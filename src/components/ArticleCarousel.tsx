'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Clock, User, Eye, Heart, Crown, Calendar, ArrowRight } from 'lucide-react';
import { NewsArticleWithAuthor } from '@/types/news';
import { useLatestArticles } from '@/hooks/useLatestArticles';

interface ArticleCarouselProps {
  autoRotate?: boolean;
  rotationInterval?: number;
  showControls?: boolean;
  className?: string;
}

export default function ArticleCarousel({
  autoRotate = true,
  rotationInterval = 8000, // 8 seconds
  showControls = true,
  className = '',
}: ArticleCarouselProps) {
  const { articles, isLoading, error } = useLatestArticles(6);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(autoRotate);

  // Auto rotation effect
  useEffect(() => {
    if (!isAutoRotating || articles.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % articles.length);
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [isAutoRotating, articles.length, rotationInterval]);

  // Pause auto-rotation on hover
  const handleMouseEnter = () => setIsAutoRotating(false);
  const handleMouseLeave = () => setIsAutoRotating(autoRotate);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % articles.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-ZA', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTags = (tags: any) => {
    if (Array.isArray(tags)) return tags;
    if (typeof tags === 'string') {
      return tags.split(',').map(t => t.trim()).filter(t => t);
    }
    return [];
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-2xl p-6 shadow-xl border border-gray-100 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !articles.length) {
    return (
      <div className={`bg-white rounded-2xl p-6 shadow-xl border border-gray-100 text-center ${className}`}>
        <div className="text-6xl mb-4">📰</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Articles Yet</h3>
        <p className="text-gray-600 mb-4">
          {error ? 'Failed to load articles' : 'Check back soon for the latest FPL content, boet!'}
        </p>
      </div>
    );
  }

  const currentArticle = articles[currentIndex];

  return (
    <div 
      className={`bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Header */}
      <div className="p-6 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-springbok-100 rounded-lg">
              <Calendar className="w-6 h-6 text-springbok-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Latest FPL Insights</h2>
              <p className="text-gray-600 text-sm">Fresh from the braai, hot FPL content 🔥</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {currentIndex + 1} of {articles.length}
            </div>
            <Link 
              href="/news" 
              className="text-springbok-600 hover:text-springbok-700 transition-colors text-sm font-semibold flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Article Display */}
      <div className="relative">
        <Link href={`/news/${currentArticle.slug}`} className="block">
          <div className="p-6">
            {/* Cover Image */}
            {currentArticle.coverImage && (
              <div className="mb-6 relative overflow-hidden rounded-lg">
                <img
                  src={currentArticle.coverImage}
                  alt={currentArticle.title}
                  className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
                />
                {currentArticle.isPremium && (
                  <div className="absolute top-3 right-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    Premium
                  </div>
                )}
              </div>
            )}

            {/* Article Content */}
            <div className="space-y-3">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {currentArticle.author.name}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDate(currentArticle.publishedAt || currentArticle.createdAt)}
                </div>
                <div className="flex items-center gap-3 ml-auto">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {currentArticle.views}
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {currentArticle.likes}
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 leading-tight hover:text-springbok-600 transition-colors">
                {currentArticle.title}
              </h3>

              {currentArticle.subtitle && (
                <p className="text-lg text-gray-700 font-medium">
                  {currentArticle.subtitle}
                </p>
              )}

              <p className="text-gray-600 line-clamp-2">
                {currentArticle.excerpt}
              </p>

              {/* Tags */}
              {currentArticle.tags && formatTags(currentArticle.tags).length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {formatTags(currentArticle.tags).slice(0, 4).map((tag: string, tagIndex: number) => (
                    <span
                      key={tagIndex}
                      className="px-2 py-1 bg-springbok-100 text-springbok-700 text-xs rounded-full font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                  {formatTags(currentArticle.tags).length > 4 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                      +{formatTags(currentArticle.tags).length - 4} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </Link>

        {/* Navigation Controls */}
        {showControls && articles.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200 group"
              aria-label="Previous article"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-springbok-600" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200 group"
              aria-label="Next article"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-springbok-600" />
            </button>
          </>
        )}
      </div>

      {/* Dot Indicators */}
      {articles.length > 1 && (
        <div className="flex justify-center gap-2 p-4 bg-gray-50">
          {articles.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? 'bg-springbok-600 w-4'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to article ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Auto-rotate indicator */}
      {isAutoRotating && articles.length > 1 && (
        <div className="absolute top-6 left-6">
          <div className="flex items-center gap-1 bg-springbok-600 text-white px-2 py-1 rounded-full text-xs font-medium">
            <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
            Auto
          </div>
        </div>
      )}
    </div>
  );
}
