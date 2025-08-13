'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Eye,
  Send,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Crown,
  Tag,
  Trash2,
  Archive
} from 'lucide-react';
import { NewsArticleWithAuthor } from '@/types/news';
import { FPL_TAGS } from '@/types/news';

interface EditArticleData {
  title: string;
  subtitle?: string;
  excerpt: string;
  content: string;
  tags: string;
  isPremium: boolean;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

export default function EditArticlePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;
  
  const [article, setArticle] = useState<NewsArticleWithAuthor | null>(null);
  const [formData, setFormData] = useState<EditArticleData>({
    title: '',
    subtitle: '',
    excerpt: '',
    content: '',
    tags: '',
    isPremium: false,
    status: 'DRAFT'
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check admin access
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Load article data
  useEffect(() => {
    if (articleId && session?.user?.id) {
      fetchArticle();
    }
  }, [articleId, session]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/admin/news?id=${articleId}`);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('You need admin access to edit articles.');
        }
        if (response.status === 404) {
          throw new Error('Article not found.');
        }
        throw new Error(data.error || 'Failed to load article');
      }

      // The API returns an array, get the first article
      const articleData = data.articles?.[0];
      if (!articleData) {
        throw new Error('Article not found.');
      }

      setArticle(articleData);
      // Handle tags - could be string or array depending on storage format
      let tagsString = '';
      if (articleData.tags) {
        if (Array.isArray(articleData.tags)) {
          tagsString = articleData.tags.join(', ');
        } else if (typeof articleData.tags === 'string') {
          tagsString = articleData.tags;
        }
      }

      setFormData({
        title: articleData.title,
        subtitle: articleData.subtitle || '',
        excerpt: articleData.excerpt,
        content: articleData.content,
        tags: tagsString,
        isPremium: articleData.isPremium,
        status: articleData.status
      });

    } catch (error) {
      console.error('Article fetch error:', error);
      setError(error instanceof Error ? error.message : 'Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (submitStatus: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Basic validation
      if (!formData.title.trim() || !formData.excerpt.trim() || !formData.content.trim()) {
        throw new Error('Title, excerpt, and content are required');
      }

      const submitData = {
        ...formData,
        status: submitStatus,
        title: formData.title.trim(),
        excerpt: formData.excerpt.trim(),
        content: formData.content.trim(),
        tags: formData.tags.trim()
      };

      const response = await fetch(`/api/admin/news?id=${articleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('You need admin access to edit articles.');
        }
        throw new Error(data.error || 'Failed to update article');
      }

      setSuccess(`Article ${submitStatus.toLowerCase()} successfully!`);
      
      // Refresh article data
      await fetchArticle();

    } catch (error) {
      console.error('Article update error:', error);
      setError(error instanceof Error ? error.message : 'Failed to update article');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/news?id=${articleId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete article');
      }

      setSuccess('Article deleted successfully!');
      
      // Redirect to dashboard after deletion
      setTimeout(() => {
        router.push('/admin');
      }, 1500);

    } catch (error) {
      console.error('Article deletion error:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete article');
    } finally {
      setSaving(false);
    }
  };

  // Auto-populate tags suggestions
  const getTagSuggestions = () => {
    return FPL_TAGS.slice(0, 8);
  };

  const addTag = (tag: string) => {
    const currentTags = formData.tags.split(',').map(t => t.trim()).filter(t => t);
    if (!currentTags.includes(tag)) {
      const newTags = [...currentTags, tag].join(', ');
      setFormData(prev => ({ ...prev, tags: newTags }));
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error && !article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Article</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors mx-auto"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push('/admin')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Edit Article
              </h1>
              <p className="text-gray-600">
                Modify your FPL content with South African flavor
              </p>
            </div>
            {article && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push(`/news/${article.slug}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Live
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className="text-green-700">{success}</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Article Info */}
        {article && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Created by <span className="font-medium">{article.author.name}</span> on{' '}
                  {new Date(article.createdAt).toLocaleDateString('en-ZA')}
                </p>
                {article.updatedAt !== article.createdAt && (
                  <p className="text-xs text-gray-500">
                    Last updated: {new Date(article.updatedAt).toLocaleDateString('en-ZA')}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {article.views} views
                </span>
                <span>{article.likes} likes</span>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Article Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Article title with SA slang"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Subtitle (Optional)
              </label>
              <input
                type="text"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleInputChange}
                placeholder="Brief secondary headline"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Excerpt (Homepage Preview) *
              </label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
                rows={3}
                placeholder="2-3 sentences that will appear on the homepage..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Article Content *
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={20}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm"
                required
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="fpl, transfers, gameweek"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              
              {/* Tag Suggestions */}
              <div className="mt-3">
                <p className="text-xs font-medium text-gray-700 mb-2">Popular tags:</p>
                <div className="flex flex-wrap gap-2">
                  {getTagSuggestions().map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addTag(tag)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-gray-200 transition-colors"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Premium Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isPremium"
                name="isPremium"
                checked={formData.isPremium}
                onChange={handleInputChange}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <label htmlFor="isPremium" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Crown className="w-4 h-4 text-yellow-500" />
                Premium Content (Subscribers Only)
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleSubmit('DRAFT')}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  Save as Draft
                </button>

                <button
                  type="button"
                  onClick={() => handleSubmit('PUBLISHED')}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  Publish
                </button>

                <button
                  type="button"
                  onClick={() => handleSubmit('ARCHIVED')}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-3 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Archive className="w-5 h-5" />
                  Archive
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
