'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PlayerRecommendation {
  playerId: number;
  playerName: string;
  webName: string;
  position: string;
  team: string;
  currentPrice: number;
  prediction: {
    totalExpectedPoints: number;
    averageExpected: number;
    confidence: number;
    trend: 'rising' | 'stable' | 'declining';
    nextGameweekExpected: number;
  };
  risk: {
    overallScore: number;
    category: string;
    primaryConcerns: string[];
    suitabilityScore: number;
  };
  recommendation: {
    action: string;
    priority: string;
    confidence: number;
    reasoning: string[];
    saFlair: string;
  };
  metrics: {
    valueScore: number;
    reliabilityScore: number;
    upside: number;
    floor: number;
  };
}

interface RecommendationReport {
  recommendations: {
    strongBuys: PlayerRecommendation[];
    buys: PlayerRecommendation[];
    considerations: PlayerRecommendation[];
  };
  specialPicks: {
    braaiBankers: PlayerRecommendation[];
    biltongBudget: PlayerRecommendation[];
    klapPotential: PlayerRecommendation[];
    safeHavens: PlayerRecommendation[];
    differentials: PlayerRecommendation[];
  };
  insights: {
    totalPlayersAnalyzed: number;
    avgConfidence: number;
    topRecommendation: PlayerRecommendation;
    riskWarnings: string[];
  };
}

export default function EnhancedAnalyticsDashboard() {
  const [riskMode, setRiskMode] = useState<'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE'>('BALANCED');
  const [horizon, setHorizon] = useState(6);
  const [recommendations, setRecommendations] = useState<RecommendationReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerRecommendation | null>(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/analytics/recommendations?mode=${riskMode}&horizon=${horizon}&onlyAvailable=true&maxRecommendations=30`
      );
      const data = await response.json();
      
      if (data.success) {
        setRecommendations(data.data);
      } else {
        console.error('Failed to fetch recommendations:', data.error);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [riskMode, horizon]);

  const getRiskBadgeColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'very low': return 'bg-green-500';
      case 'low': return 'bg-green-400';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'very high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return '📈';
      case 'declining': return '📉';
      default: return '➡️';
    }
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'STRONG_BUY': return 'bg-green-600 text-white';
      case 'BUY': return 'bg-green-500 text-white';
      case 'CONSIDER': return 'bg-yellow-500 text-white';
      case 'HOLD': return 'bg-blue-500 text-white';
      case 'AVOID': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-yellow-500 bg-clip-text text-transparent">
          🇿🇦 BoetBall Advanced Analytics
        </h1>
        <p className="text-lg text-gray-600">
          Professional FPL predictions with authentic South African flair
        </p>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 Prediction Settings</CardTitle>
          <CardDescription>
            Customize your recommendations based on your risk tolerance and planning horizon
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Risk Tolerance</label>
            <Select value={riskMode} onValueChange={(value: any) => setRiskMode(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CONSERVATIVE">🛡️ Conservative</SelectItem>
                <SelectItem value="BALANCED">⚖️ Balanced</SelectItem>
                <SelectItem value="AGGRESSIVE">⚡ Aggressive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Prediction Horizon</label>
            <Select value={horizon.toString()} onValueChange={(value) => setHorizon(parseInt(value))}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4">4 Gameweeks</SelectItem>
                <SelectItem value="5">5 Gameweeks</SelectItem>
                <SelectItem value="6">6 Gameweeks</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={fetchRecommendations} 
            disabled={loading}
            className="self-end"
          >
            {loading ? '🔄 Analyzing...' : '🎯 Update Recommendations'}
          </Button>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="text-2xl">🔮 Analyzing player data...</div>
          <div className="text-gray-600 mt-2">Crunching the numbers like a proper boet!</div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations && !loading && (
        <Tabs defaultValue="special" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="special">🇿🇦 SA Special Picks</TabsTrigger>
            <TabsTrigger value="recommendations">📊 All Recommendations</TabsTrigger>
            <TabsTrigger value="insights">💡 Insights</TabsTrigger>
          </TabsList>

          {/* SA Special Picks */}
          <TabsContent value="special" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Braai Bankers */}
              <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🔥 Braai Bankers
                    <Badge variant="outline">Most Reliable</Badge>
                  </CardTitle>
                  <CardDescription>
                    Consistent as a Heritage Day braai - you can count on these okes!
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recommendations.specialPicks.braaiBankers.slice(0, 3).map((player) => (
                    <div key={player.playerId} className="p-3 bg-white rounded-lg shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold">{player.webName}</div>
                          <div className="text-sm text-gray-600">{player.position} • {player.team}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">
                            {player.prediction.averageExpected.toFixed(1)} PPG
                          </div>
                          <div className="text-sm text-gray-500">
                            {Math.round(player.prediction.confidence * 100)}% confident
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex gap-1">
                        <Badge className={`text-xs ${getRiskBadgeColor(player.risk.category)} text-white`}>
                          Risk: {player.risk.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          £{player.currentPrice}m
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Biltong Budget */}
              <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🥩 Biltong Budget
                    <Badge variant="outline">Best Value</Badge>
                  </CardTitle>
                  <CardDescription>
                    Better value than biltong at a rugby match - maximum bang for your buck!
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recommendations.specialPicks.biltongBudget.slice(0, 3).map((player) => (
                    <div key={player.playerId} className="p-3 bg-white rounded-lg shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold">{player.webName}</div>
                          <div className="text-sm text-gray-600">{player.position} • {player.team}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">
                            {player.metrics.valueScore.toFixed(1)} PPM
                          </div>
                          <div className="text-sm text-gray-500">
                            £{player.currentPrice}m
                          </div>
                        </div>
                      </div>
                      <div className="mt-2">
                        <Badge className="text-xs bg-green-500 text-white">
                          Value Beast
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Klap Potential */}
              <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    💥 Klap Potential
                    <Badge variant="outline">High Ceiling</Badge>
                  </CardTitle>
                  <CardDescription>
                    These ou toppies can deliver a proper klap when you least expect it!
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recommendations.specialPicks.klapPotential.slice(0, 3).map((player) => (
                    <div key={player.playerId} className="p-3 bg-white rounded-lg shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold">{player.webName}</div>
                          <div className="text-sm text-gray-600">{player.position} • {player.team}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-purple-600">
                            {player.metrics.upside} upside
                          </div>
                          <div className="text-sm text-gray-500">
                            Floor: {player.metrics.floor}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2">
                        <Badge className="text-xs bg-purple-500 text-white">
                          High Ceiling
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* All Recommendations */}
          <TabsContent value="recommendations" className="space-y-6">
            
            {/* Strong Buys */}
            {recommendations.recommendations.strongBuys.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🚀 Strong Buy Recommendations
                    <Badge className="bg-green-600 text-white">
                      {recommendations.recommendations.strongBuys.length} players
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    High-confidence picks with exceptional expected returns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendations.recommendations.strongBuys.map((player) => (
                      <PlayerRecommendationCard 
                        key={player.playerId} 
                        player={player}
                        onClick={() => setSelectedPlayer(player)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Buys */}
            {recommendations.recommendations.buys.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    💪 Buy Recommendations  
                    <Badge className="bg-blue-600 text-white">
                      {recommendations.recommendations.buys.length} players
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Solid picks with strong expected returns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendations.recommendations.buys.slice(0, 6).map((player) => (
                      <PlayerRecommendationCard 
                        key={player.playerId} 
                        player={player}
                        onClick={() => setSelectedPlayer(player)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Insights */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Summary Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>📊 Analysis Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {recommendations.insights.totalPlayersAnalyzed}
                      </div>
                      <div className="text-sm text-gray-600">Players Analyzed</div>
                    </div>
                    
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round(recommendations.insights.avgConfidence * 100)}%
                      </div>
                      <div className="text-sm text-gray-600">Avg Confidence</div>
                    </div>
                  </div>
                  
                  {recommendations.insights.riskWarnings.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-orange-600">⚠️ Risk Warnings</h4>
                      {recommendations.insights.riskWarnings.map((warning, idx) => (
                        <div key={idx} className="text-sm p-2 bg-orange-50 border border-orange-200 rounded">
                          {warning}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top Recommendation */}
              {recommendations.insights.topRecommendation && (
                <Card>
                  <CardHeader>
                    <CardTitle>🏆 Top Recommendation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PlayerRecommendationCard 
                      player={recommendations.insights.topRecommendation}
                      onClick={() => setSelectedPlayer(recommendations.insights.topRecommendation)}
                      featured={true}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Player Detail Modal */}
      {selectedPlayer && (
        <PlayerDetailModal 
          player={selectedPlayer} 
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  );
}

interface PlayerCardProps {
  player: PlayerRecommendation;
  onClick: () => void;
  featured?: boolean;
}

function PlayerRecommendationCard({ player, onClick, featured = false }: PlayerCardProps) {
  const trendIcon = getTrendIcon(player.prediction.trend);
  
  return (
    <div 
      className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-lg ${
        featured ? 'border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50' : 'border-gray-200 bg-white'
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="font-semibold text-lg">{player.webName}</div>
          <div className="text-sm text-gray-600">{player.position} • {player.team} • £{player.currentPrice}m</div>
        </div>
        <Badge className={getActionBadgeColor(player.recommendation.action)}>
          {player.recommendation.action.replace('_', ' ')}
        </Badge>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Next {horizon} GWs:</span>
          <span className="font-bold text-green-600">
            {player.prediction.totalExpectedPoints.toFixed(1)} pts {trendIcon}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Avg per GW:</span>
          <span className="font-semibold">
            {player.prediction.averageExpected.toFixed(1)} pts
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Confidence:</span>
          <Badge variant="outline">
            {Math.round(player.prediction.confidence * 100)}%
          </Badge>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Risk Level:</span>
          <Badge className={`text-xs ${getRiskBadgeColor(player.risk.category)} text-white`}>
            {player.risk.category}
          </Badge>
        </div>
      </div>
      
      {featured && (
        <div className="mt-3 p-2 bg-yellow-100 rounded text-sm italic">
          {player.recommendation.saFlair}
        </div>
      )}
    </div>
  );
}

function PlayerDetailModal({ player, onClose }: { player: PlayerRecommendation; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{player.playerName}</h2>
              <p className="text-gray-600">{player.position} • {player.team} • £{player.currentPrice}m</p>
            </div>
            <Button variant="outline" onClick={onClose}>✕</Button>
          </div>

          {/* SA Flair */}
          <div className="p-4 bg-gradient-to-r from-green-100 to-yellow-100 rounded-lg">
            <div className="font-medium text-green-800">💬 Boet's Take:</div>
            <div className="italic text-green-700 mt-1">{player.recommendation.saFlair}</div>
          </div>

          {/* Predictions */}
          <Card>
            <CardHeader>
              <CardTitle>🔮 Future Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-blue-50 rounded">
                  <div className="text-xl font-bold text-blue-600">
                    {player.prediction.totalExpectedPoints.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Total Expected</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded">
                  <div className="text-xl font-bold text-green-600">
                    {player.prediction.averageExpected.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Per Gameweek</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">📈 Form Trend: {getTrendIcon(player.prediction.trend)} {player.prediction.trend}</h4>
                <h4 className="font-semibold">🎯 Confidence: {Math.round(player.prediction.confidence * 100)}%</h4>
              </div>
            </CardContent>
          </Card>

          {/* Risk Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>⚠️ Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Overall Risk:</span>
                    <Badge className={`${getRiskBadgeColor(player.risk.category)} text-white`}>
                      {player.risk.category}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    Score: {player.risk.overallScore}/100
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium">Suitability for {riskMode}:</div>
                  <div className="text-lg font-bold text-blue-600">
                    {player.risk.suitabilityScore}/100
                  </div>
                </div>
              </div>
              
              {player.risk.primaryConcerns.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">⚠️ Primary Concerns:</h4>
                  <div className="space-y-1">
                    {player.risk.primaryConcerns.map((concern, idx) => (
                      <Badge key={idx} variant="outline" className="mr-2">
                        {concern}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reasoning */}
          <Card>
            <CardHeader>
              <CardTitle>💭 Why This Recommendation?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {player.recommendation.reasoning.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="text-sm">{reason}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}

// Utility functions (move to utils if needed)
function getRiskBadgeColor(category: string) {
  switch (category.toLowerCase()) {
    case 'very low': return 'bg-green-500';
    case 'low': return 'bg-green-400';
    case 'medium': return 'bg-yellow-500';
    case 'high': return 'bg-orange-500';
    case 'very high': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
}

function getTrendIcon(trend: string) {
  switch (trend) {
    case 'rising': return '📈';
    case 'declining': return '📉';
    default: return '➡️';
  }
}

function getActionBadgeColor(action: string) {
  switch (action) {
    case 'STRONG_BUY': return 'bg-green-600 text-white';
    case 'BUY': return 'bg-green-500 text-white';
    case 'CONSIDER': return 'bg-yellow-500 text-white';
    case 'HOLD': return 'bg-blue-500 text-white';
    case 'AVOID': return 'bg-red-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
}
