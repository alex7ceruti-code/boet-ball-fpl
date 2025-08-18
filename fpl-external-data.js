#!/usr/bin/env node

/**
 * FPL External Data Integration Module
 * 
 * Integrates external data sources to enhance prediction accuracy:
 * - Injury status and availability
 * - Team news and press conferences  
 * - Tactical formations and player roles
 * - Manager rotation patterns
 * 
 * Author: Boet Ball Analytics Team
 * Version: 1.0.0
 */

const https = require('https');
const fs = require('fs');

class FPLExternalDataManager {
  constructor() {
    this.injuryData = new Map();
    this.teamNews = new Map();
    this.tacticalData = new Map();
    this.managerPatterns = new Map();
    this.confidence = new Map();
  }

  /**
   * Mock injury API - in production would integrate with injury databases
   */
  async fetchInjuryData() {
    console.log('📋 Fetching injury status data...');
    
    // This would typically fetch from Premier League API, FPL Scout, etc.
    const mockInjuryData = [
      { playerId: 1, status: 'fit', probability: 0.95, lastUpdate: new Date() },
      { playerId: 2, status: 'doubt', probability: 0.6, lastUpdate: new Date() },
      { playerId: 3, status: 'injured', probability: 0.1, lastUpdate: new Date() },
      { playerId: 4, status: 'suspended', probability: 0, lastUpdate: new Date() }
    ];

    // In production, would parse from multiple sources
    for (const injury of mockInjuryData) {
      this.injuryData.set(injury.playerId, {
        status: injury.status,
        startProbability: injury.probability,
        confidence: 0.8,
        source: 'official',
        lastUpdated: injury.lastUpdate
      });
    }

    return this.injuryData;
  }

  /**
   * Simulate team news integration
   */
  async fetchTeamNews() {
    console.log('📰 Processing team news and press conferences...');
    
    // Mock team news that would come from press conferences, training reports
    const mockTeamNews = [
      {
        teamId: 1, // Arsenal
        news: [
          { type: 'rotation_hint', content: 'Manager suggests squad rotation', impact: -0.2 },
          { type: 'tactical_change', content: 'Switch to 4-3-3 formation', impact: 0.1 }
        ]
      },
      {
        teamId: 2, // Liverpool  
        news: [
          { type: 'injury_update', content: 'Key player returns to training', impact: 0.3 }
        ]
      }
    ];

    for (const team of mockTeamNews) {
      this.teamNews.set(team.teamId, {
        updates: team.news,
        confidence: 0.7,
        lastUpdated: new Date()
      });
    }

    return this.teamNews;
  }

  /**
   * Analyze manager rotation patterns
   */
  analyzeManagerPatterns(bootstrapData, fixtureData) {
    console.log('👔 Analyzing manager rotation patterns...');
    
    const teams = bootstrapData.teams;
    const fixtures = fixtureData;

    for (const team of teams) {
      // Analyze fixture congestion
      const upcomingFixtures = fixtures.filter(f => 
        (f.team_h === team.id || f.team_a === team.id) && 
        !f.finished
      ).slice(0, 6);

      // Calculate fixture density
      const fixtureDensity = this.calculateFixtureDensity(upcomingFixtures);
      
      // Mock manager rotation tendency (would be learned from historical data)
      const rotationTendency = this.getManagerRotationTendency(team.id);
      
      this.managerPatterns.set(team.id, {
        rotationTendency,
        fixtureDensity,
        congestionMultiplier: this.calculateCongestionMultiplier(fixtureDensity),
        preferredFormation: this.getPreferredFormation(team.id),
        keyPlayers: this.getKeyPlayers(team.id, bootstrapData.elements),
        rotationRisk: rotationTendency * fixtureDensity
      });
    }

    return this.managerPatterns;
  }

  /**
   * Calculate fixture density over next few weeks
   */
  calculateFixtureDensity(fixtures) {
    if (fixtures.length === 0) return 0;
    
    const timeSpan = fixtures.length > 1 ? 
      (new Date(fixtures[fixtures.length - 1].kickoff_time) - new Date(fixtures[0].kickoff_time)) / (1000 * 60 * 60 * 24) : 
      7;
      
    return fixtures.length / Math.max(timeSpan, 7);
  }

  /**
   * Get manager rotation tendency (mock data - would be ML-learned)
   */
  getManagerRotationTendency(teamId) {
    const rotationMap = {
      1: 0.3,  // Arsenal - moderate rotation
      2: 0.4,  // Liverpool - high rotation  
      3: 0.2,  // Man City - low rotation for key players
      4: 0.5,  // Chelsea - very high rotation
      5: 0.1,  // Brighton - very low rotation
    };
    
    return rotationMap[teamId] || 0.3;
  }

  /**
   * Calculate congestion multiplier
   */
  calculateCongestionMultiplier(density) {
    if (density > 0.5) return 1.5; // High congestion
    if (density > 0.3) return 1.2; // Medium congestion  
    return 1.0; // Normal schedule
  }

  /**
   * Get preferred formation (mock)
   */
  getPreferredFormation(teamId) {
    const formationMap = {
      1: '4-3-3',
      2: '4-3-3', 
      3: '4-3-3',
      4: '4-2-3-1',
      5: '3-4-2-1'
    };
    
    return formationMap[teamId] || '4-3-3';
  }

  /**
   * Identify key players less likely to be rotated
   */
  getKeyPlayers(teamId, players) {
    return players
      .filter(p => p.team === teamId)
      .sort((a, b) => (b.total_points || 0) - (a.total_points || 0))
      .slice(0, 7) // Top 7 players as "key"
      .map(p => p.id);
  }

  /**
   * Enhanced player availability prediction
   */
  predictPlayerAvailability(playerId, gameweek, options = {}) {
    let baseProbability = 0.85; // Default assumption
    let confidence = 0.5;
    const factors = {};

    // Check injury status
    if (this.injuryData.has(playerId)) {
      const injury = this.injuryData.get(playerId);
      baseProbability = injury.startProbability;
      confidence = Math.max(confidence, injury.confidence);
      factors.injury = injury.status;
    }

    // Check team rotation patterns
    const teamId = options.teamId;
    if (teamId && this.managerPatterns.has(teamId)) {
      const patterns = this.managerPatterns.get(teamId);
      
      // Key players less likely to be rotated
      if (patterns.keyPlayers.includes(playerId)) {
        baseProbability *= 1.2;
        factors.keyPlayer = true;
      } else {
        baseProbability *= (1 - patterns.rotationRisk * 0.5);
        factors.rotationRisk = patterns.rotationRisk;
      }
      
      confidence = Math.max(confidence, 0.7);
    }

    // Check team news impact
    if (teamId && this.teamNews.has(teamId)) {
      const news = this.teamNews.get(teamId);
      for (const update of news.updates) {
        if (update.type === 'rotation_hint') {
          baseProbability *= (1 + update.impact);
          factors.teamNews = update.content;
        }
      }
      confidence = Math.max(confidence, news.confidence);
    }

    return {
      startProbability: Math.max(0, Math.min(1, baseProbability)),
      confidence: Math.max(0.1, Math.min(1, confidence)),
      factors
    };
  }

  /**
   * Get tactical context for player
   */
  getTacticalContext(playerId, teamId) {
    if (!this.managerPatterns.has(teamId)) {
      return { formation: '4-3-3', role: 'standard', impact: 1.0 };
    }

    const patterns = this.managerPatterns.get(teamId);
    
    return {
      formation: patterns.preferredFormation,
      role: patterns.keyPlayers.includes(playerId) ? 'key' : 'rotation',
      congestionImpact: patterns.congestionMultiplier,
      rotationRisk: patterns.rotationRisk
    };
  }

  /**
   * Integration with main prediction engine
   */
  enhancePrediction(basePrediction, playerId, teamId, gameweek) {
    const availability = this.predictPlayerAvailability(playerId, gameweek, { teamId });
    const tactical = this.getTacticalContext(playerId, teamId);
    
    // Adjust prediction based on external factors
    let adjustedPrediction = basePrediction * availability.startProbability;
    
    // Tactical context adjustments
    if (tactical.role === 'key') {
      adjustedPrediction *= 1.05; // Small boost for key players
    }
    
    // Congestion impact
    adjustedPrediction *= (2 - tactical.congestionImpact) / 2; // Reduce for high congestion
    
    // Confidence adjustment
    const combinedConfidence = (basePrediction.confidence + availability.confidence) / 2;
    
    return {
      ...basePrediction,
      expectedPoints: Math.round(adjustedPrediction * 10) / 10,
      confidence: Math.round(combinedConfidence * 100) / 100,
      externalFactors: {
        startProbability: availability.startProbability,
        tacticalRole: tactical.role,
        rotationRisk: tactical.rotationRisk,
        teamNews: availability.factors.teamNews || 'None'
      }
    };
  }

  /**
   * Initialize all external data sources
   */
  async initialize(bootstrapData, fixtureData) {
    console.log('🌐 Initializing external data sources...');
    
    try {
      await this.fetchInjuryData();
      await this.fetchTeamNews();
      this.analyzeManagerPatterns(bootstrapData, fixtureData);
      
      console.log(`✅ Loaded injury data for ${this.injuryData.size} players`);
      console.log(`✅ Processed team news for ${this.teamNews.size} teams`);
      console.log(`✅ Analyzed rotation patterns for ${this.managerPatterns.size} teams`);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize external data:', error.message);
      return false;
    }
  }

  /**
   * Export external data summary
   */
  exportSummary() {
    return {
      injuryUpdates: Array.from(this.injuryData.entries()).map(([id, data]) => ({
        playerId: id,
        status: data.status,
        startProbability: data.startProbability,
        lastUpdated: data.lastUpdated
      })),
      
      teamNews: Array.from(this.teamNews.entries()).map(([id, data]) => ({
        teamId: id,
        updates: data.updates.length,
        lastUpdated: data.lastUpdated
      })),
      
      rotationRisks: Array.from(this.managerPatterns.entries()).map(([id, data]) => ({
        teamId: id,
        rotationTendency: data.rotationTendency,
        fixtureDensity: data.fixtureDensity,
        overallRisk: data.rotationRisk
      }))
    };
  }
}

module.exports = FPLExternalDataManager;
