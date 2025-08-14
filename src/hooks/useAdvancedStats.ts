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

/**
 * Calculate advanced metrics from basic FPL data
 * 
 * RELIABILITY (consistencyRating/braaiRating): 0-100 score based on:
 * - Form (0-10): Max 50 points (current form × 8)
 * - Value efficiency: Max 30 points (points per million × 3) 
 * - Bonus points earned: Max 20 points (bonus × 2)
 * 
 * VALUE EFFICIENCY (valueEfficiency/biltongValue): 0-100 score based on:
 * - Points per million spent (capped at 20 points per million)
 * - Scaled by 4 to create 0-80 typical range
 * - Elite budget options score 80-100, premiums typically 40-70
 * 
 * ATTACKING THREAT (attackingThreat/klapPotential): 0-100 score based on:
 * - xG per 90 mins: Max 40 points (elite strikers ~0.8 xG90)
 * - xA per 90 mins: Max 30 points (top creators ~0.5 xA90)
 * - FPL Creativity index: Max 20 points (scaled from raw creativity)
 * - ICT Index bonus: Max 10 points (overall FPL performance)
 */
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
  
  // Professional statistical algorithms with realistic distributions
  // Consistency: Based on form (0-10) and value, scaled to 0-100 with natural distribution
  const formScore = Math.min(50, form * 8); // Form contributes max 50 points
  const valueContribution = Math.min(30, valueScore * 3); // Value contributes max 30 points
  const bonusPoints = Math.min(20, (player.bonus || 0) * 2); // Bonus points contribute max 20
  const consistencyRating = Math.round(formScore + valueContribution + bonusPoints);
  
  // Value Efficiency: More realistic scaling based on actual FPL economics
  // Top players typically get 15-20 points per million, scale accordingly
  const baseValueScore = Math.min(20, valueScore); // Cap base value at 20 points per million
  const valueEfficiency = Math.round(Math.min(100, baseValueScore * 4)); // Scale to 0-80 typically
  
  // Attacking Threat: Based on xG, xA, and underlying stats with realistic scaling
  const xGThreat = Math.min(40, xG90 * 50); // xG contribution (max ~40 for elite strikers)
  const xAThreat = Math.min(30, xA90 * 60); // xA contribution (max ~30 for top creators)
  const creativityBonus = Math.min(20, (parseFloat(player.creativity || '0') / 50)); // Creativity bonus
  const ictBonus = Math.min(10, (parseFloat(player.ict_index || '0') / 100)); // ICT index bonus
  const attackingThreat = Math.round(xGThreat + xAThreat + creativityBonus + ictBonus);
  
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
