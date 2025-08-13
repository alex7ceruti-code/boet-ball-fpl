import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    // Simple check - in production, you'd want proper auth here
    const url = new URL(request.url);
    const secret = url.searchParams.get('secret');
    
    // Add a simple secret to prevent unauthorized access
    if (secret !== 'debug-boet-ball-2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        subscriptionType: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        loginCount: true,
        marketingOptIn: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const preferences = await db.userPreferences.findMany({
      select: {
        userId: true,
        emailNotifications: true,
        weeklyReports: true,
        transferReminders: true,
        darkMode: true,
        compactView: true,
        showAdvancedStats: true,
        slangIntensity: true,
        showSouthAfricanTime: true,
      }
    });

    return NextResponse.json({
      users,
      preferences,
      count: users.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Debug users error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
