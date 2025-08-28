import { NextRequest, NextResponse } from 'next/server';

// FPL squad constraints
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

interface Player {
  id: number;
  web_name: string;
  first_name: string;
  second_name: string;
  element_type: number;
  team: number;
  now_cost: number;
  total_points: number;
  form: string;
  selected_by_percent: string;
  expected_goals: string;
  expected_assists: string;
  expected_goals_per_90: number;
  expected_assists_per_90: number;
  ict_index: string;
  minutes: number;
  bonus: number;
  value_season: string;
  status: string;
  news: string;
  chance_of_playing_this_round: number | null;
  chance_of_playing_next_round: number | null;
}

interface Team {
  id: number;
  name: string;
  short_name: string;
  strength_attack_home: number;
  strength_attack_away: number;
  strength_defence_home: number;
  strength_defence_away: number;
}

interface Fixture {
  id: number;
  event: number;
  team_h: number;
  team_a: number;
  team_h_difficulty: number;
  team_a_difficulty: number;
  finished: boolean;
  kickoff_time: string;
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Starting optimal squad analysis...');

    // Fetch FPL data
    const [bootstrapResponse, fixturesResponse] = await Promise.all([
      fetch('https://fantasy.premierleague.com/api/bootstrap-static/'),
      fetch('https://fantasy.premierleague.com/api/fixtures/')
    ]);

    if (!bootstrapResponse.ok || !fixturesResponse.ok) {
      throw new Error('Failed to fetch FPL data');
    }

    const bootstrap = await bootstrapResponse.json();
    const fixtures: Fixture[] = await fixturesResponse.json();

    const players: Player[] = bootstrap.elements;
    const teams: Team[] = bootstrap.teams;
    const currentGW = bootstrap.events.find((event: any) => event.is_current)?.id || 1;

    console.log(`📊 Analyzing ${players.length} players for optimal squad...`);
    console.log(`🎯 Current Gameweek: ${currentGW}`);

    // Get next 8 gameweeks fixture difficulty for each team
    const next8GWFixtures = getNext8GameweeksFixtures(fixtures, teams, currentGW);
    
    // Calculate comprehensive player scores
    const playerAnalysis = players.map(player => {
      const team = teams.find(t => t.id === player.team)!;
      const teamFixtures = next8GWFixtures[player.team] || { avgFDR: 3, fixtures: [] };
      
      return {
        ...player,
        teamInfo: team,
        fixtureAnalysis: teamFixtures,
        overallScore: calculatePlayerScore(player, team, teamFixtures),
        pricePerPoint: player.total_points > 0 ? (player.now_cost / 10) / player.total_points : 999,
        formScore: parseFloat(player.form || '0'),
        expectedScore: parseFloat(player.expected_goals || '0') + parseFloat(player.expected_assists || '0'),
        availabilityRisk: getAvailabilityRisk(player)
      };
    });

    // Filter out unavailable players and those with high injury risk
    const availablePlayers = playerAnalysis.filter(player => 
      player.status !== 'u' && 
      player.availabilityRisk < 3 && 
      player.total_points >= 0
    );

    console.log(`✅ ${availablePlayers.length} available players after filtering`);

    // Optimize squad using advanced algorithm
    const optimalSquad = optimizeSquad(availablePlayers);
    
    // Generate alternatives and captain recommendations
    const alternatives = generateAlternatives(availablePlayers, optimalSquad);
    const captainOptions = getCaptainOptions(optimalSquad, next8GWFixtures);
    
    // Create detailed analysis report
    const analysis = {
      squad: optimalSquad,
      totalCost: optimalSquad.reduce((sum, p) => sum + (p.now_cost / 10), 0),
      totalPoints: optimalSquad.reduce((sum, p) => sum + p.total_points, 0),
      averageForm: optimalSquad.reduce((sum, p) => sum + p.formScore, 0) / optimalSquad.length,
      fixtureStrength: calculateSquadFixtureStrength(optimalSquad, next8GWFixtures),
      captainOptions,
      alternatives,
      next8GWAnalysis: analyzeNext8Gameweeks(optimalSquad, next8GWFixtures),
      transferSuggestions: generateTransferSuggestions(optimalSquad, availablePlayers),
      riskAssessment: assessSquadRisk(optimalSquad)
    };

    return NextResponse.json({
      success: true,
      data: analysis,
      metadata: {
        currentGameweek: currentGW,
        playersAnalyzed: availablePlayers.length,
        generatedAt: new Date().toISOString(),
        budget: SQUAD_CONSTRAINTS.budget,
        targetGameweeks: `${currentGW} - ${currentGW + 7}`
      }
    });

  } catch (error) {
    console.error('❌ Squad optimization error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to optimize squad',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function getNext8GameweeksFixtures(fixtures: Fixture[], teams: Team[], currentGW: number) {
  const teamFixtures: { [teamId: number]: { avgFDR: number, fixtures: any[], easyRun: number, hardRun: number } } = {};
  
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
        difficulty: f.team_h === team.id ? f.team_h_difficulty : f.team_a_difficulty,
        kickoff: f.kickoff_time
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

function calculatePlayerScore(player: Player, team: Team, fixtures: any): number {
  let score = 0;
  
  // Base points (40% weight)
  score += (player.total_points || 0) * 0.4;
  
  // Form (20% weight) 
  const form = parseFloat(player.form || '0');
  score += form * 4; // Scale form to match points weight
  
  // Expected stats (25% weight)
  const xG = parseFloat(player.expected_goals || '0');
  const xA = parseFloat(player.expected_assists || '0');
  score += (xG * 4 + xA * 3) * 2.5; // FPL scoring weights
  
  // Fixture difficulty (10% weight) - lower FDR = better
  const fixtureFactor = Math.max(0, 5 - fixtures.avgFDR) * 2;
  score += fixtureFactor;
  
  // Value efficiency (3% weight)
  const pointsPerMillion = player.total_points > 0 ? player.total_points / (player.now_cost / 10) : 0;
  score += pointsPerMillion * 0.5;
  
  // Minutes played reliability (2% weight)
  const reliability = Math.min(1, (player.minutes || 0) / 180) * 5;
  score += reliability;
  
  // Position-specific bonuses
  if (player.element_type === 1) { // GKP
    score += Math.max(0, 5 - fixtures.avgFDR) * 1.5; // Clean sheet potential
  } else if (player.element_type === 2) { // DEF
    score += Math.max(0, 5 - fixtures.avgFDR) * 1.2; // Clean sheet potential
  } else if (player.element_type === 4) { // FWD
    score += (xG * 2); // Extra goal potential
  }
  
  return Math.round(score * 10) / 10;
}

function getAvailabilityRisk(player: Player): number {
  if (player.status === 'u') return 5;
  if (player.chance_of_playing_this_round === 0) return 4;
  if (player.chance_of_playing_this_round === 25) return 3;
  if (player.chance_of_playing_this_round === 50) return 2;
  if (player.chance_of_playing_this_round === 75) return 1;
  if (player.news && player.news.trim()) return 1;
  return 0;
}

function optimizeSquad(players: any[]): any[] {
  const positions = ['GKP', 'DEF', 'MID', 'FWD'];
  const squad: any[] = [];
  const teamCounts: { [teamId: number]: number } = {};

  // Sort players by overall score within each position
  const playersByPosition = {
    1: players.filter(p => p.element_type === 1).sort((a, b) => b.overallScore - a.overallScore),
    2: players.filter(p => p.element_type === 2).sort((a, b) => b.overallScore - a.overallScore),
    3: players.filter(p => p.element_type === 3).sort((a, b) => b.overallScore - a.overallScore),
    4: players.filter(p => p.element_type === 4).sort((a, b) => b.overallScore - a.overallScore)
  };

  // Fill each position optimally
  const positionRequirements = [
    { type: 1, count: 2 }, // 2 GKP
    { type: 2, count: 5 }, // 5 DEF  
    { type: 3, count: 5 }, // 5 MID
    { type: 4, count: 3 }  // 3 FWD
  ];

  for (const req of positionRequirements) {
    const positionPlayers = playersByPosition[req.type as keyof typeof playersByPosition];
    let added = 0;
    
    for (const player of positionPlayers) {
      if (added >= req.count) break;
      
      const currentCost = squad.reduce((sum, p) => sum + (p.now_cost / 10), 0);
      const newCost = currentCost + (player.now_cost / 10);
      
      // Check budget constraint
      if (newCost > SQUAD_CONSTRAINTS.budget) continue;
      
      // Check team limit constraint
      const currentTeamCount = teamCounts[player.team] || 0;
      if (currentTeamCount >= SQUAD_CONSTRAINTS.maxPerTeam) continue;
      
      // Add player to squad
      squad.push(player);
      teamCounts[player.team] = currentTeamCount + 1;
      added++;
    }
  }

  return squad;
}

function generateAlternatives(allPlayers: any[], currentSquad: any[]) {
  const alternatives: { [position: string]: any[] } = {
    GKP: [],
    DEF: [],
    MID: [], 
    FWD: []
  };

  const positionMap = { 1: 'GKP', 2: 'DEF', 3: 'MID', 4: 'FWD' };
  const squadIds = new Set(currentSquad.map(p => p.id));

  Object.keys(positionMap).forEach(posType => {
    const position = positionMap[posType as keyof typeof positionMap];
    const altPlayers = allPlayers
      .filter(p => p.element_type === parseInt(posType) && !squadIds.has(p.id))
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, 5);
    
    alternatives[position] = altPlayers.map(p => ({
      name: p.web_name,
      team: p.teamInfo.short_name,
      price: p.now_cost / 10,
      points: p.total_points,
      form: p.formScore,
      score: p.overallScore,
      fixtures: p.fixtureAnalysis.avgFDR
    }));
  });

  return alternatives;
}

function getCaptainOptions(squad: any[], fixtureAnalysis: any) {
  return squad
    .filter(p => p.element_type >= 3) // MID and FWD only typically
    .sort((a, b) => {
      // Weight form, fixtures, and expected returns
      const aScore = a.formScore + (5 - a.fixtureAnalysis.avgFDR) + a.expectedScore * 2;
      const bScore = b.formScore + (5 - b.fixtureAnalysis.avgFDR) + b.expectedScore * 2;
      return bScore - aScore;
    })
    .slice(0, 5)
    .map(p => ({
      name: p.web_name,
      team: p.teamInfo.short_name,
      form: p.formScore,
      nextFixture: p.fixtureAnalysis.fixtures[0]?.opponent || 'TBC',
      expectedPoints: Math.round(p.expectedScore * 10) / 10,
      reasoning: getCaptainReasoning(p)
    }));
}

function getCaptainReasoning(player: any): string {
  const reasons = [];
  
  if (player.formScore >= 6) reasons.push(`Excellent form (${player.formScore})`);
  if (player.fixtureAnalysis.avgFDR <= 2.5) reasons.push('Great fixtures ahead');
  if (player.expectedScore >= 1) reasons.push('High expected returns');
  if (player.fixtureAnalysis.easyRun >= 3) reasons.push(`${player.fixtureAnalysis.easyRun} game easy run`);
  
  return reasons.join(', ') || 'Consistent performer';
}

function analyzeNext8Gameweeks(squad: any[], fixtureAnalysis: any) {
  const analysis: { [gw: number]: any } = {};
  
  // Get all unique gameweeks from squad fixtures
  const allGameweeks = new Set<number>();
  squad.forEach(player => {
    player.fixtureAnalysis.fixtures.forEach((f: any) => {
      allGameweeks.add(f.gameweek);
    });
  });

  Array.from(allGameweeks).sort().forEach(gw => {
    const gwPlayers = squad.map(player => {
      const fixture = player.fixtureAnalysis.fixtures.find((f: any) => f.gameweek === gw);
      return {
        name: player.web_name,
        team: player.teamInfo.short_name,
        opponent: fixture?.opponent || 'No fixture',
        difficulty: fixture?.difficulty || 0,
        isHome: fixture?.isHome,
        expectedPoints: fixture ? calculateExpectedGameweekPoints(player, fixture) : 0
      };
    });

    analysis[gw] = {
      totalExpected: Math.round(gwPlayers.reduce((sum, p) => sum + p.expectedPoints, 0)),
      averageDifficulty: Math.round(gwPlayers.reduce((sum, p) => sum + p.difficulty, 0) / gwPlayers.length * 10) / 10,
      bestFixtures: gwPlayers.filter(p => p.difficulty <= 2).length,
      worstFixtures: gwPlayers.filter(p => p.difficulty >= 4).length,
      players: gwPlayers
    };
  });

  return analysis;
}

function calculateExpectedGameweekPoints(player: any, fixture: any): number {
  let expected = 2; // Base points for playing
  
  // Add expected goals/assists based on fixture difficulty
  const difficultyMultiplier = Math.max(0.5, (5 - fixture.difficulty) / 2);
  expected += (player.expectedScore || 0) * difficultyMultiplier;
  
  // Home advantage
  if (fixture.isHome) expected += 0.5;
  
  // Clean sheet probability for defenders/goalkeepers
  if (player.element_type <= 2 && fixture.difficulty <= 2) {
    expected += (player.element_type === 1 ? 4 : 4) * 0.3; // 30% clean sheet chance
  }

  return Math.round(expected * 10) / 10;
}

function generateTransferSuggestions(squad: any[], allPlayers: any[]) {
  const suggestions = [];
  const squadIds = new Set(squad.map(p => p.id));
  
  // Find underperforming squad players
  const underperformers = squad
    .filter(p => p.formScore < 3 || p.fixtureAnalysis.avgFDR >= 4)
    .sort((a, b) => a.overallScore - b.overallScore)
    .slice(0, 3);

  underperformers.forEach(player => {
    // Find better alternatives in same position
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
        out: {
          name: player.web_name,
          team: player.teamInfo.short_name,
          price: player.now_cost / 10,
          reason: getTransferOutReason(player)
        },
        in: {
          name: alt.web_name,
          team: alt.teamInfo.short_name,
          price: alt.now_cost / 10,
          reason: getTransferInReason(alt)
        },
        costDiff: (alt.now_cost - player.now_cost) / 10,
        priority: alt.overallScore - player.overallScore
      });
    });
  });

  return suggestions.sort((a, b) => b.priority - a.priority).slice(0, 5);
}

function getTransferOutReason(player: any): string {
  const reasons = [];
  if (player.formScore < 2) reasons.push('Poor form');
  if (player.fixtureAnalysis.avgFDR >= 4) reasons.push('Tough fixtures');
  if (player.fixtureAnalysis.hardRun >= 3) reasons.push('Difficult run');
  if (player.availabilityRisk >= 2) reasons.push('Injury concern');
  return reasons.join(', ') || 'Underperforming';
}

function getTransferInReason(player: any): string {
  const reasons = [];
  if (player.formScore >= 6) reasons.push('Excellent form');
  if (player.fixtureAnalysis.avgFDR <= 2.5) reasons.push('Great fixtures');
  if (player.fixtureAnalysis.easyRun >= 3) reasons.push('Easy run ahead');
  if (player.pricePerPoint < 1) reasons.push('Great value');
  return reasons.join(', ') || 'Strong option';
}

function calculateSquadFixtureStrength(squad: any[], fixtureAnalysis: any): number {
  const avgFDR = squad.reduce((sum, p) => sum + p.fixtureAnalysis.avgFDR, 0) / squad.length;
  return Math.round((5 - avgFDR) * 20); // Convert to 0-100 scale
}

function assessSquadRisk(squad: any[]) {
  const riskFactors = {
    injuryRisk: squad.filter(p => p.availabilityRisk >= 2).length,
    fixtureRisk: squad.filter(p => p.fixtureAnalysis.avgFDR >= 4).length,
    formRisk: squad.filter(p => p.formScore < 3).length,
    teamConcentration: Math.max(...Object.values(
      squad.reduce((acc: any, p) => {
        acc[p.team] = (acc[p.team] || 0) + 1;
        return acc;
      }, {})
    ))
  };

  const totalRisk = riskFactors.injuryRisk * 2 + riskFactors.fixtureRisk + riskFactors.formRisk;
  const riskLevel = totalRisk <= 3 ? 'Low' : totalRisk <= 6 ? 'Medium' : 'High';

  return {
    level: riskLevel,
    factors: riskFactors,
    recommendations: getRiskRecommendations(riskFactors)
  };
}

function getRiskRecommendations(factors: any): string[] {
  const recommendations = [];
  
  if (factors.injuryRisk >= 2) {
    recommendations.push('Consider transferring injury-prone players');
  }
  if (factors.fixtureRisk >= 4) {
    recommendations.push('Squad has many tough fixtures - plan ahead');
  }
  if (factors.formRisk >= 3) {
    recommendations.push('Multiple players in poor form - monitor closely');
  }
  if (factors.teamConcentration >= 3) {
    recommendations.push('High team concentration - spread risk');
  }

  return recommendations;
}
