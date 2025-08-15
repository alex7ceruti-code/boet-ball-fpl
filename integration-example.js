// INTEGRATION EXAMPLE: Using FPL Advanced Analytics in Boet Ball React App

// 1. ENHANCED PLAYERS PAGE WITH ANALYTICS
// File: src/app/players/page.tsx (enhancement example)

import { useEffect, useState } from 'react';
import FPLAdvancedAnalytics from '../lib/fpl-advanced-analytics.js';

function EnhancedPlayersPage() {
  const [players, setPlayers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initializeAnalytics() {
      try {
        const analyticsEngine = new FPLAdvancedAnalytics();
        await analyticsEngine.initialize();
        
        const recs = analyticsEngine.generateRecommendations();
        setAnalytics(analyticsEngine);
        setRecommendations(recs);
        
        // Enhance existing player data with analytics
        const enhancedPlayers = await enhancePlayerData(players, analyticsEngine);
        setPlayers(enhancedPlayers);
      } catch (error) {
        console.error('Failed to initialize analytics:', error);
      } finally {
        setLoading(false);
      }
    }

    initializeAnalytics();
  }, []);

  if (loading) return <div>Loading advanced analytics...</div>;

  return (
    <div className="players-page">
      {/* Recommendations Section */}
      <div className="recommendations-section">
        <h2 className="text-2xl font-bold mb-4">🎯 Smart Picks</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Hot Form Players */}
          <RecommendationCard 
            title="🔥 Hot Form" 
            players={recommendations?.hotForm?.slice(0, 3) || []}
            bgColor="from-red-500 to-orange-500"
          />
          
          {/* Differential Picks */}
          <RecommendationCard 
            title="💎 Differentials" 
            players={recommendations?.differentials?.slice(0, 3) || []}
            bgColor="from-purple-500 to-pink-500"
          />
          
          {/* Value Plays */}
          <RecommendationCard 
            title="💰 Value Plays" 
            players={recommendations?.valuePlays?.slice(0, 3) || []}
            bgColor="from-green-500 to-emerald-500"
          />
          
          {/* Bonus Magnets */}
          <RecommendationCard 
            title="⭐ Bonus Magnets" 
            players={recommendations?.bonusMagnets?.slice(0, 3) || []}
            bgColor="from-yellow-500 to-amber-500"
          />
        </div>
      </div>

      {/* Enhanced Player Table */}
      <div className="players-table">
        <h2 className="text-2xl font-bold mb-4">All Players</h2>
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg shadow">
            <thead className="bg-gradient-to-r from-green-600 to-yellow-500">
              <tr>
                <th>Player</th>
                <th>Price</th>
                <th>Form</th>
                <th>PPG</th>
                <th>Own%</th>
                <th>Efficiency</th>
                <th>Bonus%</th>
                <th>Category</th>
                <th>Analysis</th>
              </tr>
            </thead>
            <tbody>
              {players.map(player => (
                <PlayerRow key={player.id} player={player} analytics={analytics} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 2. ENHANCED PLAYER ROW WITH ANALYTICS
function PlayerRow({ player, analytics }) {
  const [analysis, setAnalysis] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (analytics) {
      const playerAnalysis = analytics.analyzePlayer(player.id);
      setAnalysis(playerAnalysis);
    }
  }, [player.id, analytics]);

  if (!analysis) return <tr><td colSpan="9">Loading...</td></tr>;

  const getBadgeColor = (category) => {
    switch (category) {
      case 'underowned': return 'bg-purple-500';
      case 'overowned': return 'bg-red-500';
      case 'hot': return 'bg-orange-500';
      case 'cold': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <>
      <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => setShowDetails(!showDetails)}>
        <td className="px-4 py-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold">{analysis.player.name}</span>
            <span className="text-xs bg-gray-200 px-2 py-1 rounded">{analysis.player.position}</span>
            <span className="text-xs text-gray-600">{analysis.player.team}</span>
            
            {/* Analytics badges */}
            <div className="flex space-x-1">
              {analysis.advanced.ownershipAnalysis.category === 'underowned' && (
                <span className="text-xs bg-purple-500 text-white px-1 rounded">💎</span>
              )}
              {analysis.advanced.formAnalysis.formTrend === 'hot' && (
                <span className="text-xs bg-red-500 text-white px-1 rounded">🔥</span>
              )}
              {analysis.advanced.priceChange.riskLevel === 'high' && (
                <span className="text-xs bg-yellow-500 text-white px-1 rounded">⚠️</span>
              )}
            </div>
          </div>
        </td>
        
        <td className="px-4 py-2">£{analysis.player.price}m</td>
        <td className="px-4 py-2">{analysis.performance.form}</td>
        <td className="px-4 py-2">{analysis.performance.pointsPerGame}</td>
        <td className="px-4 py-2">{analysis.player.ownership.toFixed(1)}%</td>
        <td className="px-4 py-2">
          <div className="text-sm">
            <div>Goals: {analysis.advanced.finishingEfficiency.goalEfficiency}%</div>
            <div>Assists: {analysis.advanced.finishingEfficiency.assistEfficiency}%</div>
          </div>
        </td>
        <td className="px-4 py-2">{analysis.advanced.bonusPotential.probability.anyBonus.toFixed(1)}%</td>
        <td className="px-4 py-2">
          <div className="flex flex-col space-y-1">
            <span className={`text-xs px-2 py-1 rounded text-white ${getBadgeColor(analysis.advanced.ownershipAnalysis.category)}`}>
              {analysis.advanced.ownershipAnalysis.category}
            </span>
            <span className={`text-xs px-2 py-1 rounded text-white ${getBadgeColor(analysis.advanced.formAnalysis.formTrend)}`}>
              {analysis.advanced.formAnalysis.formTrend}
            </span>
          </div>
        </td>
        <td className="px-4 py-2">
          <button className="text-blue-500 hover:text-blue-700">
            {showDetails ? '▼' : '▶'} Details
          </button>
        </td>
      </tr>
      
      {/* Expanded Details Row */}
      {showDetails && (
        <tr className="bg-gray-50">
          <td colSpan="9" className="px-4 py-4">
            <PlayerAnalysisDetails analysis={analysis} />
          </td>
        </tr>
      )}
    </>
  );
}

// 3. DETAILED ANALYSIS COMPONENT
function PlayerAnalysisDetails({ analysis }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Form Analysis */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-bold text-lg mb-2">📈 Form Analysis</h3>
        <div className="space-y-2 text-sm">
          <div><strong>Current Form:</strong> {analysis.performance.form}</div>
          <div><strong>Trend:</strong> {analysis.advanced.formAnalysis.formTrend}</div>
          <div><strong>Consistency:</strong> {analysis.advanced.formAnalysis.consistency}/100</div>
          <div><strong>Verdict:</strong> {analysis.advanced.formAnalysis.analysis.verdict}</div>
          <div><strong>Recommendation:</strong> {analysis.advanced.formAnalysis.analysis.recommendation}</div>
        </div>
      </div>

      {/* Finishing Efficiency */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-bold text-lg mb-2">🎯 Finishing Analysis</h3>
        <div className="space-y-2 text-sm">
          <div><strong>Goals:</strong> {analysis.advanced.finishingEfficiency.analysis.goals.actual} vs {analysis.advanced.finishingEfficiency.analysis.goals.expected} xG</div>
          <div><strong>Goal Efficiency:</strong> {analysis.advanced.finishingEfficiency.goalEfficiency}%</div>
          <div><strong>Assists:</strong> {analysis.advanced.finishingEfficiency.analysis.assists.actual} vs {analysis.advanced.finishingEfficiency.analysis.assists.expected} xA</div>
          <div><strong>Assist Efficiency:</strong> {analysis.advanced.finishingEfficiency.assistEfficiency}%</div>
          <div className="font-semibold text-blue-600">{analysis.advanced.finishingEfficiency.analysis.goals.verdict}</div>
        </div>
      </div>

      {/* Ownership Analysis */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-bold text-lg mb-2">👥 Ownership Analysis</h3>
        <div className="space-y-2 text-sm">
          <div><strong>Actual Ownership:</strong> {analysis.player.ownership}%</div>
          <div><strong>Expected:</strong> {analysis.advanced.ownershipAnalysis.expectedOwnership}%</div>
          <div><strong>Gap:</strong> {analysis.advanced.ownershipAnalysis.ownershipGap > 0 ? '+' : ''}{analysis.advanced.ownershipAnalysis.ownershipGap}%</div>
          <div><strong>Category:</strong> {analysis.advanced.ownershipAnalysis.category}</div>
          <div><strong>Differential Potential:</strong> {analysis.advanced.ownershipAnalysis.differentialPotential}</div>
          <div className="font-semibold text-purple-600">{analysis.advanced.ownershipAnalysis.analysis.strategy}</div>
        </div>
      </div>

      {/* Bonus Points */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-bold text-lg mb-2">⭐ Bonus Potential</h3>
        <div className="space-y-2 text-sm">
          <div><strong>BPS per Game:</strong> {analysis.advanced.bonusPotential.bpsPerGame}</div>
          <div><strong>Any Bonus:</strong> {analysis.advanced.bonusPotential.probability.anyBonus.toFixed(1)}%</div>
          <div><strong>2+ Bonus:</strong> {analysis.advanced.bonusPotential.probability.twoPlus}%</div>
          <div><strong>3 Bonus:</strong> {analysis.advanced.bonusPotential.probability.threePlus}%</div>
          <div><strong>Category:</strong> {analysis.advanced.bonusPotential.category}</div>
        </div>
      </div>

      {/* Price Change */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-bold text-lg mb-2">💰 Price Analysis</h3>
        <div className="space-y-2 text-sm">
          <div><strong>Net Transfers:</strong> {analysis.advanced.priceChange.netTransfers.toLocaleString()}</div>
          <div><strong>Rise Probability:</strong> {analysis.advanced.priceChange.prediction.rise}</div>
          <div><strong>Fall Probability:</strong> {analysis.advanced.priceChange.prediction.fall}</div>
          <div><strong>Risk Level:</strong> {analysis.advanced.priceChange.riskLevel}</div>
          <div className="font-semibold text-green-600">{analysis.advanced.priceChange.recommendation}</div>
        </div>
      </div>

      {/* Fixtures */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-bold text-lg mb-2">📅 Fixture Analysis</h3>
        <div className="space-y-2 text-sm">
          <div><strong>Avg Difficulty:</strong> {analysis.advanced.fixtures?.avgDifficulty?.toFixed(1) || 'N/A'}/5</div>
          <div><strong>Avg Rating:</strong> {analysis.advanced.fixtures?.avgRating || 'N/A'}/100</div>
          <div><strong>Easy Fixtures:</strong> {analysis.advanced.fixtures?.easyFixtures || 0}</div>
          <div><strong>Hard Fixtures:</strong> {analysis.advanced.fixtures?.hardFixtures || 0}</div>
          
          <div className="mt-2">
            <strong>Next 3 Fixtures:</strong>
            {analysis.advanced.fixtures?.fixtures?.slice(0, 3).map((fixture, idx) => (
              <div key={idx} className="text-xs">
                GW{fixture.gameweek}: {fixture.isHome ? 'vs' : '@'} {fixture.opponent} (Diff: {fixture.difficulty})
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 4. RECOMMENDATION CARD COMPONENT
function RecommendationCard({ title, players, bgColor }) {
  return (
    <div className={`bg-gradient-to-br ${bgColor} text-white p-4 rounded-lg shadow-lg`}>
      <h3 className="font-bold text-lg mb-3">{title}</h3>
      <div className="space-y-2">
        {players.length > 0 ? players.map((player, idx) => (
          <div key={idx} className="text-sm">
            <div className="font-semibold">{player.name}</div>
            <div className="text-xs opacity-90">{player.reason}</div>
          </div>
        )) : (
          <div className="text-sm opacity-75">No recommendations available</div>
        )}
      </div>
    </div>
  );
}

// 5. API INTEGRATION FOR SERVER-SIDE ANALYTICS
// File: src/app/api/analytics/recommendations/route.ts

export async function GET(request) {
  try {
    const FPLAdvancedAnalytics = require('../../../lib/fpl-advanced-analytics.js');
    const analytics = new FPLAdvancedAnalytics();
    await analytics.initialize();
    
    const recommendations = analytics.generateRecommendations();
    
    return Response.json({
      success: true,
      data: recommendations,
      generated: new Date().toISOString()
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 6. CAPTAIN PICKER COMPONENT
function CaptainPicker({ teamPlayers }) {
  const [captainAnalysis, setCaptainAnalysis] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function analyzeCaptainOptions() {
      try {
        const FPLAdvancedAnalytics = require('../lib/fpl-advanced-analytics.js');
        const analytics = new FPLAdvancedAnalytics();
        await analytics.initialize();

        const analyzed = teamPlayers.map(player => {
          const analysis = analytics.analyzePlayer(player.id);
          if (!analysis) return null;

          // Captain scoring algorithm
          const captainScore = 
            analysis.performance.form * 0.3 +
            analysis.performance.pointsPerGame * 0.25 +
            (analysis.advanced.fixtures?.avgRating || 100) * 0.2 / 100 +
            analysis.advanced.bonusPotential.probability.anyBonus * 0.15 / 100 +
            (analysis.advanced.finishingEfficiency.combinedEfficiency || 100) * 0.1 / 100;

          return {
            ...player,
            analysis,
            captainScore: Math.round(captainScore * 100) / 100,
            reasoning: [
              `Form: ${analysis.performance.form}/10`,
              `PPG: ${analysis.performance.pointsPerGame}`,
              `Fixture: ${analysis.advanced.fixtures?.avgRating || 'N/A'}/100`,
              `Bonus: ${analysis.advanced.bonusPotential.probability.anyBonus.toFixed(1)}%`
            ]
          };
        }).filter(p => p !== null)
          .sort((a, b) => b.captainScore - a.captainScore);

        setCaptainAnalysis(analyzed);
      } catch (error) {
        console.error('Captain analysis failed:', error);
      } finally {
        setLoading(false);
      }
    }

    if (teamPlayers.length > 0) {
      analyzeCaptainOptions();
    }
  }, [teamPlayers]);

  if (loading) return <div>Analyzing captain options...</div>;

  return (
    <div className="captain-picker">
      <h3 className="text-xl font-bold mb-4">🏆 Captain Recommendations</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {captainAnalysis.slice(0, 4).map((player, idx) => (
          <div key={player.id} className={`p-4 rounded-lg border-2 ${idx === 0 ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200'}`}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-bold">{player.analysis.player.name}</h4>
                <p className="text-sm text-gray-600">{player.analysis.player.position} - {player.analysis.player.team}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">{player.captainScore}</div>
                <div className="text-xs text-gray-500">Captain Score</div>
              </div>
            </div>
            
            <div className="space-y-1 text-xs">
              {player.reasoning.map((reason, rIdx) => (
                <div key={rIdx} className="text-gray-700">{reason}</div>
              ))}
            </div>
            
            {idx === 0 && (
              <div className="mt-2 px-2 py-1 bg-yellow-500 text-white text-xs rounded text-center">
                🏆 RECOMMENDED CAPTAIN
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export { EnhancedPlayersPage, PlayerRow, PlayerAnalysisDetails, CaptainPicker };
