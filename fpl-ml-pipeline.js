#!/usr/bin/env node

/**
 * FPL Machine Learning Pipeline
 * 
 * Implements learning algorithms to improve prediction accuracy over time:
 * - Feature engineering from historical data
 * - Model training and validation
 * - Prediction accuracy tracking
 * - Automatic model updates
 * 
 * Author: Boet Ball Analytics Team
 * Version: 1.0.0
 */

const fs = require('fs');
const path = require('path');

class FPLMLPipeline {
  constructor() {
    this.models = new Map();
    this.features = new Map();
    this.predictionHistory = [];
    this.modelPerformance = new Map();
    this.featureImportance = new Map();
    
    // Model parameters
    this.config = {
      windowSize: 8, // Games to look back for features
      validationSplit: 0.2,
      learningRate: 0.01,
      regularization: 0.001,
      maxEpochs: 1000
    };
  }

  /**
   * Feature engineering from player and team data
   */
  extractFeatures(playerId, gameweek, historicalData, externalData = {}) {
    const features = {};
    const player = historicalData.bootstrap.elements.find(p => p.id === playerId);
    
    if (!player) return null;

    // Basic features
    features.price = player.now_cost / 10;
    features.ownership = parseFloat(player.selected_by_percent || '0');
    features.position = player.element_type;
    features.team = player.team;

    // Performance features
    features.totalPoints = player.total_points || 0;
    features.pointsPerGame = parseFloat(player.points_per_game || '0');
    features.form = parseFloat(player.form || '0');
    features.minutes = player.minutes || 0;
    features.starts = player.starts || 0;

    // Attacking features
    features.goals = player.goals_scored || 0;
    features.assists = player.assists || 0;
    features.xG = parseFloat(player.expected_goals || '0');
    features.xA = parseFloat(player.expected_assists || '0');
    features.bonus = player.bonus || 0;
    features.bps = parseFloat(player.bps || '0');

    // Defensive features (for DEF/GK)
    features.cleanSheets = player.clean_sheets || 0;
    features.saves = player.saves || 0;
    features.penaltiesSaved = player.penalties_saved || 0;

    // Derived features
    features.minutesPerStart = features.starts > 0 ? features.minutes / features.starts : 0;
    features.goalEfficiency = features.xG > 0 ? features.goals / features.xG : 1;
    features.assistEfficiency = features.xA > 0 ? features.assists / features.xA : 1;
    features.bonusPerGame = features.starts > 0 ? features.bonus / features.starts : 0;

    // Form momentum features
    const currentGW = gameweek;
    features.formTrend = this.calculateFormTrend(player, currentGW);
    features.consistencyScore = this.calculateConsistencyScore(player);
    features.clutchFactor = this.calculateClutchFactor(player);

    // Fixture features
    const fixture = this.getGameweekFixture(playerId, gameweek, historicalData.fixtures);
    if (fixture) {
      features.isHome = fixture.team_h === player.team ? 1 : 0;
      features.opponentStrength = this.getOpponentStrength(fixture, player.team, historicalData.teams);
      features.fixtureDifficulty = features.isHome ? fixture.team_h_difficulty : fixture.team_a_difficulty;
    }

    // External data features
    if (externalData.availability) {
      features.startProbability = externalData.availability.startProbability;
      features.rotationRisk = externalData.availability.factors.rotationRisk || 0;
    }

    if (externalData.tactical) {
      features.isKeyPlayer = externalData.tactical.role === 'key' ? 1 : 0;
      features.congestionImpact = externalData.tactical.congestionImpact || 1;
    }

    // Team form features
    features.teamForm = this.calculateTeamForm(player.team, gameweek, historicalData.fixtures);
    features.homeAdvantage = this.calculateHomeAdvantage(player.team, historicalData.fixtures);

    return features;
  }

  /**
   * Calculate form trend over recent gameweeks
   */
  calculateFormTrend(player, currentGW) {
    // Simplified - in production would use gameweek-by-gameweek data
    const form = parseFloat(player.form || '0');
    const avgPoints = parseFloat(player.points_per_game || '0');
    
    if (avgPoints === 0) return 0;
    return (form - avgPoints) / avgPoints; // Normalized form difference
  }

  /**
   * Calculate consistency score
   */
  calculateConsistencyScore(player) {
    // Estimate based on bonus point distribution
    const bonus = player.bonus || 0;
    const starts = player.starts || 1;
    const totalPoints = player.total_points || 0;
    
    if (totalPoints === 0) return 0;
    
    const bonusRatio = bonus / totalPoints;
    return Math.min(1, bonusRatio * 5); // Normalize to 0-1
  }

  /**
   * Calculate clutch performance factor
   */
  calculateClutchFactor(player) {
    // High BPS relative to points indicates clutch performances
    const bps = parseFloat(player.bps || '0');
    const totalPoints = player.total_points || 0;
    
    if (totalPoints === 0) return 0.5;
    
    const bpsPerPoint = bps / totalPoints;
    return Math.min(1, bpsPerPoint / 50); // Normalize
  }

  /**
   * Get opponent strength for fixture
   */
  getOpponentStrength(fixture, playerTeam, teams) {
    const opponentId = fixture.team_h === playerTeam ? fixture.team_a : fixture.team_h;
    const opponent = teams.find(t => t.id === opponentId);
    
    if (!opponent) return 3; // Default medium strength
    
    // Average of attack and defense strength
    return (opponent.strength_attack_home + opponent.strength_attack_away + 
            opponent.strength_defence_home + opponent.strength_defence_away) / 4;
  }

  /**
   * Calculate team form
   */
  calculateTeamForm(teamId, gameweek, fixtures) {
    const recentFixtures = fixtures
      .filter(f => (f.team_h === teamId || f.team_a === teamId) && f.finished)
      .slice(-5); // Last 5 games

    if (recentFixtures.length === 0) return 0;

    let points = 0;
    recentFixtures.forEach(f => {
      const isHome = f.team_h === teamId;
      const teamGoals = isHome ? f.team_h_score : f.team_a_score;
      const oppGoals = isHome ? f.team_a_score : f.team_h_score;
      
      if (teamGoals > oppGoals) points += 3;
      else if (teamGoals === oppGoals) points += 1;
    });

    return points / (recentFixtures.length * 3); // Normalize to 0-1
  }

  /**
   * Calculate home advantage for team
   */
  calculateHomeAdvantage(teamId, fixtures) {
    const homeFixtures = fixtures.filter(f => f.team_h === teamId && f.finished);
    const awayFixtures = fixtures.filter(f => f.team_a === teamId && f.finished);

    if (homeFixtures.length === 0 || awayFixtures.length === 0) return 0.1;

    const homePoints = this.calculateFixturePoints(homeFixtures, true);
    const awayPoints = this.calculateFixturePoints(awayFixtures, false);

    const homePPG = homePoints / homeFixtures.length;
    const awayPPG = awayPoints / awayFixtures.length;

    return (homePPG - awayPPG) / 3; // Normalized difference
  }

  /**
   * Calculate fixture points for team
   */
  calculateFixturePoints(fixtures, isHome) {
    let points = 0;
    fixtures.forEach(f => {
      const teamGoals = isHome ? f.team_h_score : f.team_a_score;
      const oppGoals = isHome ? f.team_a_score : f.team_h_score;
      
      if (teamGoals > oppGoals) points += 3;
      else if (teamGoals === oppGoals) points += 1;
    });
    return points;
  }

  /**
   * Get fixture for specific gameweek
   */
  getGameweekFixture(playerId, gameweek, fixtures) {
    const player = { team: 1 }; // Would get from data
    return fixtures.find(f => 
      f.event === gameweek && (f.team_h === player.team || f.team_a === player.team)
    );
  }

  /**
   * Simple linear regression model
   */
  trainLinearModel(features, targets) {
    const n = features.length;
    const numFeatures = Object.keys(features[0] || {}).length;
    
    // Initialize weights
    const weights = new Array(numFeatures + 1).fill(0); // +1 for bias
    
    // Gradient descent
    for (let epoch = 0; epoch < this.config.maxEpochs; epoch++) {
      let totalError = 0;
      const gradients = new Array(numFeatures + 1).fill(0);
      
      for (let i = 0; i < n; i++) {
        const featureArray = this.featuresToArray(features[i]);
        const prediction = this.predict(featureArray, weights);
        const error = prediction - targets[i];
        totalError += error * error;
        
        // Calculate gradients
        gradients[0] += error; // bias gradient
        for (let j = 0; j < numFeatures; j++) {
          gradients[j + 1] += error * featureArray[j];
        }
      }
      
      // Update weights
      for (let j = 0; j < weights.length; j++) {
        weights[j] -= this.config.learningRate * (gradients[j] / n + this.config.regularization * weights[j]);
      }
      
      // Early stopping if converged
      const mse = totalError / n;
      if (mse < 0.001) break;
    }
    
    return weights;
  }

  /**
   * Convert feature object to array
   */
  featuresToArray(featureObj) {
    return Object.values(featureObj).map(val => 
      typeof val === 'number' ? val : (val ? 1 : 0)
    );
  }

  /**
   * Make prediction with linear model
   */
  predict(featureArray, weights) {
    let prediction = weights[0]; // bias
    for (let i = 0; i < featureArray.length; i++) {
      prediction += weights[i + 1] * featureArray[i];
    }
    return Math.max(0, prediction); // Non-negative predictions
  }

  /**
   * Train position-specific models
   */
  async trainPositionModels(trainingData) {
    console.log('🤖 Training position-specific ML models...');
    
    const positionModels = new Map();
    const positions = [1, 2, 3, 4]; // GK, DEF, MID, FWD
    
    for (const position of positions) {
      console.log(`Training model for position ${position}...`);
      
      // Filter data by position
      const positionData = trainingData.filter(d => d.features.position === position);
      
      if (positionData.length < 10) {
        console.log(`Insufficient data for position ${position}, skipping...`);
        continue;
      }
      
      const features = positionData.map(d => d.features);
      const targets = positionData.map(d => d.actualPoints);
      
      // Train model
      const weights = this.trainLinearModel(features, targets);
      
      // Calculate feature importance
      const importance = this.calculateFeatureImportance(weights, features[0]);
      
      positionModels.set(position, {
        weights,
        importance,
        dataSize: positionData.length,
        trained: new Date()
      });
      
      console.log(`✅ Position ${position} model trained on ${positionData.length} samples`);
    }
    
    this.models = positionModels;
    return positionModels;
  }

  /**
   * Calculate feature importance
   */
  calculateFeatureImportance(weights, sampleFeatures) {
    const importance = {};
    const featureNames = Object.keys(sampleFeatures);
    
    for (let i = 0; i < featureNames.length; i++) {
      importance[featureNames[i]] = Math.abs(weights[i + 1]); // Skip bias weight
    }
    
    // Normalize to percentages
    const total = Object.values(importance).reduce((sum, val) => sum + val, 0);
    if (total > 0) {
      for (const feature in importance) {
        importance[feature] = Math.round((importance[feature] / total) * 100);
      }
    }
    
    return importance;
  }

  /**
   * Make ML-enhanced prediction
   */
  predictWithML(playerId, gameweek, historicalData, externalData = {}) {
    const features = this.extractFeatures(playerId, gameweek, historicalData, externalData);
    if (!features) return null;
    
    const position = features.position;
    const model = this.models.get(position);
    
    if (!model) {
      // Fallback to simple heuristic if no model trained
      return this.fallbackPrediction(features);
    }
    
    const featureArray = this.featuresToArray(features);
    const mlPrediction = this.predict(featureArray, model.weights);
    
    // Combine with confidence based on model data size
    const confidence = Math.min(0.9, model.dataSize / 100);
    
    return {
      expectedPoints: Math.round(mlPrediction * 10) / 10,
      confidence: Math.round(confidence * 100) / 100,
      modelUsed: `Position_${position}_ML`,
      features: features,
      featureImportance: model.importance
    };
  }

  /**
   * Fallback prediction when no ML model available
   */
  fallbackPrediction(features) {
    // Simple heuristic based on form and fixture
    let prediction = features.pointsPerGame || 0;
    
    // Adjust for form
    if (features.form > features.pointsPerGame) {
      prediction *= 1.2;
    } else if (features.form < features.pointsPerGame * 0.8) {
      prediction *= 0.8;
    }
    
    // Adjust for fixture difficulty
    const difficultyAdjustment = (6 - features.fixtureDifficulty) / 4;
    prediction *= difficultyAdjustment;
    
    return {
      expectedPoints: Math.round(prediction * 10) / 10,
      confidence: 0.4,
      modelUsed: 'Heuristic_Fallback',
      features: features
    };
  }

  /**
   * Track prediction accuracy
   */
  recordPrediction(playerId, gameweek, prediction, actualPoints) {
    const record = {
      playerId,
      gameweek,
      predicted: prediction.expectedPoints,
      actual: actualPoints,
      error: Math.abs(prediction.expectedPoints - actualPoints),
      confidence: prediction.confidence,
      timestamp: new Date(),
      modelUsed: prediction.modelUsed
    };
    
    this.predictionHistory.push(record);
    
    // Update model performance metrics
    this.updateModelPerformance(prediction.modelUsed, record);
  }

  /**
   * Update model performance tracking
   */
  updateModelPerformance(modelName, record) {
    if (!this.modelPerformance.has(modelName)) {
      this.modelPerformance.set(modelName, {
        totalPredictions: 0,
        totalError: 0,
        totalSquaredError: 0,
        accuracyWithin1: 0,
        accuracyWithin2: 0
      });
    }
    
    const perf = this.modelPerformance.get(modelName);
    perf.totalPredictions++;
    perf.totalError += record.error;
    perf.totalSquaredError += record.error * record.error;
    
    if (record.error <= 1) perf.accuracyWithin1++;
    if (record.error <= 2) perf.accuracyWithin2++;
    
    this.modelPerformance.set(modelName, perf);
  }

  /**
   * Get model performance summary
   */
  getPerformanceSummary() {
    const summary = {};
    
    for (const [modelName, perf] of this.modelPerformance.entries()) {
      if (perf.totalPredictions > 0) {
        summary[modelName] = {
          predictions: perf.totalPredictions,
          meanAbsoluteError: Math.round((perf.totalError / perf.totalPredictions) * 100) / 100,
          rootMeanSquaredError: Math.round(Math.sqrt(perf.totalSquaredError / perf.totalPredictions) * 100) / 100,
          accuracyWithin1Point: Math.round((perf.accuracyWithin1 / perf.totalPredictions) * 100),
          accuracyWithin2Points: Math.round((perf.accuracyWithin2 / perf.totalPredictions) * 100)
        };
      }
    }
    
    return summary;
  }

  /**
   * Export ML pipeline state
   */
  exportState(outputDir = './fpl-ml-models') {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const state = {
      models: Object.fromEntries(this.models.entries()),
      performance: Object.fromEntries(this.modelPerformance.entries()),
      config: this.config,
      exported: new Date().toISOString(),
      predictionCount: this.predictionHistory.length
    };

    fs.writeFileSync(
      path.join(outputDir, 'ml-state.json'),
      JSON.stringify(state, null, 2)
    );

    console.log(`✅ ML pipeline state exported to: ${outputDir}`);
    return state;
  }

  /**
   * Load ML pipeline state
   */
  loadState(filePath) {
    try {
      const state = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      this.models = new Map(Object.entries(state.models || {}));
      this.modelPerformance = new Map(Object.entries(state.performance || {}));
      this.config = { ...this.config, ...state.config };
      
      console.log(`✅ ML pipeline state loaded from: ${filePath}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to load ML state:', error.message);
      return false;
    }
  }
}

module.exports = FPLMLPipeline;
