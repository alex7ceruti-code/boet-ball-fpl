import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/players/watchlist - Get all watchlisted players (public endpoint)
export async function GET(request: NextRequest) {
  try {
    // Get all active watchlist players
    const watchlistPlayers = await db.playerWatchlist.findMany({
      where: {
        status: {
          in: ['ACTIVE', 'MONITORING', 'TRIGGERED']
        }
      },
      select: {
        fplPlayerId: true,
        reason: true,
        eyeTestNotes: true,
        confidence: true,
        priority: true,
        targetPrice: true,
        targetGW: true,
        reliabilityScore: true,
        valueScore: true,
        attackingThreat: true,
        addedAt: true,
        admin: {
          select: {
            name: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { addedAt: 'desc' }
      ]
    });

    // Create a lookup map for quick access
    const watchlistMap = watchlistPlayers.reduce((acc, player) => {
      acc[player.fplPlayerId] = {
        reason: player.reason,
        eyeTestNotes: player.eyeTestNotes,
        confidence: player.confidence,
        priority: player.priority,
        targetPrice: player.targetPrice,
        targetGW: player.targetGW,
        reliabilityScore: player.reliabilityScore,
        valueScore: player.valueScore,
        attackingThreat: player.attackingThreat,
        addedAt: player.addedAt,
        addedBy: player.admin.name
      };
      return acc;
    }, {} as Record<number, any>);

    return NextResponse.json({
      success: true,
      watchlist: watchlistMap,
      count: watchlistPlayers.length
    });

  } catch (error) {
    console.error('Watchlist fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch watchlist data' },
      { status: 500 }
    );
  }
}
