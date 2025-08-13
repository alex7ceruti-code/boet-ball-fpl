import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, fplTeamId, miniLeague1Id, miniLeague2Id, favoriteTeam, location, preferences } = await request.json();

    // Update user profile
    await db.user.update({
      where: { id: session.user.id },
      data: {
        name: name?.trim() || null,
        fplTeamId: fplTeamId && fplTeamId.toString().trim() ? parseInt(fplTeamId.toString()) : null,
        miniLeague1Id: miniLeague1Id && miniLeague1Id.toString().trim() ? parseInt(miniLeague1Id.toString()) : null,
        miniLeague2Id: miniLeague2Id && miniLeague2Id.toString().trim() ? parseInt(miniLeague2Id.toString()) : null,
        favoriteTeam: favoriteTeam && favoriteTeam.toString().trim() ? parseInt(favoriteTeam.toString()) : null,
        location: location?.trim() || null,
      },
    });

    // Update user preferences if provided
    if (preferences) {
      await db.userPreferences.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          slangIntensity: preferences.slangIntensity || 'MODERATE',
          emailNotifications: preferences.emailNotifications ?? true,
          weeklyReports: preferences.weeklyReports ?? true,
          transferReminders: preferences.transferReminders ?? true,
          showAdvancedStats: preferences.showAdvancedStats ?? false,
          darkMode: preferences.darkMode ?? false,
          compactView: preferences.compactView ?? false,
        },
        update: {
          slangIntensity: preferences.slangIntensity || 'MODERATE',
          emailNotifications: preferences.emailNotifications ?? true,
          weeklyReports: preferences.weeklyReports ?? true,
          transferReminders: preferences.transferReminders ?? true,
          showAdvancedStats: preferences.showAdvancedStats ?? false,
          darkMode: preferences.darkMode ?? false,
          compactView: preferences.compactView ?? false,
        },
      });
    }

    // Track analytics
    const updateData = { name, fplTeamId, miniLeague1Id, miniLeague2Id, favoriteTeam, location, preferences };
    await db.userAnalytics.create({
      data: {
        userId: session.user.id,
        page: 'profile',
        action: 'updated',
        metadata: JSON.stringify({ 
          updatedAt: new Date().toISOString(),
          fields: Object.keys(updateData).filter(
            key => updateData[key as keyof typeof updateData] !== undefined
          )
        }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
