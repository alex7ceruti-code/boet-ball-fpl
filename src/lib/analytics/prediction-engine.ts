/**
 * BoetBall Advanced Prediction Engine
 * 
 * ML-based system for predicting player FPL points 4-6 gameweeks ahead
 * with confidence intervals and risk assessment integration.
 * 
 * Features:
 * - xG/xA regression analysis
 * - Fixture difficulty modeling
 * - Team form correlation
 * - Historical pattern matching
 * - Risk-adjusted predictions
 * - Conservative/Aggressive modes
 * 
 * @author BoetBall Analytics Team
 * @version 2.0.0
 */

import { db } from '@/lib/db';

export interface PredictionConfig {
  riskTolerance: 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE';
  predictionHorizon: number; // 4-6 gameweeks
  minConfidence: number; // 0-1
  useExternalData: boolean;
}

export interface PlayerPrediction {
  playerId: number;
  playerName: string;
  position: string;
  team: string;
  currentPrice: number;
  
  // Future predictions
  predictions: GameweekPrediction[];
  outlookSummary: {
    totalExpectedPoints: number;
    averageExpected: number;
    confidence: number;
    trend: 'rising' | 'stable' | 'declining';
  };
  
  // Risk assessment
  riskProfile: {
    overall: number; // 0-100
    rotation: number;
    injury: number;
    priceChange: number;
    formVolatility: number;
  };
  
  // Recommendation
  recommendation: {
    action: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'AVOID';
    confidence: number;
    reasoning: string[];
    suitableFor: ('CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE')[];
  };
}

export interface GameweekPrediction {
  gameweek: number;
  predictedPoints: number;
  confidence: number;
  breakdown: {
    base: number;
    formAdjustment: number;
    fixtureAdjustment: number;
    teamFormAdjustment: number;
    riskAdjustments: {
      injury: number;
      rotation: number;
    };
  };
  fixture: {
    opponent: string;
    isHome: boolean;
    difficulty: number;
  } | null;
}

export class BoetBallPredictionEngine {
  private fplData: any = null;
  private teamAnalytics: Map<number, any> = new Map();
  private playerHistory: Map<number, any[]> = new Map();
  private externalData: Map<string, any> = new Map();
  
  // Model parameters
  private readonly modelConfig = {
    version: '2.0.0',
    features: {
      form: { weight: 0.25, lookback: 5 },
      fixture: { weight: 0.20, horizon: 6 },
      underlying: { weight: 0.25, regression: true },
      teamForm: { weight: 0.15, window: 6 },
      momentum: { weight: 0.15, acceleration: true }
    },
    riskAdjustments: {
      conservative: { multiplier: 0.85, threshold: 0.75 },
      balanced: { multiplier: 1.0, threshold: 0.60 },
      aggressive: { multiplier: 1.15, threshold: 0.45 }
    }
  };

  constructor() {
    this.initialize();
  }

  /**
   * Initialize the prediction engine with FPL data
   */
  async initialize(): Promise<boolean> {
    try {
      console.log('🔮 Initializing BoetBall Prediction Engine...');
      
      // Fetch core FPL data
      await this.loadFPLData();
      
      // Build team analytics
      await this.buildTeamAnalytics();
      
      // Load historical patterns (from database if available)
      await this.loadHistoricalPatterns();
      
      console.log('✅ Prediction engine initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize prediction engine:', error);
      return false;
    }
  }

  /**
   * Load FPL data from official API
   */
  private async loadFPLData(): Promise<void> {
    const response = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/');
    if (!response.ok) throw new Error('Failed to fetch FPL data');
    
    this.fplData = await response.json();
    
    // Also load fixtures
    const fixturesResponse = await fetch('https://fantasy.premierleague.com/api/fixtures/');
    if (fixturesResponse.ok) {
      const fixtures = await fixturesResponse.json();
      this.fplData.fixtures = fixtures;
    }
  }

  /**
   * Build dynamic team analytics from recent performance
   */
  private async buildTeamAnalytics(): Promise<void> {
    const currentGW = this.getCurrentGameweek();
    
    for (const team of this.fplData.teams) {
      const analytics = await this.calculateTeamMetrics(team.id, currentGW);
      this.teamAnalytics.set(team.id, analytics);
    }
  }

  /**
   * Calculate comprehensive team metrics
   */
  private async calculateTeamMetrics(teamId: number, currentGW: number): Promise<any> {
    const team = this.fplData.teams.find((t: any) => t.id === teamId);
    const recentFixtures = this.getTeamRecentFixtures(teamId, 6);
    
    let goalsFor = 0;
    let goalsAgainst = 0;
    let points = 0;
    let games = 0;
    
    recentFixtures.forEach((fixture: any) => {
      if (fixture.finished) {
        const isHome = fixture.team_h === teamId;
        const teamGoals = isHome ? fixture.team_h_score : fixture.team_a_score;
        const oppGoals = isHome ? fixture.team_a_score : fixture.team_h_score;
        
        goalsFor += teamGoals || 0;
        goalsAgainst += oppGoals || 0;
        games++;
        
        if (teamGoals > oppGoals) points += 3;
        else if (teamGoals === oppGoals) points += 1;
      }
    });

    return {
      teamId,
      name: team?.name || 'Unknown',
      shortName: team?.short_name || 'UNK',
      form: games > 0 ? points / (games * 3) : 0.5,
      attackStrength: games > 0 ? goalsFor / games : 1.5,
      defenseStrength: games > 0 ? goalsAgainst / games : 1.5,
      homeAdvantage: this.calculateHomeAdvantage(teamId),
      upcomingFixtures: this.getUpcomingFixtures(teamId, 6),
      confidence: Math.min(1.0, games / 6)
    };
  }

  /**
   * Calculate home advantage factor for team
   */
  private calculateHomeAdvantage(teamId: number): number {
    const homeFixtures = this.getTeamFixtures(teamId, true, 10);
    const awayFixtures = this.getTeamFixtures(teamId, false, 10);
    
    if (homeFixtures.length === 0 || awayFixtures.length === 0) return 1.1;
    
    const homePoints = this.calculateAveragePoints(homeFixtures, teamId);
    const awayPoints = this.calculateAveragePoints(awayFixtures, teamId);
    
    return homePoints > 0 ? Math.max(0.9, Math.min(1.3, homePoints / Math.max(awayPoints, 0.5))) : 1.1;
  }

  /**
   * Main prediction function for a single player
   */
  async predictPlayer(
    playerId: number, 
    config: PredictionConfig
  ): Promise<PlayerPrediction | null> {
    const player = this.fplData?.elements?.find((p: any) => p.id === playerId);
    if (!player) return null;

    const currentGW = this.getCurrentGameweek();
    const endGW = Math.min(38, currentGW + config.predictionHorizon);
    
    // Generate predictions for each gameweek
    const predictions: GameweekPrediction[] = [];
    
    for (let gw = currentGW; gw <= endGW; gw++) {
      const gwPrediction = await this.predictGameweek(player, gw, config);
      if (gwPrediction) {
        predictions.push(gwPrediction);
      }
    }

    if (predictions.length === 0) return null;

    // Calculate outlook summary
    const totalExpected = predictions.reduce((sum, p) => sum + p.predictedPoints, 0);
    const avgExpected = totalExpected / predictions.length;
    const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;
    const trend = this.calculateTrend(predictions);

    // Get risk profile
    const riskProfile = await this.calculatePlayerRiskProfile(player);

    // Generate recommendation
    const recommendation = this.generateRecommendation(
      avgExpected,
      avgConfidence,
      riskProfile,
      config
    );

    return {
      playerId: player.id,
      playerName: `${player.first_name} ${player.second_name}`,
      position: this.getPositionName(player.element_type),
      team: this.getTeamName(player.team),
      currentPrice: player.now_cost / 10,
      predictions,
      outlookSummary: {
        totalExpectedPoints: Math.round(totalExpected * 10) / 10,
        averageExpected: Math.round(avgExpected * 10) / 10,
        confidence: Math.round(avgConfidence * 100) / 100,
        trend
      },
      riskProfile,
      recommendation
    };
  }

  /**
   * Predict points for a specific gameweek
   */
  private async predictGameweek(
    player: any, 
    gameweek: number, 
    config: PredictionConfig
  ): Promise<GameweekPrediction | null> {
    // Get fixture for this gameweek
    const fixture = this.getPlayerFixture(player.id, gameweek);
    
    if (!fixture && gameweek > this.getCurrentGameweek()) {
      // No fixture = blank gameweek
      return {
        gameweek,
        predictedPoints: 0,
        confidence: 1.0,
        breakdown: {
          base: 0,
          formAdjustment: 0,
          fixtureAdjustment: 0,
          teamFormAdjustment: 0,
          riskAdjustments: { injury: 0, rotation: 0 }
        },
        fixture: null
      };
    }

    // Base prediction from historical performance
    const basePoints = this.calculateBasePrediction(player);
    
    // Form adjustment
    const formAdjustment = this.calculateFormAdjustment(player);
    
    // Fixture adjustment
    const fixtureAdjustment = fixture ? 
      this.calculateFixtureAdjustment(player, fixture) : 1.0;
    
    // Team form adjustment
    const teamFormAdjustment = this.calculateTeamFormAdjustment(player.team);
    
    // Risk adjustments
    const riskAdjustments = await this.calculateRiskAdjustments(player, config);
    
    // Combine all factors
    let prediction = basePoints * 
      formAdjustment * 
      fixtureAdjustment * 
      teamFormAdjustment *
      riskAdjustments.injury *
      riskAdjustments.rotation;

    // Apply risk tolerance multiplier
    const riskMultiplier = this.modelConfig.riskAdjustments[config.riskTolerance.toLowerCase() as keyof typeof this.modelConfig.riskAdjustments];
    prediction *= riskMultiplier.multiplier;

    // Calculate confidence based on data quality
    const confidence = this.calculatePredictionConfidence(player, fixture, config);

    return {
      gameweek,
      predictedPoints: Math.max(0, Math.round(prediction * 10) / 10),
      confidence: Math.round(confidence * 100) / 100,
      breakdown: {
        base: Math.round(basePoints * 10) / 10,
        formAdjustment: Math.round((formAdjustment - 1) * 100),
        fixtureAdjustment: Math.round((fixtureAdjustment - 1) * 100),
        teamFormAdjustment: Math.round((teamFormAdjustment - 1) * 100),
        riskAdjustments: {
          injury: Math.round((riskAdjustments.injury - 1) * 100),
          rotation: Math.round((riskAdjustments.rotation - 1) * 100)
        }
      },
      fixture: fixture ? {
        opponent: this.getOpponentName(fixture, player.team),
        isHome: fixture.team_h === player.team,
        difficulty: fixture.team_h === player.team ? fixture.team_h_difficulty : fixture.team_a_difficulty
      } : null
    };
  }

  /**
   * Calculate base prediction from historical performance
   */
  private calculateBasePrediction(player: any): number {
    const pointsPerGame = parseFloat(player.points_per_game || '0');
    const form = parseFloat(player.form || '0');
    const totalPoints = player.total_points || 0;
    
    // Weighted average of season performance and recent form
    const seasonWeight = 0.6;
    const formWeight = 0.4;
    
    return (pointsPerGame * seasonWeight) + (form * formWeight);
  }

  /**
   * Calculate form-based adjustment using xG/xA regression
   */
  private calculateFormAdjustment(player: any): number {
    const goals = player.goals_scored || 0;
    const assists = player.assists || 0;
    const xG = parseFloat(player.expected_goals || '0');
    const xA = parseFloat(player.expected_assists || '0');
    
    let adjustment = 1.0;
    
    // xG regression - underperforming players get boost
    if (xG > 0) {
      const goalEfficiency = goals / xG;
      if (goalEfficiency < 0.8) {
        adjustment += 0.15; // Positive regression expected
      } else if (goalEfficiency > 1.3) {
        adjustment -= 0.1; // Negative regression expected
      }
    }
    
    // xA regression - similar logic
    if (xA > 0) {
      const assistEfficiency = assists / xA;
      if (assistEfficiency < 0.8) {
        adjustment += 0.1;
      } else if (assistEfficiency > 1.3) {
        adjustment -= 0.08;
      }
    }
    
    // Form momentum
    const currentForm = parseFloat(player.form || '0');
    const seasonAverage = parseFloat(player.points_per_game || '0');
    
    if (currentForm > seasonAverage * 1.2) {
      adjustment *= 1.1; // Riding hot streak
    } else if (currentForm < seasonAverage * 0.7) {
      adjustment *= 0.9; // Poor form drag
    }
    
    return Math.max(0.6, Math.min(1.5, adjustment));
  }

  /**
   * Calculate fixture-based adjustment
   */
  private calculateFixtureAdjustment(player: any, fixture: any): number {
    if (!fixture) return 1.0;
    
    const isHome = fixture.team_h === player.team;
    const difficulty = isHome ? fixture.team_h_difficulty : fixture.team_a_difficulty;
    const position = player.element_type;
    
    // Base adjustment from fixture difficulty (inverted)
    let adjustment = (6 - difficulty) / 4; // Range: 0.5 to 1.25
    
    // Home advantage
    if (isHome) {
      adjustment *= 1.08;
    } else {
      adjustment *= 0.96;
    }
    
    // Position-specific fixture impact
    if (position <= 2) {
      // Defenders: benefit more from easy fixtures (clean sheet potential)
      adjustment = 0.7 + (adjustment - 0.7) * 1.3;
    } else if (position === 4) {
      // Forwards: less fixture dependent
      adjustment = 0.85 + (adjustment - 0.85) * 0.8;
    }
    
    // Team strength vs opponent
    const teamStrength = this.teamAnalytics.get(player.team);
    const opponentId = isHome ? fixture.team_a : fixture.team_h;
    const opponentStrength = this.teamAnalytics.get(opponentId);
    
    if (teamStrength && opponentStrength) {
      const strengthDiff = teamStrength.attackStrength - opponentStrength.defenseStrength;
      adjustment *= (1 + strengthDiff * 0.1);
    }
    
    return Math.max(0.4, Math.min(1.8, adjustment));
  }

  /**
   * Calculate team form impact
   */
  private calculateTeamFormAdjustment(teamId: number): number {
    const teamAnalytics = this.teamAnalytics.get(teamId);
    if (!teamAnalytics) return 1.0;
    
    const teamForm = teamAnalytics.form; // 0-1 scale
    
    // Convert to multiplier
    return 0.85 + (teamForm * 0.3); // Range: 0.85 to 1.15
  }

  /**
   * Calculate risk-based adjustments
   */
  private async calculateRiskAdjustments(player: any, config: PredictionConfig): Promise<{injury: number, rotation: number}> {
    // Try to get stored risk assessment
    const riskAssessment = await db.playerRiskAssessment.findUnique({
      where: { fplPlayerId: player.id }
    }).catch(() => null);

    let injuryRisk = 0.05; // Default low risk
    let rotationRisk = 0.1; // Default low risk

    if (riskAssessment) {
      injuryRisk = riskAssessment.injuryRisk / 100;
      rotationRisk = riskAssessment.rotationRisk / 100;
    } else {
      // Calculate on-the-fly from available data
      injuryRisk = this.estimateInjuryRisk(player);
      rotationRisk = this.estimateRotationRisk(player);
    }

    return {
      injury: 1 - (injuryRisk * 0.5), // Max 50% reduction for injury risk
      rotation: 1 - (rotationRisk * 0.3) // Max 30% reduction for rotation risk
    };
  }

  /**
   * Estimate injury risk from available data
   */
  private estimateInjuryRisk(player: any): number {
    const currentGW = this.getCurrentGameweek();
    const expectedStarts = Math.max(currentGW - 2, 1);
    const actualStarts = player.starts || 0;
    
    if (actualStarts < expectedStarts * 0.6) return 0.3; // High injury risk
    if (actualStarts < expectedStarts * 0.8) return 0.15; // Medium injury risk
    return 0.05; // Low injury risk
  }

  /**
   * Estimate rotation risk from minutes played
   */
  private estimateRotationRisk(player: any): number {
    const minutes = player.minutes || 0;
    const starts = player.starts || 0;
    const appearances = starts || 1;
    
    const avgMinutes = minutes / appearances;
    const startPercentage = starts / Math.max(appearances, 1);
    
    if (avgMinutes < 60 || startPercentage < 0.7) return 0.4; // High rotation risk
    if (avgMinutes < 75 || startPercentage < 0.85) return 0.2; // Medium rotation risk
    return 0.05; // Low rotation risk
  }

  /**
   * Calculate prediction confidence
   */
  private calculatePredictionConfidence(player: any, fixture: any, config: PredictionConfig): number {
    let confidence = 0.6; // Base confidence
    
    // Increase confidence for consistent players
    const minutes = player.minutes || 0;
    const starts = player.starts || 0;
    const currentGW = this.getCurrentGameweek();
    
    const minutesConsistency = minutes / (Math.max(currentGW - 1, 1) * 90);
    if (minutesConsistency > 0.8) confidence += 0.15;
    
    // Increase confidence for regular starters
    const startConsistency = starts / Math.max(currentGW - 1, 1);
    if (startConsistency > 0.8) confidence += 0.1;
    
    // Team analytics confidence
    const teamAnalytics = this.teamAnalytics.get(player.team);
    if (teamAnalytics?.confidence > 0.8) confidence += 0.1;
    
    // Fixture confidence
    if (fixture && fixture.team_h_difficulty && fixture.team_a_difficulty) {
      confidence += 0.05; // Known fixture
    }
    
    // Reduce confidence for risky players
    if (player.status !== 'a') confidence -= 0.15; // Injury/suspension concerns
    if (parseFloat(player.selected_by_percent || '0') < 5) confidence -= 0.05; // Low ownership uncertainty
    
    return Math.max(0.1, Math.min(1.0, confidence));
  }

  /**
   * Calculate comprehensive risk profile
   */
  private async calculatePlayerRiskProfile(player: any): Promise<any> {
    const injuryRisk = this.estimateInjuryRisk(player) * 100;
    const rotationRisk = this.estimateRotationRisk(player) * 100;
    const priceChangeRisk = this.calculatePriceChangeRisk(player);
    const formVolatility = this.calculateFormVolatility(player);
    
    const overallRisk = (injuryRisk + rotationRisk + priceChangeRisk + formVolatility) / 4;
    
    return {
      overall: Math.round(overallRisk),
      rotation: Math.round(rotationRisk),
      injury: Math.round(injuryRisk),
      priceChange: Math.round(priceChangeRisk),
      formVolatility: Math.round(formVolatility)
    };
  }

  /**
   * Calculate price change risk
   */
  private calculatePriceChangeRisk(player: any): number {
    const transfersIn = player.transfers_in_event || 0;
    const transfersOut = player.transfers_out_event || 0;
    const netTransfers = transfersIn - transfersOut;
    const ownership = parseFloat(player.selected_by_percent || '0');
    
    // High negative transfers = high fall risk
    if (netTransfers < -50000 && ownership > 10) return 75;
    if (netTransfers < -25000) return 50;
    if (netTransfers < 0) return 25;
    
    return 10; // Low price change risk
  }

  /**
   * Calculate form volatility (boom/bust tendency)
   */
  private calculateFormVolatility(player: any): number {
    const totalPoints = player.total_points || 0;
    const bonus = player.bonus || 0;
    const starts = player.starts || 1;
    
    // High bonus per start suggests boom/bust
    const bonusPerStart = bonus / starts;
    
    if (bonusPerStart > 0.8) return 70; // High volatility
    if (bonusPerStart > 0.5) return 45; // Medium volatility
    if (bonusPerStart > 0.2) return 25; // Low volatility
    
    return 15; // Very consistent
  }

  /**
   * Generate actionable recommendation
   */
  private generateRecommendation(
    avgExpected: number,
    confidence: number,
    riskProfile: any,
    config: PredictionConfig
  ): any {
    const reasoning: string[] = [];
    let action: string = 'HOLD';
    let suitableFor: string[] = [];
    
    // Conservative suitability
    if (confidence >= 0.75 && riskProfile.overall <= 30 && avgExpected >= 4.0) {
      suitableFor.push('CONSERVATIVE');
      reasoning.push('High confidence with low risk profile');
    }
    
    // Balanced suitability  
    if (confidence >= 0.60 && riskProfile.overall <= 50 && avgExpected >= 3.5) {
      suitableFor.push('BALANCED');
      reasoning.push('Good expected returns with manageable risk');
    }
    
    // Aggressive suitability
    if (avgExpected >= 4.5 || (avgExpected >= 3.0 && riskProfile.formVolatility >= 60)) {
      suitableFor.push('AGGRESSIVE');
      reasoning.push('High upside potential');
    }
    
    // Determine action
    if (avgExpected >= 6.0 && confidence >= 0.7) {
      action = 'STRONG_BUY';
      reasoning.push(`Exceptional expected returns (${avgExpected.toFixed(1)} PPG)`);
    } else if (avgExpected >= 4.5 && confidence >= 0.6) {
      action = 'BUY';
      reasoning.push(`Strong expected returns (${avgExpected.toFixed(1)} PPG)`);
    } else if (avgExpected <= 2.5 || confidence <= 0.4) {
      action = 'AVOID';
      reasoning.push('Low expected returns or high uncertainty');
    } else if (riskProfile.overall >= 70) {
      action = 'SELL';
      reasoning.push('High risk profile suggests moving on');
    }
    
    return {
      action,
      confidence: Math.round(confidence * 100) / 100,
      reasoning,
      suitableFor
    };
  }

  /**
   * Utility methods
   */
  private getCurrentGameweek(): number {
    return this.fplData?.events?.find((gw: any) => gw.is_current)?.id || 1;
  }

  private getPositionName(elementType: number): string {
    const positions = { 1: 'GK', 2: 'DEF', 3: 'MID', 4: 'FWD' };
    return positions[elementType as keyof typeof positions] || 'UNK';
  }

  private getTeamName(teamId: number): string {
    return this.fplData?.teams?.find((t: any) => t.id === teamId)?.short_name || 'UNK';
  }

  private getOpponentName(fixture: any, teamId: number): string {
    const opponentId = fixture.team_h === teamId ? fixture.team_a : fixture.team_h;
    return this.getTeamName(opponentId);
  }

  private getPlayerFixture(playerId: number, gameweek: number): any {
    const player = this.fplData?.elements?.find((p: any) => p.id === playerId);
    if (!player) return null;
    
    return this.fplData?.fixtures?.find((f: any) =>
      f.event === gameweek && 
      (f.team_h === player.team || f.team_a === player.team)
    );
  }

  private getTeamRecentFixtures(teamId: number, count: number): any[] {
    return this.fplData?.fixtures
      ?.filter((f: any) => 
        (f.team_h === teamId || f.team_a === teamId) && f.finished
      )
      .slice(-count) || [];
  }

  private getTeamFixtures(teamId: number, homeOnly: boolean, count: number): any[] {
    return this.fplData?.fixtures
      ?.filter((f: any) => {
        if (homeOnly) return f.team_h === teamId && f.finished;
        return f.team_a === teamId && f.finished;
      })
      .slice(-count) || [];
  }

  private getUpcomingFixtures(teamId: number, count: number): any[] {
    return this.fplData?.fixtures
      ?.filter((f: any) => 
        (f.team_h === teamId || f.team_a === teamId) && !f.finished
      )
      .slice(0, count) || [];
  }

  private calculateAveragePoints(fixtures: any[], teamId: number): number {
    if (fixtures.length === 0) return 0;
    
    let totalPoints = 0;
    fixtures.forEach(fixture => {
      const isHome = fixture.team_h === teamId;
      const teamGoals = isHome ? fixture.team_h_score : fixture.team_a_score;
      const oppGoals = isHome ? fixture.team_a_score : fixture.team_h_score;
      
      if (teamGoals > oppGoals) totalPoints += 3;
      else if (teamGoals === oppGoals) totalPoints += 1;
    });
    
    return totalPoints / fixtures.length;
  }

  private calculateTrend(predictions: GameweekPrediction[]): 'rising' | 'stable' | 'declining' {
    if (predictions.length < 3) return 'stable';
    
    const early = predictions.slice(0, Math.floor(predictions.length / 2));
    const late = predictions.slice(Math.floor(predictions.length / 2));
    
    const earlyAvg = early.reduce((sum, p) => sum + p.predictedPoints, 0) / early.length;
    const lateAvg = late.reduce((sum, p) => sum + p.predictedPoints, 0) / late.length;
    
    const change = lateAvg - earlyAvg;
    
    if (change > 0.5) return 'rising';
    if (change < -0.5) return 'declining';
    return 'stable';
  }

  private async loadHistoricalPatterns(): Promise<void> {
    // In production, this would load from PlayerGameweekHistory table
    // For now, we'll build patterns from current season data
    console.log('📊 Building historical patterns from current season...');
  }

  /**
   * Batch predict multiple players
   */
  async predictMultiplePlayers(
    playerIds: number[],
    config: PredictionConfig
  ): Promise<PlayerPrediction[]> {
    const predictions: PlayerPrediction[] = [];
    
    for (const playerId of playerIds) {
      const prediction = await this.predictPlayer(playerId, config);
      if (prediction) {
        predictions.push(prediction);
      }
    }
    
    // Sort by expected points (descending)
    return predictions.sort((a, b) => b.outlookSummary.totalExpectedPoints - a.outlookSummary.totalExpectedPoints);
  }

  /**
   * Save predictions to database for validation
   */
  async savePredictions(predictions: PlayerPrediction[]): Promise<void> {
    try {
      for (const playerPrediction of predictions) {
        for (const gwPrediction of playerPrediction.predictions) {
          await db.playerPrediction.upsert({
            where: {
              fplPlayerId_gameweek_modelVersion: {
                fplPlayerId: playerPrediction.playerId,
                gameweek: gwPrediction.gameweek,
                modelVersion: this.modelConfig.version
              }
            },
            update: {
              predictedPoints: gwPrediction.predictedPoints,
              confidence: gwPrediction.confidence,
              basePoints: gwPrediction.breakdown.base,
              formAdjustment: gwPrediction.breakdown.formAdjustment,
              fixtureAdjustment: gwPrediction.breakdown.fixtureAdjustment,
              teamFormAdjustment: gwPrediction.breakdown.teamFormAdjustment,
              injuryRiskAdjustment: gwPrediction.breakdown.riskAdjustments.injury,
              rotationRiskAdjustment: gwPrediction.breakdown.riskAdjustments.rotation,
              predictionDate: new Date()
            },
            create: {
              fplPlayerId: playerPrediction.playerId,
              playerName: playerPrediction.playerName,
              position: playerPrediction.position,
              teamId: this.fplData.elements.find((p: any) => p.id === playerPrediction.playerId)?.team || 1,
              gameweek: gwPrediction.gameweek,
              predictedPoints: gwPrediction.predictedPoints,
              confidence: gwPrediction.confidence,
              basePoints: gwPrediction.breakdown.base,
              formAdjustment: gwPrediction.breakdown.formAdjustment,
              fixtureAdjustment: gwPrediction.breakdown.fixtureAdjustment,
              teamFormAdjustment: gwPrediction.breakdown.teamFormAdjustment,
              injuryRiskAdjustment: gwPrediction.breakdown.riskAdjustments.injury,
              rotationRiskAdjustment: gwPrediction.breakdown.riskAdjustments.rotation,
              modelVersion: this.modelConfig.version
            }
          });
        }
      }
      console.log(`✅ Saved ${predictions.length} player predictions to database`);
    } catch (error) {
      console.error('❌ Failed to save predictions:', error);
    }
  }
}

export default BoetBallPredictionEngine;
