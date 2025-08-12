'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Heart,
  Calendar,
  User,
  Crown,
  AlertCircle,
  CheckCircle2,
  Loader2,
  BarChart3,
  Settings,
  Newspaper,
  Tag,
  Search,
  Filter
} from 'lucide-react';
import { NewsArticleWithAuthor } from '@/types/news';
import { FPL_TAGS, CONTENT_GUIDELINES } from '@/types/news';

interface AdminNewsResponse {
  articles: NewsArticleWithAuthor[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    pages: number;
  };
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [articles, setArticles] = useState<AdminNewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Check admin access
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchArticles();
    }
  }, [session, selectedStatus]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (selectedStatus) params.append('status', selectedStatus);
      params.append('limit', '20');

      const response = await fetch(`/api/admin/news?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          setError('You need admin access to view this page. Contact support to become an editor.');
          return;
        }
        throw new Error(data.error || 'Failed to fetch articles');
      }

      setArticles(data);
    } catch (error) {
      console.error('Admin articles fetch error:', error);
      setError(error instanceof Error ? error.message : 'Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      DRAFT: 'bg-yellow-100 text-yellow-800',
      PUBLISHED: 'bg-green-100 text-green-800',
      ARCHIVED: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                News Admin Dashboard
              </h1>
              <p className="text-gray-600">
                Manage articles, content, and analytics for Boet Ball FPL
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/admin/create')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Article
              </button>
            </div>
          </div>
        </div>

        {/* Content Guidelines Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                Copyright-Safe Content Guidelines 📝
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">✅ Safe Sources:</h4>
                  <ul className="space-y-1 text-blue-700">
                    {CONTENT_GUIDELINES.sources.map((source, index) => (
                      <li key={index}>• {source}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-red-800 mb-2">❌ Avoid:</h4>
                  <ul className="space-y-1 text-red-700">
                    {CONTENT_GUIDELINES.avoid.map((item, index) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">🎯 Best Practices:</h4>
                  <ul className="space-y-1 text-green-700">
                    {CONTENT_GUIDELINES.best_practices.slice(0, 3).map((practice, index) => (
                      <li key={index}>• {practice}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
            {error.includes('admin access') && (
              <div className="ml-auto">
                <p className="text-sm text-red-600">
                  Need admin access? Contact: admin@boetball.com
                </p>
              </div>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Status:</span>
            </div>
            <div className="flex gap-2">
              {['', 'DRAFT', 'PUBLISHED', 'ARCHIVED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedStatus === status
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status || 'All'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Articles Table */}
        {articles && articles.articles.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Article
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Stats
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {articles.articles.map((article) => (
                    <tr key={article.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-semibold text-gray-900 truncate">
                                {article.title}
                              </h3>
                              {article.isPremium && (
                                <Crown className="w-4 h-4 text-yellow-500" />
                              )}
                            </div>
                            {article.subtitle && (
                              <p className="text-xs text-gray-600 truncate">
                                {article.subtitle}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {article.excerpt}
                            </p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(article.status)}`}>
                          {article.status}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {article.author.name || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {article.views}
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {article.likes}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-500">
                          <div className="flex items-center gap-1 mb-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(article.publishedAt || article.createdAt)}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/news/${article.slug}`)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Article"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => router.push(`/admin/edit/${article.id}`)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit Article"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          !loading && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Newspaper className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Articles Found</h3>
              <p className="text-gray-600 mb-6">
                {selectedStatus 
                  ? `No articles with status "${selectedStatus}". Try a different filter.`
                  : "Get started by creating your first article!"
                }
              </p>
              <button
                onClick={() => router.push('/admin/create')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create First Article
              </button>
            </div>
          )
        )}

        {/* Quick Stats */}
        {articles && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {articles.pagination.total}
                </div>
                <div className="text-sm text-gray-600">Total Articles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {articles.articles.filter(a => a.status === 'PUBLISHED').length}
                </div>
                <div className="text-sm text-gray-600">Published</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {articles.articles.filter(a => a.status === 'DRAFT').length}
                </div>
                <div className="text-sm text-gray-600">Drafts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {articles.articles.reduce((sum, a) => sum + a.views, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Views</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
