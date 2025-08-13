import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const adminUser = await db.adminUser.findUnique({
      where: { userId: session.user.id }
    });

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const userId = params.id;

    // Get user with full details
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        preferences: true,
        adminUser: true,
        accounts: {
          select: {
            provider: true,
            type: true,
            createdAt: true,
          }
        },
        sessions: {
          select: {
            expires: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        analytics: {
          select: {
            page: true,
            action: true,
            timestamp: true,
          },
          orderBy: { timestamp: 'desc' },
          take: 20,
        },
        articles: {
          select: {
            id: true,
            title: true,
            status: true,
            views: true,
            likes: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        ...user,
        // Remove sensitive data
        password: undefined,
        emailVerificationToken: undefined,
      }
    });
  } catch (error) {
    console.error('Admin user fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user details' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const adminUser = await db.adminUser.findUnique({
      where: { userId: session.user.id }
    });

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const userId = params.id;
    const { 
      name, 
      email, 
      fplTeamId, 
      miniLeague1Id, 
      miniLeague2Id, 
      favoriteTeam, 
      location, 
      subscriptionType, 
      isActive, 
      preferences 
    } = await request.json();

    // Update user data
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        name: name || null,
        email: email,
        fplTeamId: fplTeamId ? parseInt(fplTeamId) : null,
        miniLeague1Id: miniLeague1Id ? parseInt(miniLeague1Id) : null,
        miniLeague2Id: miniLeague2Id ? parseInt(miniLeague2Id) : null,
        favoriteTeam: favoriteTeam ? parseInt(favoriteTeam) : null,
        location: location || null,
        subscriptionType: subscriptionType,
        isActive: isActive,
        subscriptionStart: subscriptionType === 'PREMIUM' && subscriptionType !== 'PREMIUM' ? new Date() : undefined,
        subscriptionEnd: subscriptionType === 'PREMIUM' 
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) 
          : subscriptionType === 'FREE' ? null : undefined,
      }
    });

    // Update preferences if provided
    if (preferences) {
      await db.userPreferences.upsert({
        where: { userId: userId },
        create: {
          userId: userId,
          ...preferences,
        },
        update: {
          ...preferences,
        }
      });
    }

    // Log the admin action
    await db.userAnalytics.create({
      data: {
        userId: session.user.id,
        page: 'admin',
        action: 'admin_edit_user',
        metadata: JSON.stringify({
          targetUserId: userId,
          changes: { name, email, fplTeamId, miniLeague1Id, miniLeague2Id, favoriteTeam, location, subscriptionType, isActive },
          timestamp: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({ 
      success: true,
      user: {
        ...updatedUser,
        password: undefined,
        emailVerificationToken: undefined,
      }
    });
  } catch (error) {
    console.error('Admin user update error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
