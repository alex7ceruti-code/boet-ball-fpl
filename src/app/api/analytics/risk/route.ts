import { NextRequest, NextResponse } from 'next/server';
import BoetBallRiskAssessment, { type RiskAssessmentConfig } from '@/lib/analytics/risk-assessment';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const playerId = searchParams.get('playerId');
    const includeHistorical = searchParams.get('includeHistorical') === 'true';
    const confidenceThreshold = parseFloat(searchParams.get('confidenceThreshold') || '0.6');
    
    // Initialize risk assessment system
    const riskAssessment = new BoetBallRiskAssessment();
    const initialized = await riskAssessment.initialize();
    
    if (!initialized) {
      return NextResponse.json(
        { error: 'Failed to initialize risk assessment system' },
        { status: 500 }
      );
    }

    const config: RiskAssessmentConfig = {
      includeHistorical,
      confidenceThreshold,
      updateFrequency: 'hourly',
      dataSource: 'fpl_only'
    };

    // Single player risk assessment
    if (playerId) {
      const riskProfile = await riskAssessment.assessPlayer(parseInt(playerId), config);
      
      if (!riskProfile) {
        return NextResponse.json(
          { error: `Player ${playerId} not found` },
          { status: 404 }
        );
      }

      // Save risk assessment to database
      await riskAssessment.saveRiskAssessments([riskProfile]);

      return NextResponse.json({
        success: true,
        data: riskProfile,
        metadata: {
          generatedAt: new Date().toISOString(),
          config,
          dataSource: 'FPL Official API + Team Analysis'
        }
      });
    }

    // Batch risk assessment for multiple players
    const playerIds = searchParams.get('playerIds')?.split(',').map(id => parseInt(id.trim()));
    
    if (playerIds && playerIds.length > 0) {
      // Limit to 100 players per request
      const limitedPlayerIds = playerIds.slice(0, 100);
      const riskProfiles = await riskAssessment.assessMultiplePlayers(limitedPlayerIds, config);
      
      // Save to database
      if (riskProfiles.length > 0) {
        await riskAssessment.saveRiskAssessments(riskProfiles);
      }

      return NextResponse.json({
        success: true,
        data: riskProfiles,
        metadata: {
          generatedAt: new Date().toISOString(),
          config,
          playersAnalyzed: riskProfiles.length,
          dataSource: 'FPL Official API + Team Analysis'
        }
      });
    }

    // No players specified - return summary statistics
    return NextResponse.json(
      { error: 'Please specify playerId or playerIds parameter' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Risk Assessment API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to assess player risk',
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
    const riskConfig: RiskAssessmentConfig = {
      includeHistorical: config?.includeHistorical || false,
      confidenceThreshold: config?.confidenceThreshold || 0.6,
      updateFrequency: config?.updateFrequency || 'hourly',
      dataSource: config?.dataSource || 'fpl_only'
    };

    // Initialize and run risk assessment
    const riskAssessment = new BoetBallRiskAssessment();
    const initialized = await riskAssessment.initialize();
    
    if (!initialized) {
      return NextResponse.json(
        { error: 'Failed to initialize risk assessment system' },
        { status: 500 }
      );
    }

    const riskProfiles = await riskAssessment.assessMultiplePlayers(playerIds, riskConfig);
    
    // Save to database
    if (riskProfiles.length > 0) {
      await riskAssessment.saveRiskAssessments(riskProfiles);
    }

    // Categorize results for easier consumption
    const summary = {
      veryLowRisk: riskProfiles.filter(p => p.overallRisk.score <= 20).length,
      lowRisk: riskProfiles.filter(p => p.overallRisk.score <= 40 && p.overallRisk.score > 20).length,
      mediumRisk: riskProfiles.filter(p => p.overallRisk.score <= 60 && p.overallRisk.score > 40).length,
      highRisk: riskProfiles.filter(p => p.overallRisk.score <= 80 && p.overallRisk.score > 60).length,
      veryHighRisk: riskProfiles.filter(p => p.overallRisk.score > 80).length,
      
      conservativeSuitable: riskProfiles.filter(p => p.recommendations.conservative.suitable).length,
      balancedSuitable: riskProfiles.filter(p => p.recommendations.balanced.suitable).length,
      aggressiveSuitable: riskProfiles.filter(p => p.recommendations.aggressive.suitable).length
    };

    return NextResponse.json({
      success: true,
      data: riskProfiles,
      summary,
      metadata: {
        generatedAt: new Date().toISOString(),
        config: riskConfig,
        playersAnalyzed: riskProfiles.length
      }
    });

  } catch (error) {
    console.error('Risk Assessment POST API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to perform batch risk assessment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
