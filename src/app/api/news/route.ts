import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { NewsFilters } from '@/types/news';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const filters: NewsFilters = {
      status: searchParams.get('status') as any || 'PUBLISHED',
      isPremium: searchParams.get('isPremium') === 'true' ? true : 
                searchParams.get('isPremium') === 'false' ? false : undefined,
      tags: searchParams.get('tags')?.split(',').filter(Boolean),
      search: searchParams.get('search') || undefined,
      limit: parseInt(searchParams.get('limit') || '10'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    // Build where clause
    const where: any = {
      status: filters.status,
    };

    // Add premium filter - non-premium users can't see premium content
    if (!session || session.user.subscriptionType !== 'PREMIUM') {
      where.isPremium = false;
    } else if (filters.isPremium !== undefined) {
      where.isPremium = filters.isPremium;
    }

    // Add search filter
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { subtitle: { contains: filters.search } },
        { excerpt: { contains: filters.search } },
        { tags: { contains: filters.search } },
      ];
    }

    // Add tags filter
    if (filters.tags && filters.tags.length > 0) {
      where.AND = filters.tags.map(tag => ({
        tags: { contains: tag }
      }));
    }

    // Fetch articles
    const articles = await db.newsArticle.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: false, // Don't expose email to public
          },
        },
        _count: {
          select: {
            analytics: {
              where: {
                event: 'VIEW'
              }
            }
          }
        }
      },
      orderBy: [
        { publishedAt: 'desc' },
        { createdAt: 'desc' }
      ],
      take: Math.min(filters.limit || 10, 50), // Limit to max 50
      skip: filters.offset || 0,
    });

    // Get total count for pagination
    const totalCount = await db.newsArticle.count({ where });

    // Track analytics for search queries
    if (session?.user?.id && filters.search) {
      await db.userAnalytics.create({
        data: {
          userId: session.user.id,
          page: 'news-search',
          action: 'search',
          metadata: JSON.stringify({ query: filters.search }),
        },
      });
    }

    return NextResponse.json({
      articles,
      pagination: {
        total: totalCount,
        limit: filters.limit || 10,
        offset: filters.offset || 0,
        pages: Math.ceil(totalCount / (filters.limit || 10)),
      },
    });
  } catch (error) {
    console.error('News fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news articles' },
      { status: 500 }
    );
  }
}
