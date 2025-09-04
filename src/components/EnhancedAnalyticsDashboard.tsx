'use client';

import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, BarChart3, Users, DollarSign, Activity, Calendar, AlertCircle, Shield, Target, Brain, HelpCircle } from 'lucide-react';
import MLAnalyticsGuide from './analytics/MLAnalyticsGuide';

interface Player {
  id: number;
  web_name: string;
  first_name: string;
  second_name: string;
  team: number;
  element_type: number;
  now_cost: number;
  selected_by_percent: string;
  total_points: number;
  form: string;
  points_per_game: string;
}

interface Team {
  id: number;
  name: string;
  short_name: string;
}

interface PredictionResult {
  playerId: number;
  playerName: string;
  team: string;
  position: string;
  currentPrice: number;
  predictions: {
    gameweek: number;
    predictedPoints: number;
    confidence: number;
    factors: {
      form: number;
      fixtures: number;
      underlying_stats: number;
      team_strength: number;
    };
  }[];
  totalPredictedPoints: number;
  averageConfidence: number;
  riskAssessment: {
    overallRisk: 'LOW' | 'MEDIUM' | 'HIGH';
    suitability: {
      Conservative: number;
      Balanced: number;
      Aggressive: number;
    };
    factors: {
      rotation: { risk: 'LOW' | 'MEDIUM' | 'HIGH'; score: number; };
      injury: { risk: 'LOW' | 'MEDIUM' | 'HIGH'; score: number; };
      priceChange: { risk: 'LOW' | 'MEDIUM' | 'HIGH'; score: number; };
      formVolatility: { risk: 'LOW' | 'MEDIUM' | 'HIGH'; score: number; };
    };
  };
}

const EnhancedAnalyticsDashboard: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [teamFilter, setTeamFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<PredictionResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  // New analytics settings
  const [riskTolerance, setRiskTolerance] = useState<'Conservative' | 'Balanced' | 'Aggressive'>('Balanced');
  const [predictionHorizon, setPredictionHorizon] = useState(4);
  const [showGuide, setShowGuide] = useState(false);
  
  const positions = {
    1: 'GKP',
    2: 'DEF', 
    3: 'MID',
    4: 'FWD'
  };

  useEffect(() => {
    loadFPLData();
  }, []);

  const loadFPLData = async () => {
    try {
      console.log('Loading FPL data...');
      const response = await fetch('/api/fpl?endpoint=bootstrap-static/');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log('FPL Data loaded:', {
        players: data.elements?.length || 0,
        teams: data.teams?.length || 0
      });
      
      setPlayers(data.elements || []);
      setTeams(data.teams || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load FPL data:', error);
      setLoading(false);
    }
  };

  const getTeamName = (teamId: number) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.short_name : 'Unknown';
  };

  const getPositionName = (elementType: number) => {
    return positions[elementType as keyof typeof positions] || 'Unknown';
  };

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.web_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.second_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPosition = positionFilter === 'all' || player.element_type.toString() === positionFilter;
    const matchesTeam = teamFilter === 'all' || player.team.toString() === teamFilter;
    
    return matchesSearch && matchesPosition && matchesTeam;
  });

  const addPlayer = (player: Player) => {
    if (selectedPlayers.find(p => p.id === player.id)) return;
    if (selectedPlayers.length >= 6) return;
    
    setSelectedPlayers([...selectedPlayers, player]);
  };

  const removePlayer = (playerId: number) => {
    setSelectedPlayers(selectedPlayers.filter(p => p.id !== playerId));
  };

  const runAnalysis = async () => {
    if (selectedPlayers.length === 0) return;
    
    setAnalyzing(true);
    setShowResults(false);
    
    try {
      console.log('Starting enhanced analysis with settings:', {
        riskTolerance,
        predictionHorizon,
        playerCount: selectedPlayers.length
      });

      // Call our batch prediction API with all selected players
      const playerIds = selectedPlayers.map(p => p.id);
      let results: PredictionResult[] = [];
      
      const response = await fetch('/api/analytics/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerIds: playerIds,
          config: {
            riskTolerance: riskTolerance.toUpperCase(),
            predictionHorizon: predictionHorizon,
            minConfidence: 0.6,
            useExternalData: false
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to get predictions:', response.status, errorData);
        throw new Error(`API returned ${response.status}: ${errorData.error || 'Unknown error'}`);
      }

      const apiResponse = await response.json();
      
      if (!apiResponse.success || !apiResponse.data) {
        console.error('API response indicates failure:', apiResponse);
        throw new Error(apiResponse.error || 'API response was not successful');
      }

      const predictions = apiResponse.data;
      console.log('Raw API predictions:', predictions);
      
        // Transform the API response to match our UI structure
        results = predictions.map((prediction: any) => {
          const player = selectedPlayers.find(p => p.id === prediction.playerId);
          
          // Transform risk profile to our expected format
          const riskProfile = prediction.riskProfile || { overall: 50, rotation: 50, injury: 50, priceChange: 50, formVolatility: 50 };
          const overallRiskLevel = riskProfile.overall > 60 ? 'HIGH' : riskProfile.overall > 30 ? 'MEDIUM' : 'LOW';
          
          return {
            playerId: prediction.playerId,
            playerName: prediction.playerName || player?.web_name || 'Unknown Player',
            team: prediction.team || getTeamName(player?.team || 0),
            position: prediction.position || getPositionName(player?.element_type || 0),
            currentPrice: prediction.currentPrice || (player ? player.now_cost / 10 : 0),
            predictions: prediction.predictions || [],
            totalPredictedPoints: prediction.outlookSummary?.totalExpectedPoints || 0,
            averageConfidence: prediction.outlookSummary?.confidence || 0,
            riskAssessment: {
              overallRisk: overallRiskLevel,
              suitability: {
                Conservative: prediction.recommendation?.suitableFor?.includes('CONSERVATIVE') ? 80 : 20,
                Balanced: prediction.recommendation?.suitableFor?.includes('BALANCED') ? 80 : 20,
                Aggressive: prediction.recommendation?.suitableFor?.includes('AGGRESSIVE') ? 80 : 20
              },
              factors: {
                rotation: { 
                  risk: riskProfile.rotation > 60 ? 'HIGH' : riskProfile.rotation > 30 ? 'MEDIUM' : 'LOW', 
                  score: riskProfile.rotation 
                },
                injury: { 
                  risk: riskProfile.injury > 60 ? 'HIGH' : riskProfile.injury > 30 ? 'MEDIUM' : 'LOW', 
                  score: riskProfile.injury 
                },
                priceChange: { 
                  risk: riskProfile.priceChange > 60 ? 'HIGH' : riskProfile.priceChange > 30 ? 'MEDIUM' : 'LOW', 
                  score: riskProfile.priceChange 
                },
                formVolatility: { 
                  risk: riskProfile.formVolatility > 60 ? 'HIGH' : riskProfile.formVolatility > 30 ? 'MEDIUM' : 'LOW', 
                  score: riskProfile.formVolatility 
                }
              }
            }
          };
        });
      
      console.log('Analysis completed:', results.length, 'results');
      setAnalysisResults(results);
      setShowResults(true);
      
    } catch (error) {
      console.error('Enhanced analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const getRiskColor = (risk: 'LOW' | 'MEDIUM' | 'HIGH') => {
    switch (risk) {
      case 'LOW': return 'text-green-700 bg-green-100 border-green-200';
      case 'MEDIUM': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'HIGH': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getSuitabilityColor = (score: number) => {
    if (score >= 80) return 'text-green-700 bg-green-100';
    if (score >= 60) return 'text-blue-700 bg-blue-100';
    if (score >= 40) return 'text-yellow-700 bg-yellow-100';
    return 'text-red-700 bg-red-100';
  };

  const exportResults = () => {
    const exportData = {
      analysisSettings: { riskTolerance, predictionHorizon },
      timestamp: new Date().toISOString(),
      results: analysisResults
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `enhanced-fpl-analysis-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-6 text-slate-600 text-lg font-medium">Loading Enhanced Analytics...</p>
          <p className="mt-2 text-slate-400 text-sm">Preparing ML-Powered Insights</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-slate-900">
                Enhanced Player Analytics
              </h1>
              <p className="text-slate-500 text-sm font-medium">
                ML-Powered FPL Intelligence Platform
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center space-y-4">
            <p className="text-slate-600 text-lg max-w-2xl text-center">
              Advanced predictive analytics with risk assessment and personalized recommendations
            </p>
            <button
              onClick={() => setShowGuide(true)}
              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
            >
              <HelpCircle className="h-4 w-4" />
              <span>How does this work?</span>
            </button>
          </div>
        </div>

        {/* Analytics Settings */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden mb-8">
          <div className="border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center">
              <Target className="h-5 w-5 text-blue-600 mr-2" />
              Analysis Configuration
            </h2>
            <p className="text-slate-600 text-sm mt-1">Customize your prediction parameters</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Risk Tolerance Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Conservative', 'Balanced', 'Aggressive'] as const).map(level => (
                    <button
                      key={level}
                      onClick={() => setRiskTolerance(level)}
                      className={`p-3 text-center text-sm font-medium rounded-lg border-2 transition-all ${
                        riskTolerance === level
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-1">
                        <Shield className={`h-4 w-4 ${riskTolerance === level ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span>{level}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Prediction Horizon: {predictionHorizon} Gameweeks
                </label>
                <input
                  type="range"
                  min="4"
                  max="6"
                  value={predictionHorizon}
                  onChange={(e) => setPredictionHorizon(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>4 GWs (Short)</span>
                  <span>6 GWs (Long)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Player Search & Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                  <Search className="h-5 w-5 text-slate-500 mr-2" />
                  Player Database
                </h2>
                <p className="text-slate-600 text-sm mt-1">Search and select players for ML analysis</p>
              </div>
              
              <div className="p-6">
                <div className="flex flex-col space-y-4 mb-6">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search players by name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Filters */}
                  <div className="flex flex-wrap gap-4">
                    <select
                      value={positionFilter}
                      onChange={(e) => setPositionFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Positions</option>
                      <option value="1">Goalkeepers</option>
                      <option value="2">Defenders</option>
                      <option value="3">Midfielders</option>
                      <option value="4">Forwards</option>
                    </select>

                    <select
                      value={teamFilter}
                      onChange={(e) => setTeamFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Teams</option>
                      {teams.map(team => (
                        <option key={team.id} value={team.id.toString()}>{team.short_name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Player List */}
                <div className="max-h-96 overflow-y-auto">
                  {filteredPlayers.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      {players.length === 0 ? (
                        <div>
                          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
                          <p className="text-slate-600 font-medium">No players loaded</p>
                          <p className="text-slate-500 text-sm mt-1">Check console for errors</p>
                        </div>
                      ) : (
                        <div>
                          <Search className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                          <p className="text-slate-600 font-medium">No players found</p>
                          <p className="text-slate-500 text-sm mt-1">Try adjusting your search or filters</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredPlayers.slice(0, 50).map(player => (
                        <div
                          key={player.id}
                          onClick={() => addPlayer(player)}
                          className="flex items-center justify-between p-3 bg-slate-50 hover:bg-blue-50 rounded-lg cursor-pointer transition-all duration-200 border border-transparent hover:border-blue-200 hover:shadow-sm"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded font-medium">
                              {getPositionName(player.element_type)}
                            </span>
                            <span className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded font-medium">
                              {getTeamName(player.team)}
                            </span>
                            <span className="text-slate-900 font-semibold">{player.web_name}</span>
                            <span className="text-slate-500 text-sm">
                              {player.first_name} {player.second_name}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-emerald-600 font-bold">£{(player.now_cost / 10).toFixed(1)}m</span>
                            <span className="text-sm text-slate-500">{player.selected_by_percent}%</span>
                            <span className="text-sm text-blue-600 font-semibold">{player.total_points} pts</span>
                          </div>
                        </div>
                      ))}
                      {filteredPlayers.length > 50 && (
                        <div className="text-center py-3 text-slate-400 text-sm bg-slate-50 rounded-lg mt-2">
                          <p>Showing first 50 of <span className="font-semibold text-slate-600">{filteredPlayers.length}</span> players</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Selected Players & Analysis */}
          <div className="space-y-6">
            {/* Selected Players */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                  <Users className="h-5 w-5 text-slate-500 mr-2" />
                  Selected Players ({selectedPlayers.length}/6)
                </h3>
                <p className="text-slate-600 text-sm mt-1">Players for ML analysis</p>
              </div>
              
              <div className="p-6">
                {selectedPlayers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p className="text-slate-500">No players selected</p>
                    <p className="text-slate-400 text-sm mt-1">Click on players from the database to add them</p>
                  </div>
                ) : (
                  <div className="space-y-3 mb-6">
                    {selectedPlayers.map(player => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded font-medium">
                            {getPositionName(player.element_type)}
                          </span>
                          <span className="text-slate-900 font-semibold">{player.web_name}</span>
                          <span className="text-slate-500 text-sm">£{(player.now_cost / 10).toFixed(1)}m</span>
                        </div>
                        <button
                          onClick={() => removePlayer(player.id)}
                          className="text-red-500 hover:text-red-600 text-sm font-medium transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={runAnalysis}
                  disabled={selectedPlayers.length === 0 || analyzing}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg disabled:shadow-none"
                >
                  {analyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Running ML Analysis...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="h-5 w-5" />
                      <span>Run Enhanced Analysis</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            {selectedPlayers.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                    <TrendingUp className="h-5 w-5 text-slate-500 mr-2" />
                    Quick Overview
                  </h3>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <span className="text-slate-700 font-medium flex items-center">
                        <DollarSign className="h-4 w-4 text-emerald-600 mr-2" />
                        Total Value
                      </span>
                      <span className="text-emerald-700 font-bold text-lg">
                        £{selectedPlayers.reduce((sum, p) => sum + (p.now_cost / 10), 0).toFixed(1)}m
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="text-slate-700 font-medium flex items-center">
                        <Activity className="h-4 w-4 text-blue-600 mr-2" />
                        Total Points
                      </span>
                      <span className="text-blue-700 font-bold text-lg">
                        {selectedPlayers.reduce((sum, p) => sum + p.total_points, 0)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <span className="text-slate-700 font-medium flex items-center">
                        <BarChart3 className="h-4 w-4 text-purple-600 mr-2" />
                        Avg PPG
                      </span>
                      <span className="text-purple-700 font-bold text-lg">
                        {(selectedPlayers.reduce((sum, p) => sum + parseFloat(p.points_per_game || '0'), 0) / selectedPlayers.length).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Analysis Results */}
        {showResults && (
          <div className="mt-12">
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden mb-8">
              <div className="border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                      <Brain className="h-6 w-6 text-blue-600 mr-3" />
                      Enhanced ML Analysis Report
                    </h2>
                    <p className="text-slate-600 mt-1">Advanced predictive insights with risk assessment</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-slate-500">
                      <span>Risk Level: <span className="font-semibold text-slate-700">{riskTolerance}</span></span>
                      <span>Horizon: <span className="font-semibold text-slate-700">{predictionHorizon} GWs</span></span>
                    </div>
                  </div>
                  <button
                    onClick={exportResults}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 font-medium shadow-lg transition-all duration-200"
                  >
                    <DollarSign className="h-4 w-4" />
                    <span>Export Report</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {analysisResults.map((result) => (
                <div key={result.playerId} className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow duration-200">
                  {/* Player Header */}
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{result.playerName}</h3>
                        <p className="text-slate-600 text-sm flex items-center space-x-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            {result.position}
                          </span>
                          <span>{result.team}</span>
                          <span>•</span>
                          <span className="font-semibold text-emerald-600">£{result.currentPrice}m</span>
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRiskColor(result.riskAssessment.overallRisk)}`}>
                        {result.riskAssessment.overallRisk} RISK
                      </span>
                    </div>
                  </div>

                  {/* ML Predictions */}
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-purple-600 text-sm font-medium">Predicted Points</p>
                            <p className="text-purple-900 text-xl font-bold">{result.totalPredictedPoints.toFixed(1)}</p>
                          </div>
                          <Brain className="h-8 w-8 text-purple-500" />
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-600 text-sm font-medium">Confidence</p>
                            <p className="text-blue-900 text-xl font-bold">{(result.averageConfidence * 100).toFixed(0)}%</p>
                          </div>
                          <Target className="h-8 w-8 text-blue-500" />
                        </div>
                      </div>
                    </div>

                    {/* Risk Assessment */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">Risk Suitability</h4>
                      <div className="space-y-2">
                        {Object.entries(result.riskAssessment.suitability).map(([profile, score]) => (
                          <div key={profile} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                            <span className="text-sm text-slate-600">{profile}</span>
                            <span className={`text-sm font-bold px-2 py-1 rounded ${getSuitabilityColor(score)}`}>
                              {score}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Risk Factors */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-slate-700">Risk Factors</h4>
                      {Object.entries(result.riskAssessment.factors).map(([factor, data]) => (
                        <div key={factor} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                          <span className="text-slate-600 font-medium capitalize">
                            {factor.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRiskColor(data.risk)}`}>
                            {data.risk}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Enhanced Comparison Table */}
            {analysisResults.length > 1 && (
              <div className="mt-8 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center">
                    <Users className="h-5 w-5 text-slate-600 mr-2" />
                    Enhanced Player Comparison
                  </h3>
                  <p className="text-slate-600 text-sm mt-1">ML predictions and risk assessment comparison</p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-4 px-6 text-slate-700 font-semibold">Player</th>
                        <th className="text-center py-4 px-4 text-slate-700 font-semibold">Price</th>
                        <th className="text-center py-4 px-4 text-slate-700 font-semibold">Predicted Pts</th>
                        <th className="text-center py-4 px-4 text-slate-700 font-semibold">Confidence</th>
                        <th className="text-center py-4 px-4 text-slate-700 font-semibold">Risk Level</th>
                        <th className="text-center py-4 px-4 text-slate-700 font-semibold">Suitability</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysisResults.map((result, index) => (
                        <tr key={result.playerId} className={`border-b border-slate-100 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-3">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                {result.position}
                              </span>
                              <span className="font-semibold text-slate-900">{result.playerName}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center font-semibold text-emerald-600">£{result.currentPrice}m</td>
                          <td className="py-4 px-4 text-center font-semibold text-purple-600">{result.totalPredictedPoints.toFixed(1)}</td>
                          <td className="py-4 px-4 text-center font-semibold text-blue-600">{(result.averageConfidence * 100).toFixed(0)}%</td>
                          <td className="py-4 px-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRiskColor(result.riskAssessment.overallRisk)}`}>
                              {result.riskAssessment.overallRisk}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={`px-3 py-1 rounded text-xs font-bold ${getSuitabilityColor(result.riskAssessment.suitability[riskTolerance])}`}>
                              {result.riskAssessment.suitability[riskTolerance]}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* ML Analytics Guide Modal */}
      <MLAnalyticsGuide 
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
      />
    </div>
  );
};

export default EnhancedAnalyticsDashboard;
