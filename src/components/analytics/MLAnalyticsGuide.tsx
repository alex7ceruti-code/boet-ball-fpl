'use client';

import React, { useState } from 'react';
import { X, Brain, Target, Shield, TrendingUp, AlertTriangle, Home, Users, BarChart3, Info } from 'lucide-react';

interface MLAnalyticsGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const MLAnalyticsGuide: React.FC<MLAnalyticsGuideProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'confidence' | 'fixtures' | 'risk'>('overview');

  if (!isOpen) return null;

  const TabButton = ({ tab, icon: Icon, label, isActive, onClick }: any) => (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
        isActive 
          ? 'bg-blue-100 text-blue-700 border border-blue-200' 
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-700'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">ML Analytics Guide</h2>
              <p className="text-slate-600 text-sm">Understanding our prediction system</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 p-4 border-b border-slate-200 bg-slate-50">
          <TabButton
            tab="overview"
            icon={BarChart3}
            label="Overview"
            isActive={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          />
          <TabButton
            tab="confidence"
            icon={Target}
            label="Confidence"
            isActive={activeTab === 'confidence'}
            onClick={() => setActiveTab('confidence')}
          />
          <TabButton
            tab="fixtures"
            icon={Home}
            label="Fixtures"
            isActive={activeTab === 'fixtures'}
            onClick={() => setActiveTab('fixtures')}
          />
          <TabButton
            tab="risk"
            icon={Shield}
            label="Risk Assessment"
            isActive={activeTab === 'risk'}
            onClick={() => setActiveTab('risk')}
          />
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                  <Brain className="h-5 w-5 text-blue-600 mr-2" />
                  How Our ML Prediction Engine Works
                </h3>
                <div className="bg-slate-50 rounded-lg p-4 mb-4">
                  <p className="text-slate-700 leading-relaxed">
                    Our advanced machine learning system predicts FPL player points 4-6 gameweeks ahead using 
                    real-time data analysis, historical patterns, and risk assessment algorithms.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-800 mb-2 flex items-center">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
                    Data Sources
                  </h4>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• Official FPL API data</li>
                    <li>• Real-time fixture information</li>
                    <li>• Historical performance patterns</li>
                    <li>• Team form & strength metrics</li>
                    <li>• Transfer trends & ownership</li>
                  </ul>
                </div>

                <div className="border border-slate-200 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-800 mb-2 flex items-center">
                    <BarChart3 className="h-4 w-4 text-blue-600 mr-2" />
                    Key Features
                  </h4>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• 4-6 gameweek predictions</li>
                    <li>• Confidence scoring (10-100%)</li>
                    <li>• Risk tolerance matching</li>
                    <li>• Fixture difficulty analysis</li>
                    <li>• Personalized recommendations</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 mb-3">Risk Tolerance Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="border border-green-200 bg-green-50 rounded-lg p-3">
                    <div className="font-medium text-green-800 mb-1">🛡️ Conservative</div>
                    <div className="text-xs text-green-700">
                      High confidence picks with low risk. Perfect for set-and-forget lineups.
                    </div>
                  </div>
                  <div className="border border-blue-200 bg-blue-50 rounded-lg p-3">
                    <div className="font-medium text-blue-800 mb-1">⚖️ Balanced</div>
                    <div className="text-xs text-blue-700">
                      Good returns with manageable risk. Standard team building approach.
                    </div>
                  </div>
                  <div className="border border-red-200 bg-red-50 rounded-lg p-3">
                    <div className="font-medium text-red-800 mb-1">🚀 Aggressive</div>
                    <div className="text-xs text-red-700">
                      High-risk, high-reward picks. Perfect for differentials and wildcards.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'confidence' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                  <Target className="h-5 w-5 text-blue-600 mr-2" />
                  Understanding Confidence Scores
                </h3>
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <p className="text-slate-700 leading-relaxed">
                    Confidence scores (10-100%) indicate how reliable our predictions are based on data quality, 
                    player consistency, and external factors.
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 mb-3">How Confidence is Calculated</h4>
                <div className="space-y-3">
                  <div className="border-l-4 border-green-500 pl-4">
                    <div className="font-medium text-slate-800">High Confidence Factors (+)</div>
                    <ul className="text-sm text-slate-600 mt-1 space-y-1">
                      <li>• Regular starter (&gt;80% of games)</li>
                      <li>• Consistent minutes (&gt;80% season minutes)</li>
                      <li>• Good team data availability</li>
                      <li>• Known upcoming fixtures</li>
                      <li>• No injury/suspension concerns</li>
                    </ul>
                  </div>
                  
                  <div className="border-l-4 border-red-500 pl-4">
                    <div className="font-medium text-slate-800">Low Confidence Factors (-)</div>
                    <ul className="text-sm text-slate-600 mt-1 space-y-1">
                      <li>• Injury or suspension flags</li>
                      <li>• Low ownership (&lt;5% selected)</li>
                      <li>• Irregular playing time</li>
                      <li>• Limited historical data</li>
                      <li>• Recent transfers/rotation</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-800 mb-2">Confidence Ranges</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-green-700">90-100%</span>
                    <span className="text-slate-600">Highly reliable prediction</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-blue-700">70-89%</span>
                    <span className="text-slate-600">Good confidence level</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-yellow-700">50-69%</span>
                    <span className="text-slate-600">Moderate uncertainty</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-red-700">10-49%</span>
                    <span className="text-slate-600">High uncertainty</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fixtures' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                  <Home className="h-5 w-5 text-blue-600 mr-2" />
                  Fixture Analysis & FDR Impact
                </h3>
                <div className="bg-green-50 rounded-lg p-4 mb-4">
                  <p className="text-slate-700 leading-relaxed">
                    Our system heavily weighs fixture difficulty, opponent strength, home advantage, and team form 
                    when making predictions.
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 mb-3">Fixture Analysis Components</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-slate-200 rounded-lg p-4">
                    <h5 className="font-medium text-slate-800 mb-2 flex items-center">
                      <BarChart3 className="h-4 w-4 text-blue-600 mr-2" />
                      FDR (Fixture Difficulty)
                    </h5>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-700 font-medium">FDR 1-2 (Easy)</span>
                        <span className="text-slate-600">+25% to +50% boost</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-700 font-medium">FDR 3 (Average)</span>
                        <span className="text-slate-600">Neutral impact</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-red-700 font-medium">FDR 4-5 (Hard)</span>
                        <span className="text-slate-600">-20% to -60% reduction</span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-lg p-4">
                    <h5 className="font-medium text-slate-800 mb-2 flex items-center">
                      <Home className="h-4 w-4 text-green-600 mr-2" />
                      Home Advantage
                    </h5>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-700 font-medium">Home Games</span>
                        <span className="text-slate-600">+8% point boost</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-red-700 font-medium">Away Games</span>
                        <span className="text-slate-600">-4% point reduction</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 mb-3">Position-Specific Fixture Impact</h4>
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="font-medium text-blue-800">🛡️ Defenders</div>
                    <div className="text-sm text-blue-700 mt-1">
                      Get 30% more benefit from easy fixtures due to clean sheet potential
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="font-medium text-green-800">⚽ Midfielders</div>
                    <div className="text-sm text-green-700 mt-1">
                      Standard fixture impact - balanced between attacking and defensive returns
                    </div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="font-medium text-red-800">🎯 Forwards</div>
                    <div className="text-sm text-red-700 mt-1">
                      20% less fixture dependent - quality strikers can score against anyone
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-800 mb-2">Team vs Opponent Analysis</h4>
                <p className="text-sm text-slate-600 mb-2">
                  We compare your player's team strength against their opponents:
                </p>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Team attack strength vs opponent defense (last 6 games)</li>
                  <li>• Goals for/against ratios</li>
                  <li>• Recent form trends</li>
                  <li>• Head-to-head performance patterns</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'risk' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                  <Shield className="h-5 w-5 text-blue-600 mr-2" />
                  Risk Assessment System
                </h3>
                <div className="bg-yellow-50 rounded-lg p-4 mb-4">
                  <p className="text-slate-700 leading-relaxed">
                    Our risk assessment evaluates multiple factors to determine how suitable a player is 
                    for your risk tolerance and playing style.
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 mb-3">Risk Suitability Scores</h4>
                <div className="space-y-4">
                  <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-green-800">Conservative Suitability</span>
                      <span className="text-green-700 font-medium">Requires 80%+ to recommend</span>
                    </div>
                    <div className="text-sm text-green-700">
                      <strong>Criteria:</strong> High confidence (≥75%) + Low risk (≤30%) + Good returns (≥4.0 PPG)
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      Perfect for: Set-and-forget lineups, reliable captains, season keepers
                    </div>
                  </div>

                  <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-blue-800">Balanced Suitability</span>
                      <span className="text-blue-700 font-medium">Requires 60%+ to recommend</span>
                    </div>
                    <div className="text-sm text-blue-700">
                      <strong>Criteria:</strong> Good confidence (≥60%) + Moderate risk (≤50%) + Decent returns (≥3.5 PPG)
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      Perfect for: Standard team building, solid weekly picks, consistent performers
                    </div>
                  </div>

                  <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-red-800">Aggressive Suitability</span>
                      <span className="text-red-700 font-medium">High reward potential focus</span>
                    </div>
                    <div className="text-sm text-red-700">
                      <strong>Criteria:</strong> Very high returns (≥4.5 PPG) OR high boom/bust potential (≥60% volatility)
                    </div>
                    <div className="text-xs text-red-600 mt-1">
                      Perfect for: Differential picks, wildcard moves, high-risk captains
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 mb-3">Risk Factor Breakdown</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-slate-200 rounded-lg p-4">
                    <h5 className="font-medium text-slate-800 mb-2 flex items-center">
                      <Users className="h-4 w-4 text-blue-600 mr-2" />
                      Rotation Risk
                    </h5>
                    <ul className="text-xs text-slate-600 space-y-1">
                      <li>• <span className="text-red-600">High:</span> &lt;60min avg or &lt;70% starts</li>
                      <li>• <span className="text-yellow-600">Medium:</span> 60-75min avg or 70-85% starts</li>
                      <li>• <span className="text-green-600">Low:</span> &gt;75min avg and &gt;85% starts</li>
                    </ul>
                  </div>

                  <div className="border border-slate-200 rounded-lg p-4">
                    <h5 className="font-medium text-slate-800 mb-2 flex items-center">
                      <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                      Injury Risk
                    </h5>
                    <ul className="text-xs text-slate-600 space-y-1">
                      <li>• <span className="text-red-600">High:</span> &lt;60% expected appearances</li>
                      <li>• <span className="text-yellow-600">Medium:</span> 60-80% expected appearances</li>
                      <li>• <span className="text-green-600">Low:</span> &gt;80% expected appearances</li>
                    </ul>
                  </div>

                  <div className="border border-slate-200 rounded-lg p-4">
                    <h5 className="font-medium text-slate-800 mb-2 flex items-center">
                      <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
                      Price Change Risk
                    </h5>
                    <ul className="text-xs text-slate-600 space-y-1">
                      <li>• Based on recent transfer trends</li>
                      <li>• High negative transfers = fall risk</li>
                      <li>• Considers ownership levels</li>
                    </ul>
                  </div>

                  <div className="border border-slate-200 rounded-lg p-4">
                    <h5 className="font-medium text-slate-800 mb-2 flex items-center">
                      <BarChart3 className="h-4 w-4 text-purple-600 mr-2" />
                      Form Volatility
                    </h5>
                    <ul className="text-xs text-slate-600 space-y-1">
                      <li>• High bonus points = boom/bust tendency</li>
                      <li>• &gt;0.8 bonus per start = high volatility</li>
                      <li>• &lt;0.2 bonus per start = very consistent</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4 bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-slate-500">
              <Info className="h-4 w-4 mr-2" />
              <span>Model Version 2.0.0 • Updated with latest FPL data</span>
            </div>
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MLAnalyticsGuide;
