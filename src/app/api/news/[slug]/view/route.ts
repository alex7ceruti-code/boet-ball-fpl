import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    const slug = params.slug;

    console.log('Tracking view for article:', slug);

    // Find the article by slug
    const article = await db.newsArticle.findUnique({
      where: { slug },
      select: { id: true, status: true }
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Only track views for published articles or for admins viewing drafts
    const isAdmin = session?.user?.role && ['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(session.user.role);
    const canTrackView = article.status === 'PUBLISHED' || isAdmin;

    if (!canTrackView) {
      return NextResponse.json(
        { message: 'View not tracked for non-published article' },
        { status: 200 }
      );
    }

    // Track view analytics
    if (session?.user?.id) {
      console.log('Tracking authenticated view for user:', session.user.id);
      await db.newsAnalytics.create({
        data: {
          articleId: article.id,
          userId: session.user.id,
          event: 'VIEW',
          metadata: JSON.stringify({
            userAgent: request.headers.get('user-agent'),
            timestamp: new Date().toISOString(),
          }),
        },
      });
    } else {
      console.log('Tracking anonymous view');
      await db.newsAnalytics.create({
        data: {
          articleId: article.id,
          event: 'VIEW',
          metadata: JSON.stringify({
            anonymous: true,
            userAgent: request.headers.get('user-agent'),
            timestamp: new Date().toISOString(),
          }),
        },
      });
    }

    console.log('View tracked successfully');
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('View tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track view' },
      { status: 500 }
    );
  }
}
