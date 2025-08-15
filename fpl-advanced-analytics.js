#!/usr/bin/env node

/**
 * Advanced FPL Analytics Engine
 * 
 * Uses only official FPL API data to provide comprehensive player and team analytics
 * far beyond what's available in standard FPL tools.
 * 
 * Author: Boet Ball Analytics Team
 * Version: 1.0.0
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

class FPLAdvancedAnalytics {
  constructor() {
    this.baseUrl = 'https://fantasy.premierleague.com/api';
    this.data = {
      bootstrap: null,
      fixtures: null,
      gameweeks: null,
    };
    this.cache = new Map();
  }

  /**
   * Fetch data from FPL API with caching
   */
  async fetchJson(url) {
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }

    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            this.cache.set(url, json);
            resolve(json);
          } catch (error) {
            reject(error);
          }
        });
      }).on('error', reject);
    });
  }

  /**
   * Initialize all required FPL data
   */
  async initialize() {
    console.log('🚀 Initializing FPL Advanced Analytics...');
    
    try {
      // Fetch core data
      this.data.bootstrap = await this.fetchJson(`${this.baseUrl}/bootstrap-static/`);
      this.data.fixtures = await this.fetchJson(`${this.baseUrl}/fixtures/`);
      
      console.log(`✅ Loaded ${this.data.bootstrap.elements.length} players`);
      console.log(`✅ Loaded ${this.data.bootstrap.teams.length} teams`);
      console.log(`✅ Loaded ${this.data.fixtures.length} fixtures`);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize:', error.message);
      return false;
    }
  }

  /**
   * Calculate finishing efficiency (xG vs actual goals/assists)
   */
  calculateFinishingEfficiency(player) {
    const actualGoals = player.goals_scored || 0;
    const xG = parseFloat(player.expected_goals || '0');
    const actualAssists = player.assists || 0;
    const xA = parseFloat(player.expected_assists || '0');
    
    const goalEfficiency = xG > 0 ? (actualGoals / xG) * 100 : 0;
    const assistEfficiency = xA > 0 ? (actualAssists / xA) * 100 : 0;
    
    return {
      goalEfficiency: Math.round(goalEfficiency),
      assistEfficiency: Math.round(assistEfficiency),
      combinedEfficiency: Math.round((goalEfficiency + assistEfficiency) / 2),
      
      // Regression indicators
      likelyToScore: goalEfficiency < 85,
      likelyToAssist: assistEfficiency < 85,
      overperforming: goalEfficiency > 130,
      
      // Analysis
      analysis: {
        goals: {
          expected: xG,
          actual: actualGoals,
          efficiency: goalEfficiency,
          verdict: goalEfficiency > 130 ? 'Overperforming (due regression)' :
                  goalEfficiency < 85 ? 'Underperforming (positive regression likely)' :
                  'Performing as expected'
        },
        assists: {
          expected: xA,
          actual: actualAssists,
          efficiency: assistEfficiency,
          verdict: assistEfficiency > 130 ? 'Overperforming (due regression)' :
                  assistEfficiency < 85 ? 'Underperforming (positive regression likely)' :
                  'Performing as expected'
        }
      }
    };
  }

  /**
   * Calculate bonus point probability using BPS data
   */
  calculateBonusPointProbability(player) {
    const bps = parseFloat(player.bps || '0');
    const starts = Math.max(player.starts || 1, 1);
    const bpsPerGame = bps / starts;
    const bonusPerGame = (player.bonus || 0) / starts;
    
    // BPS thresholds for bonus points (typically 24+ for 1pt, 32+ for 2pt, 40+ for 3pt)
    return {
      bpsPerGame: Math.round(bpsPerGame * 10) / 10,
      actualBonusPerGame: Math.round(bonusPerGame * 10) / 10,
      
      probability: {
        anyBonus: Math.min(85, Math.max(5, bpsPerGame >= 20 ? bpsPerGame * 2 : 10)),
        twoPlus: Math.min(60, Math.max(2, bpsPerGame >= 30 ? (bpsPerGame - 20) * 2.5 : 5)),
        threePlus: Math.min(35, Math.max(1, bpsPerGame >= 38 ? (bpsPerGame - 30) * 3 : 2)),
      },
      
      category: bpsPerGame >= 35 ? 'Bonus magnet' :
               bpsPerGame >= 25 ? 'Bonus threat' :
               bpsPerGame >= 15 ? 'Occasional bonus' : 'Bonus unlikely',
               
      recommendation: bpsPerGame >= 30 ? 'Strong bonus upside' :
                     bpsPerGame >= 20 ? 'Moderate bonus potential' : 'Bonus not a factor'
    };
  }

  /**
   * Advanced form analysis with momentum and consistency
   */
  calculateAdvancedForm(player) {
    const form = parseFloat(player.form || '0');
    const ppg = parseFloat(player.points_per_game || '0');
    const starts = Math.max(player.starts || 1, 1);
    
    // Calculate form metrics
    const formScore = Math.min(100, Math.round(form * 10));
    const formTrend = form > ppg * 1.2 ? 'hot' : 
                     form < ppg * 0.8 ? 'cold' : 'stable';
    
    // Estimate consistency (using available data)
    const totalPoints = player.total_points || 0;
    const avgPoints = totalPoints / starts;
    const formDifference = Math.abs(form - avgPoints);
    const consistency = Math.max(0, 100 - (formDifference * 15));
    
    return {
      currentForm: form,
      pointsPerGame: ppg,
      formScore: formScore,
      formTrend: formTrend,
      consistency: Math.round(consistency),
      
      analysis: {
        verdict: form > ppg * 1.3 ? 'Red hot - consider before price rise' :
                form > ppg * 1.1 ? 'Good form - monitor closely' :
                form < ppg * 0.7 ? 'Poor form - avoid or consider selling' :
                'Average form - stable pick',
                
        risk: formTrend === 'hot' ? 'Price rise risk' :
              formTrend === 'cold' ? 'Price drop risk' : 'Stable',
              
        recommendation: form > 7 ? 'Buy' :
                       form > 5 ? 'Hold' :
                       form > 3 ? 'Monitor' : 'Avoid'
      }
    };
  }

  /**
   * Ownership value analysis
   */
  calculateOwnershipValue(player) {
    const ownership = parseFloat(player.selected_by_percent || '0');
    const ppg = parseFloat(player.points_per_game || '0');
    const form = parseFloat(player.form || '0');
    const price = player.now_cost / 10;
    
    // Expected ownership based on performance (rough formula)
    const expectedOwnership = Math.min(50, (ppg * 2) + (form * 1.5) + (price * 0.5));
    const ownershipGap = ownership - expectedOwnership;
    
    return {
      actualOwnership: ownership,
      expectedOwnership: Math.round(expectedOwnership * 10) / 10,
      ownershipGap: Math.round(ownershipGap * 10) / 10,
      
      category: ownershipGap < -5 ? 'underowned' :
                ownershipGap > 5 ? 'overowned' : 'fairly_owned',
                
      differentialPotential: ownershipGap < -8 ? 'high' :
                            ownershipGap < -3 ? 'medium' : 'low',
                            
      templateRisk: ownership > 25 ? 'high' : ownership > 15 ? 'medium' : 'low',
      
      analysis: {
        verdict: ownershipGap < -8 ? 'Strong differential pick' :
                ownershipGap < -3 ? 'Good differential potential' :
                ownershipGap > 8 ? 'Potentially overowned' :
                'Template/popular pick',
                
        strategy: ownership < 5 ? 'High risk/reward differential' :
                 ownership < 15 ? 'Solid differential choice' :
                 ownership < 30 ? 'Semi-popular - balanced risk' :
                 'Template player - low risk but limited upside'
      }
    };
  }

  /**
   * Price change prediction
   */
  predictPriceChange(player) {
    const transfersIn = player.transfers_in_event || 0;
    const transfersOut = player.transfers_out_event || 0;
    const netTransfers = transfersIn - transfersOut;
    const ownership = parseFloat(player.selected_by_percent || '0');
    
    // Rough approximation of total owners (assuming ~9M active managers)
    const totalManagers = 9000000;
    const ownersCount = (ownership / 100) * totalManagers;
    const changeThreshold = ownersCount * 0.06; // ~6% threshold
    
    const netTransferRate = ownersCount > 0 ? (netTransfers / ownersCount) * 100 : 0;
    
    return {
      transfersIn: transfersIn,
      transfersOut: transfersOut,
      netTransfers: netTransfers,
      netTransferRate: Math.round(netTransferRate * 100) / 100,
      
      prediction: {
        rise: netTransfers > changeThreshold * 0.7 ? 'high' :
              netTransfers > changeThreshold * 0.4 ? 'medium' : 'low',
              
        fall: netTransfers < -changeThreshold * 0.7 ? 'high' :
              netTransfers < -changeThreshold * 0.4 ? 'medium' : 'low',
      },
      
      recommendation: netTransfers > changeThreshold * 0.8 ? 'Buy before price rise' :
                     netTransfers < -changeThreshold * 0.8 ? 'Sell before price fall' :
                     'Monitor transfers',
                     
      riskLevel: Math.abs(netTransferRate) > 2 ? 'high' :
                Math.abs(netTransferRate) > 1 ? 'medium' : 'low'
    };
  }

  /**
   * Position-specific analysis for goalkeepers
   */
  analyzeGoalkeeper(player) {
    const saves = player.saves || 0;
    const savesP90 = parseFloat(player.saves_per_90 || '0');
    const gcP90 = parseFloat(player.goals_conceded_per_90 || '0');
    const cleanSheets = player.clean_sheets || 0;
    const starts = Math.max(player.starts || 1, 1);
    const price = player.now_cost / 10;
    
    return {
      saveEfficiency: saves > 0 ? Math.round((saves / (saves + (player.goals_conceded || 0))) * 100) : 0,
      savesPerGame: savesP90,
      cleanSheetRate: Math.round((cleanSheets / starts) * 100),
      goalsConc90: gcP90,
      
      // Value metrics
      savesPerPound: Math.round((saves / price) * 10) / 10,
      pointsPerStart: Math.round((player.total_points / starts) * 10) / 10,
      cleanSheetsPerPound: Math.round((cleanSheets / price) * 10) / 10,
      
      category: savesP90 >= 3.5 ? 'Shot stopper' :
                gcP90 <= 1.0 ? 'Clean sheet merchant' : 'Average',
                
      recommendation: cleanSheets / starts > 0.4 ? 'Premium clean sheet option' :
                     savesP90 > 3.5 ? 'Good save points potential' :
                     price < 4.5 ? 'Budget rotation option' : 'Avoid'
    };
  }

  /**
   * Position-specific analysis for defenders
   */
  analyzeDefender(player) {
    const cleanSheets = player.clean_sheets || 0;
    const assists = player.assists || 0;
    const goals = player.goals_scored || 0;
    const bonus = player.bonus || 0;
    const bps = parseFloat(player.bps || '0');
    const starts = Math.max(player.starts || 1, 1);
    const price = player.now_cost / 10;
    
    return {
      cleanSheetRate: Math.round((cleanSheets / starts) * 100),
      attackingReturns: goals + assists,
      attackingPoints: goals * 6 + assists * 3, // FPL points from goals/assists
      
      // Defender archetypes
      type: assists >= goals * 2 ? 'Attacking wingback' :
            cleanSheets >= starts * 0.4 ? 'Defensive stalwart' :
            bonus >= 10 ? 'Bonus magnet' : 'Rotation risk',
            
      // Value metrics
      cleanSheetsPerPound: Math.round((cleanSheets / price) * 10) / 10,
      attackingPerPound: Math.round(((goals + assists) / price) * 10) / 10,
      bpsPerGame: Math.round((bps / starts) * 10) / 10,
      
      recommendation: (goals + assists) > 5 && cleanSheets > 8 ? 'Premium all-round option' :
                     assists > goals * 1.5 ? 'Attacking threat - good for assists' :
                     cleanSheets / starts > 0.45 ? 'Defensive reliability' :
                     price < 4.5 ? 'Budget rotation' : 'Consider alternatives'
    };
  }

  /**
   * Get fixtures for a specific team
   */
  getTeamFixtures(teamId, gameweeksAhead = 6) {
    const currentGameweek = this.data.bootstrap.events.find(gw => gw.is_current)?.id || 1;
    const endGameweek = currentGameweek + gameweeksAhead;
    
    return this.data.fixtures
      .filter(fixture => 
        (fixture.team_h === teamId || fixture.team_a === teamId) &&
        fixture.event >= currentGameweek &&
        fixture.event <= endGameweek
      )
      .map(fixture => {
        const isHome = fixture.team_h === teamId;
        const opponent = this.data.bootstrap.teams.find(t => t.id === (isHome ? fixture.team_a : fixture.team_h));
        
        return {
          gameweek: fixture.event,
          opponent: opponent?.short_name || 'TBD',
          isHome: isHome,
          difficulty: isHome ? fixture.team_h_difficulty : fixture.team_a_difficulty,
          kickoff: fixture.kickoff_time
        };
      });
  }

  /**
   * Analyze fixtures difficulty using team strength
   */
  analyzeFixtureDifficulty(teamId, gameweeksAhead = 6) {
    const team = this.data.bootstrap.teams.find(t => t.id === teamId);
    const fixtures = this.getTeamFixtures(teamId, gameweeksAhead);
    
    if (!team || !fixtures.length) return null;
    
    const analysis = fixtures.map(fixture => {
      const opponent = this.data.bootstrap.teams.find(t => t.short_name === fixture.opponent);
      const isHome = fixture.isHome;
      
      if (!opponent) return fixture;
      
      // Calculate strength advantages
      const myAttack = isHome ? team.strength_attack_home : team.strength_attack_away;
      const myDefence = isHome ? team.strength_defence_home : team.strength_defence_away;
      const oppAttack = !isHome ? opponent.strength_attack_home : opponent.strength_attack_away;
      const oppDefence = !isHome ? opponent.strength_defence_home : opponent.strength_defence_away;
      
      const attackAdvantage = (myAttack / oppDefence) * 100;
      const defenceAdvantage = (myDefence / oppAttack) * 100;
      
      return {
        ...fixture,
        attackAdvantage: Math.round(attackAdvantage),
        defenceAdvantage: Math.round(defenceAdvantage),
        cleanSheetProb: Math.min(85, Math.max(5, defenceAdvantage - 80)),
        goalsProbability: Math.min(95, Math.max(15, attackAdvantage - 85)),
        fixtureRating: Math.round((attackAdvantage + defenceAdvantage) / 2)
      };
    });
    
    return {
      team: team.short_name,
      fixtures: analysis,
      avgDifficulty: analysis.reduce((sum, f) => sum + f.difficulty, 0) / analysis.length,
      avgRating: analysis.reduce((sum, f) => sum + f.fixtureRating, 0) / analysis.length,
      easyFixtures: analysis.filter(f => f.fixtureRating > 110).length,
      hardFixtures: analysis.filter(f => f.fixtureRating < 90).length
    };
  }

  /**
   * Complete player analysis combining all metrics
   */
  analyzePlayer(playerId) {
    const player = this.data.bootstrap.elements.find(p => p.id === playerId);
    if (!player) return null;
    
    const position = this.data.bootstrap.element_types.find(pos => pos.id === player.element_type);
    const team = this.data.bootstrap.teams.find(t => t.id === player.team);
    
    // Base analysis for all players
    let analysis = {
      player: {
        id: player.id,
        name: `${player.first_name} ${player.second_name}`,
        position: position.singular_name_short,
        team: team.short_name,
        price: player.now_cost / 10,
        ownership: parseFloat(player.selected_by_percent || '0')
      },
      
      performance: {
        totalPoints: player.total_points,
        pointsPerGame: parseFloat(player.points_per_game || '0'),
        form: parseFloat(player.form || '0'),
        minutes: player.minutes,
        starts: player.starts,
        bonus: player.bonus
      },
      
      advanced: {
        finishingEfficiency: this.calculateFinishingEfficiency(player),
        bonusPotential: this.calculateBonusPointProbability(player),
        formAnalysis: this.calculateAdvancedForm(player),
        ownershipAnalysis: this.calculateOwnershipValue(player),
        priceChange: this.predictPriceChange(player),
        fixtures: this.analyzeFixtureDifficulty(player.team, 6)
      }
    };
    
    // Position-specific analysis
    if (position.singular_name_short === 'GKP') {
      analysis.positionSpecific = this.analyzeGoalkeeper(player);
    } else if (position.singular_name_short === 'DEF') {
      analysis.positionSpecific = this.analyzeDefender(player);
    }
    
    return analysis;
  }

  /**
   * Generate top recommendations by category
   */
  generateRecommendations() {
    const players = this.data.bootstrap.elements;
    const recommendations = {
      differentials: [],
      hotForm: [],
      valuePlays: [],
      bonusMagnets: [],
      fixtureStars: []
    };
    
    players.forEach(player => {
      const analysis = this.analyzePlayer(player.id);
      if (!analysis) return;
      
      const ownership = analysis.player.ownership;
      const form = analysis.performance.form;
      const ppg = analysis.performance.pointsPerGame;
      const price = analysis.player.price;
      const bonusProb = analysis.advanced.bonusPotential.probability.anyBonus;
      
      // Differentials (low ownership, good performance)
      if (ownership < 10 && form > 5 && ppg > 4) {
        recommendations.differentials.push({
          ...analysis.player,
          score: form * ppg / ownership,
          reason: `${form} form, ${ppg} PPG, only ${ownership}% owned`
        });
      }
      
      // Hot form players
      if (form > 7 && analysis.advanced.formAnalysis.formTrend === 'hot') {
        recommendations.hotForm.push({
          ...analysis.player,
          score: form,
          reason: `Red hot form: ${form} average last 4 games`
        });
      }
      
      // Value plays (good points per million)
      const ppm = ppg / price;
      if (ppm > 1.2 && ppg > 4) {
        recommendations.valuePlays.push({
          ...analysis.player,
          score: ppm,
          reason: `${ppm.toFixed(2)} points per million, £${price}m`
        });
      }
      
      // Bonus magnets
      if (bonusProb > 40 && ppg > 4) {
        recommendations.bonusMagnets.push({
          ...analysis.player,
          score: bonusProb,
          reason: `${bonusProb}% chance of bonus points`
        });
      }
    });
    
    // Sort and limit each category
    Object.keys(recommendations).forEach(category => {
      recommendations[category] = recommendations[category]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
    });
    
    return recommendations;
  }

  /**
   * Export comprehensive analytics report
   */
  exportReport(outputDir = './fpl-analytics-output') {
    console.log('📊 Generating comprehensive analytics report...');
    
    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Generate player analyses
    const playerAnalyses = this.data.bootstrap.elements
      .map(player => this.analyzePlayer(player.id))
      .filter(analysis => analysis !== null);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations();
    
    // Export comprehensive JSON report
    const report = {
      generated: new Date().toISOString(),
      summary: {
        totalPlayers: playerAnalyses.length,
        avgOwnership: playerAnalyses.reduce((sum, p) => sum + p.player.ownership, 0) / playerAnalyses.length,
        avgPrice: playerAnalyses.reduce((sum, p) => sum + p.player.price, 0) / playerAnalyses.length
      },
      recommendations: recommendations,
      playerAnalyses: playerAnalyses
    };
    
    fs.writeFileSync(
      path.join(outputDir, 'fpl-advanced-analytics.json'), 
      JSON.stringify(report, null, 2)
    );
    
    // Export CSV for easy analysis
    const csvHeaders = [
      'Name', 'Position', 'Team', 'Price', 'Ownership%', 'Total Points', 'PPG', 'Form',
      'xG', 'xA', 'Goal Efficiency%', 'Assist Efficiency%', 'Bonus Prob%',
      'Form Trend', 'Ownership Category', 'Price Change Risk', 'Recommendation'
    ];
    
    const csvData = playerAnalyses.map(analysis => [
      analysis.player.name,
      analysis.player.position,
      analysis.player.team,
      analysis.player.price,
      analysis.player.ownership,
      analysis.performance.totalPoints,
      analysis.performance.pointsPerGame,
      analysis.performance.form,
      analysis.advanced.finishingEfficiency.analysis.goals.expected,
      analysis.advanced.finishingEfficiency.analysis.assists.expected,
      analysis.advanced.finishingEfficiency.goalEfficiency,
      analysis.advanced.finishingEfficiency.assistEfficiency,
      analysis.advanced.bonusPotential.probability.anyBonus,
      analysis.advanced.formAnalysis.formTrend,
      analysis.advanced.ownershipAnalysis.category,
      analysis.advanced.priceChange.riskLevel,
      analysis.advanced.formAnalysis.analysis.recommendation
    ]);
    
    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    fs.writeFileSync(
      path.join(outputDir, 'fpl-player-analytics.csv'), 
      csvContent
    );
    
    // Export recommendations summary
    const recSummary = Object.entries(recommendations).map(([category, players]) => ({
      category: category,
      count: players.length,
      topPlayers: players.slice(0, 5).map(p => ({ name: p.name, reason: p.reason }))
    }));
    
    fs.writeFileSync(
      path.join(outputDir, 'fpl-recommendations.json'), 
      JSON.stringify(recSummary, null, 2)
    );
    
    console.log(`✅ Analytics report exported to: ${outputDir}`);
    console.log(`📁 Files generated:`);
    console.log(`   - fpl-advanced-analytics.json (Complete analysis)`);
    console.log(`   - fpl-player-analytics.csv (Spreadsheet format)`);
    console.log(`   - fpl-recommendations.json (Top picks by category)`);
    
    return outputDir;
  }
}

/**
 * CLI Interface
 */
async function main() {
  const args = process.argv.slice(2);
  const analytics = new FPLAdvancedAnalytics();
  
  // Initialize data
  const initialized = await analytics.initialize();
  if (!initialized) {
    process.exit(1);
  }
  
  // Handle different commands
  if (args.includes('--player') || args.includes('-p')) {
    const playerIdArg = args.find(arg => !isNaN(parseInt(arg)));
    if (playerIdArg) {
      const playerId = parseInt(playerIdArg);
      const analysis = analytics.analyzePlayer(playerId);
      if (analysis) {
        console.log('\n🔍 PLAYER ANALYSIS:');
        console.log(JSON.stringify(analysis, null, 2));
      } else {
        console.log(`❌ Player ID ${playerId} not found`);
      }
      return;
    }
  }
  
  if (args.includes('--recommendations') || args.includes('-r')) {
    console.log('\n🏆 TOP RECOMMENDATIONS:');
    const recs = analytics.generateRecommendations();
    Object.entries(recs).forEach(([category, players]) => {
      console.log(`\n${category.toUpperCase()}:`);
      players.slice(0, 5).forEach((player, idx) => {
        console.log(`${idx + 1}. ${player.name} (${player.position}) - ${player.reason}`);
      });
    });
    return;
  }
  
  // Default: generate full report
  analytics.exportReport();
}

// Export for use as module
module.exports = FPLAdvancedAnalytics;

// Run CLI if called directly
if (require.main === module) {
  main().catch(console.error);
}
