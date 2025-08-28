#!/usr/bin/env node

const https = require('https');

// FPL API endpoints
const FPL_BASE_URL = 'https://fantasy.premierleague.com/api/';

// Squad constraints
const SQUAD_CONSTRAINTS = {
  totalPlayers: 15,
  budget: 100.0, // £100m budget
  maxPerTeam: 3,
  positions: {
    goalkeeper: { min: 2, max: 2 },
    defender: { min: 5, max: 5 },
    midfielder: { min: 5, max: 5 },
    forward: { min: 3, max: 3 }
  }
};

// Fetch data from FPL API
async function fetchFPLData(endpoint) {
  return new Promise((resolve, reject) => {
    https.get(`${FPL_BASE_URL}${endpoint}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Calculate player score based on multiple factors
function calculatePlayerScore(player, team, teamFixtures) {
  let score = 0;
  
  // Base points (40% weight)
  score += (player.total_points || 0) * 0.4;
  
  // Form (20% weight) 
  const form = parseFloat(player.form || '0');
  score += form * 4;
  
  // Expected stats (25% weight)
  const xG = parseFloat(player.expected_goals || '0');
  const xA = parseFloat(player.expected_assists || '0');
  score += (xG * 4 + xA * 3) * 2.5;
  
  // Fixture difficulty (10% weight) - lower FDR = better
  const fixtureFactor = Math.max(0, 5 - teamFixtures.avgFDR) * 2;
  score += fixtureFactor;
  
  // Value efficiency (3% weight)
  const pointsPerMillion = player.total_points > 0 ? player.total_points / (player.now_cost / 10) : 0;
  score += pointsPerMillion * 0.5;
  
  // Minutes played reliability (2% weight)
  const reliability = Math.min(1, (player.minutes || 0) / 180) * 5;
  score += reliability;
  
  // Position-specific bonuses
  if (player.element_type === 1) { // GKP
    score += Math.max(0, 5 - teamFixtures.avgFDR) * 1.5;
  } else if (player.element_type === 2) { // DEF
    score += Math.max(0, 5 - teamFixtures.avgFDR) * 1.2;
  } else if (player.element_type === 4) { // FWD
    score += (xG * 2);
  }
  
  return Math.round(score * 10) / 10;
}

// Get availability risk score
function getAvailabilityRisk(player) {
  if (player.status === 'u') return 5;
  if (player.chance_of_playing_this_round === 0) return 4;
  if (player.chance_of_playing_this_round === 25) return 3;
  if (player.chance_of_playing_this_round === 50) return 2;
  if (player.chance_of_playing_this_round === 75) return 1;
  if (player.news && player.news.trim()) return 1;
  return 0;
}

// Analyze next 8 gameweeks fixtures for each team
function analyzeFixtures(fixtures, teams, currentGW) {
  const teamFixtures = {};
  
  teams.forEach(team => {
    const upcomingFixtures = fixtures
      .filter(f => 
        (f.team_h === team.id || f.team_a === team.id) && 
        f.event >= currentGW && 
        f.event < currentGW + 8 &&
        !f.finished
      )
      .map(f => ({
        gameweek: f.event,
        opponent: f.team_h === team.id ? 
          teams.find(t => t.id === f.team_a)?.short_name : 
          teams.find(t => t.id === f.team_h)?.short_name,
        isHome: f.team_h === team.id,
        difficulty: f.team_h === team.id ? f.team_h_difficulty : f.team_a_difficulty
      }))
      .slice(0, 8);

    const avgFDR = upcomingFixtures.length > 0 
      ? upcomingFixtures.reduce((sum, f) => sum + f.difficulty, 0) / upcomingFixtures.length
      : 3;

    // Calculate runs
    const difficulties = upcomingFixtures.map(f => f.difficulty);
    let easyRun = 0, hardRun = 0, currentEasy = 0, currentHard = 0;
    
    difficulties.forEach(diff => {
      if (diff <= 2) {
        currentEasy++;
        currentHard = 0;
        easyRun = Math.max(easyRun, currentEasy);
      } else if (diff >= 4) {
        currentHard++;
        currentEasy = 0;
        hardRun = Math.max(hardRun, currentHard);
      } else {
        currentEasy = 0;
        currentHard = 0;
      }
    });

    teamFixtures[team.id] = {
      avgFDR: Math.round(avgFDR * 10) / 10,
      fixtures: upcomingFixtures,
      easyRun,
      hardRun
    };
  });

  return teamFixtures;
}

// Optimize squad selection
function optimizeSquad(players) {
  const squad = [];
  const teamCounts = {};

  // Sort players by position and score
  const playersByPosition = {
    1: players.filter(p => p.element_type === 1).sort((a, b) => b.overallScore - a.overallScore),
    2: players.filter(p => p.element_type === 2).sort((a, b) => b.overallScore - a.overallScore),
    3: players.filter(p => p.element_type === 3).sort((a, b) => b.overallScore - a.overallScore),
    4: players.filter(p => p.element_type === 4).sort((a, b) => b.overallScore - a.overallScore)
  };

  const requirements = [
    { type: 1, count: 2 }, // 2 GKP
    { type: 2, count: 5 }, // 5 DEF  
    { type: 3, count: 5 }, // 5 MID
    { type: 4, count: 3 }  // 3 FWD
  ];

  for (const req of requirements) {
    const positionPlayers = playersByPosition[req.type];
    let added = 0;
    
    for (const player of positionPlayers) {
      if (added >= req.count) break;
      
      const currentCost = squad.reduce((sum, p) => sum + (p.now_cost / 10), 0);
      const newCost = currentCost + (player.now_cost / 10);
      
      if (newCost > SQUAD_CONSTRAINTS.budget) continue;
      
      const currentTeamCount = teamCounts[player.team] || 0;
      if (currentTeamCount >= SQUAD_CONSTRAINTS.maxPerTeam) continue;
      
      squad.push(player);
      teamCounts[player.team] = currentTeamCount + 1;
      added++;
    }
  }

  return squad;
}

// Get captain recommendations
function getCaptainOptions(squad) {
  return squad
    .filter(p => p.element_type >= 3) // MID and FWD
    .sort((a, b) => {
      const aScore = a.formScore + (5 - a.fixtureAnalysis.avgFDR) + a.expectedScore * 2;
      const bScore = b.formScore + (5 - b.fixtureAnalysis.avgFDR) + b.expectedScore * 2;
      return bScore - aScore;
    })
    .slice(0, 3)
    .map(p => ({
      name: p.web_name,
      team: p.teamInfo.short_name,
      price: `£${(p.now_cost / 10).toFixed(1)}m`,
      form: p.formScore,
      nextFixture: p.fixtureAnalysis.fixtures[0]?.opponent || 'TBC',
      avgFDR: p.fixtureAnalysis.avgFDR,
      reasoning: getCaptainReasoning(p)
    }));
}

function getCaptainReasoning(player) {
  const reasons = [];
  
  if (player.formScore >= 6) reasons.push(`Excellent form (${player.formScore})`);
  if (player.fixtureAnalysis.avgFDR <= 2.5) reasons.push('Great fixtures');
  if (player.expectedScore >= 1) reasons.push('High expected returns');
  if (player.fixtureAnalysis.easyRun >= 3) reasons.push(`${player.fixtureAnalysis.easyRun} game easy run`);
  
  return reasons.join(', ') || 'Consistent performer';
}

// Format squad display
function formatSquad(squad) {
  const positions = {
    1: 'Goalkeepers',
    2: 'Defenders', 
    3: 'Midfielders',
    4: 'Forwards'
  };

  let output = '';
  
  Object.keys(positions).forEach(posType => {
    const posPlayers = squad.filter(p => p.element_type == posType);
    output += `\n📍 ${positions[posType]}:\n`;
    
    posPlayers.forEach(player => {
      const fixtures = player.fixtureAnalysis.fixtures.slice(0, 3)
        .map(f => `${f.opponent}(${f.difficulty})`)
        .join(', ');
      
      output += `  • ${player.web_name} (${player.teamInfo.short_name}) - £${(player.now_cost/10).toFixed(1)}m\n`;
      output += `    Points: ${player.total_points} | Form: ${player.formScore} | Score: ${player.overallScore}\n`;
      output += `    Next 3: ${fixtures || 'No fixtures'} | Avg FDR: ${player.fixtureAnalysis.avgFDR}\n`;
    });
  });
  
  return output;
}

// Main analysis function
async function analyzeOptimalSquad() {
  console.log('🔍 Fetching FPL data...');
  
  try {
    const [bootstrap, fixtures] = await Promise.all([
      fetchFPLData('bootstrap-static/'),
      fetchFPLData('fixtures/')
    ]);

    const players = bootstrap.elements;
    const teams = bootstrap.teams;
    const currentGW = bootstrap.events.find(event => event.is_current)?.id || 1;

    console.log(`📊 Analyzing ${players.length} players for GW${currentGW}+8...`);

    // Analyze fixtures for next 8 gameweeks
    const teamFixtures = analyzeFixtures(fixtures, teams, currentGW);
    
    // Calculate comprehensive player analysis
    const playerAnalysis = players.map(player => {
      const team = teams.find(t => t.id === player.team);
      const fixtures = teamFixtures[player.team] || { avgFDR: 3, fixtures: [], easyRun: 0, hardRun: 0 };
      
      return {
        ...player,
        teamInfo: team,
        fixtureAnalysis: fixtures,
        overallScore: calculatePlayerScore(player, team, fixtures),
        pricePerPoint: player.total_points > 0 ? (player.now_cost / 10) / player.total_points : 999,
        formScore: parseFloat(player.form || '0'),
        expectedScore: parseFloat(player.expected_goals || '0') + parseFloat(player.expected_assists || '0'),
        availabilityRisk: getAvailabilityRisk(player)
      };
    });

    // Filter available players
    const availablePlayers = playerAnalysis.filter(player => 
      player.status !== 'u' && 
      player.availabilityRisk < 3 && 
      player.total_points >= 0
    );

    console.log(`✅ ${availablePlayers.length} available players after filtering`);

    // Optimize squad
    const optimalSquad = optimizeSquad(availablePlayers);
    
    // Calculate squad statistics
    const totalCost = optimalSquad.reduce((sum, p) => sum + (p.now_cost / 10), 0);
    const totalPoints = optimalSquad.reduce((sum, p) => sum + p.total_points, 0);
    const avgForm = optimalSquad.reduce((sum, p) => sum + p.formScore, 0) / optimalSquad.length;
    const avgFDR = optimalSquad.reduce((sum, p) => sum + p.fixtureAnalysis.avgFDR, 0) / optimalSquad.length;

    // Get captain options
    const captains = getCaptainOptions(optimalSquad);

    // Display analysis
    console.log('\n🏆 OPTIMAL FPL SQUAD ANALYSIS');
    console.log('=====================================');
    console.log(`💰 Total Cost: £${totalCost.toFixed(1)}m / £${SQUAD_CONSTRAINTS.budget}m`);
    console.log(`📈 Total Points: ${totalPoints}`);
    console.log(`🔥 Average Form: ${avgForm.toFixed(1)}`);
    console.log(`🎯 Average FDR (next 8): ${avgFDR.toFixed(1)}`);
    console.log(`📅 Analysis Period: GW${currentGW} - GW${currentGW + 7}`);

    console.log(formatSquad(optimalSquad));

    console.log('\n👑 TOP CAPTAIN OPTIONS:');
    console.log('============================');
    captains.forEach((cap, i) => {
      console.log(`${i + 1}. ${cap.name} (${cap.team}) - ${cap.price}`);
      console.log(`   Form: ${cap.form} | Next: vs ${cap.nextFixture} | FDR: ${cap.avgFDR}`);
      console.log(`   Reasoning: ${cap.reasoning}\n`);
    });

    // Team distribution
    console.log('\n🏟️ TEAM DISTRIBUTION:');
    console.log('=======================');
    const teamDist = {};
    optimalSquad.forEach(p => {
      teamDist[p.teamInfo.short_name] = (teamDist[p.teamInfo.short_name] || 0) + 1;
    });
    
    Object.entries(teamDist)
      .sort(([,a], [,b]) => b - a)
      .forEach(([team, count]) => {
        console.log(`${team}: ${count} players`);
      });

    // Best fixtures analysis
    console.log('\n🎮 FIXTURE ANALYSIS (Next 8 GWs):');
    console.log('====================================');
    
    const bestFixtures = optimalSquad.filter(p => p.fixtureAnalysis.avgFDR <= 2.5).length;
    const neutralFixtures = optimalSquad.filter(p => p.fixtureAnalysis.avgFDR > 2.5 && p.fixtureAnalysis.avgFDR < 4).length;
    const toughFixtures = optimalSquad.filter(p => p.fixtureAnalysis.avgFDR >= 4).length;
    
    console.log(`✅ Good fixtures (FDR ≤ 2.5): ${bestFixtures} players`);
    console.log(`⚠️  Neutral fixtures (2.5 < FDR < 4): ${neutralFixtures} players`);
    console.log(`❌ Tough fixtures (FDR ≥ 4): ${toughFixtures} players`);

    // Easy runs
    const easyRuns = optimalSquad.filter(p => p.fixtureAnalysis.easyRun >= 3);
    if (easyRuns.length > 0) {
      console.log('\n🚀 PLAYERS WITH EASY RUNS (3+ consecutive easy fixtures):');
      easyRuns.forEach(p => {
        console.log(`• ${p.web_name} (${p.teamInfo.short_name}): ${p.fixtureAnalysis.easyRun} game easy run`);
      });
    }

    console.log('\n📋 KEY RECOMMENDATIONS:');
    console.log('========================');
    
    if (avgFDR <= 2.8) {
      console.log('✅ Squad has excellent fixture difficulty overall');
    } else if (avgFDR >= 3.5) {
      console.log('⚠️  Squad faces tough fixtures - consider rotating');
    }
    
    if (avgForm >= 5) {
      console.log('✅ Squad is in excellent form');
    } else if (avgForm <= 3) {
      console.log('⚠️  Squad form is concerning - monitor closely');
    }
    
    if (totalCost <= 95) {
      console.log(`💰 Good budget management - £${(100 - totalCost).toFixed(1)}m remaining for upgrades`);
    }

    console.log('\n🎯 Generated:', new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' }));
    
  } catch (error) {
    console.error('❌ Error analyzing squad:', error.message);
  }
}

// Run the analysis
analyzeOptimalSquad();
