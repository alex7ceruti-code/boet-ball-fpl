import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build where clause for search
    const whereClause = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    // Get users with their preferences and admin status
    const [users, totalCount] = await Promise.all([
      db.user.findMany({
        where: whereClause,
        include: {
          preferences: true,
          adminUser: true,
          _count: {
            select: {
              analytics: true,
              articles: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder as 'asc' | 'desc',
        },
        skip,
        take: limit,
      }),
      db.user.count({
        where: whereClause,
      }),
    ]);

    return NextResponse.json({
      users: users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        fplTeamId: user.fplTeamId,
        miniLeague1Id: user.miniLeague1Id,
        miniLeague2Id: user.miniLeague2Id,
        favoriteTeam: user.favoriteTeam,
        location: user.location,
        subscriptionType: user.subscriptionType,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        loginCount: user.loginCount,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        termsAcceptedAt: user.termsAcceptedAt,
        marketingOptIn: user.marketingOptIn,
        promoCodeUsed: user.promoCodeUsed,
        preferences: user.preferences,
        isAdmin: !!user.adminUser,
        adminRole: user.adminUser?.role,
        analyticsCount: user._count.analytics,
        articlesCount: user._count.articles,
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
