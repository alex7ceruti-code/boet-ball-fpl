/**
 * BoetBall Risk Assessment Framework
 * 
 * Multi-factor risk analysis system for FPL players covering:
 * - Rotation Risk (minutes consistency, squad depth)
 * - Injury Risk (history, fitness patterns)
 * - Price Change Risk (transfer trends, ownership)
 * - Form Volatility (boom/bust tendencies)
 * 
 * Real-time updates with confidence scoring and historical validation
 * 
 * @author BoetBall Analytics Team
 * @version 2.0.0
 */

import { db } from '@/lib/db';

export interface RiskAssessmentConfig {
  includeHistorical: boolean;
  confidenceThreshold: number; // 0-1
  updateFrequency: 'realtime' | 'hourly' | 'daily';
  dataSource: 'fpl_only' | 'with_external';
}

export interface PlayerRiskProfile {
  playerId: number;
  playerName: string;
  position: string;
  team: string;
  lastUpdated: string;
  
  // Risk scores (0-100, higher = more risky)
  riskScores: {
    rotation: {
      score: number;
      category: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
      confidence: number;
      factors: RotationRiskFactors;
    };
    injury: {
      score: number;
      category: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
      confidence: number;
      factors: InjuryRiskFactors;
    };
    priceChange: {
      score: number;
      category: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
      confidence: number;
      factors: PriceChangeFactors;
    };
    formVolatility: {
      score: number;
      category: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
      confidence: number;
      factors: FormVolatilityFactors;
    };
  };
  
  // Overall risk assessment
  overallRisk: {
    score: number; // Weighted composite
    category: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
    primaryConcerns: string[];
  };
  
  // Recommendations
  recommendations: {
    conservative: {
      suitable: boolean;
      score: number; // 0-100 suitability
      reasoning: string[];
    };
    balanced: {
      suitable: boolean;
      score: number;
      reasoning: string[];
    };
    aggressive: {
      suitable: boolean;
      score: number;
      reasoning: string[];
    };
  };
}

export interface RotationRiskFactors {
  minutesConsistency: number; // 0-100, higher = more consistent
  squadDepth: number; // 1-5 team depth at position
  recentMinutesTrend: 'increasing' | 'stable' | 'decreasing';
  startingXIStatus: 'nailed' | 'regular' | 'rotation' | 'bench';
  competitionForPlace: number; // 0-100, higher = more competition
  managerTrust: number; // 0-100 based on usage patterns
}

export interface InjuryRiskFactors {
  injuryHistory: {
    totalInjuries: number;
    avgDaysOut: number;
    recurringIssues: boolean;
    lastInjuryDays: number;
  };
  fitnessPatterns: {
    missedGamesProportion: number;
    midWeekRotation: boolean;
    ageRisk: number; // Age-based injury risk
  };
  currentStatus: {
    playingThroughPain: boolean;
    fitnessFlags: string[];
    returnFromInjury: boolean;
    returnGamesSince: number;
  };
}

export interface PriceChangeFactors {
  transferMomentum: {
    netTransfers: number;
    transferTrend: 'rising' | 'stable' | 'falling';
    velocityScore: number; // Rate of change
  };
  ownershipContext: {
    currentOwnership: number;
    ownershipTrend: 'rising' | 'stable' | 'falling';
    templateStatus: boolean; // Is template pick
  };
  performanceGap: {
    expectedVsActual: number;
    recentForm: number;
    hypeLevel: 'undervalued' | 'fairly_valued' | 'overvalued';
  };
}

export interface FormVolatilityFactors {
  pointsDistribution: {
    haulsFrequency: number; // % games with 8+ points
    blanksFrequency: number; // % games with 0-2 points
    consistencyIndex: number; // Lower = more volatile
  };
  underlyingVolatility: {
    xGVariance: number;
    xAVariance: number;
    bonusPointsVolatility: number;
  };
  situationalFactors: {
    bigGamePlayer: boolean; // Performs better vs top 6
    homeAwayDifference: number;
    fixtureVolatility: number; // How much form changes with fixtures
  };
}

export class BoetBallRiskAssessment {
  private fplData: any = null;
  private teamDepthMap: Map<number, any> = new Map();
  private historicalData: Map<number, any[]> = new Map();
  
  // Risk model weights
  private readonly riskWeights = {
    rotation: 0.30, // Most impactful for FPL
    injury: 0.25,   // Major impact when it happens
    priceChange: 0.20, // Important for budget planning
    formVolatility: 0.25 // Affects expected returns
  };

  constructor() {
    this.initialize();
  }

  /**
   * Initialize risk assessment system
   */
  async initialize(): Promise<boolean> {
    try {
      console.log('⚠️ Initializing BoetBall Risk Assessment...');
      
      await this.loadFPLData();
      await this.buildTeamDepthAnalysis();
      await this.loadHistoricalRiskData();
      
      console.log('✅ Risk assessment system initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize risk assessment:', error);
      return false;
    }
  }

  /**
   * Load FPL data
   */
  private async loadFPLData(): Promise<void> {
    const response = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/');
    if (!response.ok) throw new Error('Failed to fetch FPL data');
    this.fplData = await response.json();
  }

  /**
   * Build team depth analysis for rotation risk
   */
  private async buildTeamDepthAnalysis(): Promise<void> {
    const teams = this.fplData.teams;
    
    for (const team of teams) {
      const teamPlayers = this.fplData.elements.filter((p: any) => p.team === team.id);
      
      // Group by position
      const byPosition = {
        1: teamPlayers.filter((p: any) => p.element_type === 1), // GK
        2: teamPlayers.filter((p: any) => p.element_type === 2), // DEF
        3: teamPlayers.filter((p: any) => p.element_type === 3), // MID
        4: teamPlayers.filter((p: any) => p.element_type === 4)  // FWD
      };
      
      // Calculate depth and competition for each position
      const depthAnalysis = {
        gk: this.calculatePositionDepth(byPosition[1]),
        def: this.calculatePositionDepth(byPosition[2]),
        mid: this.calculatePositionDepth(byPosition[3]),
        fwd: this.calculatePositionDepth(byPosition[4])
      };
      
      this.teamDepthMap.set(team.id, depthAnalysis);
    }
  }

  /**
   * Calculate position depth and competition
   */
  private calculatePositionDepth(players: any[]): any {
    if (players.length === 0) return { depth: 1, competition: 0 };
    
    // Sort by total points to identify hierarchy
    const sorted = players
      .filter(p => p.minutes > 0) // Only consider players who've played
      .sort((a, b) => b.total_points - a.total_points);
    
    const starter = sorted[0];
    const backup = sorted[1];
    const depth = sorted.length;
    
    // Calculate competition level
    let competition = 0;
    if (backup && starter) {
      const pointsGap = starter.total_points - backup.total_points;
      competition = Math.max(0, 100 - (pointsGap * 2)); // Closer points = more competition
    }
    
    return {
      depth,
      competition,
      hierarchy: sorted.map(p => ({
        id: p.id,
        name: p.web_name,
        points: p.total_points,
        minutes: p.minutes
      }))
    };
  }

  /**
   * Load historical risk data from database
   */
  private async loadHistoricalRiskData(): Promise<void> {
    try {
      const historicalData = await db.playerGameweekHistory.findMany({
        where: {
          season: '2024-25'
        },
        orderBy: {
          gameweek: 'asc'
        }
      });
      
      // Group by player
      historicalData.forEach(record => {
        const playerId = record.fplPlayerId;
        if (!this.historicalData.has(playerId)) {
          this.historicalData.set(playerId, []);
        }
        this.historicalData.get(playerId)?.push(record);
      });
      
    } catch (error) {
      console.warn('⚠️ Could not load historical data, using current season only');
    }
  }

  /**
   * Assess comprehensive risk profile for a player
   */
  async assessPlayer(playerId: number, config: RiskAssessmentConfig): Promise<PlayerRiskProfile | null> {
    const player = this.fplData?.elements?.find((p: any) => p.id === playerId);
    if (!player) return null;

    // Calculate individual risk factors
    const rotationRisk = await this.calculateRotationRisk(player);
    const injuryRisk = await this.calculateInjuryRisk(player);
    const priceChangeRisk = await this.calculatePriceChangeRisk(player);
    const formVolatilityRisk = await this.calculateFormVolatility(player);

    // Calculate overall risk
    const overallRiskScore = Math.round(
      (rotationRisk.score * this.riskWeights.rotation) +
      (injuryRisk.score * this.riskWeights.injury) +
      (priceChangeRisk.score * this.riskWeights.priceChange) +
      (formVolatilityRisk.score * this.riskWeights.formVolatility)
    );

    // Determine primary concerns
    const concerns: string[] = [];
    if (rotationRisk.score > 60) concerns.push('High rotation risk');
    if (injuryRisk.score > 60) concerns.push('Injury concerns');
    if (priceChangeRisk.score > 70) concerns.push('Price fall risk');
    if (formVolatilityRisk.score > 65) concerns.push('Inconsistent returns');

    // Generate recommendations
    const recommendations = this.generateRiskBasedRecommendations(
      overallRiskScore,
      rotationRisk.score,
      injuryRisk.score,
      priceChangeRisk.score,
      formVolatilityRisk.score,
      player
    );

    return {
      playerId: player.id,
      playerName: `${player.first_name} ${player.second_name}`,
      position: this.getPositionName(player.element_type),
      team: this.getTeamName(player.team),
      lastUpdated: new Date().toISOString(),
      riskScores: {
        rotation: rotationRisk,
        injury: injuryRisk,
        priceChange: priceChangeRisk,
        formVolatility: formVolatilityRisk
      },
      overallRisk: {
        score: overallRiskScore,
        category: this.getRiskCategory(overallRiskScore),
        primaryConcerns: concerns
      },
      recommendations
    };
  }

  /**
   * Calculate rotation risk
   */
  private async calculateRotationRisk(player: any): Promise<any> {
    const currentGW = this.fplData.events?.find((gw: any) => gw.is_current)?.id || 1;
    const teamDepth = this.teamDepthMap.get(player.team);
    const positionDepth = teamDepth?.[this.getPositionKey(player.element_type)];
    
    // Minutes consistency (last 6 gameweeks if available)
    const minutes = player.minutes || 0;
    const starts = player.starts || 0;
    const appearances = starts || 1;
    const avgMinutes = minutes / appearances;
    const startPercentage = starts / Math.max(appearances, 1);
    
    let minutesConsistency = 0;
    if (avgMinutes >= 85) minutesConsistency = 90;
    else if (avgMinutes >= 70) minutesConsistency = 75;
    else if (avgMinutes >= 60) minutesConsistency = 50;
    else if (avgMinutes >= 30) minutesConsistency = 25;
    else minutesConsistency = 10;

    // Squad depth impact
    const squadDepthScore = positionDepth?.depth || 1;
    const competitionScore = positionDepth?.competition || 0;
    
    // Manager trust (based on selection patterns)
    let managerTrust = 80;
    if (startPercentage < 0.5) managerTrust = 30;
    else if (startPercentage < 0.7) managerTrust = 60;
    else if (startPercentage < 0.9) managerTrust = 80;
    else managerTrust = 95;

    // Recent trend analysis
    let recentTrend: 'increasing' | 'stable' | 'decreasing' = 'stable';
    if (startPercentage > 0.8 && avgMinutes > 70) recentTrend = 'stable';
    else if (avgMinutes < 60) recentTrend = 'decreasing';
    
    // Starting XI status
    let startingXIStatus: 'nailed' | 'regular' | 'rotation' | 'bench';
    if (startPercentage > 0.9 && avgMinutes > 80) startingXIStatus = 'nailed';
    else if (startPercentage > 0.7 && avgMinutes > 65) startingXIStatus = 'regular';
    else if (startPercentage > 0.4) startingXIStatus = 'rotation';
    else startingXIStatus = 'bench';

    // Calculate overall rotation risk score
    let riskScore = 100 - minutesConsistency;
    riskScore += (competitionScore * 0.3);
    riskScore -= ((managerTrust - 50) * 0.4);
    riskScore = Math.max(0, Math.min(100, riskScore));

    const factors: RotationRiskFactors = {
      minutesConsistency,
      squadDepth: squadDepthScore,
      recentMinutesTrend: recentTrend,
      startingXIStatus,
      competitionForPlace: Math.round(competitionScore),
      managerTrust: Math.round(managerTrust)
    };

    return {
      score: Math.round(riskScore),
      category: this.getRiskCategory(riskScore),
      confidence: this.calculateConfidence(player, 'rotation'),
      factors
    };
  }

  /**
   * Calculate injury risk
   */
  private async calculateInjuryRisk(player: any): Promise<any> {
    const currentGW = this.fplData.events?.find((gw: any) => gw.is_current)?.id || 1;
    
    // Age-based risk (players over 30 have higher injury risk)
    const age = this.estimateAge(player); // Would need birthdate data
    let ageRisk = 10;
    if (age > 33) ageRisk = 30;
    else if (age > 30) ageRisk = 20;
    else if (age < 23) ageRisk = 15; // Young players also have development risks

    // Current availability
    let statusRisk = 0;
    if (player.status === 'i') statusRisk = 80; // Injured
    else if (player.status === 'd') statusRisk = 60; // Doubtful
    else if (player.status === 's') statusRisk = 40; // Suspended
    else if (player.chance_of_playing_next_round < 75) statusRisk = 30;

    // Minutes patterns (players missing significant time)
    const expectedStarts = Math.max(currentGW - 2, 1);
    const actualStarts = player.starts || 0;
    let missedGamesRisk = 0;
    
    if (actualStarts < expectedStarts * 0.5) missedGamesRisk = 40;
    else if (actualStarts < expectedStarts * 0.7) missedGamesRisk = 25;
    else if (actualStarts < expectedStarts * 0.9) missedGamesRisk = 10;

    // News and status analysis
    const fitnessFlags: string[] = [];
    if (player.news && player.news.toLowerCase().includes('injury')) {
      fitnessFlags.push('Injury mentioned in news');
      statusRisk += 20;
    }
    if (player.news && player.news.toLowerCase().includes('doubt')) {
      fitnessFlags.push('Fitness doubt');
      statusRisk += 15;
    }

    const overallRisk = Math.min(100, (ageRisk + statusRisk + missedGamesRisk) / 3 * 2);

    const factors: InjuryRiskFactors = {
      injuryHistory: {
        totalInjuries: 0, // Would need historical data
        avgDaysOut: 0,
        recurringIssues: false,
        lastInjuryDays: 0
      },
      fitnessPatterns: {
        missedGamesProportion: (expectedStarts - actualStarts) / expectedStarts,
        midWeekRotation: false,
        ageRisk
      },
      currentStatus: {
        playingThroughPain: false,
        fitnessFlags,
        returnFromInjury: player.status === 'a' && statusRisk > 0,
        returnGamesSince: 0
      }
    };

    return {
      score: Math.round(overallRisk),
      category: this.getRiskCategory(overallRisk),
      confidence: this.calculateConfidence(player, 'injury'),
      factors
    };
  }

  /**
   * Calculate price change risk
   */
  private async calculatePriceChangeRisk(player: any): Promise<any> {
    const transfersIn = player.transfers_in_event || 0;
    const transfersOut = player.transfers_out_event || 0;
    const netTransfers = transfersIn - transfersOut;
    const ownership = parseFloat(player.selected_by_percent || '0');
    
    // Transfer momentum
    let transferRisk = 50; // Neutral
    if (netTransfers < -100000) transferRisk = 85; // Very high fall risk
    else if (netTransfers < -50000) transferRisk = 75;
    else if (netTransfers < -10000) transferRisk = 65;
    else if (netTransfers < 0) transferRisk = 60;
    else if (netTransfers > 50000) transferRisk = 30; // Rise likely
    else if (netTransfers > 10000) transferRisk = 40;
    
    // Ownership context
    let ownershipRisk = 50;
    if (ownership > 20) ownershipRisk += 15; // High ownership = more volatile
    else if (ownership < 5) ownershipRisk -= 10; // Low ownership = less volatile
    
    // Performance vs price context
    const pointsPerMillion = player.total_points / (player.now_cost / 10);
    let valueRisk = 50;
    if (pointsPerMillion < 1.0) valueRisk += 20; // Poor value = fall risk
    else if (pointsPerMillion > 2.0) valueRisk -= 15; // Great value = rise protection

    // Recent form impact
    const recentForm = parseFloat(player.form || '0');
    const seasonAvg = parseFloat(player.points_per_game || '0');
    if (recentForm < seasonAvg * 0.7) transferRisk += 10; // Poor form = sell pressure

    const overallRisk = Math.round((transferRisk + ownershipRisk + valueRisk) / 3);

    const factors: PriceChangeFactors = {
      transferMomentum: {
        netTransfers,
        transferTrend: netTransfers > 0 ? 'rising' : netTransfers < -10000 ? 'falling' : 'stable',
        velocityScore: Math.abs(netTransfers / Math.max(ownership * 10000, 1000))
      },
      ownershipContext: {
        currentOwnership: ownership,
        ownershipTrend: 'stable', // Would need historical data
        templateStatus: ownership > 15
      },
      performanceGap: {
        expectedVsActual: pointsPerMillion,
        recentForm: recentForm,
        hypeLevel: pointsPerMillion > 2.0 ? 'undervalued' : pointsPerMillion < 1.0 ? 'overvalued' : 'fairly_valued'
      }
    };

    return {
      score: overallRisk,
      category: this.getRiskCategory(overallRisk),
      confidence: this.calculateConfidence(player, 'price'),
      factors
    };
  }

  /**
   * Calculate form volatility risk
   */
  private async calculateFormVolatility(player: any): Promise<any> {
    const totalPoints = player.total_points || 0;
    const bonus = player.bonus || 0;
    const starts = player.starts || 1;
    
    // Bonus point volatility (high bonus = boom/bust)
    const bonusPerStart = bonus / starts;
    let volatilityScore = 30; // Base volatility
    
    if (bonusPerStart > 1.0) volatilityScore = 80; // Very volatile
    else if (bonusPerStart > 0.6) volatilityScore = 65;
    else if (bonusPerStart > 0.3) volatilityScore = 45;
    else volatilityScore = 25; // Very consistent

    // ICT variance (would need gameweek data)
    const threat = parseFloat(player.threat || '0');
    const creativity = parseFloat(player.creativity || '0');
    
    // High threat + creativity but inconsistent points = volatile
    if ((threat > 50 || creativity > 50) && bonusPerStart > 0.5) {
      volatilityScore += 15;
    }

    // Position-based adjustments
    if (player.element_type === 4) { // Forwards
      volatilityScore += 5; // Naturally more volatile
    } else if (player.element_type === 1) { // Goalkeepers
      volatilityScore -= 10; // More consistent
    }

    const factors: FormVolatilityFactors = {
      pointsDistribution: {
        haulsFrequency: bonusPerStart * 100, // Approximate
        blanksFrequency: Math.max(0, 100 - (totalPoints / starts) * 10), // Approximate
        consistencyIndex: Math.max(0, 100 - volatilityScore)
      },
      underlyingVolatility: {
        xGVariance: 0, // Would need gameweek data
        xAVariance: 0,
        bonusPointsVolatility: bonusPerStart * 100
      },
      situationalFactors: {
        bigGamePlayer: false, // Would need match analysis
        homeAwayDifference: 0, // Would need H/A split data
        fixtureVolatility: 50 // Default
      }
    };

    return {
      score: Math.round(volatilityScore),
      category: this.getRiskCategory(volatilityScore),
      confidence: this.calculateConfidence(player, 'volatility'),
      factors
    };
  }

  /**
   * Generate risk-based recommendations
   */
  private generateRiskBasedRecommendations(
    overallRisk: number,
    rotationRisk: number,
    injuryRisk: number,
    priceChangeRisk: number,
    volatilityRisk: number,
    player: any
  ): any {
    const avgExpected = parseFloat(player.points_per_game || '0');
    const ownership = parseFloat(player.selected_by_percent || '0');
    
    // Conservative recommendations (risk-averse users)
    const conservativeScore = Math.max(0, 100 - overallRisk - (volatilityRisk * 0.5));
    const conservativeSuitable = overallRisk <= 35 && rotationRisk <= 25 && injuryRisk <= 30;
    const conservativeReasons = [];
    if (conservativeSuitable) {
      conservativeReasons.push('Low overall risk profile');
      conservativeReasons.push('Consistent minutes and fitness record');
    } else {
      conservativeReasons.push(`Overall risk too high (${overallRisk}/100)`);
      if (rotationRisk > 25) conservativeReasons.push('Rotation concerns');
      if (injuryRisk > 30) conservativeReasons.push('Injury risk');
    }

    // Balanced recommendations
    const balancedScore = Math.max(0, 80 - (overallRisk * 0.7));
    const balancedSuitable = overallRisk <= 55 && avgExpected >= 3.5;
    const balancedReasons = [];
    if (balancedSuitable) {
      balancedReasons.push('Acceptable risk for expected returns');
      if (volatilityRisk > 60) balancedReasons.push('High upside potential with some volatility');
    } else {
      balancedReasons.push('Risk-return ratio not favorable');
    }

    // Aggressive recommendations
    const aggressiveScore = Math.max(0, 100 - (overallRisk * 0.3));
    const aggressiveSuitable = avgExpected >= 4.0 || volatilityRisk >= 65 || ownership < 10;
    const aggressiveReasons = [];
    if (aggressiveSuitable) {
      aggressiveReasons.push('High potential returns justify risks');
      if (volatilityRisk >= 65) aggressiveReasons.push('High ceiling play');
      if (ownership < 10) aggressiveReasons.push('Low-owned differential');
    } else {
      aggressiveReasons.push('Limited upside potential');
    }

    return {
      conservative: {
        suitable: conservativeSuitable,
        score: Math.round(conservativeScore),
        reasoning: conservativeReasons
      },
      balanced: {
        suitable: balancedSuitable,
        score: Math.round(balancedScore),
        reasoning: balancedReasons
      },
      aggressive: {
        suitable: aggressiveSuitable,
        score: Math.round(aggressiveScore),
        reasoning: aggressiveReasons
      }
    };
  }

  /**
   * Utility methods
   */
  private getRiskCategory(score: number): 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High' {
    if (score <= 20) return 'Very Low';
    if (score <= 40) return 'Low';
    if (score <= 60) return 'Medium';
    if (score <= 80) return 'High';
    return 'Very High';
  }

  private getPositionName(elementType: number): string {
    const positions = { 1: 'GK', 2: 'DEF', 3: 'MID', 4: 'FWD' };
    return positions[elementType as keyof typeof positions] || 'UNK';
  }

  private getPositionKey(elementType: number): string {
    const keys = { 1: 'gk', 2: 'def', 3: 'mid', 4: 'fwd' };
    return keys[elementType as keyof typeof keys] || 'gk';
  }

  private getTeamName(teamId: number): string {
    return this.fplData?.teams?.find((t: any) => t.id === teamId)?.short_name || 'UNK';
  }

  private estimateAge(player: any): number {
    // Would need actual birthdate data - using placeholder logic
    return 26; // Average age assumption
  }

  private calculateConfidence(player: any, riskType: string): number {
    let confidence = 0.7; // Base confidence
    
    const minutes = player.minutes || 0;
    const appearances = player.starts || 1;
    
    // More data = higher confidence
    if (appearances > 10) confidence += 0.15;
    else if (appearances > 5) confidence += 0.1;
    
    // Regular playing time = higher confidence
    if (minutes / appearances > 70) confidence += 0.1;
    
    // Specific adjustments
    switch (riskType) {
      case 'rotation':
        if (player.starts > 8) confidence += 0.05;
        break;
      case 'injury':
        if (player.status === 'a') confidence += 0.1;
        break;
      case 'price':
        if (parseFloat(player.selected_by_percent) > 10) confidence += 0.05;
        break;
    }
    
    return Math.round(Math.min(1.0, confidence) * 100) / 100;
  }

  /**
   * Batch assess multiple players
   */
  async assessMultiplePlayers(
    playerIds: number[],
    config: RiskAssessmentConfig
  ): Promise<PlayerRiskProfile[]> {
    const profiles: PlayerRiskProfile[] = [];
    
    for (const playerId of playerIds) {
      const profile = await this.assessPlayer(playerId, config);
      if (profile) {
        profiles.push(profile);
      }
    }
    
    return profiles;
  }

  /**
   * Save risk assessments to database
   */
  async saveRiskAssessments(profiles: PlayerRiskProfile[]): Promise<void> {
    try {
      for (const profile of profiles) {
        await db.playerRiskAssessment.upsert({
          where: {
            fplPlayerId: profile.playerId
          },
          update: {
            rotationRisk: profile.riskScores.rotation.score,
            injuryRisk: profile.riskScores.injury.score,
            priceChangeRisk: profile.riskScores.priceChange.score,
            formVolatility: profile.riskScores.formVolatility.score,
            overallRiskScore: profile.overallRisk.score,
            riskCategory: profile.overallRisk.category.replace(' ', '_') as any,
            conservativePickSuitability: profile.recommendations.conservative.score,
            aggressivePickSuitability: profile.recommendations.aggressive.score,
            minutesConsistency: profile.riskScores.rotation.factors.minutesConsistency,
            teamDepth: profile.riskScores.rotation.factors.squadDepth,
            lastUpdated: new Date()
          },
          create: {
            fplPlayerId: profile.playerId,
            playerName: profile.playerName,
            position: profile.position,
            teamId: this.fplData.elements.find((p: any) => p.id === profile.playerId)?.team || 1,
            rotationRisk: profile.riskScores.rotation.score,
            injuryRisk: profile.riskScores.injury.score,
            priceChangeRisk: profile.riskScores.priceChange.score,
            formVolatility: profile.riskScores.formVolatility.score,
            overallRiskScore: profile.overallRisk.score,
            riskCategory: profile.overallRisk.category.replace(' ', '_') as any,
            conservativePickSuitability: profile.recommendations.conservative.score,
            aggressivePickSuitability: profile.recommendations.aggressive.score,
            minutesConsistency: profile.riskScores.rotation.factors.minutesConsistency,
            teamDepth: profile.riskScores.rotation.factors.squadDepth
          }
        });
      }
      console.log(`✅ Saved ${profiles.length} risk assessments to database`);
    } catch (error) {
      console.error('❌ Failed to save risk assessments:', error);
    }
  }

  /**
   * Get risk alerts for high-risk changes
   */
  async getRiskAlerts(): Promise<any[]> {
    // Implementation for detecting significant risk changes
    return [];
  }
}

export default BoetBallRiskAssessment;
