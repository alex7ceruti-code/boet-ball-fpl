'use client';

import React, { useState, useMemo } from 'react';
import { useBootstrapData, useFixtures } from '@/hooks/useFplData';
import { getSlangPhrase, getLoadingText } from '@/utils/slang';
import {
  Calendar,
  Filter,
  BarChart,
  Clock,
  MapPin,
  Target,
  Home,
  Plane,
  ChevronDown,
  ChevronUp,
  Settings,
  TrendingUp,
  TrendingDown,
  Info
} from 'lucide-react';

// Helper functions
const getTeamBadgeUrl = (teamCode: number) => 
  `https://resources.premierleague.com/premierleague/badges/25/t${teamCode}.png`;

const getFdrColor = (fdr: number) => {
  if (fdr <= 2) return 'bg-green-500 text-white';
  if (fdr <= 3) return 'bg-yellow-500 text-white';
  if (fdr <= 4) return 'bg-orange-500 text-white';
  return 'bg-red-500 text-white';
};

const getFdrColorLight = (fdr: number) => {
  if (fdr <= 2) return 'bg-green-100 text-green-800';
  if (fdr <= 3) return 'bg-yellow-100 text-yellow-800';
  if (fdr <= 4) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
};

const formatKickoffSAST = (kickoffTime: string) => {
  const date = new Date(kickoffTime);
  return date.toLocaleString('en-ZA', {
    timeZone: 'Africa/Johannesburg',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getDifficultyText = (fdr: number) => {
  if (fdr <= 2) return 'Easy';
  if (fdr <= 3) return 'Moderate';
  if (fdr <= 4) return 'Hard';
  return 'Very Hard';
};

export default function Fixtures() {
  const { data: bootstrap, isLoading: bootstrapLoading, error: bootstrapError } = useBootstrapData();
  const { data: fixtures, isLoading: fixturesLoading, error: fixturesError } = useFixtures();
  
  const [selectedTeams, setSelectedTeams] = useState<number[]>([]);
  const [gameweekHorizon, setGameweekHorizon] = useState(5);
  const [startGameweek, setStartGameweek] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'fdr' | 'team'>('fdr');
  const [showSettings, setShowSettings] = useState(false);

  // Calculate derived values (moved before early returns to follow Rules of Hooks)
  const currentGW = bootstrap?.events.find(event => event.is_current) || bootstrap?.events[0];
  const actualStartGW = startGameweek || currentGW?.id || 1;
  
  // Get future gameweeks within horizon
  const planningGameweeks = useMemo(() => {
    if (!bootstrap) return [];
    return bootstrap.events
      .filter(gw => gw.id >= actualStartGW && gw.id < actualStartGW + gameweekHorizon)
      .sort((a, b) => a.id - b.id);
  }, [bootstrap, actualStartGW, gameweekHorizon]);

  // Group fixtures by team for the planning period
  const teamFixtures = useMemo(() => {
    if (!bootstrap || !fixtures) return {};
    
    const teamData: { [teamId: number]: any } = {};
    
    bootstrap.teams.forEach(team => {
      teamData[team.id] = {
        ...team,
        fixtures: [],
        totalFdr: 0,
        averageFdr: 0,
        homeFixtures: 0,
        awayFixtures: 0
      };
    });

    // Get fixtures for planning gameweeks
    const relevantFixtures = fixtures.filter(fixture => 
      planningGameweeks.some(gw => gw.id === fixture.event)
    );

    relevantFixtures.forEach(fixture => {
      const homeTeam = teamData[fixture.team_h];
      const awayTeam = teamData[fixture.team_a];
      
      if (homeTeam && awayTeam) {
        // Home team fixture
        homeTeam.fixtures.push({
          ...fixture,
          opponent: awayTeam,
          isHome: true,
          fdr: fixture.team_h_difficulty,
          gameweek: planningGameweeks.find(gw => gw.id === fixture.event)
        });
        homeTeam.totalFdr += fixture.team_h_difficulty;
        homeTeam.homeFixtures += 1;
        
        // Away team fixture
        awayTeam.fixtures.push({
          ...fixture,
          opponent: homeTeam,
          isHome: false,
          fdr: fixture.team_a_difficulty,
          gameweek: planningGameweeks.find(gw => gw.id === fixture.event)
        });
        awayTeam.totalFdr += fixture.team_a_difficulty;
        awayTeam.awayFixtures += 1;
      }
    });

    // Calculate averages
    Object.values(teamData).forEach((team: any) => {
      team.averageFdr = team.fixtures.length > 0 ? team.totalFdr / team.fixtures.length : 0;
    });

    return teamData;
  }, [bootstrap, fixtures, planningGameweeks]);

  // Sort teams
  const sortedTeams = useMemo(() => {
    const teams = Object.values(teamFixtures);
    
    if (sortBy === 'fdr') {
      return teams.sort((a: any, b: any) => a.averageFdr - b.averageFdr);
    } else {
      return teams.sort((a: any, b: any) => a.name.localeCompare(b.name));
    }
  }, [teamFixtures, sortBy]);

  // Filter teams if selection is active
  const displayTeams = useMemo(() => {
    return selectedTeams.length > 0 
      ? sortedTeams.filter((team: any) => selectedTeams.includes(team.id))
      : sortedTeams;
  }, [selectedTeams, sortedTeams]);

  // Early returns after all hooks
  if (bootstrapLoading || fixturesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">{getLoadingText()}</p>
          <p className="text-sm text-gray-500 mt-2">Loading fixture data...</p>
        </div>
      </div>
    );
  }

  if (bootstrapError || fixturesError || !bootstrap || !fixtures) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😅</div>
          <h2 className="text-2xl font-bold text-red-800 mb-4">Eish, no fixtures boet...</h2>
          <p className="text-red-600 mb-6">Having trouble loading fixture data. Check your connection!</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const toggleTeamSelection = (teamId: number) => {
    setSelectedTeams(prev => 
      prev.includes(teamId) 
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-yellow-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-gray-900">
            Fixtures Planner
            <span className="block text-2xl md:text-3xl mt-2 text-transparent bg-clip-text"
              style={{
                background: 'linear-gradient(135deg, #007A3D 0%, #16a34a 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {getSlangPhrase('culture', 'lekker')} Transfer Planning
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Plan your transfers with FDR analysis and team schedules! 🇿🇦
          </p>
        </div>

        {/* Planning Controls */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-800">Planning Options</h2>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              {showSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showSettings ? 'Hide' : 'Show'} Options
            </button>
          </div>
          
          {showSettings && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Gameweek
                </label>
                <select
                  value={startGameweek || currentGW.id}
                  onChange={(e) => setStartGameweek(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {bootstrap.events.filter(gw => gw.id >= currentGW.id).map(gw => (
                    <option key={gw.id} value={gw.id}>{gw.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Planning Horizon
                </label>
                <select
                  value={gameweekHorizon}
                  onChange={(e) => setGameweekHorizon(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value={3}>3 Gameweeks</option>
                  <option value={5}>5 Gameweeks</option>
                  <option value={8}>8 Gameweeks</option>
                  <option value={10}>10 Gameweeks</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'fdr' | 'team')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="fdr">Average FDR (Easy First)</option>
                  <option value="team">Team Name (A-Z)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Team Filter
                </label>
                <button
                  onClick={() => setSelectedTeams([])}
                  disabled={selectedTeams.length === 0}
                  className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {selectedTeams.length === 0 ? 'All Teams' : `Clear Filter (${selectedTeams.length})`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* FDR Color Legend */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Info className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-800">Fixture Difficulty Rating (FDR)</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(rating => (
              <div key={rating} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full ${getFdrColor(rating)} flex items-center justify-center text-xs font-bold`}>
                  {rating}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {getDifficultyText(rating)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Fixture Grid */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-800">
                  Fixture Analysis ({gameweekHorizon} GWs)
                </h2>
              </div>
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                GW{actualStartGW} - GW{actualStartGW + gameweekHorizon - 1}
              </div>
            </div>
          </div>
          
          {/* Table Header */}
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-600">
                <div className="lg:col-span-3 flex items-center gap-2">
                  <span>Team</span>
                  {sortBy === 'fdr' && <TrendingUp className="w-4 h-4" />}
                </div>
                <div className="lg:col-span-2 text-center">Avg FDR</div>
                <div className="lg:col-span-1 text-center">H/A</div>
                <div className="lg:col-span-6">
                  <div className="grid grid-cols-5 gap-2 text-center">
                    {planningGameweeks.map(gw => (
                      <div key={gw.id} className="text-xs">
                        {gw.name.replace('Gameweek ', 'GW')}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Team Rows */}
              <div className="divide-y divide-gray-100">
                {displayTeams.map((team: any) => (
                  <div 
                    key={team.id} 
                    className={`grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      selectedTeams.includes(team.id) ? 'bg-green-50 border-l-4 border-green-500' : ''
                    }`}
                    onClick={() => toggleTeamSelection(team.id)}
                  >
                    {/* Team Info */}
                    <div className="lg:col-span-3 flex items-center gap-3">
                      <img 
                        src={getTeamBadgeUrl(team.code)}
                        alt={team.name}
                        className="w-8 h-8"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/team-placeholder.svg';
                        }}
                      />
                      <div>
                        <div className="font-semibold text-gray-800">{team.short_name}</div>
                        <div className="text-xs text-gray-500">{team.name}</div>
                      </div>
                    </div>
                    
                    {/* Average FDR */}
                    <div className="lg:col-span-2 flex items-center justify-center">
                      <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                        getFdrColorLight(team.averageFdr)
                      }`}>
                        {team.averageFdr.toFixed(1)}
                      </div>
                    </div>
                    
                    {/* Home/Away Split */}
                    <div className="lg:col-span-1 flex items-center justify-center text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Home className="w-3 h-3" />
                        <span>{team.homeFixtures}</span>
                        <span className="text-gray-400">|</span>
                        <Plane className="w-3 h-3" />
                        <span>{team.awayFixtures}</span>
                      </div>
                    </div>
                    
                    {/* Fixtures */}
                    <div className="lg:col-span-6">
                      <div className="grid grid-cols-5 gap-2">
                        {planningGameweeks.map(gw => {
                          const fixture = team.fixtures.find((f: any) => f.gameweek?.id === gw.id);
                          
                          if (!fixture) {
                            return (
                              <div key={gw.id} className="text-center py-2">
                                <div className="w-full h-8 bg-gray-100 rounded flex items-center justify-center">
                                  <span className="text-xs text-gray-400">—</span>
                                </div>
                              </div>
                            );
                          }
                          
                          return (
                            <div key={gw.id} className="text-center">
                              <div className={`w-full p-2 rounded-lg text-xs font-semibold ${
                                getFdrColorLight(fixture.fdr)
                              } hover:shadow-md transition-shadow cursor-pointer`}>
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  {fixture.isHome ? (
                                    <Home className="w-3 h-3" />
                                  ) : (
                                    <Plane className="w-3 h-3" />
                                  )}
                                  <img 
                                    src={getTeamBadgeUrl(fixture.opponent.code)}
                                    alt={fixture.opponent.name}
                                    className="w-3 h-3"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = '/team-placeholder.svg';
                                    }}
                                  />
                                </div>
                                <div className="font-bold">{fixture.opponent.short_name}</div>
                                <div className="text-xs opacity-75">
                                  {formatKickoffSAST(fixture.kickoff_time)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Planning Tips */}
        <div className="mt-8 bg-green-50 rounded-xl p-6 border border-green-200">
          <h3 className="text-lg font-bold text-green-800 mb-4">
            🎯 Transfer Planning Tips:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700">
            <div>
              <h4 className="font-semibold mb-2">Easy Fixtures (Green):</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Great for captaincy options</li>
                <li>Consider doubling up on attack</li>
                <li>Ideal for differentials</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Hard Fixtures (Red):</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Avoid or transfer out temporarily</li>
                <li>Focus on defensive assets only</li>
                <li>Wait for fixture turn</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
