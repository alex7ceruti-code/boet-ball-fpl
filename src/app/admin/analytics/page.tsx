'use client';

import { useState, useEffect } from 'react';

interface AnalyticsData {
  summary: {
    totalPlayers: number;
    avgOwnership: number;
    avgPrice: number;
  };
  recommendations: {
    differentials: Array<any>;
    hotForm: Array<any>;
    valuePlays: Array<any>;
    bonusMagnets: Array<any>;
  };
  playerAnalyses: Array<any>;
}

interface PlayerAnalysis {
  player: {
    id: number;
    name: string;
    position: string;
    team: string;
    price: number;
    ownership: number;
  };
  performance: {
    totalPoints: number;
    pointsPerGame: number;
    form: number;
    minutes: number;
    starts: number;
    bonus: number;
  };
  advanced: {
    finishingEfficiency: any;
    bonusPotential: any;
    formAnalysis: any;
    ownershipAnalysis: any;
    priceChange: any;
    fixtures: any;
  };
  positionSpecific?: any;
}

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [filterPosition, setFilterPosition] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [error, setError] = useState<string | null>(null);

  const generateAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/analytics/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate analytics');
      }
      
      const data = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate analytics');
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = async (format: 'json' | 'csv') => {
    if (!analyticsData) return;
    
    try {
      const response = await fetch(`/api/admin/analytics/export?format=${format}`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error('Failed to export analytics');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fpl-analytics-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export analytics');
    }
  };

  const filteredPlayers = analyticsData?.playerAnalyses?.filter((player) => {
    if (filterPosition !== 'all' && player.player.position !== filterPosition) return false;
    if (filterCategory !== 'all') {
      switch (filterCategory) {
        case 'hot-form':
          return player.advanced.formAnalysis.formTrend === 'hot';
        case 'differential':
          return player.advanced.ownershipAnalysis.category === 'underowned';
        case 'overowned':
          return player.advanced.ownershipAnalysis.category === 'overowned';
        case 'price-risk':
          return player.advanced.priceChange.riskLevel === 'high';
        default:
          return true;
      }
    }
    return true;
  }) || [];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-yellow-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">🔬 Admin Analytics Dashboard</h1>
              <p className="text-green-100 mt-2">Advanced FPL data analysis and insights generation</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={generateAnalytics}
                disabled={loading}
                className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    🚀 Generate Analytics
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400 text-xl">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!analyticsData && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Analytics Generated Yet</h3>
            <p className="text-gray-600 mb-6">Click "Generate Analytics" to analyze all FPL data and generate insights</p>
            <button
              onClick={generateAnalytics}
              className="bg-gradient-to-r from-green-600 to-yellow-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow"
            >
              🚀 Start Analysis
            </button>
          </div>
        )}

        {analyticsData && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Players Analyzed</p>
                    <p className="text-3xl font-bold text-blue-600">{analyticsData.summary.totalPlayers}</p>
                  </div>
                  <div className="text-blue-500 text-3xl">📊</div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Ownership</p>
                    <p className="text-3xl font-bold text-purple-600">{analyticsData.summary.avgOwnership.toFixed(1)}%</p>
                  </div>
                  <div className="text-purple-500 text-3xl">👥</div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Price</p>
                    <p className="text-3xl font-bold text-green-600">£{analyticsData.summary.avgPrice.toFixed(1)}m</p>
                  </div>
                  <div className="text-green-500 text-3xl">💰</div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Recommendations</p>
                    <p className="text-3xl font-bold text-red-600">
                      {Object.values(analyticsData.recommendations).reduce((sum, arr) => sum + arr.length, 0)}
                    </p>
                  </div>
                  <div className="text-red-500 text-3xl">🎯</div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-lg mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex">
                  {[
                    { id: 'overview', name: 'Overview', icon: '📋' },
                    { id: 'recommendations', name: 'Recommendations', icon: '🎯' },
                    { id: 'players', name: 'Player Analysis', icon: '👥' },
                    { id: 'export', name: 'Export Data', icon: '📤' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`${
                        activeTab === tab.id
                          ? 'border-green-500 text-green-600 bg-green-50'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center space-x-2`}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.name}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">🎯 Quick Insights</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 rounded-lg">
                          <h4 className="font-bold mb-2">🔥 Hot Form Players</h4>
                          <p className="text-sm opacity-90 mb-3">Players in excellent recent form</p>
                          <div className="text-2xl font-bold">{analyticsData.recommendations.hotForm.length}</div>
                        </div>

                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg">
                          <h4 className="font-bold mb-2">💎 Differential Opportunities</h4>
                          <p className="text-sm opacity-90 mb-3">Low ownership, high performance</p>
                          <div className="text-2xl font-bold">{analyticsData.recommendations.differentials.length}</div>
                        </div>

                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-lg">
                          <h4 className="font-bold mb-2">💰 Value Plays</h4>
                          <p className="text-sm opacity-90 mb-3">Best points per million</p>
                          <div className="text-2xl font-bold">{analyticsData.recommendations.valuePlays.length}</div>
                        </div>

                        <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white p-4 rounded-lg">
                          <h4 className="font-bold mb-2">⭐ Bonus Magnets</h4>
                          <p className="text-sm opacity-90 mb-3">High bonus point probability</p>
                          <div className="text-2xl font-bold">{analyticsData.recommendations.bonusMagnets.length}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recommendations Tab */}
                {activeTab === 'recommendations' && (
                  <div className="space-y-8">
                    {Object.entries(analyticsData.recommendations).map(([category, players]) => (
                      <div key={category}>
                        <h3 className="text-lg font-semibold mb-4 capitalize flex items-center">
                          {category === 'hotForm' && '🔥 Hot Form'}
                          {category === 'differentials' && '💎 Differentials'}
                          {category === 'valuePlays' && '💰 Value Plays'}
                          {category === 'bonusMagnets' && '⭐ Bonus Magnets'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {players.slice(0, 6).map((player: any, index: number) => (
                            <div key={player.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-semibold text-gray-900">{player.name}</h4>
                                  <p className="text-sm text-gray-600">{player.position} - {player.team}</p>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-green-600">£{player.price}m</div>
                                  <div className="text-xs text-gray-500">{player.ownership}% owned</div>
                                </div>
                              </div>
                              <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{player.reason}</p>
                            </div>
                          ))}
                        </div>
                        {players.length === 0 && (
                          <p className="text-gray-500 italic">No players found in this category</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Players Tab */}
                {activeTab === 'players' && (
                  <div>
                    {/* Filters */}
                    <div className="flex flex-wrap gap-4 mb-6">
                      <select
                        value={filterPosition}
                        onChange={(e) => setFilterPosition(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="all">All Positions</option>
                        <option value="GKP">Goalkeepers</option>
                        <option value="DEF">Defenders</option>
                        <option value="MID">Midfielders</option>
                        <option value="FWD">Forwards</option>
                      </select>

                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="all">All Categories</option>
                        <option value="hot-form">Hot Form</option>
                        <option value="differential">Differentials</option>
                        <option value="overowned">Overowned</option>
                        <option value="price-risk">Price Risk</option>
                      </select>

                      <div className="flex-1 text-right">
                        <span className="text-sm text-gray-600">
                          Showing {filteredPlayers.length} of {analyticsData.playerAnalyses.length} players
                        </span>
                      </div>
                    </div>

                    {/* Player Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full bg-white rounded-lg shadow">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Player</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Price</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Own%</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Form</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">PPG</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Category</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Analysis</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {filteredPlayers.slice(0, 50).map((player) => (
                            <tr key={player.player.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <div>
                                  <div className="font-semibold text-gray-900">{player.player.name}</div>
                                  <div className="text-sm text-gray-600">{player.player.position} - {player.player.team}</div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm">£{player.player.price}m</td>
                              <td className="px-4 py-3 text-sm">{player.player.ownership.toFixed(1)}%</td>
                              <td className="px-4 py-3 text-sm">{player.performance.form}</td>
                              <td className="px-4 py-3 text-sm">{player.performance.pointsPerGame}</td>
                              <td className="px-4 py-3">
                                <div className="flex flex-wrap gap-1">
                                  {player.advanced.formAnalysis.formTrend === 'hot' && (
                                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">🔥</span>
                                  )}
                                  {player.advanced.ownershipAnalysis.category === 'underowned' && (
                                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">💎</span>
                                  )}
                                  {player.advanced.priceChange.riskLevel === 'high' && (
                                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">⚠️</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => setSelectedPlayer(player)}
                                  className="text-green-600 hover:text-green-900 text-sm font-medium"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Export Tab */}
                {activeTab === 'export' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">📤 Export Analytics Data</h3>
                      <p className="text-gray-600 mb-6">Download the complete analytics dataset for further analysis or reporting.</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border border-gray-200 rounded-lg p-6">
                          <h4 className="font-semibold mb-2">JSON Format</h4>
                          <p className="text-sm text-gray-600 mb-4">Complete structured data including all analytics and recommendations</p>
                          <button
                            onClick={() => exportAnalytics('json')}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                          >
                            📄 Download JSON
                          </button>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-6">
                          <h4 className="font-semibold mb-2">CSV Format</h4>
                          <p className="text-sm text-gray-600 mb-4">Spreadsheet-friendly format for Excel analysis</p>
                          <button
                            onClick={() => exportAnalytics('csv')}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                          >
                            📊 Download CSV
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Player Detail Modal */}
        {selectedPlayer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedPlayer.player.name}</h2>
                    <p className="text-gray-600">{selectedPlayer.player.position} - {selectedPlayer.player.team}</p>
                  </div>
                  <button
                    onClick={() => setSelectedPlayer(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Basic Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">📋 Basic Info</h3>
                    <div className="space-y-1 text-sm">
                      <div>Price: £{selectedPlayer.player.price}m</div>
                      <div>Ownership: {selectedPlayer.player.ownership.toFixed(1)}%</div>
                      <div>Total Points: {selectedPlayer.performance.totalPoints}</div>
                      <div>PPG: {selectedPlayer.performance.pointsPerGame}</div>
                    </div>
                  </div>

                  {/* Form Analysis */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">📈 Form Analysis</h3>
                    <div className="space-y-1 text-sm">
                      <div>Form: {selectedPlayer.performance.form}</div>
                      <div>Trend: {selectedPlayer.advanced.formAnalysis.formTrend}</div>
                      <div>Recommendation: {selectedPlayer.advanced.formAnalysis.analysis.recommendation}</div>
                    </div>
                  </div>

                  {/* Efficiency */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">🎯 Efficiency</h3>
                    <div className="space-y-1 text-sm">
                      <div>Goal Eff: {selectedPlayer.advanced.finishingEfficiency.goalEfficiency}%</div>
                      <div>Assist Eff: {selectedPlayer.advanced.finishingEfficiency.assistEfficiency}%</div>
                      <div>Combined: {selectedPlayer.advanced.finishingEfficiency.combinedEfficiency}%</div>
                    </div>
                  </div>

                  {/* Ownership Analysis */}
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">👥 Ownership</h3>
                    <div className="space-y-1 text-sm">
                      <div>Category: {selectedPlayer.advanced.ownershipAnalysis.category}</div>
                      <div>Differential: {selectedPlayer.advanced.ownershipAnalysis.differentialPotential}</div>
                      <div>Template Risk: {selectedPlayer.advanced.ownershipAnalysis.templateRisk}</div>
                    </div>
                  </div>

                  {/* Bonus Potential */}
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">⭐ Bonus</h3>
                    <div className="space-y-1 text-sm">
                      <div>BPS/Game: {selectedPlayer.advanced.bonusPotential.bpsPerGame}</div>
                      <div>Any Bonus: {selectedPlayer.advanced.bonusPotential.probability.anyBonus.toFixed(1)}%</div>
                      <div>Category: {selectedPlayer.advanced.bonusPotential.category}</div>
                    </div>
                  </div>

                  {/* Price Analysis */}
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">💰 Price</h3>
                    <div className="space-y-1 text-sm">
                      <div>Net Transfers: {selectedPlayer.advanced.priceChange.netTransfers.toLocaleString()}</div>
                      <div>Risk Level: {selectedPlayer.advanced.priceChange.riskLevel}</div>
                      <div>Recommendation: {selectedPlayer.advanced.priceChange.recommendation}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
