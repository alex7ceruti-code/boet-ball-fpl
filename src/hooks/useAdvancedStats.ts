'use client';

import useSWR from 'swr';

// Enhanced player stats with advanced analytics
export interface AdvancedPlayerStats {
  playerId: number;
  name: string;
  
  // Core FPL Stats (already available)
  totalPoints: number;
  form: number;
  pointsPerGame: number;
  value: number;
  
  // Enhanced Analytics
  xG90: number;
  xA90: number;
  xGI90: number; // Expected Goal Involvements per 90
  shotQuality: number; // xG per shot
  bonusProbability: number;
  valueScore: number; // Points per million rating
  formTrend: 'rising' | 'falling' | 'stable';
  rotationRisk: 'low' | 'medium' | 'high';
  
  // Professional Analytics
  consistencyRating: number; // Consistency score (0-100)
  valueEfficiency: number; // Budget efficiency score
  attackingThreat: number; // Goal/assist potential score
}

export interface FixtureAnalysis {
  teamId: number;
  next5FDR: number;
  easyRunLength: number;
  difficultPatchAhead: boolean;
  cleanSheetProb: number;
  goalsExpected: number;
}

export interface FormPrediction {
  playerId: number;
  nextGWPoints: number;
  confidence: number;
  reasoning: string[];
}

// Fetcher function for external APIs
const fetcher = async (url: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.warn(`Failed to fetch ${url}:`, error);
    return null;
  }
};

// Hook for Understat.com data
export function useUnderstatData(season: string = '2024') {
  const { data, error, isLoading } = useSWR(
    `/api/external/understat/${season}`,
    fetcher,
    {
      refreshInterval: 30 * 60 * 1000, // 30 minutes
      revalidateOnFocus: false,
    }
  );

  return {
    understatData: data,
    isLoading,
    error,
  };
}

// Hook for enhanced player analytics
export function useAdvancedPlayerStats() {
  const { data, error, isLoading } = useSWR(
    '/api/analytics/players',
    fetcher,
    {
      refreshInterval: 15 * 60 * 1000, // 15 minutes
      revalidateOnFocus: false,
    }
  );

  return {
    advancedStats: data?.players as AdvancedPlayerStats[] || [],
    isLoading,
    error,
  };
}

// Hook for fixture analysis
export function useFixtureAnalysis() {
  const { data, error, isLoading } = useSWR(
    '/api/analytics/fixtures',
    fetcher,
    {
      refreshInterval: 60 * 60 * 1000, // 1 hour
      revalidateOnFocus: false,
    }
  );

  return {
    fixtureAnalysis: data?.analysis as FixtureAnalysis[] || [],
    isLoading,
    error,
  };
}

// Hook for form predictions
export function useFormPredictions() {
  const { data, error, isLoading } = useSWR(
    '/api/analytics/predictions',
    fetcher,
    {
      refreshInterval: 2 * 60 * 60 * 1000, // 2 hours
      revalidateOnFocus: false,
    }
  );

  return {
    predictions: data?.predictions as FormPrediction[] || [],
    isLoading,
    error,
  };
}

// Professional player categorization
export function categorizePlayer(stats: AdvancedPlayerStats): {
  category: string;
  description: string;
  icon: string;
} {
  if (stats.consistencyRating >= 80) {
    return {
      category: 'Premium Reliable',
      description: 'Consistently high-performing asset',
      icon: '🔥'
    };
  }
  
  if (stats.valueEfficiency >= 85) {
    return {
      category: 'Value Champion', 
      description: 'Exceptional points-per-price ratio',
      icon: '💰'
    };
  }
  
  if (stats.attackingThreat >= 75) {
    return {
      category: 'High Ceiling',
      description: 'Strong potential for explosive returns',
      icon: '💥'
    };
  }
  
  if (stats.value >= 10 && stats.totalPoints >= 80) {
    return {
      category: 'Premium Asset',
      description: 'Top-tier option with proven quality',
      icon: '🏆'
    };
  }
  
  return {
    category: 'Steady Performer',
    description: 'Reliable squad player with consistent output',
    icon: '⚡'
  };
}

// Calculate advanced metrics from basic FPL data
export function calculateAdvancedMetrics(player: any): Partial<AdvancedPlayerStats> {
  const xG = parseFloat(player.expected_goals || '0');
  const xA = parseFloat(player.expected_assists || '0');
  const minutes = player.minutes || 1;
  const totalPoints = player.total_points || 0;
  const nowCost = player.now_cost || 1;
  const form = parseFloat(player.form || '0');
  
  // Use FPL API's accurate per-90 values (more reliable than manual calculation)
  const xG90 = player.expected_goals_per_90 || 0;
  const xA90 = player.expected_assists_per_90 || 0;
  const xGI90 = xG90 + xA90;
  
  // Value calculations
  const valueScore = (totalPoints / nowCost) * 10; // Points per million (scaled)
  
  // Professional statistical algorithms
  const consistencyRating = Math.min(100, (form * 15) + (valueScore * 2));
  const valueEfficiency = Math.min(100, valueScore * 8);
  // Enhanced attacking threat including both xG and xA weighted by creativity
  const attackingThreat = Math.min(100, (xG90 * 20) + (xA90 * 20) + (parseFloat(player.creativity || '0') / 10));
  
  return {
    xG90: Math.round(xG90 * 100) / 100,
    xA90: Math.round(xA90 * 100) / 100,
    xGI90: Math.round(xGI90 * 100) / 100,
    valueScore: Math.round(valueScore * 10) / 10,
    consistencyRating: Math.round(consistencyRating),
    valueEfficiency: Math.round(valueEfficiency),
    attackingThreat: Math.round(attackingThreat),
    // Legacy names for backward compatibility
    braaiRating: Math.round(consistencyRating),
    biltongValue: Math.round(valueEfficiency),
    klapPotential: Math.round(attackingThreat),
  };
}
