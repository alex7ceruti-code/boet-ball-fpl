import { useState, useEffect } from 'react';
import { NewsArticleWithAuthor } from '@/types/news';

interface UseLatestArticlesResult {
  articles: NewsArticleWithAuthor[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useLatestArticles(limit: number = 6): UseLatestArticlesResult {
  const [articles, setArticles] = useState<NewsArticleWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/news?limit=${limit}&status=PUBLISHED`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch articles');
      }

      setArticles(data.articles || []);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch articles');
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [limit]);

  return {
    articles,
    isLoading,
    error,
    refetch: fetchArticles,
  };
}
