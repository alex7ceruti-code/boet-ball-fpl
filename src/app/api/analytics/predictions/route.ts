import { NextRequest, NextResponse } from 'next/server';
import BoetBallPredictionEngine, { type PredictionConfig } from '@/lib/analytics/prediction-engine';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const playerId = searchParams.get('playerId');
    const mode = searchParams.get('mode') || 'BALANCED';
    const horizon = parseInt(searchParams.get('horizon') || '6');
    const minConfidence = parseFloat(searchParams.get('minConfidence') || '0.6');
    
    // Validate parameters
    if (!['CONSERVATIVE', 'BALANCED', 'AGGRESSIVE'].includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid mode. Use CONSERVATIVE, BALANCED, or AGGRESSIVE' },
        { status: 400 }
      );
    }

    if (horizon < 1 || horizon > 10) {
      return NextResponse.json(
        { error: 'Horizon must be between 1 and 10 gameweeks' },
        { status: 400 }
      );
    }

    // Initialize prediction engine
    const engine = new BoetBallPredictionEngine();
    const initialized = await engine.initialize();
    
    if (!initialized) {
      return NextResponse.json(
        { error: 'Failed to initialize prediction engine' },
        { status: 500 }
      );
    }

    const config: PredictionConfig = {
      riskTolerance: mode as 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE',
      predictionHorizon: horizon,
      minConfidence,
      useExternalData: false // Start with FPL-only
    };

    // Single player prediction
    if (playerId) {
      const prediction = await engine.predictPlayer(parseInt(playerId), config);
      
      if (!prediction) {
        return NextResponse.json(
          { error: `Player ${playerId} not found` },
          { status: 404 }
        );
      }

      // Save prediction to database
      await engine.savePredictions([prediction]);

      return NextResponse.json({
        success: true,
        data: prediction,
        metadata: {
          generatedAt: new Date().toISOString(),
          modelVersion: '2.0.0',
          config,
          dataSource: 'FPL Official API'
        }
      });
    }

    // Batch predictions for multiple players
    const playerIds = searchParams.get('playerIds')?.split(',').map(id => parseInt(id.trim()));
    
    if (playerIds && playerIds.length > 0) {
      // Limit to 50 players per request for performance
      const limitedPlayerIds = playerIds.slice(0, 50);
      const predictions = await engine.predictMultiplePlayers(limitedPlayerIds, config);
      
      // Save predictions to database
      if (predictions.length > 0) {
        await engine.savePredictions(predictions);
      }

      return NextResponse.json({
        success: true,
        data: predictions,
        metadata: {
          generatedAt: new Date().toISOString(),
          modelVersion: '2.0.0',
          config,
          playersAnalyzed: predictions.length,
          dataSource: 'FPL Official API'
        }
      });
    }

    // No specific players requested - return error
    return NextResponse.json(
      { error: 'Please specify playerId or playerIds parameter' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Predictions API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate predictions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerIds, config } = body;

    if (!playerIds || !Array.isArray(playerIds)) {
      return NextResponse.json(
        { error: 'playerIds array is required' },
        { status: 400 }
      );
    }

    // Default config
    const predictionConfig: PredictionConfig = {
      riskTolerance: config?.riskTolerance || 'BALANCED',
      predictionHorizon: config?.predictionHorizon || 6,
      minConfidence: config?.minConfidence || 0.6,
      useExternalData: config?.useExternalData || false
    };

    // Initialize and run predictions
    const engine = new BoetBallPredictionEngine();
    const initialized = await engine.initialize();
    
    if (!initialized) {
      return NextResponse.json(
        { error: 'Failed to initialize prediction engine' },
        { status: 500 }
      );
    }

    const predictions = await engine.predictMultiplePlayers(playerIds, predictionConfig);
    
    // Save to database
    if (predictions.length > 0) {
      await engine.savePredictions(predictions);
    }

    return NextResponse.json({
      success: true,
      data: predictions,
      metadata: {
        generatedAt: new Date().toISOString(),
        modelVersion: '2.0.0',
        config: predictionConfig,
        playersAnalyzed: predictions.length
      }
    });

  } catch (error) {
    console.error('Predictions POST API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate batch predictions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
