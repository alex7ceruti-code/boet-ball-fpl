/**
 * BoetBall Player Recommendation Engine
 * 
 * Intelligent recommendation system that combines:
 * - Future point predictions (4-6 GW outlook)
 * - Risk assessment (rotation, injury, price, volatility)
 * - Budget constraints and user preferences
 * - Conservative/Balanced/Aggressive modes
 * 
 * Generates personalized player recommendations with confidence scoring
 * and South African flair.
 * 
 * @author BoetBall Analytics Team
 * @version 2.0.0
 */

import BoetBallPredictionEngine, { type PredictionConfig, type PlayerPrediction } from './prediction-engine';
import BoetBallRiskAssessment, { type RiskAssessmentConfig, type PlayerRiskProfile } from './risk-assessment';
import { db } from '@/lib/db';

export interface RecommendationConfig {
  // User preferences
  riskTolerance: 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE';
  budgetConstraints: {
    maxPlayerPrice?: number;
    totalBudget?: number;
    positionBudgets?: {
      gk?: number;
      def?: number;
      mid?: number;
      fwd?: number;
    };
  };
  
  // Prediction settings
  predictionHorizon: number; // 4-6 gameweeks
  minConfidence: number; // 0-1
  
  // Filtering options
  positions?: string[]; // ['DEF', 'MID', 'FWD', 'GK']
  excludePlayerIds?: number[];
  onlyShowAvailable?: boolean; // Filter out injured/suspended
  
  // Recommendation limits
  maxRecommendations?: number;
  includeAlternatives?: boolean;
}

export interface PlayerRecommendation {
  // Player info
  playerId: number;
  playerName: string;
  webName: string;
  position: string;
  team: string;
  currentPrice: number;
  ownership: number;
  
  // Prediction data
  prediction: {
    totalExpectedPoints: number;
    averageExpected: number;
    confidence: number;
    trend: 'rising' | 'stable' | 'declining';
    nextGameweekExpected: number;
  };
  
  // Risk profile
  risk: {
    overallScore: number;
    category: string;
    primaryConcerns: string[];
    suitabilityScore: number; // For user's risk tolerance
  };
  
  // Recommendation details
  recommendation: {
    action: 'STRONG_BUY' | 'BUY' | 'CONSIDER' | 'HOLD' | 'AVOID';
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    confidence: number;
    reasoning: string[];
    saFlair: string; // South African commentary
  };
  
  // Comparison metrics
  metrics: {
    valueScore: number; // Points per million
    reliabilityScore: number; // Consistency rating
    upside: number; // Potential ceiling
    floor: number; // Potential floor
  };
  
  // Timing
  bestTransferWindow: {
    start: number; // Gameweek
    end: number;   // Gameweek  
    reason: string;
  };
}

export interface RecommendationReport {
  // User context
  userId?: string;
  generatedAt: string;
  config: RecommendationConfig;
  
  // Recommendations by category
  recommendations: {
    strongBuys: PlayerRecommendation[];
    buys: PlayerRecommendation[];
    considerations: PlayerRecommendation[];
    holds: PlayerRecommendation[];
    avoids: PlayerRecommendation[];
  };
  
  // Special categories
  specialPicks: {
    braaiBankers: PlayerRecommendation[]; // Most reliable picks
    biltongBudget: PlayerRecommendation[]; // Best value finds
    klapPotential: PlayerRecommendation[]; // High ceiling plays
    safeHavens: PlayerRecommendation[];   // Conservative options
    differentials: PlayerRecommendation[]; // Low-owned gems
  };
  
  // Summary insights
  insights: {
    totalPlayersAnalyzed: number;
    avgConfidence: number;
    topRecommendation: PlayerRecommendation;
    budgetOptimal: PlayerRecommendation[];
    riskWarnings: string[];
  };
}

export class BoetBallRecommendationEngine {
  private predictionEngine: BoetBallPredictionEngine;
  private riskAssessment: BoetBallRiskAssessment;
  private initialized = false;

  constructor() {
    this.predictionEngine = new BoetBallPredictionEngine();
    this.riskAssessment = new BoetBallRiskAssessment();
  }

  /**
   * Initialize the recommendation engine
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) return true;
    
    try {
      console.log('🎯 Initializing BoetBall Recommendation Engine...');
      
      const [predictionInit, riskInit] = await Promise.all([
        this.predictionEngine.initialize(),
        this.riskAssessment.initialize()
      ]);
      
      if (!predictionInit || !riskInit) {
        throw new Error('Failed to initialize sub-engines');
      }
      
      this.initialized = true;
      console.log('✅ Recommendation engine ready');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize recommendation engine:', error);
      return false;
    }
  }

  /**
   * Generate comprehensive player recommendations
   */
  async generateRecommendations(
    config: RecommendationConfig,
    userId?: string
  ): Promise<RecommendationReport> {
    
    if (!this.initialized) {
      await this.initialize();
    }

    // Get user preferences if userId provided
    let userPrefs = null;
    if (userId) {
      userPrefs = await db.userAnalyticsPreferences.findUnique({
        where: { userId }
      }).catch(() => null);
    }

    // Merge user preferences with config
    const finalConfig = this.mergeWithUserPreferences(config, userPrefs);

    // Get candidate players based on filters
    const candidatePlayerIds = await this.getCandidatePlayers(finalConfig);
    
    console.log(`🔍 Analyzing ${candidatePlayerIds.length} candidate players...`);

    // Generate predictions and risk assessments
    const predictionConfig: PredictionConfig = {
      riskTolerance: finalConfig.riskTolerance,
      predictionHorizon: finalConfig.predictionHorizon,
      minConfidence: finalConfig.minConfidence,
      useExternalData: false
    };

    const riskConfig: RiskAssessmentConfig = {
      includeHistorical: true,
      confidenceThreshold: finalConfig.minConfidence,
      updateFrequency: 'hourly',
      dataSource: 'fpl_only'
    };

    // Run analysis in parallel
    const [predictions, riskProfiles] = await Promise.all([
      this.predictionEngine.predictMultiplePlayers(candidatePlayerIds, predictionConfig),
      this.riskAssessment.assessMultiplePlayers(candidatePlayerIds, riskConfig)
    ]);

    // Combine predictions with risk data
    const playerRecommendations = this.combineAnalysis(predictions, riskProfiles, finalConfig);

    // Categorize recommendations
    const categorized = this.categorizeRecommendations(playerRecommendations);

    // Generate special SA-flavored picks
    const specialPicks = this.generateSpecialPicks(playerRecommendations);

    // Create insights summary
    const insights = this.generateInsights(playerRecommendations, finalConfig);

    const report: RecommendationReport = {
      userId,
      generatedAt: new Date().toISOString(),
      config: finalConfig,
      recommendations: categorized,
      specialPicks,
      insights
    };

    // Save to database for tracking
    await this.saveRecommendationReport(report);

    return report;
  }

  /**
   * Get candidate players based on filters and constraints
   */
  private async getCandidatePlayers(config: RecommendationConfig): Promise<number[]> {
    // Fetch FPL data
    const response = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/');
    const fplData = await response.json();
    
    let candidates = fplData.elements || [];

    // Apply filters
    if (config.positions && config.positions.length > 0) {
      const positionMap = { 'GK': 1, 'DEF': 2, 'MID': 3, 'FWD': 4 };
      const elementTypes = config.positions.map(pos => positionMap[pos as keyof typeof positionMap]);
      candidates = candidates.filter((p: any) => elementTypes.includes(p.element_type));
    }

    // Budget constraints
    if (config.budgetConstraints.maxPlayerPrice) {
      const maxPrice = config.budgetConstraints.maxPlayerPrice * 10; // Convert to FPL units
      candidates = candidates.filter((p: any) => p.now_cost <= maxPrice);
    }

    // Availability filter
    if (config.onlyShowAvailable) {
      candidates = candidates.filter((p: any) => 
        p.status === 'a' && // Available
        (p.chance_of_playing_next_round === null || p.chance_of_playing_next_round >= 75)
      );
    }

    // Exclude specific players
    if (config.excludePlayerIds && config.excludePlayerIds.length > 0) {
      candidates = candidates.filter((p: any) => !config.excludePlayerIds!.includes(p.id));
    }

    // Focus on players with some track record
    candidates = candidates.filter((p: any) => 
      p.minutes > 0 || p.total_points > 0 // Has played or scored
    );

    return candidates.map((p: any) => p.id);
  }

  /**
   * Combine predictions with risk assessment
   */
  private combineAnalysis(
    predictions: PlayerPrediction[], 
    riskProfiles: PlayerRiskProfile[],
    config: RecommendationConfig
  ): PlayerRecommendation[] {
    
    const recommendations: PlayerRecommendation[] = [];
    
    for (const prediction of predictions) {
      const riskProfile = riskProfiles.find(r => r.playerId === prediction.playerId);
      if (!riskProfile) continue;

      // Get risk suitability score for user's tolerance
      const suitabilityScore = this.getSuitabilityScore(riskProfile, config.riskTolerance);
      
      // Determine recommendation action and priority
      const { action, priority, confidence, reasoning } = this.determineRecommendation(
        prediction, riskProfile, config
      );

      // Generate South African flair
      const saFlair = this.generateSAFlair(prediction, riskProfile, action);

      // Calculate additional metrics
      const metrics = this.calculatePlayerMetrics(prediction, riskProfile);

      // Determine best transfer window
      const bestWindow = this.calculateBestTransferWindow(prediction);

      const recommendation: PlayerRecommendation = {
        playerId: prediction.playerId,
        playerName: prediction.playerName,
        webName: prediction.playerName.split(' ').pop() || prediction.playerName,
        position: prediction.position,
        team: prediction.team,
        currentPrice: prediction.currentPrice,
        ownership: 0, // Would get from FPL data
        
        prediction: {
          totalExpectedPoints: prediction.outlookSummary.totalExpectedPoints,
          averageExpected: prediction.outlookSummary.averageExpected,
          confidence: prediction.outlookSummary.confidence,
          trend: prediction.outlookSummary.trend,
          nextGameweekExpected: prediction.predictions[0]?.predictedPoints || 0
        },
        
        risk: {
          overallScore: riskProfile.overallRisk.score,
          category: riskProfile.overallRisk.category,
          primaryConcerns: riskProfile.overallRisk.primaryConcerns,
          suitabilityScore
        },
        
        recommendation: {
          action,
          priority,
          confidence,
          reasoning,
          saFlair
        },
        
        metrics,
        bestTransferWindow: bestWindow
      };

      recommendations.push(recommendation);
    }

    return recommendations;
  }

  /**
   * Get suitability score for user's risk tolerance
   */
  private getSuitabilityScore(riskProfile: PlayerRiskProfile, tolerance: string): number {
    switch (tolerance) {
      case 'CONSERVATIVE':
        return riskProfile.recommendations.conservative.score;
      case 'AGGRESSIVE':
        return riskProfile.recommendations.aggressive.score;
      default:
        return riskProfile.recommendations.balanced.score;
    }
  }

  /**
   * Determine recommendation action and priority
   */
  private determineRecommendation(
    prediction: PlayerPrediction,
    risk: PlayerRiskProfile,
    config: RecommendationConfig
  ): any {
    const avgExpected = prediction.outlookSummary.averageExpected;
    const confidence = prediction.outlookSummary.confidence;
    const overallRisk = risk.overallRisk.score;
    const suitabilityScore = this.getSuitabilityScore(risk, config.riskTolerance);
    
    const reasoning: string[] = [];
    
    // Strong Buy criteria
    if (avgExpected >= 6.0 && confidence >= 0.75 && suitabilityScore >= 70) {
      reasoning.push(`Exceptional returns: ${avgExpected.toFixed(1)} PPG expected`);
      reasoning.push(`High confidence: ${Math.round(confidence * 100)}%`);
      return {
        action: 'STRONG_BUY' as const,
        priority: 'HIGH' as const,
        confidence,
        reasoning
      };
    }

    // Buy criteria  
    if (avgExpected >= 4.5 && confidence >= 0.65 && suitabilityScore >= 60) {
      reasoning.push(`Strong returns: ${avgExpected.toFixed(1)} PPG expected`);
      reasoning.push(`Good fit for ${config.riskTolerance.toLowerCase()} strategy`);
      return {
        action: 'BUY' as const,
        priority: avgExpected >= 5.5 ? 'HIGH' as const : 'MEDIUM' as const,
        confidence,
        reasoning
      };
    }

    // Consider criteria
    if (avgExpected >= 3.5 && confidence >= 0.55 && suitabilityScore >= 45) {
      reasoning.push(`Decent returns: ${avgExpected.toFixed(1)} PPG expected`);
      if (overallRisk <= 40) reasoning.push('Low risk profile');
      if (prediction.outlookSummary.trend === 'rising') reasoning.push('Improving trend');
      return {
        action: 'CONSIDER' as const,
        priority: 'MEDIUM' as const,
        confidence,
        reasoning
      };
    }

    // Hold criteria (for existing picks)
    if (avgExpected >= 3.0 && overallRisk <= 60) {
      reasoning.push(`Stable returns expected: ${avgExpected.toFixed(1)} PPG`);
      return {
        action: 'HOLD' as const,
        priority: 'LOW' as const,
        confidence,
        reasoning
      };
    }

    // Avoid criteria
    reasoning.push(avgExpected < 3.0 ? 'Low expected returns' : 'High risk profile');
    if (confidence < 0.5) reasoning.push('Low prediction confidence');
    if (overallRisk > 70) reasoning.push('Multiple risk factors');
    
    return {
      action: 'AVOID' as const,
      priority: 'LOW' as const,
      confidence,
      reasoning
    };
  }

  /**
   * Generate South African flair commentary
   */
  private generateSAFlair(
    prediction: PlayerPrediction,
    risk: PlayerRiskProfile,
    action: string
  ): string {
    const avgExpected = prediction.outlookSummary.averageExpected;
    const playerName = prediction.playerName.split(' ').pop();
    
    switch (action) {
      case 'STRONG_BUY':
        return `Eish, ${playerName} is about to deliver a proper klap! This ou toppie is hotter than a Durban summer! 🔥🇿🇦`;
      
      case 'BUY':
        return `Ja boet, ${playerName} looks solid as a Castle Lager! Good returns coming like the Springboks at home! 💪`;
      
      case 'CONSIDER':
        if (risk.overallRisk.score <= 30) {
          return `${playerName} is safe as houses, but returns might be flatter than a pap breakfast. Solid choice though! 🏠`;
        } else {
          return `${playerName} could deliver, but it's more risky than driving in Joburg traffic. Proceed with caution! ⚠️`;
        }
      
      case 'HOLD':
        return `${playerName} is steady like a bakkie - nothing fancy but gets the job done week in, week out! 🚛`;
      
      case 'AVOID':
        return `Ag man, ${playerName} is riskier than a braai in the rain. Rather save your rand for better options! ☔`;
      
      default:
        return `${playerName} is an interesting shout, hey!`;
    }
  }

  /**
   * Calculate player metrics for comparison
   */
  private calculatePlayerMetrics(
    prediction: PlayerPrediction,
    risk: PlayerRiskProfile
  ): any {
    const avgExpected = prediction.outlookSummary.averageExpected;
    const price = prediction.currentPrice;
    
    // Value score (points per million)
    const valueScore = Math.round((avgExpected / price) * 10) / 10;
    
    // Reliability (consistency - lower risk = higher reliability)
    const reliabilityScore = Math.max(0, 100 - risk.overallRisk.score);
    
    // Upside (best case scenario)
    const maxPrediction = Math.max(...prediction.predictions.map(p => p.predictedPoints));
    const upside = Math.round(maxPrediction * 1.2); // 20% optimistic scenario
    
    // Floor (worst case but still playing)
    const minPrediction = Math.min(...prediction.predictions.map(p => p.predictedPoints));
    const floor = Math.round(minPrediction * 0.8); // 20% pessimistic scenario
    
    return {
      valueScore,
      reliabilityScore,
      upside,
      floor
    };
  }

  /**
   * Calculate best transfer window
   */
  private calculateBestTransferWindow(prediction: PlayerPrediction): any {
    const predictions = prediction.predictions;
    if (predictions.length === 0) {
      return { start: 1, end: 1, reason: 'No fixture data available' };
    }
    
    // Find the best consecutive 3-4 gameweek window
    let bestStart = predictions[0].gameweek;
    let bestEnd = bestStart + 2;
    let bestTotal = 0;
    
    for (let i = 0; i <= predictions.length - 3; i++) {
      const windowTotal = predictions.slice(i, i + 3).reduce((sum, p) => sum + p.predictedPoints, 0);
      if (windowTotal > bestTotal) {
        bestTotal = windowTotal;
        bestStart = predictions[i].gameweek;
        bestEnd = predictions[i + 2].gameweek;
      }
    }
    
    return {
      start: bestStart,
      end: bestEnd,
      reason: `Best 3-GW window: ${(bestTotal / 3).toFixed(1)} PPG expected`
    };
  }

  /**
   * Categorize recommendations by action
   */
  private categorizeRecommendations(recommendations: PlayerRecommendation[]): any {
    return {
      strongBuys: recommendations
        .filter(r => r.recommendation.action === 'STRONG_BUY')
        .sort((a, b) => b.prediction.averageExpected - a.prediction.averageExpected),
      
      buys: recommendations
        .filter(r => r.recommendation.action === 'BUY')
        .sort((a, b) => b.prediction.averageExpected - a.prediction.averageExpected),
      
      considerations: recommendations
        .filter(r => r.recommendation.action === 'CONSIDER')
        .sort((a, b) => b.metrics.valueScore - a.metrics.valueScore),
      
      holds: recommendations
        .filter(r => r.recommendation.action === 'HOLD')
        .sort((a, b) => b.metrics.reliabilityScore - a.metrics.reliabilityScore),
      
      avoids: recommendations
        .filter(r => r.recommendation.action === 'AVOID')
        .sort((a, b) => a.risk.overallScore - b.risk.overallScore)
    };
  }

  /**
   * Generate special SA-flavored recommendation categories
   */
  private generateSpecialPicks(recommendations: PlayerRecommendation[]): any {
    const eligible = recommendations.filter(r => 
      ['STRONG_BUY', 'BUY', 'CONSIDER'].includes(r.recommendation.action)
    );

    return {
      // Braai Bankers - Most reliable options
      braaiBankers: eligible
        .filter(r => r.metrics.reliabilityScore >= 70 && r.risk.overallScore <= 40)
        .sort((a, b) => b.metrics.reliabilityScore - a.metrics.reliabilityScore)
        .slice(0, 5),

      // Biltong Budget - Best value picks
      biltongBudget: eligible
        .filter(r => r.currentPrice <= 7.0 && r.metrics.valueScore >= 0.6)
        .sort((a, b) => b.metrics.valueScore - a.metrics.valueScore)
        .slice(0, 5),

      // Klap Potential - High ceiling plays
      klapPotential: eligible
        .filter(r => r.metrics.upside >= 10)
        .sort((a, b) => b.metrics.upside - a.metrics.upside)
        .slice(0, 5),

      // Safe Havens - Conservative picks
      safeHavens: eligible
        .filter(r => r.risk.overallScore <= 30 && r.prediction.confidence >= 0.7)
        .sort((a, b) => b.prediction.confidence - a.prediction.confidence)
        .slice(0, 5),

      // Differentials - Low owned gems  
      differentials: eligible
        .filter(r => r.ownership < 15 && r.prediction.averageExpected >= 4.0)
        .sort((a, b) => b.prediction.averageExpected - a.prediction.averageExpected)
        .slice(0, 5)
    };
  }

  /**
   * Generate summary insights
   */
  private generateInsights(recommendations: PlayerRecommendation[], config: RecommendationConfig): any {
    const strongBuys = recommendations.filter(r => r.recommendation.action === 'STRONG_BUY');
    const avgConfidence = recommendations.reduce((sum, r) => sum + r.prediction.confidence, 0) / recommendations.length;
    
    const topRecommendation = recommendations
      .filter(r => ['STRONG_BUY', 'BUY'].includes(r.recommendation.action))
      .sort((a, b) => b.prediction.averageExpected - a.prediction.averageExpected)[0];

    // Budget optimal (best value within budget)
    const budgetOptimal = recommendations
      .filter(r => r.currentPrice <= (config.budgetConstraints.maxPlayerPrice || 15))
      .sort((a, b) => b.metrics.valueScore - a.metrics.valueScore)
      .slice(0, 3);

    // Risk warnings
    const riskWarnings: string[] = [];
    const highRiskPlayers = recommendations.filter(r => r.risk.overallScore > 70).length;
    if (highRiskPlayers > recommendations.length * 0.3) {
      riskWarnings.push(`${highRiskPlayers} players have high risk profiles - consider lowering risk tolerance`);
    }

    const lowConfidencePlayers = recommendations.filter(r => r.prediction.confidence < 0.6).length;
    if (lowConfidencePlayers > recommendations.length * 0.2) {
      riskWarnings.push(`${lowConfidencePlayers} predictions have low confidence - wait for more data`);
    }

    return {
      totalPlayersAnalyzed: recommendations.length,
      avgConfidence: Math.round(avgConfidence * 100) / 100,
      topRecommendation,
      budgetOptimal,
      riskWarnings
    };
  }

  /**
   * Merge config with user preferences
   */
  private mergeWithUserPreferences(config: RecommendationConfig, userPrefs: any): RecommendationConfig {
    if (!userPrefs) return config;

    return {
      ...config,
      riskTolerance: config.riskTolerance || userPrefs.riskTolerance || 'BALANCED',
      predictionHorizon: config.predictionHorizon || userPrefs.predictionHorizon || 6,
      minConfidence: config.minConfidence || userPrefs.minConfidence || 0.6,
      budgetConstraints: {
        ...config.budgetConstraints,
        maxPlayerPrice: config.budgetConstraints.maxPlayerPrice || userPrefs.maxPlayerPrice,
        totalBudget: config.budgetConstraints.totalBudget || userPrefs.totalBudget
      }
    };
  }

  /**
   * Save recommendation report for analytics
   */
  private async saveRecommendationReport(report: RecommendationReport): Promise<void> {
    try {
      // Would save to a RecommendationReport table if we had one
      // For now, just log summary
      console.log(`✅ Generated ${report.recommendations.strongBuys.length} strong buy recommendations`);
      console.log(`📊 Average confidence: ${Math.round(report.insights.avgConfidence * 100)}%`);
    } catch (error) {
      console.error('Failed to save recommendation report:', error);
    }
  }

  /**
   * Get position name helper
   */
  private getPositionName(elementType: number): string {
    const positions = { 1: 'GK', 2: 'DEF', 3: 'MID', 4: 'FWD' };
    return positions[elementType as keyof typeof positions] || 'UNK';
  }
}

export default BoetBallRecommendationEngine;
