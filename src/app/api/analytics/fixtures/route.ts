import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Fetch FPL fixtures and teams data
    const [fixturesResponse, teamsResponse] = await Promise.all([
      fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/api/fpl/fixtures`),
      fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/api/fpl/bootstrap-static`)
    ]);

    const fixturesData = await fixturesResponse.json();
    const bootstrapData = await teamsResponse.json();
    
    if (!fixturesData.fixtures || !bootstrapData.teams) {
      throw new Error('No fixture or team data available');
    }

    const fixtures = fixturesData.fixtures;
    const teams = bootstrapData.teams;

    // Analyze fixture difficulty and opportunities
    const fixtureAnalysis = teams.map((team: any) => {
      const teamFixtures = fixtures
        .filter((fixture: any) => 
          (fixture.team_h === team.id || fixture.team_a === team.id) &&
          !fixture.finished
        )
        .slice(0, 5); // Next 5 fixtures

      if (teamFixtures.length === 0) {
        return {
          teamId: team.id,
          teamName: team.name,
          next5FDR: 0,
          easyRunLength: 0,
          difficultPatchAhead: false,
          cleanSheetProb: 0,
          goalsExpected: 0,
          saInsight: "No fixtures available, boet!"
        };
      }

      // Calculate average FDR for next 5 fixtures
      const fdrValues = teamFixtures.map((fixture: any) => {
        return fixture.team_h === team.id ? fixture.team_h_difficulty : fixture.team_a_difficulty;
      });

      const next5FDR = fdrValues.reduce((acc: number, fdr: number) => acc + fdr, 0) / fdrValues.length;

      // Find easy runs (3+ consecutive fixtures with FDR <= 3)
      let easyRunLength = 0;
      let currentRun = 0;
      for (const fdr of fdrValues) {
        if (fdr <= 3) {
          currentRun++;
          easyRunLength = Math.max(easyRunLength, currentRun);
        } else {
          currentRun = 0;
        }
      }

      // Check for difficult patch (3+ consecutive fixtures with FDR >= 4)
      let difficultPatchAhead = false;
      let difficultCount = 0;
      for (const fdr of fdrValues) {
        if (fdr >= 4) {
          difficultCount++;
          if (difficultCount >= 3) {
            difficultPatchAhead = true;
            break;
          }
        } else {
          difficultCount = 0;
        }
      }

      // Estimate clean sheet probability based on team strength and FDR
      const defensiveStrength = (team.strength_defence_home + team.strength_defence_away) / 2;
      const avgOpponentAttack = teamFixtures.reduce((acc: number, fixture: any) => {
        const opponent = teams.find((t: any) => t.id === (fixture.team_h === team.id ? fixture.team_a : fixture.team_h));
        return acc + ((opponent?.strength_attack_home + opponent?.strength_attack_away) / 2 || 100);
      }, 0) / teamFixtures.length;

      const cleanSheetProb = Math.max(0, Math.min(90, 
        ((defensiveStrength / avgOpponentAttack) * 100) - (next5FDR * 5)
      ));

      // Estimate goals expected (for attacking returns)
      const attackingStrength = (team.strength_attack_home + team.strength_attack_away) / 2;
      const goalsExpected = Math.max(0.5, 
        (attackingStrength / 100) * (6 - next5FDR) * 1.2
      );

      // Generate SA-flavored insight
      const saInsight = generateFixtureInsight(team, next5FDR, easyRunLength, difficultPatchAhead, cleanSheetProb);

      return {
        teamId: team.id,
        teamName: team.name,
        shortName: team.short_name,
        next5FDR: Math.round(next5FDR * 10) / 10,
        easyRunLength,
        difficultPatchAhead,
        cleanSheetProb: Math.round(cleanSheetProb),
        goalsExpected: Math.round(goalsExpected * 10) / 10,
        fixtures: teamFixtures.map((fixture: any) => ({
          opponent: fixture.team_h === team.id ? 
            teams.find((t: any) => t.id === fixture.team_a)?.short_name :
            teams.find((t: any) => t.id === fixture.team_h)?.short_name,
          isHome: fixture.team_h === team.id,
          difficulty: fixture.team_h === team.id ? fixture.team_h_difficulty : fixture.team_a_difficulty,
          kickoffTime: fixture.kickoff_time,
          gameweek: fixture.event
        })),
        saInsight,
        category: categorizeFixtureDifficulty(next5FDR, easyRunLength, difficultPatchAhead)
      };
    });

    // Sort by most favorable fixtures first
    fixtureAnalysis.sort((a: any, b: any) => a.next5FDR - b.next5FDR);

    return NextResponse.json({
      success: true,
      analysis: fixtureAnalysis,
      metadata: {
        totalTeams: fixtureAnalysis.length,
        lastUpdated: new Date().toISOString(),
        dataSource: 'FPL Official + BoetBall Fixture Analytics',
        season: '2024/25',
      },
      insights: {
        easiestFixtures: fixtureAnalysis.slice(0, 5),
        hardestFixtures: fixtureAnalysis.slice(-5).reverse(),
        bestCleanSheetOdds: [...fixtureAnalysis].sort((a: any, b: any) => b.cleanSheetProb - a.cleanSheetProb).slice(0, 5),
        bestAttackingFixtures: [...fixtureAnalysis].sort((a: any, b: any) => b.goalsExpected - a.goalsExpected).slice(0, 5)
      }
    });

  } catch (error) {
    console.error('Fixture Analysis API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to analyze fixtures',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Generate South African insights for fixtures
function generateFixtureInsight(team: any, fdr: number, easyRun: number, difficultPatch: boolean, cleanSheetProb: number): string {
  if (easyRun >= 4) {
    return `${team.short_name} has a proper easy run coming up, boet! Perfect time for a braai with their players! 🔥`;
  }
  
  if (difficultPatch) {
    return `Eish, ${team.short_name} is hitting a rough patch! Might want to bench their players for now, hey!`;
  }
  
  if (fdr <= 2.5) {
    return `${team.short_name} has some lekker fixtures ahead - time to captain their stars! ⭐`;
  }
  
  if (fdr >= 4) {
    return `${team.short_name} faces some proper tough opponents - approach with caution, my bru!`;
  }
  
  if (cleanSheetProb >= 60) {
    return `${team.short_name} defenders could be solid picks - they're tighter than a Springbok scrum! 🏉`;
  }
  
  return `${team.short_name} has average fixtures - nothing to write home about, but steady options available.`;
}

// Categorize fixture difficulty for easy filtering
function categorizeFixtureDifficulty(fdr: number, easyRun: number, difficultPatch: boolean): string {
  if (easyRun >= 4) return 'Braai Time';
  if (difficultPatch) return 'Nightmare';
  if (fdr <= 2.5) return 'Green Light';
  if (fdr >= 4) return 'Red Flag';
  return 'Steady';
}
