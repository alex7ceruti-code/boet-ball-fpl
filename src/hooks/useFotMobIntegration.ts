'use client';

import { useMemo } from 'react';
import { calculateAdvancedMetrics } from './useAdvancedStats';

// FotMob enhanced player data structure
export interface FotMobPlayerData {
  fotmobId: number;
  fplId: number;
  
  // Attacking metrics
  shots_per_game: number;
  shots_on_target_per_game: number;
  shot_accuracy: number;
  big_chances_created: number;
  big_chances_missed: number;
  touches_in_box_per_game: number;
  successful_dribbles_per_game: number;
  key_passes_per_game: number;
  
  // Defensive metrics  
  tackles_won_per_game: number;
  interceptions_per_game: number;
  clearances_per_game: number;
  blocks_per_game: number;
  recoveries_per_game: number;
  aerial_duels_won_per_game: number;
  ground_duels_won_per_game: number;
  
  // Possession & Passing
  pass_accuracy: number;
  progressive_passes_per_game: number;
  long_balls_accuracy: number;
  cross_accuracy: number;
  through_balls_per_game: number;
  
  // Physical & Discipline
  distance_covered_per_game: number;
  sprints_per_game: number;
  fouls_committed_per_game: number;
  cards_per_game: number;
}

// Enhanced metrics with FotMob integration
export interface EnhancedPlayerMetrics {
  // Core FPL + existing advanced metrics
  playerId: number;
  name: string;
  braaiRating: number;
  biltongValue: number;
  klapPotential: number;
  
  // NEW: FotMob-enhanced metrics
  shotQualityIndex: number;        // 0-100: Shot efficiency and quality
  defensiveImpactScore: number;    // 0-100: Comprehensive defensive contribution
  creativeThreatIndex: number;     // 0-100: Creative output beyond assists
  defconPotential: number;         // 0-100: NEW FPL DEFCON points prediction
  enhancedFormTrend: number;       // -10 to +10: Enhanced form analysis
  
  // Enhanced SA metrics
  enhancedBraaiRating: number;     // FotMob-improved consistency score
  enhancedKlapPotential: number;   // FotMob-improved explosive potential
  
  // Reliability indicators
  dataQuality: 'high' | 'medium' | 'low';
  fotmobDataAvailable: boolean;
  lastUpdated: string;
}

/**
 * 🥅 Shot Quality Index (SQI)
 * Measures shooting efficiency and quality (0-100 scale)
 */
export function calculateShotQualityIndex(fotmobData: FotMobPlayerData): number {
  const shotsPerGame = fotmobData.shots_per_game || 0;
  const shotsOnTarget = fotmobData.shots_on_target_per_game || 0;
  const shotAccuracy = fotmobData.shot_accuracy || 0;
  const touchesInBox = fotmobData.touches_in_box_per_game || 0;
  
  if (shotsPerGame === 0) return 0;
  
  // Base shooting metrics
  const volumeScore = Math.min(25, shotsPerGame * 5);        // Shot volume (max 25 points)
  const accuracyScore = Math.min(35, shotAccuracy * 0.35);   // Accuracy percentage (max 35 points)
  const targetScore = Math.min(25, shotsOnTarget * 8);       // Shots on target (max 25 points)
  const positionScore = Math.min(15, touchesInBox * 3);      // Penalty area involvement (max 15 points)
  
  return Math.round(volumeScore + accuracyScore + targetScore + positionScore);
}

/**
 * 🛡️ Defensive Impact Score (DIS) 
 * Comprehensive defensive contribution metric (0-100 scale)
 */
export function calculateDefensiveImpactScore(fotmobData: FotMobPlayerData): number {
  const tackles = fotmobData.tackles_won_per_game || 0;
  const interceptions = fotmobData.interceptions_per_game || 0;
  const clearances = fotmobData.clearances_per_game || 0;
  const blocks = fotmobData.blocks_per_game || 0;
  const recoveries = fotmobData.recoveries_per_game || 0;
  const aerialWins = fotmobData.aerial_duels_won_per_game || 0;
  
  // Weighted formula based on FPL point values and frequency
  const disScore = (
    tackles * 6 +         // 2 FPL points, good frequency  
    interceptions * 8 +   // 2 FPL points, lower frequency
    clearances * 3 +      // 1 FPL point, high frequency
    blocks * 10 +         // Potential DEFCON points, medium frequency
    recoveries * 4 +      // Potential DEFCON points, high frequency  
    aerialWins * 5        // Important for set pieces
  );
  
  return Math.min(100, Math.round(disScore));
}

/**
 * ⚡ Creative Threat Index (CTI)
 * Beyond assists - comprehensive creativity measurement (0-100 scale)
 */
export function calculateCreativeThreatIndex(fotmobData: FotMobPlayerData): number {
  const keyPasses = fotmobData.key_passes_per_game || 0;
  const bigChancesCreated = fotmobData.big_chances_created || 0;
  const throughBalls = fotmobData.through_balls_per_game || 0;
  const crossAccuracy = fotmobData.cross_accuracy || 0;
  const successfulDribbles = fotmobData.successful_dribbles_per_game || 0;
  
  const creativityScore = (
    keyPasses * 8 +                    // Direct creative output
    bigChancesCreated * 15 +           // High-quality chances  
    throughBalls * 12 +                // Penetrating passes
    (crossAccuracy / 10) +             // Delivery quality
    successfulDribbles * 3             // Beat defenders to create
  );
  
  return Math.min(100, Math.round(creativityScore));
}

/**
 * 🛡️ DEFCON Potential - NEW FPL DEFCON Points Prediction
 * Predicts potential for new defensive contribution scoring (0-100 scale)
 */
export function calculateDefconPotential(fotmobData: FotMobPlayerData): number {
  const recoveries = fotmobData.recoveries_per_game || 0;
  const blocks = fotmobData.blocks_per_game || 0;
  const tackles = fotmobData.tackles_won_per_game || 0;
  const interceptions = fotmobData.interceptions_per_game || 0;
  const clearances = fotmobData.clearances_per_game || 0;
  
  // Weighted scoring based on expected DEFCON point values
  const defconScore = (
    recoveries * 3 +      // High frequency, lower points (1 point each)
    blocks * 8 +          // Medium frequency, higher points (2-3 points each)
    tackles * 4 +         // Good frequency, medium points (1-2 points each)  
    interceptions * 5 +   // Good positioning, medium-high points (2 points each)
    clearances * 2        // High frequency, lower points (1 point each)
  );
  
  return Math.min(100, Math.round(defconScore));
}

/**
 * 📈 Enhanced Form Analysis
 * Improved form prediction using FotMob recent performance data
 */
export function calculateEnhancedFormTrend(
  player: any, 
  fotmobData: FotMobPlayerData
): number {
  const baseFplForm = parseFloat(player.form || '0');
  const seasonAverage = parseFloat(player.points_per_game || '0');
  
  // Recent performance indicators from FotMob
  const recentShotTrend = fotmobData.shots_per_game * 0.2;
  const recentCreativity = fotmobData.key_passes_per_game * 0.3;
  const recentDefensiveActions = 
    (fotmobData.tackles_won_per_game + fotmobData.interceptions_per_game) * 0.2;
  
  // Position-specific form adjustments
  let positionAdjustment = 0;
  if (player.element_type === 4) { // Forwards
    positionAdjustment = recentShotTrend + (recentCreativity * 0.5);
  } else if (player.element_type === 2) { // Defenders
    positionAdjustment = recentDefensiveActions * 1.5;
  } else if (player.element_type === 3) { // Midfielders
    positionAdjustment = (recentShotTrend + recentCreativity + recentDefensiveActions) * 0.7;
  }
  
  // Calculate trend: -10 (very poor form) to +10 (excellent form)
  const formDifference = baseFplForm - seasonAverage;
  const enhancedTrend = formDifference + positionAdjustment;
  
  return Math.max(-10, Math.min(10, enhancedTrend));
}

/**
 * 🔥 Enhanced Braai Rating with FotMob reliability indicators
 * Improved consistency score using additional reliability metrics
 */
export function calculateEnhancedBraaiRating(
  player: any, 
  fotmobData: FotMobPlayerData
): number {
  const baseBraai = calculateAdvancedMetrics(player).braaiRating || 0;
  
  // FotMob consistency indicators
  const passAccuracy = fotmobData.pass_accuracy || 70;
  const disciplineScore = Math.max(0, 10 - (fotmobData.cards_per_game * 20));
  const consistencyBonus = Math.min(15, (passAccuracy - 70) / 2);
  
  // Additional reliability factors
  let positionReliability = 0;
  if (player.element_type === 1) { // Goalkeepers
    // GKs are naturally more consistent
    positionReliability = 5;
  } else if (player.element_type === 2) { // Defenders  
    // Defensive consistency based on defensive actions
    positionReliability = Math.min(8, fotmobData.clearances_per_game);
  }
  
  const enhancedRating = baseBraai + consistencyBonus + disciplineScore + positionReliability;
  return Math.min(100, Math.round(enhancedRating));
}

/**
 * 💥 Enhanced Klap Potential with FotMob shooting data
 * Improved explosive potential using detailed shooting metrics
 */
export function calculateEnhancedKlapPotential(
  player: any, 
  fotmobData: FotMobPlayerData  
): number {
  const baseKlap = calculateAdvancedMetrics(player).klapPotential || 0;
  
  // FotMob explosive potential indicators
  const shotVolume = fotmobData.shots_per_game || 0;
  const bigChanceInvolvement = (fotmobData.big_chances_created + (fotmobData.touches_in_box_per_game * 0.5)) || 0;
  const creativeThreat = fotmobData.key_passes_per_game || 0;
  
  // Enhanced explosive potential calculation
  const explosiveBonus = (
    Math.min(15, shotVolume * 3) +              // Shot volume bonus
    Math.min(20, bigChanceInvolvement * 2) +    // Big chance involvement  
    Math.min(10, creativeThreat * 4)            // Creative contribution
  );
  
  const enhancedKlap = baseKlap + explosiveBonus;
  return Math.min(100, Math.round(enhancedKlap));
}

/**
 * Main hook for FotMob-enhanced player analytics
 */
export function useFotMobEnhancedAnalytics(
  fplPlayers: any[], 
  fotmobData?: FotMobPlayerData[]
): EnhancedPlayerMetrics[] {
  return useMemo(() => {
    if (!fplPlayers?.length) return [];
    
    return fplPlayers.map(player => {
      const fotmobStats = fotmobData?.find(fm => fm.fplId === player.id);
      const baseMetrics = calculateAdvancedMetrics(player);
      
      if (fotmobStats) {
        // Full FotMob enhancement available
        return {
          playerId: player.id,
          name: `${player.first_name} ${player.second_name}`,
          
          // Base metrics
          braaiRating: baseMetrics.braaiRating || 0,
          biltongValue: baseMetrics.biltongValue || 0, 
          klapPotential: baseMetrics.klapPotential || 0,
          
          // NEW: FotMob-enhanced metrics
          shotQualityIndex: calculateShotQualityIndex(fotmobStats),
          defensiveImpactScore: calculateDefensiveImpactScore(fotmobStats),
          creativeThreatIndex: calculateCreativeThreatIndex(fotmobStats),
          defconPotential: calculateDefconPotential(fotmobStats),
          enhancedFormTrend: calculateEnhancedFormTrend(player, fotmobStats),
          
          // Enhanced SA metrics
          enhancedBraaiRating: calculateEnhancedBraaiRating(player, fotmobStats),
          enhancedKlapPotential: calculateEnhancedKlapPotential(player, fotmobStats),
          
          // Quality indicators
          dataQuality: 'high' as const,
          fotmobDataAvailable: true,
          lastUpdated: new Date().toISOString(),
        };
      } else {
        // Fallback to FPL-only metrics
        return {
          playerId: player.id,
          name: `${player.first_name} ${player.second_name}`,
          
          // Base metrics only
          braaiRating: baseMetrics.braaiRating || 0,
          biltongValue: baseMetrics.biltongValue || 0,
          klapPotential: baseMetrics.klapPotential || 0,
          
          // Estimated metrics (lower confidence)
          shotQualityIndex: Math.round((baseMetrics.klapPotential || 0) * 0.6),
          defensiveImpactScore: player.element_type === 2 ? 
            Math.round((baseMetrics.braaiRating || 0) * 0.7) : 20,
          creativeThreatIndex: player.element_type === 3 ? 
            Math.round((baseMetrics.klapPotential || 0) * 0.8) : 15,
          defconPotential: player.element_type === 2 ? 
            Math.round((baseMetrics.braaiRating || 0) * 0.5) : 10,
          enhancedFormTrend: parseFloat(player.form || '0') - parseFloat(player.points_per_game || '0'),
          
          // Same as base (no enhancement available)
          enhancedBraaiRating: baseMetrics.braaiRating || 0,
          enhancedKlapPotential: baseMetrics.klapPotential || 0,
          
          // Quality indicators
          dataQuality: 'medium' as const,
          fotmobDataAvailable: false,
          lastUpdated: new Date().toISOString(),
        };
      }
    });
  }, [fplPlayers, fotmobData]);
}

/**
 * 🏆 SA-flavored insights with FotMob enhancement
 */
export function generateFotMobEnhancedInsights(metrics: EnhancedPlayerMetrics): string[] {
  const insights: string[] = [];
  
  // DEFCON potential insights (NEW!)
  if (metrics.defconPotential >= 80) {
    insights.push("🛡️ Eish, this boet is gonna be a DEFCON machine! Blocks and recoveries for days!");
  } else if (metrics.defconPotential >= 60) {
    insights.push("🛡️ Solid DEFCON potential here - defensive points coming your way, china!");
  }
  
  // Shot quality insights
  if (metrics.shotQualityIndex >= 80) {
    insights.push("🎯 Clinical finishing like a Springbok penalty kick - this ou knows how to find the net!");
  } else if (metrics.shotQualityIndex >= 60) {
    insights.push("🎯 Good shot quality - not just shooting for the sake of it, hey!");
  }
  
  // Enhanced form insights  
  if (metrics.enhancedFormTrend >= 5) {
    insights.push("📈 This player is hotter than a Durban curry right now - form is flying!");
  } else if (metrics.enhancedFormTrend <= -5) {
    insights.push("📉 Yoh, this ou is colder than a Cape Town winter - form needs watching!");
  }
  
  // Creative threat insights
  if (metrics.creativeThreatIndex >= 75) {
    insights.push("⚡ Creative genius! This boet creates chances like a boerewors creates hunger!");
  }
  
  // Data quality indicator
  if (metrics.fotmobDataAvailable) {
    insights.push("✨ Enhanced with professional FotMob data - these insights are sharp sharp!");
  } else {
    insights.push("📊 Based on FPL data only - still lekker, but could be even better with more data!");
  }
  
  return insights;
}

/**
 * Export utility functions for external use
 */
export const FotMobUtils = {
  calculateShotQualityIndex,
  calculateDefensiveImpactScore, 
  calculateCreativeThreatIndex,
  calculateDefconPotential,
  calculateEnhancedFormTrend,
  calculateEnhancedBraaiRating,
  calculateEnhancedKlapPotential,
  generateFotMobEnhancedInsights,
};
