'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Newspaper,
  Search,
  Filter,
  Clock,
  Eye,
  Heart,
  Tag,
  Crown,
  Loader2,
  AlertCircle,
  Flame,
  TrendingUp,
  Calendar,
  User,
  ChevronRight,
  Star
} from 'lucide-react';
import { NewsArticleWithAuthor } from '@/types/news';
import { getSlangPhrase, getTimeBasedGreeting } from '@/utils/slang';

interface NewsResponse {
  articles: NewsArticleWithAuthor[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    pages: number;
  };
}

const POPULAR_TAGS = [
  'gameweek-preview',
  'transfers',
  'captaincy',
  'player-analysis',
  'sa-content',
  'strategy',
  'differentials',
];

export default function NewsPage() {
  const { data: session } = useSession();
  const [news, setNews] = useState<NewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);

  useEffect(() => {
    fetchNews();
  }, [selectedTag, showPremiumOnly]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (selectedTag) params.append('tags', selectedTag);
      if (showPremiumOnly) params.append('isPremium', 'true');
      if (searchQuery) params.append('search', searchQuery);
      params.append('limit', '12');

      const response = await fetch(`/api/news?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch news');
      }

      setNews(data);
    } catch (error) {
      console.error('News fetch error:', error);
      setError(error instanceof Error ? error.message : 'Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNews();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTags = (tagsString: string) => {
    return tagsString.split(',').filter(Boolean).slice(0, 3);
  };

  if (loading && !news) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-springbok-50 via-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">Loading the latest FPL insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-springbok-50 via-green-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 shadow-lg">
              <Newspaper className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-gray-900">
            FPL News Hub
            <span className="block text-2xl md:text-3xl mt-2 text-transparent bg-clip-text"
              style={{
                background: 'linear-gradient(135deg, #007A3D 0%, #16a34a 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Sharp Insights, Lekker Analysis 🇿🇦
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {getTimeBasedGreeting()}! Stay sharp with the latest FPL insights, analysis, and South African perspective on the beautiful game.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search articles, topics, or FPL insights..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                <button
                  type="submit"
                  className="absolute right-2 top-2 px-4 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Premium Filter */}
            {session?.user?.subscriptionType === 'PREMIUM' && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="premiumOnly"
                  checked={showPremiumOnly}
                  onChange={(e) => setShowPremiumOnly(e.target.checked)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="premiumOnly" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  Premium Only
                </label>
              </div>
            )}
          </div>

          {/* Popular Tags */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Popular Topics:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag('')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  !selectedTag
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {POPULAR_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
                    selectedTag === tag
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
            <button
              onClick={fetchNews}
              className="ml-auto px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* Articles Grid */}
        {news && news.articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {news.articles.map((article) => (
              <Link
                key={article.id}
                href={`/news/${article.slug}`}
                className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                {/* Cover Image */}
                <div className="relative h-48 bg-gradient-to-r from-green-500 to-green-600">
                  {article.coverImage ? (
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Newspaper className="w-12 h-12 text-white" />
                    </div>
                  )}
                  
                  {/* Premium Badge */}
                  {article.isPremium && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      Premium
                    </div>
                  )}

                  {/* Hot Badge for articles with high views */}
                  {article.views > 100 && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      Hot
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {formatTags(article.tags).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full capitalize"
                      >
                        {tag.replace('-', ' ')}
                      </span>
                    ))}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors line-clamp-2">
                    {article.title}
                  </h3>

                  {/* Subtitle */}
                  {article.subtitle && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {article.subtitle}
                    </p>
                  )}

                  {/* Excerpt */}
                  <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {article.author.name || 'Boet Ball'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(article.publishedAt?.toString() || article.createdAt?.toString() || '')}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {article.views}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {article.likes}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Read More Arrow */}
                <div className="px-6 pb-4">
                  <div className="flex items-center text-green-600 text-sm font-medium group-hover:text-green-700 transition-colors">
                    Read More
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          !loading && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📰</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">No Articles Found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || selectedTag
                  ? "No articles match your search criteria. Try different keywords or tags."
                  : "No articles published yet. Check back soon for fresh FPL insights!"
                }
              </p>
              {(searchQuery || selectedTag) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTag('');
                    fetchNews();
                  }}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Show All Articles
                </button>
              )}
            </div>
          )
        )}

        {/* Loading More */}
        {loading && news && (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto" />
          </div>
        )}

        {/* SA Footer */}
        <div className="mt-12 text-center">
          <div className="bg-green-50 rounded-xl p-6 border border-green-200">
            <h3 className="text-lg font-bold text-green-800 mb-2">
              "{getSlangPhrase('culture', 'general')}"
            </h3>
            <p className="text-green-600 text-sm">
              Stay sharp with FPL insights crafted for South African fans. From local perspectives to global strategy! 🇿🇦⚽
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
