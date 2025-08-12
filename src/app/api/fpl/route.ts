import { NextRequest, NextResponse } from 'next/server';

const FPL_BASE_URL = 'https://fantasy.premierleague.com/api';

// Helper function to create FPL API URL
function createFplUrl(endpoint: string): string {
  return `${FPL_BASE_URL}/${endpoint.replace(/^\//, '')}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    
    if (!endpoint) {
      return NextResponse.json(
        { error: 'Missing endpoint parameter' },
        { status: 400 }
      );
    }

    const fplUrl = createFplUrl(endpoint);
    
    console.log(`Fetching from FPL API: ${fplUrl}`);
    
    const response = await fetch(fplUrl, {
      headers: {
        'User-Agent': 'Boet Ball - Fantasy Premier League Companion App',
      },
      // Add cache control for better performance
      next: {
        revalidate: endpoint.includes('live') ? 60 : 300, // 1min for live data, 5min for others
      },
    });

    if (!response.ok) {
      console.error(`FPL API error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `FPL API returned ${response.status}: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': endpoint.includes('live') 
          ? 'public, s-maxage=60, stale-while-revalidate=30'
          : 'public, s-maxage=300, stale-while-revalidate=60',
      },
    });
    
  } catch (error) {
    console.error('FPL API proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from FPL API' },
      { status: 500 }
    );
  }
}

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
