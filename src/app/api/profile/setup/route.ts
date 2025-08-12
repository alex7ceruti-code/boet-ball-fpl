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

    const { fplTeamId, favoriteTeam, location, preferences } = await request.json();

    // Update user profile
    await db.user.update({
      where: { id: session.user.id },
      data: {
        fplTeamId: fplTeamId || null,
        favoriteTeam: favoriteTeam || null,
        location: location || null,
      },
    });

    // Update user preferences
    if (preferences) {
      await db.userPreferences.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          slangIntensity: preferences.slangIntensity || 'MODERATE',
          emailNotifications: preferences.emailNotifications ?? true,
          weeklyReports: preferences.weeklyReports ?? true,
          transferReminders: preferences.transferReminders ?? true,
        },
        update: {
          slangIntensity: preferences.slangIntensity || 'MODERATE',
          emailNotifications: preferences.emailNotifications ?? true,
          weeklyReports: preferences.weeklyReports ?? true,
          transferReminders: preferences.transferReminders ?? true,
        },
      });
    }

    // Track analytics
    await db.userAnalytics.create({
      data: {
        userId: session.user.id,
        page: 'profile-setup',
        action: 'completed',
        metadata: JSON.stringify({ completedAt: new Date().toISOString() }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile setup error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
