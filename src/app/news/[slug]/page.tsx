'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  ArrowLeft,
  Calendar,
  User,
  Eye,
  Heart,
  Share2,
  Crown,
  Tag,
  Edit,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { NewsArticleWithAuthor } from '@/types/news';

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const slug = params.slug as string;
  
  const [article, setArticle] = useState<NewsArticleWithAuthor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      setError('');

      // Try to fetch the article by slug
      const response = await fetch(`/api/news/${slug}`);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          setError('Article not found.');
        } else if (response.status === 403) {
          setError('This article is not available. It might be a draft or premium content.');
        } else {
          setError(data.error || 'Failed to load article');
        }
        return;
      }

      // API returns { article: ... } format
      const articleData = data.article || data;
      setArticle(articleData);
      
      // Track view (only for published articles)
      if (articleData.status === 'PUBLISHED') {
        trackView();
      }

    } catch (error) {
      console.error('Article fetch error:', error);
      setError('Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const trackView = async () => {
    try {
      await fetch(`/api/news/${slug}/view`, { method: 'POST' });
    } catch (error) {
      console.error('Failed to track view:', error);
    }
  };

  const handleLike = async () => {
    if (!article || liked) return;
    
    try {
      const response = await fetch(`/api/news/${slug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'like' }),
      });
      
      if (response.ok) {
        setLiked(true);
        setArticle(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
      }
    } catch (error) {
      console.error('Failed to like article:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share && article) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatContent = (content: string) => {
    // Basic markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-semibold text-gray-900 mt-6 mb-3">$1</h3>')
      .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br>');
  };

  const isAdmin = session?.user?.role && ['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(session.user.role);
  const isDraft = article?.status === 'DRAFT';
  const isArchived = article?.status === 'ARCHIVED';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Article Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error || "The article you're looking for doesn't exist or may have been moved."}
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => router.push('/news')}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to News
            </button>
            {isAdmin && (
              <button
                onClick={() => router.push('/admin')}
                className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                Admin Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show draft warning for admin users
  if (isDraft && !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Draft Article</h1>
          <p className="text-gray-600 mb-6">
            This article is still being worked on and isn't published yet.
          </p>
          <button
            onClick={() => router.push('/news')}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors mx-auto"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to News
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Draft/Archived Banner for Admin */}
      {(isDraft || isArchived) && isAdmin && (
        <div className={`px-4 py-3 text-center text-white font-semibold ${
          isDraft ? 'bg-yellow-500' : 'bg-gray-500'
        }`}>
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-5 h-5" />
            {isDraft ? 'DRAFT PREVIEW - Only visible to admins' : 'ARCHIVED ARTICLE - Only visible to admins'}
            <button
              onClick={() => router.push(`/admin/edit/${article.id}`)}
              className="ml-4 px-3 py-1 bg-white bg-opacity-20 rounded-md hover:bg-opacity-30 transition-colors"
            >
              Edit Article
            </button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/news')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to News
          </button>

          {/* Cover Image */}
          {article.coverImage && (
            <div className="mb-8">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-64 md:h-80 object-cover rounded-lg shadow-lg"
              />
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {article.title}
          </h1>

          {/* Subtitle */}
          {article.subtitle && (
            <h2 className="text-xl md:text-2xl text-gray-600 mb-6 leading-relaxed">
              {article.subtitle}
            </h2>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-6">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="font-medium text-gray-700">{article.author.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(article.publishedAt || article.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>{article.views} views</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span>{article.likes} likes</span>
            </div>
            {article.isPremium && (
              <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                <Crown className="w-4 h-4" />
                <span className="font-semibold">Premium</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={handleLike}
              disabled={liked}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                liked 
                  ? 'bg-red-100 text-red-700 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
              {liked ? 'Liked!' : 'Like'}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              Share
            </button>
            {isAdmin && (
              <button
                onClick={() => router.push(`/admin/edit/${article.id}`)}
                className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold hover:bg-green-200 transition-colors"
              >
                <Edit className="w-5 h-5" />
                Edit
              </button>
            )}
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {article.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Article Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Excerpt */}
          <div className="text-lg text-gray-700 font-medium mb-8 p-4 bg-gray-50 rounded-lg border-l-4 border-green-600">
            {article.excerpt}
          </div>

          {/* Content */}
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ 
              __html: `<p class="mb-4">${formatContent(article.content)}</p>` 
            }}
          />
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => router.push('/news')}
            className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to News
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              disabled={liked}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                liked 
                  ? 'bg-red-100 text-red-700 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
              {liked ? 'Liked!' : 'Like'}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
