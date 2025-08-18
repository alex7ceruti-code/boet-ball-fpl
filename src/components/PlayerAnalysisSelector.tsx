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
      const response = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/');
      const data = await response.json();
      
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-900 via-yellow-800 to-green-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-yellow-200 text-lg">Loading FPL data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-yellow-800 to-green-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">
            🔮 Advanced Player Analysis
          </h1>
          <p className="text-yellow-200 text-lg">
            Select up to 6 players for in-depth analysis and comparison
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Player Search & Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-yellow-400/20">
              <div className="flex flex-col space-y-4 mb-6">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search players by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-yellow-400/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4">
                  <select
                    value={positionFilter}
                    onChange={(e) => setPositionFilter(e.target.value)}
                    className="bg-white/5 border border-yellow-400/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
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
                    className="bg-white/5 border border-yellow-400/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
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
                <div className="space-y-2">
                  {filteredPlayers.slice(0, 50).map(player => (
                    <div
                      key={player.id}
                      onClick={() => addPlayer(player)}
                      className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-yellow-400/30"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xs px-2 py-1 bg-blue-500 text-white rounded">
                          {getPositionName(player.element_type)}
                        </span>
                        <span className="text-xs px-2 py-1 bg-gray-600 text-white rounded">
                          {getTeamName(player.team)}
                        </span>
                        <span className="text-white font-medium">{player.web_name}</span>
                        <span className="text-gray-300 text-sm">
                          {player.first_name} {player.second_name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-yellow-400 font-bold">£{(player.now_cost / 10).toFixed(1)}m</span>
                        <span className="text-sm text-gray-300">{player.selected_by_percent}%</span>
                        <span className="text-sm text-green-400">{player.total_points} pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Selected Players & Analysis */}
          <div className="space-y-6">
            {/* Selected Players */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-yellow-400/20">
              <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center">
                <Users className="mr-2" />
                Selected Players ({selectedPlayers.length}/6)
              </h3>
              
              <div className="space-y-2 mb-6">
                {selectedPlayers.map(player => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-2 bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-xs px-2 py-1 bg-blue-500 text-white rounded">
                        {getPositionName(player.element_type)}
                      </span>
                      <span className="text-white text-sm">{player.web_name}</span>
                    </div>
                    <button
                      onClick={() => removePlayer(player.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={runAnalysis}
                disabled={selectedPlayers.length === 0 || analyzing}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {analyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-5 w-5" />
                    <span>Run Analysis</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Stats */}
            {selectedPlayers.length > 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-yellow-400/20">
                <h3 className="text-lg font-bold text-yellow-400 mb-4">Quick Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Value:</span>
                    <span className="text-white font-bold">
                      £{selectedPlayers.reduce((sum, p) => sum + (p.now_cost / 10), 0).toFixed(1)}m
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Points:</span>
                    <span className="text-green-400 font-bold">
                      {selectedPlayers.reduce((sum, p) => sum + p.total_points, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Avg Points/Game:</span>
                    <span className="text-blue-400 font-bold">
                      {(selectedPlayers.reduce((sum, p) => sum + parseFloat(p.points_per_game || '0'), 0) / selectedPlayers.length).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Analysis Results */}
        {showResults && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-yellow-400">Analysis Results</h2>
              <button
                onClick={exportResults}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <DollarSign className="h-4 w-4" />
                <span>Export Data</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analysisResults.map((result) => (
                <div key={result.playerInfo.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-yellow-400/20">
                  {/* Player Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">{result.playerInfo.webName}</h3>
                      <p className="text-gray-300 text-sm">
                        {result.playerInfo.position} | {result.playerInfo.team} | {result.playerInfo.price}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${getValueRatingColor(result.performance.valueRating)}`}>
                      {result.performance.valueRating}
                    </span>
                  </div>

                  {/* Performance Metrics */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Points/Game:</span>
                      <span className="text-white font-bold">{result.performance.pointsPerGame}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-300">Points/£M:</span>
                      <span className="text-green-400 font-bold">{result.performance.pointsPerMillion}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-300">Expected Points:</span>
                      <span className="text-blue-400 font-bold">{result.predictive.expectedPoints}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-300">Form Trend:</span>
                      <span className={`font-bold ${getFormTrendColor(result.performance.formTrend.direction)}`}>
                        {result.performance.formTrend.direction} {result.performance.formTrend.percentage}%
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-300">Rotation Risk:</span>
                      <span className="text-yellow-400 font-bold">{result.predictive.rotationRisk.level}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-300">Fixture Rating:</span>
                      <span className="text-purple-400 font-bold">{result.predictive.fixtureRating.rating}</span>
                    </div>
                  </div>

                  {/* Advanced Stats */}
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-center">
                        <div className="text-gray-400">xG</div>
                        <div className="text-white font-bold">{result.advanced.underlyingStats.expectedGoals}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-400">xA</div>
                        <div className="text-white font-bold">{result.advanced.underlyingStats.expectedAssists}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-400">ICT</div>
                        <div className="text-white font-bold">{result.advanced.underlyingStats.ictIndex}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-400">Consistency</div>
                        <div className="text-white font-bold">{result.predictive.consistency}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Comparison Table */}
            {analysisResults.length > 1 && (
              <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-yellow-400/20 overflow-x-auto">
                <h3 className="text-xl font-bold text-yellow-400 mb-4">Comparison Table</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-2 text-yellow-400">Player</th>
                      <th className="text-center py-2 text-yellow-400">Price</th>
                      <th className="text-center py-2 text-yellow-400">PPG</th>
                      <th className="text-center py-2 text-yellow-400">PP£M</th>
                      <th className="text-center py-2 text-yellow-400">xPts</th>
                      <th className="text-center py-2 text-yellow-400">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysisResults.map((result) => (
                      <tr key={result.playerInfo.id} className="border-b border-white/10">
                        <td className="py-2 text-white">{result.playerInfo.webName}</td>
                        <td className="py-2 text-center text-white">{result.playerInfo.price}</td>
                        <td className="py-2 text-center text-white">{result.performance.pointsPerGame}</td>
                        <td className="py-2 text-center text-green-400">{result.performance.pointsPerMillion}</td>
                        <td className="py-2 text-center text-blue-400">{result.predictive.expectedPoints}</td>
                        <td className="py-2 text-center">
                          <span className={`px-2 py-1 rounded text-xs ${getValueRatingColor(result.performance.valueRating)}`}>
                            {result.performance.valueRating}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerAnalysisSelector;
