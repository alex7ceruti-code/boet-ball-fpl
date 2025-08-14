import { NextRequest, NextResponse } from 'next/server';
import { calculateAdvancedMetrics } from '@/hooks/useAdvancedStats';

// Mock external data integration - replace with real APIs later
async function fetchUnderstatData() {
  // This would connect to Understat.com API in production
  // For now, return mock enhanced data
  return {
    season: '2024/25',
    lastUpdated: new Date().toISOString(),
    players: [], // Will be populated with real data
  };
}

async function fetchFBRefData() {
  // This would scrape FBRef.com for advanced metrics
  return {
    progressivePasses: {},
    setPlayers: {},
    aerialDuels: {},
  };
}

export async function GET(request: NextRequest) {
  try {
    // Fetch FPL data from your existing API
    const fplResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/api/fpl/bootstrap-static`);
    const fplData = await fplResponse.json();
    
    if (!fplData.elements) {
      throw new Error('No FPL data available');
    }

    // Get external data (mock for now)
    const understatData = await fetchUnderstatData();
    const fbrefData = await fetchFBRefData();

    // Process players with enhanced analytics
    const enhancedPlayers = fplData.elements.map((player: any) => {
      const advanced = calculateAdvancedMetrics(player);
      
      return {
        playerId: player.id,
        name: `${player.first_name} ${player.second_name}`,
        webName: player.web_name,
        team: player.team,
        position: player.element_type,
        
        // Core FPL Stats
        totalPoints: player.total_points,
        form: parseFloat(player.form || '0'),
        pointsPerGame: parseFloat(player.points_per_game || '0'),
        value: player.now_cost / 10,
        
        // Enhanced Analytics
        ...advanced,
        
        // Additional insights
        selectedBy: parseFloat(player.selected_by_percent || '0'),
        transfersIn: player.transfers_in_event || 0,
        transfersOut: player.transfers_out_event || 0,
        priceChange: player.cost_change_event || 0,
        
        // Status indicators
        status: player.status,
        news: player.news,
        chanceOfPlaying: player.chance_of_playing_next_round,
        
        // Form trend analysis (simplified)
        formTrend: analyzeFormTrend(player),
        rotationRisk: assessRotationRisk(player),
        
        // Bonus point analysis
        bonusProbability: calculateBonusProbability(player),
      };
    });

    // Sort by total points for better ranking
    enhancedPlayers.sort((a: any, b: any) => b.totalPoints - a.totalPoints);

    // Add rankings
    enhancedPlayers.forEach((player: any, index: number) => {
      player.overallRank = index + 1;
    });

    return NextResponse.json({
      success: true,
      players: enhancedPlayers,
      metadata: {
        totalPlayers: enhancedPlayers.length,
        lastUpdated: new Date().toISOString(),
        dataSource: 'FPL Official + BoetBall Analytics',
        season: '2024/25',
      },
    });

  } catch (error) {
    console.error('Analytics API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch analytics data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper functions for analysis
function analyzeFormTrend(player: any): 'rising' | 'falling' | 'stable' {
  const form = parseFloat(player.form || '0');
  const ppg = parseFloat(player.points_per_game || '0');
  
  if (form > ppg * 1.2) return 'rising';
  if (form < ppg * 0.8) return 'falling';
  return 'stable';
}

function assessRotationRisk(player: any): 'low' | 'medium' | 'high' {
  const minutes = player.minutes || 0;
  const starts = player.starts || 0;
  const gamesPlayed = starts > 0 ? starts : 1;
  const avgMinutes = minutes / gamesPlayed;
  
  if (avgMinutes >= 80) return 'low';
  if (avgMinutes >= 60) return 'medium';
  return 'high';
}

function calculateBonusProbability(player: any): number {
  const bps = parseFloat(player.bps || '0');
  const minutes = player.minutes || 1;
  const bpsPerGame = (bps / minutes) * 90;
  
  // Simple bonus probability based on BPS per 90
  if (bpsPerGame >= 40) return 85;
  if (bpsPerGame >= 30) return 65;
  if (bpsPerGame >= 20) return 40;
  if (bpsPerGame >= 10) return 20;
  return 10;
}

// SA-flavored insights generator
function generateSAInsights(player: any): string[] {
  const insights = [];
  
  if (player.braaiRating >= 80) {
    insights.push("This ou toppie is as reliable as a braai on Heritage Day! 🔥");
  }
  
  if (player.biltongValue >= 85) {
    insights.push("Eish, this player is better value than biltong at a rugby match! 💰");
  }
  
  if (player.klapPotential >= 75) {
    insights.push("Watch out boet, this one can deliver a proper klap when you least expect it! 💥");
  }
  
  if (player.formTrend === 'rising') {
    insights.push("This player is on the up and up, like the Springboks in the World Cup! 📈");
  }
  
  return insights;
}
