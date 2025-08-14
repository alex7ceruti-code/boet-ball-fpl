import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// DELETE /api/admin/watchlist/[id] - Remove player from watchlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Player ID required' }, { status: 400 });
    }

    // Delete the watchlist entry
    await db.playerWatchlist.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Player removed from watchlist'
    });

  } catch (error) {
    console.error('Watchlist DELETE error:', error);
    
    // Handle case where record doesn't exist
    if ((error as any)?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Player not found in watchlist' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to remove player from watchlist' },
      { status: 500 }
    );
  }
}

// GET /api/admin/watchlist/[id] - Get single watchlist player
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    const watchlistPlayer = await db.playerWatchlist.findUnique({
      where: { id },
      include: {
        admin: {
          select: { name: true, email: true }
        }
      }
    });

    if (!watchlistPlayer) {
      return NextResponse.json(
        { error: 'Player not found in watchlist' },
        { status: 404 }
      );
    }

    return NextResponse.json({ player: watchlistPlayer });

  } catch (error) {
    console.error('Watchlist GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch watchlist player' },
      { status: 500 }
    );
  }
}
