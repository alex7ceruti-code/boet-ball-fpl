import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { calculateAdvancedMetrics } from '@/hooks/useAdvancedStats';

// GET /api/admin/watchlist - Get all watchlist players
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const adminUser = await db.adminUser.findUnique({
      where: { userId: session.user.id }
    });

    if (!adminUser) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    // Build where clause
    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;

    // Get watchlist players
    const watchlistPlayers = await db.playerWatchlist.findMany({
      where,
      include: {
        admin: {
          select: { name: true, email: true }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { addedAt: 'desc' }
      ]
    });

    return NextResponse.json({
      players: watchlistPlayers,
      total: watchlistPlayers.length
    });

  } catch (error) {
    console.error('Watchlist GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch watchlist' },
      { status: 500 }
    );
  }
}

// POST /api/admin/watchlist - Add player to watchlist
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const adminUser = await db.adminUser.findUnique({
      where: { userId: session.user.id }
    });

    if (!adminUser) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    console.log('Received watchlist form data:', body);
    
    const {
      fplPlayerId,
      playerName,
      teamName,
      position,
      currentPrice,
      reason,
      eyeTestNotes,
      confidence,
      priority,
      targetPrice,
      targetGW,
      reliabilityScore,
      valueScore,
      attackingThreat
    } = body;

    // Validate required fields with detailed error messages
    const missingFields = [];
    if (!fplPlayerId) missingFields.push('fplPlayerId');
    if (!playerName) missingFields.push('playerName');
    if (!teamName) missingFields.push('teamName');
    if (!position) missingFields.push('position');
    if (!currentPrice) missingFields.push('currentPrice');
    if (!reason || !reason.trim()) missingFields.push('reason');
    
    if (missingFields.length > 0) {
      console.log('Missing fields:', missingFields);
      return NextResponse.json({ 
        error: `Missing required fields: ${missingFields.join(', ')}`,
        missingFields 
      }, { status: 400 });
    }

    // Check if player already on watchlist
    const existing = await db.playerWatchlist.findFirst({
      where: { fplPlayerId: parseInt(fplPlayerId) }
    });

    if (existing) {
      return NextResponse.json({ error: 'Player already on watchlist' }, { status: 409 });
    }

    // Add to watchlist
    const watchlistPlayer = await db.playerWatchlist.create({
      data: {
        fplPlayerId: parseInt(fplPlayerId),
        playerName,
        teamName,
        position,
        currentPrice: parseFloat(currentPrice),
        reason,
        eyeTestNotes: eyeTestNotes || null,
        confidence: confidence || 'MEDIUM',
        priority: priority || 'MEDIUM',
        targetPrice: targetPrice ? parseFloat(targetPrice) : null,
        targetGW: targetGW ? parseInt(targetGW) : null,
        reliabilityScore: parseInt(reliabilityScore) || 0,
        valueScore: parseInt(valueScore) || 0,
        attackingThreat: parseInt(attackingThreat) || 0,
        addedBy: session.user.id
      },
      include: {
        admin: {
          select: { name: true, email: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      player: watchlistPlayer
    });

  } catch (error) {
    console.error('Watchlist POST error:', error);
    return NextResponse.json(
      { error: 'Failed to add player to watchlist' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/watchlist - Update watchlist player
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const adminUser = await db.adminUser.findUnique({
      where: { userId: session.user.id }
    });

    if (!adminUser) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Player ID required' }, { status: 400 });
    }

    // Update the watchlist entry
    const updatedPlayer = await db.playerWatchlist.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        admin: {
          select: { name: true, email: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      player: updatedPlayer
    });

  } catch (error) {
    console.error('Watchlist PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update watchlist player' },
      { status: 500 }
    );
  }
}
