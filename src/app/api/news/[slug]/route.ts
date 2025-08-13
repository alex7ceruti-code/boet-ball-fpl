import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    const slug = params.slug;

    // Fetch article
    const article = await db.newsArticle.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: false,
          },
        },
        _count: {
          select: {
            analytics: {
              where: { event: 'VIEW' }
            }
          }
        }
      },
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Check if article is published or if user is admin
    const isAdmin = session?.user?.role && ['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(session.user.role);
    const isDraft = article.status === 'DRAFT';
    const isArchived = article.status === 'ARCHIVED';
    
    // Non-published articles are only visible to admins
    if ((isDraft || isArchived) && !isAdmin) {
      return NextResponse.json(
        { error: 'Article not available' },
        { status: 404 }
      );
    }
    
    // Only published articles should be viewable by non-admins
    if (article.status !== 'PUBLISHED' && !isAdmin) {
      return NextResponse.json(
        { error: 'Article not available' },
        { status: 404 }
      );
    }

    // Check premium access
    if (article.isPremium && (!session || session.user.subscriptionType !== 'PREMIUM')) {
      return NextResponse.json(
        { 
          error: 'Premium content', 
          message: 'This article is only available to Premium subscribers',
          isPremium: true 
        },
        { status: 403 }
      );
    }

    // Note: View tracking is handled by the separate /view endpoint
    // This prevents double-tracking when the article is fetched for display

    return NextResponse.json({ article });
  } catch (error) {
    console.error('Article fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const slug = params.slug;
    const { action } = await request.json();

    if (action === 'like') {
      // Find the article
      const article = await db.newsArticle.findUnique({
        where: { slug },
      });

      if (!article) {
        return NextResponse.json(
          { error: 'Article not found' },
          { status: 404 }
        );
      }

      // Check if user already liked this article
      const existingLike = await db.newsAnalytics.findFirst({
        where: {
          articleId: article.id,
          userId: session.user.id,
          event: 'LIKE',
        },
      });

      if (existingLike) {
        return NextResponse.json(
          { error: 'Already liked this article' },
          { status: 400 }
        );
      }

      // Add like
      await db.newsArticle.update({
        where: { id: article.id },
        data: { likes: { increment: 1 } },
      });

      // Track like analytics
      await db.newsAnalytics.create({
        data: {
          articleId: article.id,
          userId: session.user.id,
          event: 'LIKE',
        },
      });

      return NextResponse.json({ success: true, action: 'liked' });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Article action error:', error);
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    );
  }
}
