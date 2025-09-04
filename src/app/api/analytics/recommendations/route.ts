import { NextRequest, NextResponse } from 'next/server';
import BoetBallRecommendationEngine, { type RecommendationConfig } from '@/lib/analytics/recommendation-engine';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Get user session
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    // Parse query parameters
    const mode = searchParams.get('mode') || 'BALANCED';
    const horizon = parseInt(searchParams.get('horizon') || '6');
    const minConfidence = parseFloat(searchParams.get('minConfidence') || '0.6');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '15.0');
    const positions = searchParams.get('positions')?.split(',').map(p => p.trim()) || [];
    const onlyAvailable = searchParams.get('onlyAvailable') === 'true';
    const maxRecs = parseInt(searchParams.get('maxRecommendations') || '50');
    
    // Validate parameters
    if (!['CONSERVATIVE', 'BALANCED', 'AGGRESSIVE'].includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid mode. Use CONSERVATIVE, BALANCED, or AGGRESSIVE' },
        { status: 400 }
      );
    }

    if (horizon < 3 || horizon > 10) {
      return NextResponse.json(
        { error: 'Horizon must be between 3 and 10 gameweeks' },
        { status: 400 }
      );
    }

    // Build recommendation config
    const config: RecommendationConfig = {
      riskTolerance: mode as 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE',
      budgetConstraints: {
        maxPlayerPrice: maxPrice,
        totalBudget: 100.0 // Standard FPL budget
      },
      predictionHorizon: horizon,
      minConfidence,
      positions: positions.length > 0 ? positions : undefined,
      onlyShowAvailable: onlyAvailable,
      maxRecommendations: maxRecs
    };

    // Initialize and generate recommendations
    const engine = new BoetBallRecommendationEngine();
    const initialized = await engine.initialize();
    
    if (!initialized) {
      return NextResponse.json(
        { error: 'Failed to initialize recommendation engine' },
        { status: 500 }
      );
    }

    console.log(`🎯 Generating ${mode} recommendations for ${horizon} gameweeks...`);
    
    const report = await engine.generateRecommendations(config, userId);

    return NextResponse.json({
      success: true,
      data: report,
      metadata: {
        generatedAt: report.generatedAt,
        userId: userId || 'anonymous',
        modelVersion: '2.0.0',
        dataSource: 'FPL Official API + BoetBall Analytics',
        processingTime: Date.now() - new Date(report.generatedAt).getTime()
      }
    });

  } catch (error) {
    console.error('Recommendations API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { config, userId } = body;

    // Get user session if not provided
    const session = await getServerSession(authOptions);
    const finalUserId = userId || session?.user?.id;

    // Validate config
    if (!config || typeof config !== 'object') {
      return NextResponse.json(
        { error: 'Configuration object is required' },
        { status: 400 }
      );
    }

    // Default configuration
    const recommendationConfig: RecommendationConfig = {
      riskTolerance: config.riskTolerance || 'BALANCED',
      budgetConstraints: {
        maxPlayerPrice: config.budgetConstraints?.maxPlayerPrice || 15.0,
        totalBudget: config.budgetConstraints?.totalBudget || 100.0,
        positionBudgets: config.budgetConstraints?.positionBudgets || {}
      },
      predictionHorizon: config.predictionHorizon || 6,
      minConfidence: config.minConfidence || 0.6,
      positions: config.positions || [],
      excludePlayerIds: config.excludePlayerIds || [],
      onlyShowAvailable: config.onlyShowAvailable || false,
      maxRecommendations: config.maxRecommendations || 50,
      includeAlternatives: config.includeAlternatives || true
    };

    // Initialize and generate recommendations
    const engine = new BoetBallRecommendationEngine();
    const initialized = await engine.initialize();
    
    if (!initialized) {
      return NextResponse.json(
        { error: 'Failed to initialize recommendation engine' },
        { status: 500 }
      );
    }

    const report = await engine.generateRecommendations(recommendationConfig, finalUserId);

    // Enhanced response with additional insights
    const enhancedReport = {
      ...report,
      saInsights: {
        topBraaiPick: report.specialPicks.braaiBankers[0]?.playerName || 'None found',
        bestBiltongValue: report.specialPicks.biltongBudget[0]?.playerName || 'None found',
        biggestKlap: report.specialPicks.klapPotential[0]?.playerName || 'None found',
        safestHaven: report.specialPicks.safeHavens[0]?.playerName || 'None found'
      },
      quickStats: {
        strongBuyCount: report.recommendations.strongBuys.length,
        buyCount: report.recommendations.buys.length,
        avgExpectedNext: report.recommendations.strongBuys.length > 0 
          ? report.recommendations.strongBuys.reduce((sum, r) => sum + r.prediction.nextGameweekExpected, 0) / report.recommendations.strongBuys.length
          : 0,
        totalValue: report.recommendations.strongBuys.reduce((sum, r) => sum + r.currentPrice, 0)
      }
    };

    return NextResponse.json({
      success: true,
      data: enhancedReport,
      metadata: {
        generatedAt: report.generatedAt,
        userId: finalUserId || 'anonymous',
        modelVersion: '2.0.0',
        config: recommendationConfig
      }
    });

  } catch (error) {
    console.error('Recommendations POST API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate custom recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Quick recommendations endpoint for specific scenarios
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { scenario, budget, positions, riskLevel } = body;

    // Pre-configured scenarios
    const scenarioConfigs: Record<string, Partial<RecommendationConfig>> = {
      'wildcard': {
        riskTolerance: 'BALANCED',
        budgetConstraints: { totalBudget: budget || 100.0 },
        predictionHorizon: 8,
        onlyShowAvailable: true,
        maxRecommendations: 15
      },
      'budget_team': {
        riskTolerance: 'AGGRESSIVE',
        budgetConstraints: { maxPlayerPrice: 7.0 },
        predictionHorizon: 6,
        maxRecommendations: 20
      },
      'premium_picks': {
        riskTolerance: 'CONSERVATIVE',
        budgetConstraints: { maxPlayerPrice: 15.0, totalBudget: 50.0 },
        minConfidence: 0.75,
        predictionHorizon: 6,
        maxRecommendations: 10
      },
      'differentials': {
        riskTolerance: 'AGGRESSIVE',
        predictionHorizon: 4,
        maxRecommendations: 15
        // Would filter by low ownership in the engine
      }
    };

    if (!scenario || !scenarioConfigs[scenario]) {
      return NextResponse.json(
        { error: 'Invalid scenario. Use: wildcard, budget_team, premium_picks, or differentials' },
        { status: 400 }
      );
    }

    const baseConfig = scenarioConfigs[scenario];
    const finalConfig: RecommendationConfig = {
      ...baseConfig,
      riskTolerance: riskLevel || baseConfig.riskTolerance || 'BALANCED',
      positions: positions || baseConfig.positions,
      budgetConstraints: {
        ...baseConfig.budgetConstraints,
        totalBudget: budget || baseConfig.budgetConstraints?.totalBudget
      }
    } as RecommendationConfig;

    // Generate recommendations
    const engine = new BoetBallRecommendationEngine();
    const initialized = await engine.initialize();
    
    if (!initialized) {
      return NextResponse.json(
        { error: 'Failed to initialize recommendation engine' },
        { status: 500 }
      );
    }

    const report = await engine.generateRecommendations(finalConfig);

    return NextResponse.json({
      success: true,
      scenario,
      data: {
        summary: {
          strongBuys: report.recommendations.strongBuys.slice(0, 5),
          specialPicks: report.specialPicks,
          insights: report.insights
        },
        fullReport: report
      },
      metadata: {
        scenario,
        generatedAt: report.generatedAt,
        config: finalConfig
      }
    });

  } catch (error) {
    console.error('Scenario Recommendations API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate scenario recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
