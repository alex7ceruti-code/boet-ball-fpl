#!/usr/bin/env node

const https = require('https');

// FPL API endpoints
const FPL_BASE_URL = 'https://fantasy.premierleague.com/api/';

// Enhanced analysis with South African flair
console.log('🇿🇦 BOET BALL - FPL SQUAD OPTIMIZER');
console.log('====================================');

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

function calculatePlayerScore(player, team, teamFixtures) {
  let score = 0;
  
  // Base points (35% weight) - what they've actually delivered
  score += (player.total_points || 0) * 0.35;
  
  // Form (25% weight) - recent performance trend
  const form = parseFloat(player.form || '0');
  score += form * 5;
  
  // Expected stats (20% weight) - underlying performance
  const xG = parseFloat(player.expected_goals || '0');
  const xA = parseFloat(player.expected_assists || '0');
  score += (xG * 4 + xA * 3) * 2;
  
  // Fixture difficulty (15% weight) - upcoming schedule strength
  const fixtureFactor = Math.max(0, 5 - teamFixtures.avgFDR) * 3;
  score += fixtureFactor;
  
  // Value efficiency (3% weight) - points per price
  const pointsPerMillion = player.total_points > 0 ? player.total_points / (player.now_cost / 10) : 0;
  score += Math.min(20, pointsPerMillion) * 0.3;
  
  // Minutes reliability (2% weight) - playing time assurance
  const reliability = Math.min(1, (player.minutes || 0) / 180) * 4;
  score += reliability;
  
  // Position-specific bonuses
  if (player.element_type === 1) { // GKP
    // Clean sheet potential based on defense + fixtures
    const cleanSheetBonus = Math.max(0, 5 - teamFixtures.avgFDR) * 2;
    score += cleanSheetBonus;
  } else if (player.element_type === 2) { // DEF
    // Clean sheet + attacking potential
    const cleanSheetBonus = Math.max(0, 5 - teamFixtures.avgFDR) * 1.5;
    const attackingBonus = (xG + xA) * 8; // Defenders with attacking returns
    score += cleanSheetBonus + attackingBonus;
  } else if (player.element_type === 3) { // MID
    // All-round contribution
    const creativityIndex = parseFloat(player.creativity || '0') / 10;
    score += creativityIndex;
  } else if (player.element_type === 4) { // FWD
    // Goal-scoring emphasis
    score += (xG * 3) + (parseFloat(player.threat || '0') / 10);
  }
  
  return Math.round(score * 10) / 10;
}

function getAvailabilityRisk(player) {
  if (player.status === 'u') return 5;
  if (player.chance_of_playing_this_round === 0) return 4;
  if (player.chance_of_playing_this_round === 25) return 3;
  if (player.chance_of_playing_this_round === 50) return 2;
  if (player.chance_of_playing_this_round === 75) return 1;
  if (player.news && player.news.trim()) return 1;
  return 0;
}

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

    // Calculate easy/hard runs
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

function optimizeSquad(players) {
  const squad = [];
  const teamCounts = {};

  // Advanced optimization: Try different strategies
  const strategies = [
    'balanced', // Balanced across all metrics
    'form_heavy', // Prioritize current form
    'value_focused', // Focus on points per price
    'fixture_optimized' // Prioritize upcoming fixtures
  ];

  let bestSquad = null;
  let bestScore = 0;

  for (const strategy of strategies) {
    const testSquad = buildSquadByStrategy(players, strategy);
    const squadScore = calculateSquadScore(testSquad);
    
    if (squadScore > bestScore) {
      bestScore = squadScore;
      bestSquad = testSquad;
    }
  }

  return bestSquad || buildSquadByStrategy(players, 'balanced');
}

function buildSquadByStrategy(players, strategy) {
  const squad = [];
  const teamCounts = {};

  // Sort players by strategy-specific criteria
  let sortFunction;
  switch (strategy) {
    case 'form_heavy':
      sortFunction = (a, b) => b.formScore - a.formScore || b.overallScore - a.overallScore;
      break;
    case 'value_focused':
      sortFunction = (a, b) => (b.total_points / (b.now_cost / 10)) - (a.total_points / (a.now_cost / 10));
      break;
    case 'fixture_optimized':
      sortFunction = (a, b) => (a.fixtureAnalysis.avgFDR - b.fixtureAnalysis.avgFDR) || b.overallScore - a.overallScore;
      break;
    default: // balanced
      sortFunction = (a, b) => b.overallScore - a.overallScore;
  }

  const playersByPosition = {
    1: players.filter(p => p.element_type === 1).sort(sortFunction),
    2: players.filter(p => p.element_type === 2).sort(sortFunction),
    3: players.filter(p => p.element_type === 3).sort(sortFunction),
    4: players.filter(p => p.element_type === 4).sort(sortFunction)
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
      
      if (newCost > 100) continue;
      
      const currentTeamCount = teamCounts[player.team] || 0;
      if (currentTeamCount >= 3) continue;
      
      squad.push(player);
      teamCounts[player.team] = currentTeamCount + 1;
      added++;
    }
  }

  return squad;
}

function calculateSquadScore(squad) {
  return squad.reduce((sum, p) => sum + p.overallScore, 0);
}

function generateGameweekAnalysis(squad, currentGW) {
  const analysis = {};
  
  // Analyze each of the next 8 gameweeks
  for (let gw = currentGW; gw < currentGW + 8; gw++) {
    const gwPlayers = squad.map(player => {
      const fixture = player.fixtureAnalysis.fixtures.find(f => f.gameweek === gw);
      return {
        name: player.web_name,
        team: player.teamInfo.short_name,
        opponent: fixture?.opponent || 'No fixture',
        difficulty: fixture?.difficulty || 0,
        isHome: fixture?.isHome,
        expectedPoints: fixture ? calculateExpectedGameweekPoints(player, fixture) : 0,
        position: ['', 'GKP', 'DEF', 'MID', 'FWD'][player.element_type]
      };
    });

    const totalExpected = gwPlayers.reduce((sum, p) => sum + p.expectedPoints, 0);
    const avgDifficulty = gwPlayers.reduce((sum, p) => sum + p.difficulty, 0) / gwPlayers.length;

    analysis[gw] = {
      gameweek: gw,
      totalExpected: Math.round(totalExpected),
      averageDifficulty: Math.round(avgDifficulty * 10) / 10,
      bestFixtures: gwPlayers.filter(p => p.difficulty <= 2),
      worstFixtures: gwPlayers.filter(p => p.difficulty >= 4),
      players: gwPlayers.sort((a, b) => b.expectedPoints - a.expectedPoints)
    };
  }

  return analysis;
}

function calculateExpectedGameweekPoints(player, fixture) {
  let expected = 2; // Base points for playing
  
  // Adjust for fixture difficulty
  const difficultyMultiplier = Math.max(0.6, (5 - fixture.difficulty) / 2);
  
  // Add expected goals/assists
  const xG = parseFloat(player.expected_goals || '0');
  const xA = parseFloat(player.expected_assists || '0');
  expected += (xG * 0.5 + xA * 0.3) * difficultyMultiplier;
  
  // Home advantage
  if (fixture.isHome) expected += 0.3;
  
  // Position-specific points
  if (player.element_type <= 2 && fixture.difficulty <= 2) {
    expected += (player.element_type === 1 ? 4 : 4) * 0.4; // Clean sheet chance
  }
  
  // Form influence
  const form = parseFloat(player.form || '0');
  expected += Math.max(0, (form - 5) * 0.2);

  return Math.round(expected * 10) / 10;
}

function getTransferSuggestions(squad, allPlayers) {
  const suggestions = [];
  const squadIds = new Set(squad.map(p => p.id));
  
  // Find underperforming players
  const weakestPlayers = squad
    .sort((a, b) => a.overallScore - b.overallScore)
    .slice(0, 3);

  weakestPlayers.forEach(player => {
    const alternatives = allPlayers
      .filter(p => 
        p.element_type === player.element_type && 
        !squadIds.has(p.id) &&
        p.now_cost <= player.now_cost + 5 && // Within 0.5m
        p.overallScore > player.overallScore
      )
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, 2);

    alternatives.forEach(alt => {
      suggestions.push({
        out: player.web_name,
        outTeam: player.teamInfo.short_name,
        outPrice: (player.now_cost / 10).toFixed(1),
        outReason: getWeaknessReason(player),
        in: alt.web_name,
        inTeam: alt.teamInfo.short_name,
        inPrice: (alt.now_cost / 10).toFixed(1),
        inReason: getStrengthReason(alt),
        costDiff: ((alt.now_cost - player.now_cost) / 10).toFixed(1),
        priority: Math.round(alt.overallScore - player.overallScore)
      });
    });
  });

  return suggestions.sort((a, b) => b.priority - a.priority).slice(0, 5);
}

function getWeaknessReason(player) {
  const reasons = [];
  if (player.formScore < 3) reasons.push('poor form');
  if (player.fixtureAnalysis.avgFDR >= 4) reasons.push('tough fixtures');
  if (player.availabilityRisk >= 2) reasons.push('injury risk');
  if (player.total_points < 10) reasons.push('low points');
  return reasons.join(', ') || 'underperforming';
}

function getStrengthReason(player) {
  const reasons = [];
  if (player.formScore >= 7) reasons.push('excellent form');
  if (player.fixtureAnalysis.avgFDR <= 2.5) reasons.push('great fixtures');
  if (player.fixtureAnalysis.easyRun >= 3) reasons.push('easy run');
  if (player.pricePerPoint < 0.8) reasons.push('great value');
  return reasons.join(', ') || 'strong option';
}

// Generate differential picks
function findDifferentials(players, maxOwnership = 5) {
  const differentials = players
    .filter(p => parseFloat(p.selected_by_percent) <= maxOwnership)
    .filter(p => p.total_points >= 8) // Must have some returns
    .sort((a, b) => b.overallScore - a.overallScore)
    .slice(0, 10);

  return differentials.map(p => ({
    name: p.web_name,
    team: p.teamInfo.short_name,
    position: ['', 'GKP', 'DEF', 'MID', 'FWD'][p.element_type],
    price: `£${(p.now_cost / 10).toFixed(1)}m`,
    points: p.total_points,
    ownership: `${p.selected_by_percent}%`,
    form: p.formScore,
    avgFDR: p.fixtureAnalysis.avgFDR,
    score: p.overallScore
  }));
}

async function runCompleteAnalysis() {
  console.log('🔄 Fetching live FPL data...');
  
  try {
    const [bootstrap, fixtures] = await Promise.all([
      fetchFPLData('bootstrap-static/'),
      fetchFPLData('fixtures/')
    ]);

    const players = bootstrap.elements;
    const teams = bootstrap.teams;
    const currentGW = bootstrap.events.find(event => event.is_current)?.id || 1;
    const nextGW = bootstrap.events.find(event => event.is_next)?.id || currentGW + 1;

    console.log(`📅 Current: GW${currentGW} | Next: GW${nextGW}`);
    console.log(`👥 Total Players: ${players.length}`);

    // Analyze fixtures
    const teamFixtures = analyzeFixtures(fixtures, teams, currentGW);
    
    // Enhanced player analysis
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
      player.availabilityRisk <= 2 && 
      player.total_points >= 0
    );

    console.log(`✅ ${availablePlayers.length} healthy players available`);

    // Optimize squad
    const optimalSquad = optimizeSquad(availablePlayers);
    
    if (optimalSquad.length < 15) {
      console.log(`⚠️  Warning: Only ${optimalSquad.length}/15 players selected due to budget/team constraints`);
    }

    // Calculate key metrics
    const totalCost = optimalSquad.reduce((sum, p) => sum + (p.now_cost / 10), 0);
    const totalPoints = optimalSquad.reduce((sum, p) => sum + p.total_points, 0);
    const avgForm = optimalSquad.reduce((sum, p) => sum + p.formScore, 0) / optimalSquad.length;
    const avgFDR = optimalSquad.reduce((sum, p) => sum + p.fixtureAnalysis.avgFDR, 0) / optimalSquad.length;

    // Generate gameweek-by-gameweek analysis
    const gwAnalysis = generateGameweekAnalysis(optimalSquad, currentGW);

    // Main squad display
    console.log('\n🏆 OPTIMAL SQUAD (Based on Current Form + Next 8 GWs)');
    console.log('====================================================');
    console.log(`💰 Total Cost: £${totalCost.toFixed(1)}m (£${(100-totalCost).toFixed(1)}m remaining)`);
    console.log(`📊 Total Points: ${totalPoints}`);
    console.log(`🔥 Squad Form: ${avgForm.toFixed(1)}/10`);
    console.log(`🎯 Squad FDR: ${avgFDR.toFixed(1)}/5 ${avgFDR <= 3 ? '✅' : '⚠️'}`);

    // Display squad by position
    const positions = {1: 'Goalkeepers', 2: 'Defenders', 3: 'Midfielders', 4: 'Forwards'};
    
    Object.keys(positions).forEach(posType => {
      const posPlayers = optimalSquad.filter(p => p.element_type == posType);
      console.log(`\n📍 ${positions[posType]} (${posPlayers.length}):`);
      
      posPlayers.forEach((player, i) => {
        const next3 = player.fixtureAnalysis.fixtures.slice(0, 3)
          .map(f => `${f.opponent}${f.isHome ? '(H)' : '(A)'}(${f.difficulty})`)
          .join(', ');
        
        console.log(`  ${i+1}. ${player.web_name} (${player.teamInfo.short_name}) - £${(player.now_cost/10).toFixed(1)}m`);
        console.log(`     📈 ${player.total_points} pts | Form: ${player.formScore} | Score: ${player.overallScore}`);
        console.log(`     🗓️  Next 3: ${next3 || 'No fixtures'}`);
        console.log(`     🎯 8GW FDR: ${player.fixtureAnalysis.avgFDR} ${getFixtureEmoji(player.fixtureAnalysis.avgFDR)}`);
        
        if (player.availabilityRisk > 0) {
          console.log(`     ⚠️  Risk: ${getRiskDescription(player.availabilityRisk)}`);
        }
        if (player.fixtureAnalysis.easyRun >= 3) {
          console.log(`     🚀 Easy run: ${player.fixtureAnalysis.easyRun} games`);
        }
        console.log('');
      });
    });

    // Captain analysis
    console.log('\n👑 CAPTAIN RECOMMENDATIONS:');
    console.log('=============================');
    
    const captains = optimalSquad
      .filter(p => p.element_type >= 3 && p.formScore >= 5) // Form threshold for captains
      .sort((a, b) => {
        const aScore = a.formScore + a.expectedScore * 3 + (5 - a.fixtureAnalysis.avgFDR);
        const bScore = b.formScore + b.expectedScore * 3 + (5 - b.fixtureAnalysis.avgFDR);
        return bScore - aScore;
      })
      .slice(0, 5);

    captains.forEach((cap, i) => {
      const nextFixture = cap.fixtureAnalysis.fixtures[0];
      console.log(`${i + 1}. ${cap.web_name} (${cap.teamInfo.short_name}) - £${(cap.now_cost/10).toFixed(1)}m`);
      console.log(`   Next: ${nextFixture ? `vs ${nextFixture.opponent} ${nextFixture.isHome ? '(H)' : '(A)'} [${nextFixture.difficulty}]` : 'No fixture'}`);
      console.log(`   Form: ${cap.formScore}/10 | xG+xA: ${cap.expectedScore.toFixed(2)}`);
      console.log('');
    });

    // Team with best fixtures
    console.log('\n🌟 TEAMS WITH BEST FIXTURES (Next 8 GWs):');
    console.log('==========================================');
    
    const teamFixtureRanking = Object.values(teamFixtures)
      .map(tf => {
        const team = teams.find(t => t.id === Object.keys(teamFixtures).find(k => teamFixtures[k] === tf));
        return {
          name: team?.short_name || 'Unknown',
          avgFDR: tf.avgFDR,
          easyRun: tf.easyRun,
          hardRun: tf.hardRun,
          fixtures: tf.fixtures.slice(0, 4).map(f => `${f.opponent}(${f.difficulty})`).join(', ')
        };
      })
      .sort((a, b) => a.avgFDR - b.avgFDR)
      .slice(0, 8);

    teamFixtureRanking.forEach((team, i) => {
      const easyRunText = team.easyRun >= 3 ? ` 🚀${team.easyRun} easy` : '';
      const hardRunText = team.hardRun >= 3 ? ` ❌${team.hardRun} hard` : '';
      console.log(`${i+1}. ${team.name}: ${team.avgFDR} FDR ${getFixtureEmoji(team.avgFDR)}${easyRunText}${hardRunText}`);
    });

    // Differential picks
    console.log('\n🎯 TOP DIFFERENTIAL PICKS (≤5% owned):');
    console.log('======================================');
    
    const differentials = findDifferentials(availablePlayers, 5).slice(0, 6);
    differentials.forEach((diff, i) => {
      console.log(`${i+1}. ${diff.name} (${diff.team}) ${diff.position} - ${diff.price}`);
      console.log(`   Owned: ${diff.ownership} | Points: ${diff.points} | Form: ${diff.form} | FDR: ${diff.avgFDR}`);
    });

    // Transfer suggestions
    console.log('\n🔄 POTENTIAL TRANSFER TARGETS:');
    console.log('==============================');
    
    const transfers = getTransferSuggestions(optimalSquad, availablePlayers);
    transfers.forEach((transfer, i) => {
      console.log(`${i+1}. ${transfer.out} (${transfer.outTeam}) ➡️  ${transfer.in} (${transfer.inTeam})`);
      console.log(`   Cost: £${transfer.outPrice}m ➡️  £${transfer.inPrice}m (${transfer.costDiff >= 0 ? '+' : ''}£${transfer.costDiff}m)`);
      console.log(`   Why: ${transfer.outReason} ➡️  ${transfer.inReason}`);
      console.log('');
    });

    // Gameweek breakdown
    console.log('\n📅 GAMEWEEK-BY-GAMEWEEK BREAKDOWN:');
    console.log('==================================');
    
    Object.values(gwAnalysis).forEach(gw => {
      console.log(`\n📍 Gameweek ${gw.gameweek}:`);
      console.log(`Expected Points: ${gw.totalExpected} | Avg Difficulty: ${gw.averageDifficulty}`);
      console.log(`Best fixtures: ${gw.bestFixtures.length} | Worst fixtures: ${gw.worstFixtures.length}`);
      
      if (gw.bestFixtures.length > 0) {
        console.log(`✅ Easy: ${gw.bestFixtures.slice(0, 3).map(p => `${p.name} vs ${p.opponent}`).join(', ')}`);
      }
      if (gw.worstFixtures.length > 0) {
        console.log(`❌ Tough: ${gw.worstFixtures.slice(0, 2).map(p => `${p.name} vs ${p.opponent}`).join(', ')}`);
      }
    });

    // Key insights
    console.log('\n🧠 BOET BALL INSIGHTS:');
    console.log('======================');
    
    const insights = [];
    
    if (avgForm >= 8) {
      insights.push('🔥 Your squad is absolutely firing right now, boet!');
    } else if (avgForm <= 4) {
      insights.push('😬 Squad form is concerning - time for some changes, my bru!');
    }
    
    const topFormPlayers = optimalSquad.filter(p => p.formScore >= 8);
    if (topFormPlayers.length >= 3) {
      insights.push(`⚡ ${topFormPlayers.length} players in red-hot form - capitalize on this!`);
    }
    
    const easyFixturePlayers = optimalSquad.filter(p => p.fixtureAnalysis.avgFDR <= 2.5);
    if (easyFixturePlayers.length >= 5) {
      insights.push(`🎯 ${easyFixturePlayers.length} players with lekker fixtures coming up!`);
    }
    
    const budgetRemaining = 100 - totalCost;
    if (budgetRemaining >= 2) {
      insights.push(`💰 £${budgetRemaining.toFixed(1)}m in the bank - perfect for upgrades!`);
    }
    
    // Team concentration insights
    const teamDist = {};
    optimalSquad.forEach(p => {
      teamDist[p.teamInfo.short_name] = (teamDist[p.teamInfo.short_name] || 0) + 1;
    });
    const maxTeamPlayers = Math.max(...Object.values(teamDist));
    const teamWithMost = Object.entries(teamDist).find(([team, count]) => count === maxTeamPlayers)?.[0];
    
    if (maxTeamPlayers === 3) {
      insights.push(`⚠️  Maxed out on ${teamWithMost} players - watch their fixture swings!`);
    }

    insights.forEach(insight => console.log(`• ${insight}`));

    console.log('\n🎯 Analysis completed at:', new Date().toLocaleString('en-ZA', { 
      timeZone: 'Africa/Johannesburg',
      weekday: 'long',
      day: 'numeric', 
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    }));
    
    console.log('\n🚀 BRAAI TIP: This squad balances current form with upcoming fixtures. Monitor player news and be ready to pivot based on team rotations!');
    
  } catch (error) {
    console.error('❌ Eish! Error analyzing squad:', error.message);
  }
}

function getFixtureEmoji(fdr) {
  if (fdr <= 2) return '🟢';
  if (fdr <= 3) return '🟡';
  if (fdr <= 4) return '🟠';
  return '🔴';
}

function getRiskDescription(risk) {
  const descriptions = {
    1: 'Minor concern',
    2: 'Moderate risk', 
    3: 'High risk',
    4: 'Very risky',
    5: 'Unavailable'
  };
  return descriptions[risk] || 'Unknown';
}

// Run the complete analysis
runCompleteAnalysis();
