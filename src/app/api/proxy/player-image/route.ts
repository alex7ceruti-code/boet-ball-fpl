import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const playerCode = searchParams.get('code');
  
  if (!playerCode) {
    return NextResponse.json({ error: 'Player code is required' }, { status: 400 });
  }

  try {
    // Fetch the image from Premier League
    const imageUrl = `https://resources.premierleague.com/premierleague/photos/players/250x250/p${playerCode}.png`;
    
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const imageBuffer = await response.arrayBuffer();
    
    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache for 24 hours
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error proxying player image:', error);
    
    // Return a transparent 1x1 pixel PNG as fallback
    const transparentPixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    );
    
    return new NextResponse(transparentPixel, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=300', // Short cache for failed requests
      },
    });
  }
}
