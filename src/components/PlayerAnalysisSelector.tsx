'use client';

import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, BarChart3, Users, DollarSign, Activity, Calendar, AlertCircle } from 'lucide-react';

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

interface PlayerAnalysisReport {
  playerInfo: {
    id: number;
    name: string;
    webName: string;
    team: string;
    position: string;
    price: string;
    ownership: string;
  };
  performance: {
    totalPoints: number;
    pointsPerGame: string;
    pointsPerMillion: string;
    valueRating: string;
    form: string;
    formTrend: {
      direction: string;
      strength: string;
      percentage: number;
    };
  };
  predictive: {
    expectedPoints: string;
    consistency: string;
    fixtureRating: {
      rating: string;
      difficulty: number;
      fixtures: Array<{
        opponent: string;
        venue: string;
        difficulty: number;
        gameweek: number;
      }>;
    };
    rotationRisk: {
      level: string;
      minutesPercentage: number;
      startsPercentage: number;
    };
    priceChangeProb: string;
  };
  advanced: {
    underlyingStats: {
      expectedGoals: string;
      expectedAssists: string;
      expectedGoalsPer90: string;
      expectedAssistsPer90: string;
      ictIndex: string;
      influence: string;
      creativity: string;
      threat: string;
    };
    teamStrength: {
      overall: string;
      attack: string;
      defense: string;
    };
  };
}

const PlayerAnalysisSelector: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [teamFilter, setTeamFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<PlayerAnalysisReport[]>([]);
  const [showResults, setShowResults] = useState(false);

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
    if (selectedPlayers.length >= 6) return; // Limit to 6 players for comparison
    
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
      // Simulate calling our backend analysis (in real implementation, this would be an API call)
      const playerIds = selectedPlayers.map(p => p.id);
      
      // Mock analysis results (in real implementation, this would call the Node.js analysis tool)
      const mockResults = selectedPlayers.map(player => ({
        playerInfo: {
          id: player.id,
          name: `${player.first_name} ${player.second_name}`,
          webName: player.web_name,
          team: getTeamName(player.team),
          position: getPositionName(player.element_type),
          price: `£${(player.now_cost / 10).toFixed(1)}m`,
          ownership: `${player.selected_by_percent}%`
        },
        performance: {
          totalPoints: player.total_points,
          pointsPerGame: player.points_per_game,
          pointsPerMillion: (player.total_points / (player.now_cost / 10)).toFixed(2),
          valueRating: getValueRating(player.total_points / (player.now_cost / 10)),
          form: player.form,
          formTrend: {
            direction: 'Stable',
            strength: 'Moderate',
            percentage: Math.round(Math.random() * 20 - 10)
          }
        },
        predictive: {
          expectedPoints: (parseFloat(player.points_per_game) * 1.1).toFixed(1),
          consistency: `${Math.round(Math.random() * 40 + 60)}%`,
          fixtureRating: {
            rating: ['Excellent', 'Good', 'Average', 'Difficult'][Math.floor(Math.random() * 4)],
            difficulty: 2 + Math.random() * 2,
            fixtures: [
              { opponent: 'AVL', venue: 'H', difficulty: 2, gameweek: 2 },
              { opponent: 'LIV', venue: 'A', difficulty: 4, gameweek: 3 },
              { opponent: 'BHA', venue: 'H', difficulty: 3, gameweek: 4 }
            ]
          },
          rotationRisk: {
            level: ['Very Low', 'Low', 'Medium', 'High'][Math.floor(Math.random() * 4)],
            minutesPercentage: Math.round(Math.random() * 40 + 60),
            startsPercentage: Math.round(Math.random() * 30 + 70)
          },
          priceChangeProb: ['Rise Likely', 'Rise Possible', 'Stable', 'Fall Possible'][Math.floor(Math.random() * 4)]
        },
        advanced: {
          underlyingStats: {
            expectedGoals: (Math.random() * 5).toFixed(2),
            expectedAssists: (Math.random() * 3).toFixed(2),
            expectedGoalsPer90: (Math.random() * 0.8).toFixed(2),
            expectedAssistsPer90: (Math.random() * 0.5).toFixed(2),
            ictIndex: (Math.random() * 200).toFixed(1),
            influence: (Math.random() * 100).toFixed(1),
            creativity: (Math.random() * 100).toFixed(1),
            threat: (Math.random() * 100).toFixed(1)
          },
          teamStrength: {
            overall: ['Excellent', 'Very Good', 'Good', 'Average'][Math.floor(Math.random() * 4)],
            attack: ['Excellent', 'Very Good', 'Good', 'Average'][Math.floor(Math.random() * 4)],
            defense: ['Excellent', 'Very Good', 'Good', 'Average'][Math.floor(Math.random() * 4)]
          }
        }
      }));
      
      setAnalysisResults(mockResults);
      setShowResults(true);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const getValueRating = (pointsPerMillion: number) => {
    if (pointsPerMillion > 2.0) return 'Exceptional';
    if (pointsPerMillion > 1.5) return 'Excellent';
    if (pointsPerMillion > 1.0) return 'Good';
    if (pointsPerMillion > 0.8) return 'Fair';
    return 'Poor';
  };

  const getValueRatingColor = (rating: string) => {
    switch (rating) {
      case 'Exceptional': return 'text-purple-600 bg-purple-50';
      case 'Excellent': return 'text-green-600 bg-green-50';
      case 'Good': return 'text-blue-600 bg-blue-50';
      case 'Fair': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-red-600 bg-red-50';
    }
  };

  const getFormTrendColor = (direction: string) => {
    switch (direction) {
      case 'Improving': return 'text-green-600';
      case 'Stable': return 'text-blue-600';
      case 'Declining': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const exportResults = () => {
    const dataStr = JSON.stringify(analysisResults, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `fpl-analysis-${new Date().toISOString().split('T')[0]}.json`;
    
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
          <p className="mt-6 text-slate-600 text-lg font-medium">Loading Player Database...</p>
          <p className="mt-2 text-slate-400 text-sm">Preparing Advanced Analytics</p>
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
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-slate-900">
                Advanced Player Analytics
              </h1>
              <p className="text-slate-500 text-sm font-medium">
                Professional FPL Intelligence Report
              </p>
            </div>
          </div>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Select up to 6 players for comprehensive performance analysis and data-driven insights
          </p>
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
                <p className="text-slate-600 text-sm mt-1">Search and select players for analysis</p>
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

                {/* Debug Info */}
                <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-xs text-slate-500 flex items-center justify-between">
                    <span>Database: {players.length} players loaded</span>
                    <span>Filtered: {filteredPlayers.length} results</span>
                  </div>
                  {searchTerm && (
                    <div className="text-xs text-slate-400 mt-1">
                      Search: "{searchTerm}"
                    </div>
                  )}
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
                <p className="text-slate-600 text-sm mt-1">Players chosen for analysis</p>
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
                      <span>Analyzing Players...</span>
                    </>
                  ) : (
                    <>
                      <BarChart3 className="h-5 w-5" />
                      <span>Run Advanced Analysis</span>
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

        {/* Analysis Results */}
        {showResults && (
          <div className="mt-12">
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden mb-8">
              <div className="border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                      <BarChart3 className="h-6 w-6 text-blue-600 mr-3" />
                      Professional Analysis Report
                    </h2>
                    <p className="text-slate-600 mt-1">Comprehensive player performance insights and data-driven recommendations</p>
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
                <div key={result.playerInfo.id} className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow duration-200">
                  {/* Player Header */}
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{result.playerInfo.webName}</h3>
                        <p className="text-slate-600 text-sm flex items-center space-x-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            {result.playerInfo.position}
                          </span>
                          <span>{result.playerInfo.team}</span>
                          <span>•</span>
                          <span className="font-semibold text-emerald-600">{result.playerInfo.price}</span>
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getValueRatingColor(result.performance.valueRating)}`}>
                        {result.performance.valueRating}
                      </span>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-600 text-sm font-medium">Points/Game</p>
                            <p className="text-blue-900 text-xl font-bold">{result.performance.pointsPerGame}</p>
                          </div>
                          <Activity className="h-8 w-8 text-blue-500" />
                        </div>
                      </div>
                      
                      <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-emerald-600 text-sm font-medium">Value Rating</p>
                            <p className="text-emerald-900 text-xl font-bold">{result.performance.pointsPerMillion}</p>
                          </div>
                          <TrendingUp className="h-8 w-8 text-emerald-500" />
                        </div>
                      </div>
                      
                      <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-purple-600 text-sm font-medium">Expected Pts</p>
                            <p className="text-purple-900 text-xl font-bold">{result.predictive.expectedPoints}</p>
                          </div>
                          <BarChart3 className="h-8 w-8 text-purple-500" />
                        </div>
                      </div>
                      
                      <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-amber-600 text-sm font-medium">Consistency</p>
                            <p className="text-amber-900 text-xl font-bold">{result.predictive.consistency}</p>
                          </div>
                          <Calendar className="h-8 w-8 text-amber-500" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-600 font-medium">Form Trend</span>
                        <span className={`font-bold px-3 py-1 rounded-full text-sm ${getFormTrendColor(result.performance.formTrend.direction)} bg-slate-100`}>
                          {result.performance.formTrend.direction} {result.performance.formTrend.percentage > 0 ? '+' : ''}{result.performance.formTrend.percentage}%
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-600 font-medium">Rotation Risk</span>
                        <span className="font-bold text-slate-800">{result.predictive.rotationRisk.level}</span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-600 font-medium">Fixture Rating</span>
                        <span className="font-bold text-slate-800">{result.predictive.fixtureRating.rating}</span>
                      </div>
                    </div>

                    {/* Advanced Stats */}
                    <div className="mt-6 pt-4 border-t border-slate-200">
                      <p className="text-sm font-semibold text-slate-700 mb-3">Advanced Metrics</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-2 bg-slate-50 rounded">
                          <div className="text-xs text-slate-500">Expected Goals</div>
                          <div className="font-bold text-slate-800">{result.advanced.underlyingStats.expectedGoals}</div>
                        </div>
                        <div className="text-center p-2 bg-slate-50 rounded">
                          <div className="text-xs text-slate-500">Expected Assists</div>
                          <div className="font-bold text-slate-800">{result.advanced.underlyingStats.expectedAssists}</div>
                        </div>
                        <div className="text-center p-2 bg-slate-50 rounded">
                          <div className="text-xs text-slate-500">ICT Index</div>
                          <div className="font-bold text-slate-800">{result.advanced.underlyingStats.ictIndex}</div>
                        </div>
                        <div className="text-center p-2 bg-slate-50 rounded">
                          <div className="text-xs text-slate-500">Ownership</div>
                          <div className="font-bold text-slate-800">{result.playerInfo.ownership}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Comparison Table */}
            {analysisResults.length > 1 && (
              <div className="mt-8 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center">
                    <Users className="h-5 w-5 text-slate-600 mr-2" />
                    Player Comparison Matrix
                  </h3>
                  <p className="text-slate-600 text-sm mt-1">Side-by-side performance analysis</p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-4 px-6 text-slate-700 font-semibold">Player</th>
                        <th className="text-center py-4 px-4 text-slate-700 font-semibold">Price</th>
                        <th className="text-center py-4 px-4 text-slate-700 font-semibold">PPG</th>
                        <th className="text-center py-4 px-4 text-slate-700 font-semibold">PP£M</th>
                        <th className="text-center py-4 px-4 text-slate-700 font-semibold">xPts</th>
                        <th className="text-center py-4 px-4 text-slate-700 font-semibold">Value Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysisResults.map((result, index) => (
                        <tr key={result.playerInfo.id} className={`border-b border-slate-100 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-3">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                {result.playerInfo.position}
                              </span>
                              <span className="font-semibold text-slate-900">{result.playerInfo.webName}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center font-semibold text-emerald-600">{result.playerInfo.price}</td>
                          <td className="py-4 px-4 text-center font-semibold text-slate-800">{result.performance.pointsPerGame}</td>
                          <td className="py-4 px-4 text-center font-semibold text-blue-600">{result.performance.pointsPerMillion}</td>
                          <td className="py-4 px-4 text-center font-semibold text-purple-600">{result.predictive.expectedPoints}</td>
                          <td className="py-4 px-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getValueRatingColor(result.performance.valueRating)}`}>
                              {result.performance.valueRating}
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
    </div>
  );
};

export default PlayerAnalysisSelector;
