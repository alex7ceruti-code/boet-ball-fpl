#!/usr/bin/env node

/**
 * FPL Advanced Player Analysis Tool
 * Provides in-depth analysis for selected players with comparison capabilities
 */

const fs = require('fs').promises;
const path = require('path');

class FPLPlayerAnalysis {
  constructor() {
    this.players = [];
    this.fixtures = [];
    this.teams = [];
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    console.log('🔮 Initializing FPL Player Analysis Tool...');
    
    try {
      // Load FPL bootstrap data
      const response = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/');
      const data = await response.json();
      
      this.players = data.elements || [];
      this.fixtures = data.fixtures || [];
      this.teams = data.teams || [];
      
      console.log(`✅ Loaded ${this.players.length} players`);
      console.log(`✅ Loaded ${this.fixtures.length} fixtures`);
      console.log(`✅ Loaded ${this.teams.length} teams`);
      
      this.initialized = true;
    } catch (error) {
      console.error('❌ Failed to load FPL data:', error.message);
      throw error;
    }
  }

  findPlayersByName(searchTerm) {
    return this.players.filter(player => 
      player.web_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.second_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  findPlayerById(id) {
    return this.players.find(player => player.id === parseInt(id));
  }

  getTeamName(teamId) {
    const team = this.teams.find(t => t.id === teamId);
    return team ? team.name : 'Unknown';
  }

  getPositionName(elementType) {
    const positions = { 1: 'Goalkeeper', 2: 'Defender', 3: 'Midfielder', 4: 'Forward' };
    return positions[elementType] || 'Unknown';
  }

  calculateAdvancedStats(player) {
    const stats = {
      // Basic metrics
      pointsPerGame: player.total_points / Math.max(player.minutes, 90) * 90,
      pointsPerMillion: player.total_points / (player.now_cost / 10),
      valueRating: this.calculateValueRating(player),
      
      // Form metrics
      formTrend: this.calculateFormTrend(player),
      consistency: this.calculateConsistency(player),
      
      // Predictive metrics
      expectedPoints: this.calculateExpectedPoints(player),
      fixtureRating: this.calculateFixtureRating(player),
      rotationRisk: this.calculateRotationRisk(player),
      
      // Advanced analytics
      underlyingStats: this.getUnderlyingStats(player),
      teamStrength: this.calculateTeamStrength(player.team),
      priceChangeProb: this.calculatePriceChangeProb(player)
    };

    return stats;
  }

  calculateValueRating(player) {
    const ppg = player.total_points / Math.max(player.minutes, 90) * 90;
    const ppm = player.total_points / (player.now_cost / 10);
    
    if (ppm > 2.0) return 'Exceptional';
    if (ppm > 1.5) return 'Excellent';
    if (ppm > 1.0) return 'Good';
    if (ppm > 0.8) return 'Fair';
    return 'Poor';
  }

  calculateFormTrend(player) {
    const form = parseFloat(player.form) || 0;
    const recentForm = parseFloat(player.points_per_game) || 0;
    
    const trend = (form - recentForm) / Math.max(recentForm, 0.1);
    
    if (trend > 0.2) return { direction: 'Improving', strength: 'Strong', percentage: Math.round(trend * 100) };
    if (trend > 0.1) return { direction: 'Improving', strength: 'Moderate', percentage: Math.round(trend * 100) };
    if (trend > -0.1) return { direction: 'Stable', strength: 'Consistent', percentage: Math.round(Math.abs(trend) * 100) };
    if (trend > -0.2) return { direction: 'Declining', strength: 'Moderate', percentage: Math.round(Math.abs(trend) * 100) };
    return { direction: 'Declining', strength: 'Strong', percentage: Math.round(Math.abs(trend) * 100) };
  }

  calculateConsistency(player) {
    // Simplified consistency based on bonus points and minutes
    const bonusConsistency = (player.bonus || 0) / Math.max(player.total_points, 1);
    const minutesConsistency = Math.min(player.minutes / (38 * 90), 1);
    
    return ((bonusConsistency * 0.3) + (minutesConsistency * 0.7)) * 100;
  }

  calculateExpectedPoints(player) {
    // Multi-factor expected points calculation
    const basePoints = parseFloat(player.points_per_game) || 0;
    const formMultiplier = 1 + ((parseFloat(player.form) || 0) - basePoints) / Math.max(basePoints, 0.1) * 0.3;
    const fixtureMultiplier = this.calculateFixtureMultiplier(player);
    const teamMultiplier = this.calculateTeamMultiplier(player.team);
    
    return basePoints * formMultiplier * fixtureMultiplier * teamMultiplier;
  }

  calculateFixtureMultiplier(player) {
    // Get next 3 fixtures for the team
    const teamFixtures = this.fixtures
      .filter(f => f.team_h === player.team || f.team_a === player.team)
      .filter(f => !f.finished)
      .slice(0, 3);
    
    if (teamFixtures.length === 0) return 1.0;
    
    const avgDifficulty = teamFixtures.reduce((sum, fixture) => {
      return sum + (fixture.team_h === player.team ? fixture.team_h_difficulty : fixture.team_a_difficulty);
    }, 0) / teamFixtures.length;
    
    // Convert difficulty to multiplier (lower difficulty = higher multiplier)
    return Math.max(0.7, 1.4 - (avgDifficulty / 5) * 0.6);
  }

  calculateTeamMultiplier(teamId) {
    const team = this.teams.find(t => t.id === teamId);
    if (!team) return 1.0;
    
    // Simple team strength based on overall strength
    const avgStrength = (team.strength_overall_home + team.strength_overall_away) / 2;
    return 0.8 + (avgStrength / 5) * 0.4; // Scale between 0.8 and 1.2
  }

  calculateFixtureRating(player) {
    const teamFixtures = this.fixtures
      .filter(f => f.team_h === player.team || f.team_a === player.team)
      .filter(f => !f.finished)
      .slice(0, 5);
    
    if (teamFixtures.length === 0) return { rating: 'Unknown', difficulty: 3, fixtures: [] };
    
    const fixtureDetails = teamFixtures.map(fixture => {
      const isHome = fixture.team_h === player.team;
      const opponentId = isHome ? fixture.team_a : fixture.team_h;
      const opponent = this.teams.find(t => t.id === opponentId);
      const difficulty = isHome ? fixture.team_h_difficulty : fixture.team_a_difficulty;
      
      return {
        opponent: opponent ? opponent.short_name : 'TBD',
        venue: isHome ? 'H' : 'A',
        difficulty: difficulty,
        gameweek: fixture.event
      };
    });
    
    const avgDifficulty = fixtureDetails.reduce((sum, f) => sum + f.difficulty, 0) / fixtureDetails.length;
    
    let rating;
    if (avgDifficulty <= 2.5) rating = 'Excellent';
    else if (avgDifficulty <= 3.0) rating = 'Good';
    else if (avgDifficulty <= 3.5) rating = 'Average';
    else if (avgDifficulty <= 4.0) rating = 'Difficult';
    else rating = 'Very Difficult';
    
    return { rating, difficulty: avgDifficulty, fixtures: fixtureDetails };
  }

  calculateRotationRisk(player) {
    // Based on minutes played and team depth
    const minutesPercentage = player.minutes / (38 * 90);
    const startsPercentage = player.starts / Math.max(player.appearances, 1);
    
    let risk;
    if (minutesPercentage > 0.8 && startsPercentage > 0.9) risk = 'Very Low';
    else if (minutesPercentage > 0.6 && startsPercentage > 0.7) risk = 'Low';
    else if (minutesPercentage > 0.4 && startsPercentage > 0.5) risk = 'Medium';
    else if (minutesPercentage > 0.2) risk = 'High';
    else risk = 'Very High';
    
    return {
      level: risk,
      minutesPercentage: Math.round(minutesPercentage * 100),
      startsPercentage: Math.round(startsPercentage * 100)
    };
  }

  getUnderlyingStats(player) {
    return {
      expectedGoals: (parseFloat(player.expected_goals) || 0).toFixed(2),
      expectedAssists: (parseFloat(player.expected_assists) || 0).toFixed(2),
      expectedGoalsPer90: ((parseFloat(player.expected_goals) || 0) / Math.max(player.minutes, 90) * 90).toFixed(2),
      expectedAssistsPer90: ((parseFloat(player.expected_assists) || 0) / Math.max(player.minutes, 90) * 90).toFixed(2),
      ictIndex: player.ict_index || '0.0',
      influence: player.influence || '0.0',
      creativity: player.creativity || '0.0',
      threat: player.threat || '0.0'
    };
  }

  calculateTeamStrength(teamId) {
    const team = this.teams.find(t => t.id === teamId);
    if (!team) return { overall: 'Unknown', attack: 'Unknown', defense: 'Unknown' };
    
    const overall = (team.strength_overall_home + team.strength_overall_away) / 2;
    const attack = (team.strength_attack_home + team.strength_attack_away) / 2;
    const defense = (team.strength_defence_home + team.strength_defence_away) / 2;
    
    return {
      overall: this.ratingToText(overall),
      attack: this.ratingToText(attack),
      defense: this.ratingToText(defense)
    };
  }

  ratingToText(rating) {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 4.0) return 'Very Good';
    if (rating >= 3.5) return 'Good';
    if (rating >= 3.0) return 'Average';
    if (rating >= 2.5) return 'Below Average';
    return 'Poor';
  }

  calculatePriceChangeProb(player) {
    // Simplified price change probability based on ownership and form
    const ownership = parseFloat(player.selected_by_percent) || 0;
    const form = parseFloat(player.form) || 0;
    const ppg = parseFloat(player.points_per_game) || 0;
    
    const momentum = form - ppg;
    
    let prob = 'Stable';
    if (momentum > 1.0 && ownership > 10) prob = 'Rise Likely';
    else if (momentum > 0.5 && ownership > 5) prob = 'Rise Possible';
    else if (momentum < -1.0 && ownership < 3) prob = 'Fall Likely';
    else if (momentum < -0.5) prob = 'Fall Possible';
    
    return prob;
  }

  generatePlayerReport(player, includeComparisons = false) {
    const stats = this.calculateAdvancedStats(player);
    const team = this.getTeamName(player.team);
    const position = this.getPositionName(player.element_type);
    
    const report = {
      playerInfo: {
        id: player.id,
        name: `${player.first_name} ${player.second_name}`,
        webName: player.web_name,
        team: team,
        position: position,
        price: `£${(player.now_cost / 10).toFixed(1)}m`,
        ownership: `${player.selected_by_percent}%`
      },
      
      performance: {
        totalPoints: player.total_points,
        pointsPerGame: stats.pointsPerGame.toFixed(1),
        pointsPerMillion: stats.pointsPerMillion.toFixed(2),
        valueRating: stats.valueRating,
        form: player.form,
        formTrend: stats.formTrend
      },
      
      predictive: {
        expectedPoints: stats.expectedPoints.toFixed(1),
        consistency: `${stats.consistency.toFixed(0)}%`,
        fixtureRating: stats.fixtureRating,
        rotationRisk: stats.rotationRisk,
        priceChangeProb: stats.priceChangeProb
      },
      
      advanced: {
        underlyingStats: stats.underlyingStats,
        teamStrength: stats.teamStrength,
        minutesPlayed: player.minutes,
        appearances: player.appearances,
        starts: player.starts
      },
      
      timestamp: new Date().toISOString()
    };
    
    return report;
  }

  async analyzeMultiplePlayers(playerIdentifiers) {
    await this.initialize();
    
    const reports = [];
    const playerList = [];
    
    console.log('\n🔍 Finding and analyzing players...\n');
    
    for (const identifier of playerIdentifiers) {
      let players = [];
      
      // Check if it's a number (ID) or string (name search)
      if (/^\d+$/.test(identifier)) {
        const player = this.findPlayerById(parseInt(identifier));
        if (player) players = [player];
      } else {
        players = this.findPlayersByName(identifier);
      }
      
      if (players.length === 0) {
        console.log(`❌ No players found for: "${identifier}"`);
        continue;
      }
      
      if (players.length > 1 && !/^\d+$/.test(identifier)) {
        console.log(`🔍 Multiple players found for "${identifier}":`);
        players.slice(0, 3).forEach((p, i) => {
          console.log(`   ${i + 1}. ${p.web_name} (${this.getTeamName(p.team)}) - ID: ${p.id}`);
        });
        console.log(`   Using: ${players[0].web_name}\n`);
      }
      
      const selectedPlayer = players[0];
      playerList.push(selectedPlayer);
      const report = this.generatePlayerReport(selectedPlayer);
      reports.push(report);
      
      console.log(`✅ Analyzed: ${report.playerInfo.name} (${report.playerInfo.team})`);
    }
    
    return { reports, playerList };
  }

  printDetailedReport(report) {
    const p = report.playerInfo;
    const perf = report.performance;
    const pred = report.predictive;
    const adv = report.advanced;
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🏈 ${p.name} (${p.webName})`);
    console.log(`${p.position} | ${p.team} | ${p.price} | ${p.ownership} owned`);
    console.log(`${'='.repeat(60)}\n`);
    
    // Performance Section
    console.log(`📊 PERFORMANCE METRICS:`);
    console.log(`   Total Points: ${perf.totalPoints}`);
    console.log(`   Points/Game: ${perf.pointsPerGame}`);
    console.log(`   Points/£Million: ${perf.pointsPerMillion}`);
    console.log(`   Value Rating: ${perf.valueRating}`);
    console.log(`   Current Form: ${perf.form}`);
    console.log(`   Form Trend: ${perf.formTrend.direction} (${perf.formTrend.strength}) ${perf.formTrend.percentage}%\n`);
    
    // Predictive Section
    console.log(`🔮 PREDICTIVE ANALYTICS:`);
    console.log(`   Expected Points (next GW): ${pred.expectedPoints}`);
    console.log(`   Consistency Rating: ${pred.consistency}`);
    console.log(`   Fixture Rating: ${pred.fixtureRating.rating} (${pred.fixtureRating.difficulty.toFixed(1)}/5)`);
    console.log(`   Rotation Risk: ${pred.rotationRisk.level} (${pred.rotationRisk.minutesPercentage}% minutes)`);
    console.log(`   Price Change: ${pred.priceChangeProb}\n`);
    
    // Fixtures
    console.log(`📅 UPCOMING FIXTURES:`);
    pred.fixtureRating.fixtures.slice(0, 3).forEach(fixture => {
      console.log(`   GW${fixture.gameweek}: ${fixture.venue === 'H' ? 'vs' : '@'} ${fixture.opponent} (${fixture.difficulty}/5)`);
    });
    console.log('');
    
    // Advanced Stats
    console.log(`⚡ UNDERLYING STATS:`);
    console.log(`   Expected Goals: ${adv.underlyingStats.expectedGoals} (${adv.underlyingStats.expectedGoalsPer90}/90)`);
    console.log(`   Expected Assists: ${adv.underlyingStats.expectedAssists} (${adv.underlyingStats.expectedAssistsPer90}/90)`);
    console.log(`   ICT Index: ${adv.underlyingStats.ictIndex}`);
    console.log(`   Threat: ${adv.underlyingStats.threat} | Creativity: ${adv.underlyingStats.creativity}`);
    console.log(`   Influence: ${adv.underlyingStats.influence}\n`);
    
    // Team Context
    console.log(`🏆 TEAM CONTEXT:`);
    console.log(`   Team Strength: ${adv.teamStrength.overall}`);
    console.log(`   Attack Rating: ${adv.teamStrength.attack}`);
    console.log(`   Defense Rating: ${adv.teamStrength.defense}`);
    console.log(`   Minutes Played: ${adv.minutesPlayed} (${adv.appearances} apps, ${adv.starts} starts)\n`);
  }

  async generateComparisonTable(reports) {
    if (reports.length < 2) return;
    
    console.log(`\n${'='.repeat(120)}`);
    console.log(`🔄 PLAYER COMPARISON TABLE`);
    console.log(`${'='.repeat(120)}\n`);
    
    // Header
    const headers = ['Player', 'Price', 'PPG', 'PP£M', 'Form', 'xPts', 'Fix', 'Risk', 'Value'];
    console.log(headers.map(h => h.padEnd(12)).join(''));
    console.log('-'.repeat(120));
    
    // Player rows
    reports.forEach(report => {
      const row = [
        report.playerInfo.webName.substring(0, 11),
        report.playerInfo.price,
        report.performance.pointsPerGame,
        report.performance.pointsPerMillion,
        report.performance.form,
        report.predictive.expectedPoints,
        report.predictive.fixtureRating.rating.substring(0, 8),
        report.predictive.rotationRisk.level.substring(0, 8),
        report.performance.valueRating.substring(0, 8)
      ];
      console.log(row.map(cell => String(cell).padEnd(12)).join(''));
    });
    
    console.log('');
  }

  async exportAnalysis(reports, filename = 'player-analysis') {
    const timestamp = new Date().toISOString().split('T')[0];
    const exportData = {
      generated: new Date().toISOString(),
      players: reports,
      summary: {
        playersAnalyzed: reports.length,
        avgExpectedPoints: reports.reduce((sum, r) => sum + parseFloat(r.predictive.expectedPoints), 0) / reports.length,
        topValuePlayer: reports.reduce((best, current) => 
          parseFloat(current.performance.pointsPerMillion) > parseFloat(best.performance.pointsPerMillion) ? current : best
        )
      }
    };
    
    // Export JSON
    await fs.writeFile(`${filename}-${timestamp}.json`, JSON.stringify(exportData, null, 2));
    
    // Export CSV
    const csvHeaders = ['Name', 'Team', 'Position', 'Price', 'PPG', 'PP£M', 'Expected_Points', 'Form_Trend', 'Fixture_Rating', 'Value_Rating'];
    const csvRows = reports.map(r => [
      r.playerInfo.name,
      r.playerInfo.team,
      r.playerInfo.position,
      r.playerInfo.price,
      r.performance.pointsPerGame,
      r.performance.pointsPerMillion,
      r.predictive.expectedPoints,
      `${r.performance.formTrend.direction} ${r.performance.formTrend.percentage}%`,
      r.predictive.fixtureRating.rating,
      r.performance.valueRating
    ]);
    
    const csvContent = [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');
    await fs.writeFile(`${filename}-${timestamp}.csv`, csvContent);
    
    console.log(`📁 Analysis exported:`);
    console.log(`   - ${filename}-${timestamp}.json`);
    console.log(`   - ${filename}-${timestamp}.csv\n`);
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help')) {
    console.log(`
🔮 FPL Advanced Player Analysis Tool

Usage:
  node fpl-player-analysis.js [player1] [player2] [...] [options]

Examples:
  node fpl-player-analysis.js "Haaland" "Salah" "Palmer"
  node fpl-player-analysis.js 233 302 428
  node fpl-player-analysis.js "Son" --export
  node fpl-player-analysis.js "Saka" "Palmer" "Foden" --compare

Options:
  --export         Export analysis to JSON/CSV files
  --compare        Show comparison table
  --help           Show this help message

Player Identification:
  - Use player names (e.g., "Haaland", "Salah")  
  - Use player IDs (e.g., 233, 302)
  - Partial names work (e.g., "Son" finds "Son Heung-min")
`);
    return;
  }
  
  const analyzer = new FPLPlayerAnalysis();
  
  // Extract options
  const exportResults = args.includes('--export');
  const showComparison = args.includes('--compare');
  
  // Extract player identifiers (exclude options)
  const players = args.filter(arg => !arg.startsWith('--'));
  
  if (players.length === 0) {
    console.log('❌ Please specify at least one player to analyze.');
    return;
  }
  
  try {
    const { reports } = await analyzer.analyzeMultiplePlayers(players);
    
    if (reports.length === 0) {
      console.log('❌ No players could be analyzed.');
      return;
    }
    
    // Print detailed reports
    reports.forEach(report => analyzer.printDetailedReport(report));
    
    // Show comparison if requested and multiple players
    if (showComparison || reports.length > 1) {
      await analyzer.generateComparisonTable(reports);
    }
    
    // Export if requested
    if (exportResults) {
      await analyzer.exportAnalysis(reports, 'fpl-player-analysis');
    }
    
    console.log(`✅ Analysis complete! Analyzed ${reports.length} player${reports.length > 1 ? 's' : ''}.`);
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = FPLPlayerAnalysis;
