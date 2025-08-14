import { useState, useEffect } from 'react';

interface WatchlistData {
  reason: string;
  eyeTestNotes?: string;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  targetPrice?: number;
  targetGW?: number;
  reliabilityScore: number;
  valueScore: number;
  attackingThreat: number;
  addedAt: string;
  addedBy: string;
}

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<Record<number, WatchlistData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/players/watchlist');
        
        if (!response.ok) {
          // If endpoint doesn't exist or fails, silently continue with empty watchlist
          if (response.status === 404 || response.status === 500) {
            console.warn('Watchlist API not available, using empty watchlist');
            setWatchlist({});
            setError(null);
            return;
          }
        }
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch watchlist');
        }

        setWatchlist(data.watchlist || {});
        setError(null);
      } catch (err) {
        console.warn('Error fetching watchlist, using empty fallback:', err);
        // Use empty watchlist as fallback instead of showing error
        setWatchlist({});
        setError(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWatchlist();
  }, []);

  const isOnWatchlist = (playerId: number): boolean => {
    return playerId in watchlist;
  };

  const getWatchlistData = (playerId: number): WatchlistData | null => {
    return watchlist[playerId] || null;
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'URGENT': return { icon: '🚨', color: 'text-red-600' };
      case 'HIGH': return { icon: '⚡', color: 'text-orange-600' };
      case 'MEDIUM': return { icon: '👀', color: 'text-blue-600' };
      case 'LOW': return { icon: '📝', color: 'text-gray-600' };
      default: return { icon: '👀', color: 'text-blue-600' };
    }
  };

  const getConfidenceLevel = (confidence: string) => {
    switch (confidence) {
      case 'VERY_HIGH': return { text: 'Very High', color: 'text-green-600' };
      case 'HIGH': return { text: 'High', color: 'text-green-500' };
      case 'MEDIUM': return { text: 'Medium', color: 'text-blue-500' };
      case 'LOW': return { text: 'Low', color: 'text-gray-500' };
      default: return { text: 'Medium', color: 'text-blue-500' };
    }
  };

  return {
    watchlist,
    isLoading,
    error,
    isOnWatchlist,
    getWatchlistData,
    getPriorityIcon,
    getConfidenceLevel,
    count: Object.keys(watchlist).length
  };
}
