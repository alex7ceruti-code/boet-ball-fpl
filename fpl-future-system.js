#!/usr/bin/env node

/**
 * FPL Future-Focused Prediction System
 * 
 * Integrated system combining all predictive modules:
 * - Predictive Analytics Engine
 * - External Data Integration
 * - Machine Learning Pipeline
 * - Scenario Modeling
 * 
 * Author: Boet Ball Analytics Team
 * Version: 2.0.0 - Complete Integration
 */

const FPLPredictiveEngine = require('./fpl-predictive-analytics');
const FPLExternalDataManager = require('./fpl-external-data');
const FPLMLPipeline = require('./fpl-ml-pipeline');
const fs = require('fs');
const path = require('path');

class FPLFutureSystem {
  constructor() {
    this.predictiveEngine = new FPLPredictiveEngine();
    this.externalData = new FPLExternalDataManager();
    this.mlPipeline = new FPLMLPipeline();
    this.initialized = false;
    
    // System configuration
    this.config = {
      predictionHorizon: 6, // Gameweeks to predict ahead
      useML: true,
      useExternalData: true,
      scenarioModeling: true,
      confidenceThreshold: 0.6
    };
    
    // Scenario modeling
    this.scenarios = new Map();
  }

  /**
   * Initialize the complete system
   */
  async initialize() {
    console.log('🔮 Initializing FPL Future Prediction System...');
    
    try {
      // Initialize core predictive engine
      await this.predictiveEngine.initialize();
      
      // Initialize external data sources
      await this.externalData.initialize(
        this.predictiveEngine.data.bootstrap,
        this.predictiveEngine.data.fixtures
      );
      
      // Load ML models if available
      this.loadMLModels();
      
      this.initialized = true;
      console.log('✅ FPL Future System fully initialized');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize future system:', error.message);
      return false;
    }
  }

  /**
   * Load pre-trained ML models
   */
  loadMLModels() {
    const modelPath = './fpl-ml-models/ml-state.json';
    if (fs.existsSync(modelPath)) {
      this.mlPipeline.loadState(modelPath);
      console.log('✅ Pre-trained ML models loaded');
    } else {
      console.log('⚠️ No pre-trained models found, using heuristic predictions');
    }
  }

  /**
   * Enhanced prediction combining all systems
   */
  async predictPlayer(playerId, gameweek, options = {}) {
    if (!this.initialized) {
      throw new Error('System not initialized. Call initialize() first.');
    }

    const player = this.predictiveEngine.data.bootstrap.elements.find(p => p.id === playerId);
    if (!player) {
      return { error: `Player ${playerId} not found` };
    }

    // Get base prediction from predictive engine
    const basePrediction = this.predictiveEngine.predictGameweekPoints(playerId, gameweek, options);
    
    if (!basePrediction) {
      return { error: `Could not generate base prediction for player ${playerId}` };
    }

    // Enhance with external data
    let enhancedPrediction = basePrediction;
    if (this.config.useExternalData) {
      enhancedPrediction = this.externalData.enhancePrediction(
        basePrediction.expectedPoints,
        playerId,
        player.team,
        gameweek
      );
    }

    // Enhance with ML if available and configured
    let mlEnhanced = enhancedPrediction;
    if (this.config.useML && this.mlPipeline.models.size > 0) {
      const externalContext = {
        availability: this.externalData.predictPlayerAvailability(playerId, gameweek, { teamId: player.team }),
        tactical: this.externalData.getTacticalContext(playerId, player.team)
      };
      
      const mlPrediction = this.mlPipeline.predictWithML(
        playerId,
        gameweek,
        this.predictiveEngine.data,
        externalContext
      );
      
      if (mlPrediction) {
        // Blend ML prediction with enhanced prediction
        const blendWeight = Math.min(mlPrediction.confidence, 0.7);
        mlEnhanced = {
          ...enhancedPrediction,
          expectedPoints: Math.round(
            ((enhancedPrediction.expectedPoints * (1 - blendWeight)) +
             (mlPrediction.expectedPoints * blendWeight)) * 10
          ) / 10,
          confidence: Math.max(enhancedPrediction.confidence, mlPrediction.confidence),
          modelUsed: 'Integrated_ML_Enhanced',
          featureImportance: mlPrediction.featureImportance
        };
      }
    }

    // Add scenario modeling if configured
    if (this.config.scenarioModeling) {
      const scenarios = this.generateScenarios(playerId, gameweek, mlEnhanced);
      mlEnhanced.scenarios = scenarios;
    }

    // Final prediction with metadata
    return {
      ...mlEnhanced,
      player: {
        id: playerId,
        name: `${player.first_name} ${player.second_name}`,
        position: this.predictiveEngine.data.bootstrap.element_types
          .find(p => p.id === player.element_type)?.singular_name_short,
        team: this.predictiveEngine.data.bootstrap.teams
          .find(t => t.id === player.team)?.short_name,
        price: player.now_cost / 10
      },
      gameweek,
      timestamp: new Date().toISOString(),
      systemVersion: '2.0.0'
    };
  }

  /**
   * Generate multiple scenarios for robust prediction
   */
  generateScenarios(playerId, gameweek, basePrediction) {
    const scenarios = {};
    
    // Optimistic scenario (everything goes well)
    scenarios.optimistic = {
      expectedPoints: Math.round(basePrediction.expectedPoints * 1.3 * 10) / 10,
      probability: 0.2,
      description: 'Player in top form, easy fixture, full 90 minutes',
      factors: ['excellent_form', 'easy_fixture', 'full_minutes', 'bonus_likely']
    };

    // Base scenario (current prediction)
    scenarios.base = {
      expectedPoints: basePrediction.expectedPoints,
      probability: 0.6,
      description: 'Expected performance based on current data',
      factors: ['normal_form', 'expected_fixture', 'typical_minutes']
    };

    // Conservative scenario (things go wrong)
    scenarios.conservative = {
      expectedPoints: Math.round(basePrediction.expectedPoints * 0.6 * 10) / 10,
      probability: 0.2,
      description: 'Below-par performance or rotation risk',
      factors: ['rotation_risk', 'difficult_fixture', 'limited_minutes']
    };

    // Injury/suspension scenario
    scenarios.unavailable = {
      expectedPoints: 0,
      probability: this.getUnavailableProbability(playerId),
      description: 'Player unavailable due to injury/suspension/rotation',
      factors: ['injured', 'suspended', 'rotated']
    };

    return scenarios;
  }

  /**
   * Get probability of player being unavailable
   */
  getUnavailableProbability(playerId) {
    // Check external data for injury/rotation risk
    const availability = this.externalData.injuryData.get(playerId);
    if (availability) {
      return 1 - availability.startProbability;
    }
    return 0.1; // Default 10% unavailability risk
  }

  /**
   * Multi-gameweek outlook with trend analysis
   */
  async predictOutlook(playerId, gameweeksAhead = null) {
    const horizon = gameweeksAhead || this.config.predictionHorizon;
    const currentGW = this.predictiveEngine.data.bootstrap.events.find(gw => gw.is_current)?.id || 1;
    
    const predictions = [];
    const trends = [];
    
    for (let gw = currentGW; gw < currentGW + horizon; gw++) {
      const prediction = await this.predictPlayer(playerId, gw);
      
      if (prediction && !prediction.error) {
        predictions.push({
          gameweek: gw,
          prediction: prediction.expectedPoints,
          confidence: prediction.confidence,
          scenarios: prediction.scenarios
        });
      }
    }

    if (predictions.length === 0) {
      return { error: 'No predictions generated' };
    }

    // Calculate trends and outlook metrics
    const totalExpected = predictions.reduce((sum, p) => sum + p.prediction, 0);
    const avgExpected = totalExpected / predictions.length;
    const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;
    
    // Trend analysis
    const trend = this.calculateTrendAnalysis(predictions);
    
    // Value assessment
    const valueAssessment = this.assessPlayerValue(playerId, avgExpected, predictions);
    
    return {
      playerId,
      outlook: {
        gameweeks: predictions,
        totalExpectedPoints: Math.round(totalExpected * 10) / 10,
        averageExpectedPoints: Math.round(avgExpected * 10) / 10,
        confidenceLevel: Math.round(avgConfidence * 100) / 100,
        trend: trend,
        valueAssessment: valueAssessment
      },
      recommendation: this.generateAdvancedRecommendation(avgExpected, avgConfidence, trend, valueAssessment),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Calculate trend analysis from predictions
   */
  calculateTrendAnalysis(predictions) {
    if (predictions.length < 3) return { direction: 'stable', strength: 0 };
    
    const early = predictions.slice(0, Math.ceil(predictions.length / 2));
    const late = predictions.slice(Math.floor(predictions.length / 2));
    
    const earlyAvg = early.reduce((sum, p) => sum + p.prediction, 0) / early.length;
    const lateAvg = late.reduce((sum, p) => sum + p.prediction, 0) / late.length;
    
    const change = lateAvg - earlyAvg;
    const percentChange = earlyAvg > 0 ? (change / earlyAvg) * 100 : 0;
    
    let direction = 'stable';
    let strength = Math.abs(percentChange);
    
    if (percentChange > 10) direction = 'improving';
    else if (percentChange < -10) direction = 'declining';
    
    return {
      direction,
      strength: Math.round(strength),
      change: Math.round(change * 10) / 10,
      percentChange: Math.round(percentChange)
    };
  }

  /**
   * Assess player value relative to price
   */
  assessPlayerValue(playerId, avgExpected, predictions) {
    const player = this.predictiveEngine.data.bootstrap.elements.find(p => p.id === playerId);
    if (!player) return { rating: 'unknown' };
    
    const price = player.now_cost / 10;
    const pointsPerMillion = avgExpected / price;
    const consistency = this.calculatePredictionConsistency(predictions);
    
    let valueRating = 'fair';
    if (pointsPerMillion > 1.0 && consistency > 0.7) valueRating = 'excellent';
    else if (pointsPerMillion > 0.8) valueRating = 'good';
    else if (pointsPerMillion < 0.6) valueRating = 'poor';
    
    return {
      rating: valueRating,
      pointsPerMillion: Math.round(pointsPerMillion * 100) / 100,
      consistency: Math.round(consistency * 100) / 100,
      pricePoint: price >= 10 ? 'premium' : price >= 7 ? 'mid-range' : 'budget'
    };
  }

  /**
   * Calculate consistency of predictions
   */
  calculatePredictionConsistency(predictions) {
    if (predictions.length < 2) return 1;
    
    const values = predictions.map(p => p.prediction);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    // Convert to consistency score (lower std dev = higher consistency)
    return Math.max(0, 1 - (stdDev / Math.max(mean, 1)));
  }

  /**
   * Generate advanced recommendation
   */
  generateAdvancedRecommendation(avgExpected, avgConfidence, trend, valueAssessment) {
    let action = 'HOLD';
    let priority = 'Medium';
    let reasoning = [];

    // Base decision on expected points and confidence
    if (avgExpected > 6 && avgConfidence > 0.7) {
      action = 'STRONG_BUY';
      priority = 'High';
      reasoning.push(`High expected returns (${avgExpected.toFixed(1)} PPG)`);
      reasoning.push(`High confidence (${Math.round(avgConfidence * 100)}%)`);
    } else if (avgExpected > 4.5 && avgConfidence > 0.6) {
      action = 'BUY';
      priority = 'Medium';
      reasoning.push(`Good expected returns (${avgExpected.toFixed(1)} PPG)`);
    } else if (avgExpected < 3 || avgConfidence < 0.4) {
      action = 'AVOID';
      priority = 'High';
      reasoning.push(`Low expected returns or uncertainty`);
    }

    // Adjust for trend
    if (trend.direction === 'improving' && trend.strength > 15) {
      if (action === 'HOLD') action = 'BUY';
      reasoning.push(`Strong positive trend (+${trend.percentChange}%)`);
    } else if (trend.direction === 'declining' && trend.strength > 15) {
      if (action === 'BUY') action = 'HOLD';
      if (action === 'STRONG_BUY') action = 'BUY';
      reasoning.push(`Concerning negative trend (${trend.percentChange}%)`);
    }

    // Adjust for value
    if (valueAssessment.rating === 'excellent') {
      reasoning.push(`Excellent value (${valueAssessment.pointsPerMillion} pts/£m)`);
      if (action === 'HOLD') action = 'BUY';
    } else if (valueAssessment.rating === 'poor') {
      reasoning.push(`Poor value for price`);
      if (action === 'BUY') action = 'HOLD';
    }

    return {
      action,
      priority,
      reasoning: reasoning.join('. '),
      confidence: Math.round(avgConfidence * 100),
      expectedReturn: avgExpected,
      riskLevel: this.calculateRiskLevel(avgConfidence, trend, valueAssessment)
    };
  }

  /**
   * Calculate overall risk level
   */
  calculateRiskLevel(confidence, trend, valueAssessment) {
    let risk = 'Medium';
    
    if (confidence > 0.8 && valueAssessment.consistency > 0.7) {
      risk = 'Low';
    } else if (confidence < 0.5 || trend.direction === 'declining') {
      risk = 'High';
    }
    
    return risk;
  }

  /**
   * Batch processing for multiple players
   */
  async predictMultiplePlayers(playerIds, gameweek, options = {}) {
    const predictions = [];
    
    console.log(`🔮 Generating predictions for ${playerIds.length} players...`);
    
    for (const playerId of playerIds) {
      try {
        const prediction = await this.predictPlayer(playerId, gameweek, options);
        if (prediction && !prediction.error) {
          predictions.push(prediction);
        }
      } catch (error) {
        console.error(`Failed to predict player ${playerId}:`, error.message);
      }
    }
    
    // Sort by expected points
    predictions.sort((a, b) => b.expectedPoints - a.expectedPoints);
    
    return {
      gameweek,
      predictions,
      summary: {
        totalPlayers: predictions.length,
        avgExpectedPoints: predictions.reduce((sum, p) => sum + p.expectedPoints, 0) / predictions.length,
        avgConfidence: predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length,
        strongBuys: predictions.filter(p => p.scenarios?.base?.expectedPoints > 6).length,
        highConfidence: predictions.filter(p => p.confidence > 0.7).length
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Export comprehensive prediction report
   */
  async exportFutureReport(outputDir = './fpl-future-predictions', gameweeksAhead = 4) {
    console.log('🔮 Generating comprehensive future predictions report...');
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const currentGW = this.predictiveEngine.data.bootstrap.events.find(gw => gw.is_current)?.id || 1;
    
    // Generate predictions for top players (limit for performance)
    const topPlayers = this.predictiveEngine.data.bootstrap.elements
      .sort((a, b) => (b.total_points || 0) - (a.total_points || 0))
      .slice(0, 100)
      .map(p => p.id);

    const playerOutlooks = [];
    const gameweekPredictions = [];
    
    // Generate outlooks
    console.log('Generating player outlooks...');
    for (const playerId of topPlayers.slice(0, 50)) { // Limit for demo
      const outlook = await this.predictOutlook(playerId, gameweeksAhead);
      if (outlook && !outlook.error) {
        playerOutlooks.push(outlook);
      }
    }

    // Generate gameweek predictions
    console.log('Generating gameweek predictions...');
    for (let gw = currentGW; gw < currentGW + 3; gw++) { // Next 3 gameweeks
      const gwPredictions = await this.predictMultiplePlayers(topPlayers.slice(0, 30), gw);
      gameweekPredictions.push(gwPredictions);
    }

    const report = {
      generated: new Date().toISOString(),
      systemVersion: '2.0.0',
      currentGameweek: currentGW,
      predictionHorizon: gameweeksAhead,
      
      summary: {
        playersAnalyzed: playerOutlooks.length,
        gameweeksAnalyzed: gameweekPredictions.length,
        avgConfidence: playerOutlooks.reduce((sum, p) => sum + p.outlook.confidenceLevel, 0) / playerOutlooks.length,
        systemComponents: ['PredictiveEngine', 'ExternalData', 'MLPipeline', 'ScenarioModeling']
      },
      
      topOutlooks: playerOutlooks
        .sort((a, b) => b.outlook.averageExpectedPoints - a.outlook.averageExpectedPoints)
        .slice(0, 20),
        
      gameweekPredictions: gameweekPredictions,
      
      recommendations: {
        strongBuys: playerOutlooks
          .filter(p => p.recommendation.action === 'STRONG_BUY')
          .slice(0, 10),
        differentials: playerOutlooks
          .filter(p => {
            const player = this.predictiveEngine.data.bootstrap.elements.find(el => el.id === p.playerId);
            return player && parseFloat(player.selected_by_percent || '0') < 10;
          })
          .sort((a, b) => b.outlook.averageExpectedPoints - a.outlook.averageExpectedPoints)
          .slice(0, 10)
      },
      
      methodology: {
        components: [
          'Advanced fixture difficulty analysis',
          'Form momentum and regression modeling',
          'External data integration (injuries, rotation)',
          'Machine learning enhancement',
          'Multi-scenario probability modeling',
          'Value assessment and risk analysis'
        ],
        confidenceFactors: [
          'Historical performance consistency',
          'Data quality and recency',
          'Model validation accuracy',
          'External factor reliability'
        ]
      }
    };

    // Export main report
    fs.writeFileSync(
      path.join(outputDir, 'future-predictions-report.json'),
      JSON.stringify(report, null, 2)
    );

    // Export CSV for analysis
    const csvHeaders = [
      'Name', 'Position', 'Team', 'Price', 'Avg_Expected', 'Total_Expected',
      'Confidence', 'Trend', 'Value_Rating', 'Recommendation', 'Risk_Level'
    ];

    const csvData = playerOutlooks.map(p => {
      const player = this.predictiveEngine.data.bootstrap.elements.find(el => el.id === p.playerId);
      return [
        player ? `${player.first_name} ${player.second_name}` : 'Unknown',
        player ? this.predictiveEngine.data.bootstrap.element_types.find(pt => pt.id === player.element_type)?.singular_name_short : 'Unknown',
        player ? this.predictiveEngine.data.bootstrap.teams.find(t => t.id === player.team)?.short_name : 'Unknown',
        player ? player.now_cost / 10 : 0,
        p.outlook.averageExpectedPoints,
        p.outlook.totalExpectedPoints,
        p.outlook.confidenceLevel,
        p.outlook.trend.direction,
        p.outlook.valueAssessment.rating,
        p.recommendation.action,
        p.recommendation.riskLevel
      ];
    });

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    fs.writeFileSync(
      path.join(outputDir, 'future-predictions.csv'),
      csvContent
    );

    console.log(`✅ Future predictions report exported to: ${outputDir}`);
    console.log(`📁 Files generated:`);
    console.log(`   - future-predictions-report.json (Complete analysis)`);
    console.log(`   - future-predictions.csv (Spreadsheet format)`);

    return report;
  }
}

/**
 * CLI Interface for the integrated system
 */
async function main() {
  const args = process.argv.slice(2);
  const system = new FPLFutureSystem();
  
  // Initialize the system
  const initialized = await system.initialize();
  if (!initialized) {
    process.exit(1);
  }
  
  // Handle different commands
  if (args.includes('--player') || args.includes('-p')) {
    const playerIdArg = args.find(arg => !isNaN(parseInt(arg)));
    if (playerIdArg) {
      const playerId = parseInt(playerIdArg);
      const currentGW = system.predictiveEngine.data.bootstrap.events.find(gw => gw.is_current)?.id || 1;
      
      console.log('\n🔮 FUTURE PREDICTION ANALYSIS:');
      
      // Single gameweek prediction
      const prediction = await system.predictPlayer(playerId, currentGW);
      if (prediction && !prediction.error) {
        console.log(`\n📊 Next Gameweek (GW${currentGW}):`);
        console.log(`Expected Points: ${prediction.expectedPoints} (${Math.round(prediction.confidence * 100)}% confidence)`);
        console.log(`Model: ${prediction.modelUsed || 'Integrated'}`);
        
        if (prediction.scenarios) {
          console.log('\n📈 Scenarios:');
          Object.entries(prediction.scenarios).forEach(([name, scenario]) => {
            console.log(`  ${name}: ${scenario.expectedPoints} pts (${Math.round(scenario.probability * 100)}% chance)`);
          });
        }
      }
      
      // Multi-gameweek outlook
      const outlook = await system.predictOutlook(playerId, 6);
      if (outlook && !outlook.error) {
        console.log(`\n🎯 6-Gameweek Outlook:`);
        console.log(`Total Expected: ${outlook.outlook.totalExpectedPoints} points`);
        console.log(`Average: ${outlook.outlook.averageExpectedPoints} PPG`);
        console.log(`Trend: ${outlook.outlook.trend.direction} (${outlook.outlook.trend.percentChange}%)`);
        console.log(`Value: ${outlook.outlook.valueAssessment.rating}`);
        console.log(`\n💡 Recommendation: ${outlook.recommendation.action}`);
        console.log(`Reasoning: ${outlook.recommendation.reasoning}`);
      }
      
      return;
    }
  }
  
  // Default: generate comprehensive future predictions report
  await system.exportFutureReport();
}

module.exports = FPLFutureSystem;

if (require.main === module) {
  main().catch(console.error);
}
