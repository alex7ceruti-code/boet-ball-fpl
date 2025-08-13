import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { CreateArticleData, DEFAULT_PERMISSIONS } from '@/types/news';

// Helper function to check admin permissions
async function checkAdminPermissions(userId: string, requiredPermission: keyof typeof DEFAULT_PERMISSIONS.ADMIN) {
  const adminUser = await db.adminUser.findUnique({
    where: { userId },
  });

  if (!adminUser) {
    return { hasPermission: false, error: 'Admin access required' };
  }

  const permissions = DEFAULT_PERMISSIONS[adminUser.role];
  if (!permissions[requiredPermission]) {
    return { hasPermission: false, error: 'Insufficient permissions' };
  }

  return { hasPermission: true, adminUser };
}

// Generate URL-friendly slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const permissionCheck = await checkAdminPermissions(session.user.id, 'canCreateArticles');
    if (!permissionCheck.hasPermission) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const articleId = searchParams.get('id');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // If ID is provided, fetch single article
    if (articleId) {
      const article = await db.newsArticle.findUnique({
        where: { id: articleId },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              analytics: true,
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

      return NextResponse.json({ articles: [article] });
    }

    // Otherwise, fetch multiple articles
    const where: any = {};
    if (status) where.status = status;

    // Get articles with author info
    const articles = await db.newsArticle.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            analytics: true,
          }
        }
      },
      orderBy: [
        { updatedAt: 'desc' }
      ],
      take: Math.min(limit, 100),
      skip: offset,
    });

    const totalCount = await db.newsArticle.count({ where });

    return NextResponse.json({
      articles,
      pagination: {
        total: totalCount,
        limit,
        offset,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Admin news fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const permissionCheck = await checkAdminPermissions(session.user.id, 'canCreateArticles');
    if (!permissionCheck.hasPermission) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: 403 }
      );
    }

    const articleData: CreateArticleData = await request.json();

    // Validate required fields
    if (!articleData.title || !articleData.content || !articleData.excerpt) {
      return NextResponse.json(
        { error: 'Title, content, and excerpt are required' },
        { status: 400 }
      );
    }

    // Generate slug from title
    let slug = generateSlug(articleData.title);
    
    // Check if slug already exists and make it unique
    const existingArticle = await db.newsArticle.findUnique({
      where: { slug },
    });

    if (existingArticle) {
      slug = `${slug}-${Date.now()}`;
    }

    // Prepare tags
    const tags = Array.isArray(articleData.tags) 
      ? articleData.tags.join(',') 
      : typeof articleData.tags === 'string' ? articleData.tags : '';

    // Create article
    const article = await db.newsArticle.create({
      data: {
        slug,
        title: articleData.title,
        subtitle: articleData.subtitle,
        content: articleData.content,
        excerpt: articleData.excerpt,
        coverImage: articleData.coverImage,
        metaTitle: articleData.metaTitle || articleData.title,
        metaDescription: articleData.metaDescription || articleData.excerpt,
        tags,
        status: articleData.status,
        isPremium: articleData.isPremium,
        publishedAt: articleData.status === 'PUBLISHED' 
          ? (articleData.publishedAt || new Date()) 
          : null,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Track creation analytics
    await db.userAnalytics.create({
      data: {
        userId: session.user.id,
        page: 'admin-news',
        action: 'article-created',
        metadata: JSON.stringify({ 
          articleId: article.id, 
          title: article.title,
          status: article.status,
        }),
      },
    });

    return NextResponse.json({ article });
  } catch (error) {
    console.error('Article creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const articleId = searchParams.get('id');

    if (!articleId) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      );
    }

    // Check if article exists and get current data
    const existingArticle = await db.newsArticle.findUnique({
      where: { id: articleId },
      include: { author: true },
    });

    if (!existingArticle) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Check permissions - user must be admin or the author
    const isAuthor = existingArticle.authorId === session.user.id;
    const permissionCheck = await checkAdminPermissions(session.user.id, 'canEditAnyArticle');
    const canEdit = permissionCheck.hasPermission || isAuthor;

    if (!canEdit) {
      return NextResponse.json(
        { error: 'You do not have permission to edit this article' },
        { status: 403 }
      );
    }

    const articleData = await request.json();

    // Validate required fields
    if (!articleData.title || !articleData.content || !articleData.excerpt) {
      return NextResponse.json(
        { error: 'Title, content, and excerpt are required' },
        { status: 400 }
      );
    }

    // Prepare tags
    const tags = typeof articleData.tags === 'string' ? articleData.tags : '';

    // Update article
    const updatedArticle = await db.newsArticle.update({
      where: { id: articleId },
      data: {
        title: articleData.title.trim(),
        subtitle: articleData.subtitle?.trim() || null,
        content: articleData.content.trim(),
        excerpt: articleData.excerpt.trim(),
        tags,
        status: articleData.status,
        isPremium: articleData.isPremium || false,
        publishedAt: articleData.status === 'PUBLISHED' && !existingArticle.publishedAt
          ? new Date()
          : existingArticle.publishedAt,
        updatedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Track update analytics
    await db.userAnalytics.create({
      data: {
        userId: session.user.id,
        page: 'admin-news',
        action: 'article-updated',
        metadata: JSON.stringify({
          articleId: updatedArticle.id,
          title: updatedArticle.title,
          status: updatedArticle.status,
          previousStatus: existingArticle.status,
        }),
      },
    });

    return NextResponse.json({ article: updatedArticle });
  } catch (error) {
    console.error('Article update error:', error);
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const articleId = searchParams.get('id');

    if (!articleId) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      );
    }

    // Check if article exists
    const existingArticle = await db.newsArticle.findUnique({
      where: { id: articleId },
      include: { author: true },
    });

    if (!existingArticle) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Check permissions - must have delete permission
    const permissionCheck = await checkAdminPermissions(session.user.id, 'canDeleteArticles');
    if (!permissionCheck.hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to delete articles' },
        { status: 403 }
      );
    }

    // Delete related analytics first (foreign key constraint)
    await db.newsAnalytics.deleteMany({
      where: { articleId },
    });

    // Delete the article
    await db.newsArticle.delete({
      where: { id: articleId },
    });

    // Track deletion analytics
    await db.userAnalytics.create({
      data: {
        userId: session.user.id,
        page: 'admin-news',
        action: 'article-deleted',
        metadata: JSON.stringify({
          articleId,
          title: existingArticle.title,
          status: existingArticle.status,
        }),
      },
    });

    return NextResponse.json({ success: true, message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Article deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}
