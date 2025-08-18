#!/usr/bin/env node

/**
 * FPL Predictive Analytics Engine
 * 
 * Future-focused analytics system that predicts player performance
 * for upcoming gameweeks using advanced modeling techniques.
 * 
 * Author: Boet Ball Analytics Team
 * Version: 2.0.0 - Predictive Focus
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

class FPLPredictiveEngine {
  constructor() {
    this.baseUrl = 'https://fantasy.premierleague.com/api';
    this.data = {
      bootstrap: null,
      fixtures: null,
      gameweeks: null,
      liveData: null,
      teamStrengths: new Map(),
      playerTrends: new Map(),
      managerPreferences: new Map()
    };
    this.cache = new Map();
    this.predictionWeights = {
      form: 0.25,
      fixture: 0.20,
      underlying: 0.25,  // xG/xA
      context: 0.15,     // Team tactics, rotation risk
      momentum: 0.15     // Recent trends, confidence intervals
    };
  }

  /**
   * Enhanced data fetcher with caching and error handling
   */
  async fetchJson(url) {
    if (this.cache.has(url)) {
      const cached = this.cache.get(url);
      // Cache for 5 minutes
      if (Date.now() - cached.timestamp < 300000) {
        return cached.data;
      }
    }

    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            this.cache.set(url, { data: json, timestamp: Date.now() });
            resolve(json);
          } catch (error) {
            reject(error);
          }
        });
      }).on('error', reject);
    });
  }

  /**
   * Initialize with enhanced data loading
   */
  async initialize() {
    console.log('🔮 Initializing FPL Predictive Engine...');
    
    try {
      // Load core data
      this.data.bootstrap = await this.fetchJson(`${this.baseUrl}/bootstrap-static/`);
      this.data.fixtures = await this.fetchJson(`${this.baseUrl}/fixtures/`);
      
      console.log(`✅ Loaded ${this.data.bootstrap.elements.length} players`);
      console.log(`✅ Loaded ${this.data.fixtures.length} fixtures`);
      
      // Build team strength models
      await this.buildTeamStrengthModel();
      
      // Analyze historical patterns
      await this.buildHistoricalPatterns();
      
      console.log('✅ Built predictive models');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize:', error.message);
      return false;
    }
  }

  /**
   * Build dynamic team strength model based on recent performance
   */
  async buildTeamStrengthModel() {
    const teams = this.data.bootstrap.teams;
    const currentGW = this.data.bootstrap.events.find(gw => gw.is_current)?.id || 1;
    
    for (const team of teams) {
      // Get recent fixtures (last 6 games)
      const recentFixtures = this.data.fixtures
        .filter(f => 
          (f.team_h === team.id || f.team_a === team.id) && 
          f.finished && 
          f.event >= Math.max(1, currentGW - 6)
        )
        .slice(-6);
      
      if (recentFixtures.length === 0) {
        // Fallback to static FPL strength ratings
        this.data.teamStrengths.set(team.id, {
          attack: (team.strength_attack_home + team.strength_attack_away) / 2,
          defence: (team.strength_defence_home + team.strength_defence_away) / 2,
          form: 0,
          confidence: 0.5
        });
        continue;
      }

      let goalsFor = 0;
      let goalsAgainst = 0;
      let points = 0;
      
      recentFixtures.forEach(fixture => {
        const isHome = fixture.team_h === team.id;
        const teamGoals = isHome ? fixture.team_h_score : fixture.team_a_score;
        const oppGoals = isHome ? fixture.team_a_score : fixture.team_h_score;
        
        goalsFor += teamGoals || 0;
        goalsAgainst += oppGoals || 0;
        
        // Points calculation
        if (teamGoals > oppGoals) points += 3;
        else if (teamGoals === oppGoals) points += 1;
      });

      const gamesPlayed = recentFixtures.length;
      this.data.teamStrengths.set(team.id, {
        attack: Math.max(0.5, goalsFor / gamesPlayed),
        defence: Math.min(3, goalsAgainst / gamesPlayed),
        form: points / (gamesPlayed * 3), // Points per game as percentage
        confidence: Math.min(1, gamesPlayed / 6), // Confidence based on sample size
        goalsPG: goalsFor / gamesPlayed,
        concededPG: goalsAgainst / gamesPlayed
      });
    }
  }

  /**
   * Build historical performance patterns for each player
   */
  async buildHistoricalPatterns() {
    for (const player of this.data.bootstrap.elements) {
      const patterns = {
        consistencyScore: this.calculateConsistency(player),
        clutchFactor: this.calculateClutchPerformance(player),
        fixtureBonus: this.calculateFixtureBonus(player),
        rotationRisk: this.calculateRotationRisk(player),
        injuryProneness: this.calculateInjuryRisk(player)
      };
      
      this.data.playerTrends.set(player.id, patterns);
    }
  }

  /**
   * Calculate player consistency score (0-1)
   */
  calculateConsistency(player) {
    const totalPoints = player.total_points || 0;
    const gamesPlayed = Math.max(player.starts || 1, 1);
    const avgPoints = totalPoints / gamesPlayed;
    const form = parseFloat(player.form || '0');
    
    // Consistency = how close form is to season average
    const variance = Math.abs(form - avgPoints);
    return Math.max(0, 1 - (variance / Math.max(avgPoints, 1)));
  }

  /**
   * Calculate clutch performance in important matches
   */
  calculateClutchPerformance(player) {
    // This would ideally use match-by-match data
    // For now, approximate using bonus points ratio
    const bonus = player.bonus || 0;
    const totalPoints = player.total_points || 0;
    
    if (totalPoints === 0) return 0.5;
    
    const bonusRatio = bonus / totalPoints;
    return Math.min(1, bonusRatio * 10); // Scale to 0-1
  }

  /**
   * Calculate how much player benefits from easier fixtures
   */
  calculateFixtureBonus(player) {
    // Approximate using home/away performance differential
    // This is simplified - ideally would analyze performance vs fixture difficulty
    const position = player.element_type;
    
    // Defensive players benefit more from easy fixtures
    if (position === 1 || position === 2) return 0.8; // GK/DEF
    if (position === 3) return 0.6; // MID
    return 0.4; // FWD - less fixture dependent
  }

  /**
   * Calculate rotation risk based on minutes played
   */
  calculateRotationRisk(player) {
    const minutes = player.minutes || 0;
    const maxMinutes = (this.data.bootstrap.events.find(gw => gw.is_current)?.id || 38) * 90;
    const minutesRatio = minutes / maxMinutes;
    
    // Players with less than 70% minutes have higher rotation risk
    if (minutesRatio < 0.7) return 1 - minutesRatio;
    return 0.1; // Low risk for regular starters
  }

  /**
   * Calculate injury proneness based on appearances
   */
  calculateInjuryRisk(player) {
    const starts = player.starts || 0;
    const currentGW = this.data.bootstrap.events.find(gw => gw.is_current)?.id || 38;
    const expectedStarts = Math.max(currentGW - 3, 1); // Allow for some rotation
    
    const appearanceRatio = starts / expectedStarts;
    
    // If player has missed significant time, higher injury risk
    if (appearanceRatio < 0.6) return 0.3;
    if (appearanceRatio < 0.8) return 0.15;
    return 0.05; // Low risk for regularly available players
  }

  /**
   * Predict expected points for a player in a specific gameweek
   */
  predictGameweekPoints(playerId, gameweek, options = {}) {
    const player = this.data.bootstrap.elements.find(p => p.id === playerId);
    if (!player) return null;

    const team = this.data.bootstrap.teams.find(t => t.id === player.team);
    const fixtures = this.getPlayerFixtures(playerId, gameweek, gameweek);
    
    if (fixtures.length === 0) return { expectedPoints: 0, confidence: 1, factors: {} };

    const fixture = fixtures[0];
    const isHome = fixture.team_h === player.team;
    const opponent = this.data.bootstrap.teams.find(t => 
      t.id === (isHome ? fixture.team_a : fixture.team_h)
    );

    // Get team and opponent strengths
    const teamStrength = this.data.teamStrengths.get(player.team);
    const opponentStrength = this.data.teamStrengths.get(opponent.id);
    const playerTrends = this.data.playerTrends.get(player.id);

    // Base prediction from historical performance
    const basePPG = parseFloat(player.points_per_game || '0');
    const form = parseFloat(player.form || '0');
    const baseExpected = (basePPG * 0.6) + (form * 0.4);

    // Fixture difficulty adjustment
    const fixtureAdjustment = this.calculateFixtureAdjustment(
      player, teamStrength, opponentStrength, isHome, fixture
    );

    // Form momentum adjustment
    const momentumAdjustment = this.calculateMomentumAdjustment(player, form, basePPG);

    // Context adjustments (rotation, injuries, etc.)
    const contextAdjustment = this.calculateContextAdjustment(
      player, playerTrends, gameweek, options
    );

    // Underlying stats adjustment (xG/xA)
    const underlyingAdjustment = this.calculateUnderlyingAdjustment(player);

    // Combine all factors
    const prediction = Math.max(0, 
      baseExpected * 
      fixtureAdjustment * 
      momentumAdjustment * 
      contextAdjustment * 
      underlyingAdjustment
    );

    // Calculate confidence based on data quality and consistency
    const confidence = this.calculatePredictionConfidence(
      player, playerTrends, teamStrength, gameweek
    );

    return {
      expectedPoints: Math.round(prediction * 10) / 10,
      confidence: Math.round(confidence * 100) / 100,
      factors: {
        base: Math.round(baseExpected * 10) / 10,
        fixture: Math.round((fixtureAdjustment - 1) * 100),
        momentum: Math.round((momentumAdjustment - 1) * 100),
        context: Math.round((contextAdjustment - 1) * 100),
        underlying: Math.round((underlyingAdjustment - 1) * 100)
      },
      breakdown: {
        fixtureOpponent: opponent.short_name,
        isHome,
        difficulty: isHome ? fixture.team_h_difficulty : fixture.team_a_difficulty,
        teamForm: teamStrength?.form || 0,
        rotationRisk: playerTrends?.rotationRisk || 0
      }
    };
  }

  /**
   * Calculate fixture-based adjustment
   */
  calculateFixtureAdjustment(player, teamStrength, opponentStrength, isHome, fixture) {
    const position = player.element_type;
    const fdr = isHome ? fixture.team_h_difficulty : fixture.team_a_difficulty;
    
    // Base adjustment from FDR (inverted - easier fixtures = higher multiplier)
    const fdrMultiplier = (6 - fdr) / 4; // Range: 0.25 to 1.25
    
    // Home advantage
    const homeBonus = isHome ? 1.1 : 0.95;
    
    // Team strength vs opponent
    let strengthDifferential = 1.0;
    if (teamStrength && opponentStrength) {
      if (position <= 2) {
        // Defenders benefit from good defense vs weak attack
        strengthDifferential = (teamStrength.defence + (5 - opponentStrength.attack)) / 5;
      } else {
        // Attackers benefit from good attack vs weak defense  
        strengthDifferential = (teamStrength.attack + (5 - opponentStrength.defence)) / 5;
      }
    }
    
    return fdrMultiplier * homeBonus * Math.max(0.5, Math.min(1.8, strengthDifferential));
  }

  /**
   * Calculate momentum-based adjustment
   */
  calculateMomentumAdjustment(player, form, basePPG) {
    if (basePPG === 0) return 1.0;
    
    const formRatio = form / basePPG;
    
    // Hot streak: multiply effect but cap at 1.5x
    if (formRatio > 1.3) return Math.min(1.5, 1 + (formRatio - 1) * 0.5);
    
    // Cold streak: dampen effect but floor at 0.6x
    if (formRatio < 0.7) return Math.max(0.6, 1 + (formRatio - 1) * 0.3);
    
    return 1.0; // Stable form
  }

  /**
   * Calculate context-based adjustments
   */
  calculateContextAdjustment(player, trends, gameweek, options) {
    let adjustment = 1.0;
    
    // Rotation risk
    if (trends?.rotationRisk > 0.3) {
      adjustment *= (1 - trends.rotationRisk * 0.5);
    }
    
    // Injury risk
    if (trends?.injuryProneness > 0.2) {
      adjustment *= (1 - trends.injuryProneness * 0.3);
    }
    
    // Double gameweek bonus (if implemented)
    if (options.doubleGameweek) {
      adjustment *= 1.8; // Not quite double due to rotation risk
    }
    
    // Blank gameweek
    if (options.blankGameweek) {
      adjustment = 0;
    }
    
    return Math.max(0.1, adjustment);
  }

  /**
   * Calculate underlying stats adjustment (xG/xA regression)
   */
  calculateUnderlyingAdjustment(player) {
    const goals = player.goals_scored || 0;
    const assists = player.assists || 0;
    const xG = parseFloat(player.expected_goals || '0');
    const xA = parseFloat(player.expected_assists || '0');
    
    if (xG === 0 && xA === 0) return 1.0;
    
    // Calculate efficiency ratios
    const goalEfficiency = xG > 0 ? goals / xG : 1;
    const assistEfficiency = xA > 0 ? assists / xA : 1;
    
    let adjustment = 1.0;
    
    // Underperforming players get boost (regression to mean)
    if (goalEfficiency < 0.8) adjustment += 0.15;
    if (assistEfficiency < 0.8) adjustment += 0.1;
    
    // Overperforming players get penalty
    if (goalEfficiency > 1.3) adjustment -= 0.1;
    if (assistEfficiency > 1.3) adjustment -= 0.08;
    
    return Math.max(0.7, Math.min(1.4, adjustment));
  }

  /**
   * Calculate prediction confidence
   */
  calculatePredictionConfidence(player, trends, teamStrength, gameweek) {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence for consistent players
    if (trends?.consistencyScore > 0.7) confidence += 0.2;
    
    // Increase confidence for regular starters
    const minutesRatio = (player.minutes || 0) / (Math.max(gameweek - 1, 1) * 90);
    if (minutesRatio > 0.8) confidence += 0.15;
    
    // Increase confidence if we have good team data
    if (teamStrength?.confidence > 0.8) confidence += 0.1;
    
    // Decrease confidence for injury-prone players
    if (trends?.injuryProneness > 0.2) confidence -= 0.15;
    
    // Decrease confidence for high rotation risk
    if (trends?.rotationRisk > 0.4) confidence -= 0.2;
    
    return Math.max(0.1, Math.min(1.0, confidence));
  }

  /**
   * Get player fixtures for specified gameweek range
   */
  getPlayerFixtures(playerId, startGW, endGW) {
    const player = this.data.bootstrap.elements.find(p => p.id === playerId);
    if (!player) return [];

    return this.data.fixtures.filter(fixture =>
      (fixture.team_h === player.team || fixture.team_a === player.team) &&
      fixture.event >= startGW &&
      fixture.event <= endGW
    );
  }

  /**
   * Predict multiple gameweeks for planning
   */
  predictPlayerOutlook(playerId, gameweeksAhead = 6) {
    const currentGW = this.data.bootstrap.events.find(gw => gw.is_current)?.id || 1;
    const predictions = [];
    
    for (let gw = currentGW; gw < currentGW + gameweeksAhead; gw++) {
      const prediction = this.predictGameweekPoints(playerId, gw);
      if (prediction) {
        predictions.push({
          gameweek: gw,
          ...prediction
        });
      }
    }
    
    // Calculate outlook metrics
    const totalExpected = predictions.reduce((sum, p) => sum + p.expectedPoints, 0);
    const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;
    
    return {
      gameweeks: predictions,
      totalExpectedPoints: Math.round(totalExpected * 10) / 10,
      averageExpected: Math.round((totalExpected / predictions.length) * 10) / 10,
      confidence: Math.round(avgConfidence * 100) / 100,
      recommendation: this.generateRecommendation(totalExpected, avgConfidence, predictions)
    };
  }

  /**
   * Generate actionable recommendation
   */
  generateRecommendation(totalExpected, confidence, predictions) {
    const avgExpected = totalExpected / predictions.length;
    const trend = this.calculateTrend(predictions);
    
    if (avgExpected > 6 && confidence > 0.7) {
      return {
        action: 'STRONG_BUY',
        reason: `High expected returns (${avgExpected.toFixed(1)} PPG) with good confidence`,
        priority: 'High'
      };
    }
    
    if (avgExpected > 4.5 && confidence > 0.6 && trend > 0) {
      return {
        action: 'BUY',
        reason: `Good expected returns with positive trend`,
        priority: 'Medium'
      };
    }
    
    if (avgExpected < 3 || confidence < 0.4) {
      return {
        action: 'AVOID',
        reason: `Low expected returns or high uncertainty`,
        priority: 'High'
      };
    }
    
    return {
      action: 'HOLD',
      reason: `Stable expected returns, monitor for changes`,
      priority: 'Low'
    };
  }

  /**
   * Calculate trend direction from predictions
   */
  calculateTrend(predictions) {
    if (predictions.length < 3) return 0;
    
    const early = predictions.slice(0, Math.floor(predictions.length / 2));
    const late = predictions.slice(Math.floor(predictions.length / 2));
    
    const earlyAvg = early.reduce((sum, p) => sum + p.expectedPoints, 0) / early.length;
    const lateAvg = late.reduce((sum, p) => sum + p.expectedPoints, 0) / late.length;
    
    return lateAvg - earlyAvg;
  }

  /**
   * Export predictive report
   */
  async exportPredictiveReport(outputDir = './fpl-predictions') {
    console.log('🔮 Generating predictive analytics report...');
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const currentGW = this.data.bootstrap.events.find(gw => gw.is_current)?.id || 1;
    const playerPredictions = [];
    const teamOutlooks = [];

    // Generate predictions for all players
    for (const player of this.data.bootstrap.elements.slice(0, 100)) { // Limit for demo
      const nextGWPrediction = this.predictGameweekPoints(player.id, currentGW);
      const outlook = this.predictPlayerOutlook(player.id, 4);
      
      if (nextGWPrediction && outlook) {
        playerPredictions.push({
          player: {
            id: player.id,
            name: `${player.first_name} ${player.second_name}`,
            position: this.data.bootstrap.element_types.find(p => p.id === player.element_type)?.singular_name_short,
            team: this.data.bootstrap.teams.find(t => t.id === player.team)?.short_name,
            price: player.now_cost / 10
          },
          nextGameweek: nextGWPrediction,
          outlook: outlook
        });
      }
    }

    // Sort by expected points for next gameweek
    playerPredictions.sort((a, b) => b.nextGameweek.expectedPoints - a.nextGameweek.expectedPoints);

    const report = {
      generated: new Date().toISOString(),
      gameweek: currentGW,
      summary: {
        playersAnalyzed: playerPredictions.length,
        avgExpectedNext: playerPredictions.reduce((sum, p) => sum + p.nextGameweek.expectedPoints, 0) / playerPredictions.length,
        highConfidencePicks: playerPredictions.filter(p => p.nextGameweek.confidence > 0.7).length
      },
      topPredictions: {
        nextGameweek: playerPredictions.slice(0, 20),
        longTermOutlook: playerPredictions
          .sort((a, b) => b.outlook.totalExpectedPoints - a.outlook.totalExpectedPoints)
          .slice(0, 20)
      },
      methodology: {
        predictionWeights: this.predictionWeights,
        factorsConsidered: [
          'Historical form and consistency',
          'Fixture difficulty and team matchups',
          'Underlying statistics (xG/xA)',
          'Team tactical context',
          'Rotation and injury risks',
          'Momentum and regression analysis'
        ]
      }
    };

    // Export main report
    fs.writeFileSync(
      path.join(outputDir, 'predictive-report.json'),
      JSON.stringify(report, null, 2)
    );

    // Export CSV for analysis
    const csvHeaders = [
      'Name', 'Position', 'Team', 'Price', 'Next_GW_Expected', 'Confidence',
      'Outlook_Total', 'Outlook_Avg', 'Recommendation', 'Fixture_Opponent',
      'Rotation_Risk', 'Injury_Risk'
    ];

    const csvData = playerPredictions.map(p => [
      p.player.name,
      p.player.position,
      p.player.team,
      p.player.price,
      p.nextGameweek.expectedPoints,
      p.nextGameweek.confidence,
      p.outlook.totalExpectedPoints,
      p.outlook.averageExpected,
      p.outlook.recommendation.action,
      p.nextGameweek.breakdown.fixtureOpponent,
      p.nextGameweek.breakdown.rotationRisk || 0,
      this.data.playerTrends.get(p.player.id)?.injuryProneness || 0
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    fs.writeFileSync(
      path.join(outputDir, 'player-predictions.csv'),
      csvContent
    );

    console.log(`✅ Predictive report exported to: ${outputDir}`);
    console.log(`📁 Files generated:`);
    console.log(`   - predictive-report.json (Complete predictions)`);
    console.log(`   - player-predictions.csv (Analysis-ready data)`);

    return outputDir;
  }
}

/**
 * CLI Interface
 */
async function main() {
  const args = process.argv.slice(2);
  const engine = new FPLPredictiveEngine();
  
  const initialized = await engine.initialize();
  if (!initialized) {
    process.exit(1);
  }
  
  if (args.includes('--player') || args.includes('-p')) {
    const playerIdArg = args.find(arg => !isNaN(parseInt(arg)));
    if (playerIdArg) {
      const playerId = parseInt(playerIdArg);
      const currentGW = engine.data.bootstrap.events.find(gw => gw.is_current)?.id || 1;
      const prediction = engine.predictGameweekPoints(playerId, currentGW);
      const outlook = engine.predictPlayerOutlook(playerId, 6);
      
      if (prediction && outlook) {
        console.log('\n🔮 PLAYER PREDICTION:');
        console.log(`Next GW Expected: ${prediction.expectedPoints} points (${Math.round(prediction.confidence * 100)}% confidence)`);
        console.log(`6-GW Outlook: ${outlook.totalExpectedPoints} points total`);
        console.log(`Recommendation: ${outlook.recommendation.action} - ${outlook.recommendation.reason}`);
        console.log('\nFactors:');
        Object.entries(prediction.factors).forEach(([key, value]) => {
          console.log(`  ${key}: ${value > 0 ? '+' : ''}${value}%`);
        });
      }
      return;
    }
  }
  
  // Default: generate full predictive report
  await engine.exportPredictiveReport();
}

module.exports = FPLPredictiveEngine;

if (require.main === module) {
  main().catch(console.error);
}
