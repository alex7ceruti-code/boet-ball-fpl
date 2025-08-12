'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useBootstrapData, useCurrentGameweek, useGameweekFixtures } from '@/hooks/useFplData';
import { getSlangPhrase, getLoadingText, getTimeBasedGreeting } from '@/utils/slang';
import {
  BarChart3,
  Activity, 
  TrendingUp,
  Users,
  Calendar,
  Clock,
  Trophy,
  Target,
  Flame,
  MapPin,
  Search,
  Timer,
  Zap,
  Star
} from 'lucide-react';

// Helper functions
const getPlayerPhotoUrl = (playerCode: number) =>
  `https://resources.premierleague.com/premierleague/photos/players/110x140/p${playerCode}.png`;

const getTeamBadgeUrl = (teamCode: number) => 
  `https://resources.premierleague.com/premierleague/badges/25/t${teamCode}.png`;

const formatPrice = (price: number) => `£${(price / 10).toFixed(1)}m`;

const getFdrColor = (fdr: number) => {
  if (fdr <= 2) return 'text-green-600 bg-green-100';
  if (fdr <= 3) return 'text-yellow-600 bg-yellow-100';
  if (fdr <= 4) return 'text-orange-600 bg-orange-100';
  return 'text-red-600 bg-red-100';
};

const formatKickoffSAST = (kickoffTime: string) => {
  const date = new Date(kickoffTime);
  return date.toLocaleString('en-ZA', {
    timeZone: 'Africa/Johannesburg',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getGameweekProgress = (currentGW: any) => {
  if (!currentGW) return 0;
  const now = new Date();
  const deadline = new Date(currentGW.deadline_time);
  const gwStart = new Date(deadline.getTime() - (7 * 24 * 60 * 60 * 1000)); // Assume 7 days before deadline
  
  if (now < gwStart) return 0;
  if (now > deadline) return 100;
  
  const progress = ((now.getTime() - gwStart.getTime()) / (deadline.getTime() - gwStart.getTime())) * 100;
  return Math.min(100, Math.max(0, progress));
};

export default function Dashboard() {
  const { data: bootstrap, isLoading: bootstrapLoading, error: bootstrapError } = useBootstrapData();
  const { current: currentGW } = useCurrentGameweek();
  const { data: fixtures, isLoading: fixturesLoading } = useGameweekFixtures(currentGW?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get most recent completed gameweek for live data
  const mostRecentGW = bootstrap?.events
    .filter(gw => gw.finished)
    .sort((a, b) => b.id - a.id)[0] || currentGW;

  if (bootstrapLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">{getLoadingText()}</p>
          <p className="text-sm text-gray-500 mt-2">{getSlangPhrase('culture', 'general')}</p>
        </div>
      </div>
    );
  }

  if (bootstrapError || !bootstrap) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😅</div>
          <h2 className="text-2xl font-bold text-red-800 mb-4">Eish, something's not lekker...</h2>
          <p className="text-red-600 mb-6">Having trouble loading FPL data. Check your connection, boet!</p>
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

  // Get top performers this season
  const topPerformers = bootstrap.elements
    .sort((a, b) => b.total_points - a.total_points)
    .slice(0, 6)
    .map(player => {
      const team = bootstrap.teams.find(t => t.id === player.team);
      const position = bootstrap.element_types.find(p => p.id === player.element_type);
      return { ...player, team_info: team, position_info: position };
    });

  // Get current gameweek progress
  const progress = getGameweekProgress(currentGW);
  const deadline = currentGW ? new Date(currentGW.deadline_time) : null;
  const now = new Date();
  const timeToDeadline = deadline ? deadline.getTime() - now.getTime() : 0;
  const daysToDeadline = Math.max(0, Math.ceil(timeToDeadline / (1000 * 60 * 60 * 24)));
  const hoursToDeadline = Math.max(0, Math.ceil((timeToDeadline % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-gray-900">
            {getTimeBasedGreeting()}
            <span className="block text-2xl md:text-3xl mt-2 text-transparent bg-clip-text"
              style={{
                background: 'linear-gradient(135deg, #007A3D 0%, #16a34a 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              FPL Command Center
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {getSlangPhrase('culture', 'general')} - Live data and insights! 🏆
          </p>
        </div>

        {/* Live Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Gameweek Info */}
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">{currentGW?.name || 'GW TBC'}</h3>
                <p className="text-sm text-gray-500">{currentGW?.finished ? 'Complete' : 'Live'}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-600">
                {(mostRecentGW?.average_entry_score || currentGW?.average_entry_score || 45)?.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Average Score</div>
              {deadline && timeToDeadline > 0 && (
                <div className="text-xs text-orange-600 font-medium">
                  {daysToDeadline > 0 ? `${daysToDeadline}d ` : ''}{hoursToDeadline}h to deadline
                </div>
              )}
              {timeToDeadline <= 0 && currentGW?.finished && (
                <div className="text-xs text-green-600 font-medium">
                  ✅ Gameweek Complete
                </div>
              )}
            </div>
          </div>

          {/* Total Players */}
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Managers</h3>
                <p className="text-sm text-gray-500">Total Active</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-600">
                {bootstrap.total_players?.toLocaleString() || '9.6M'}
              </div>
              <div className="text-sm text-gray-500">Worldwide</div>
            </div>
          </div>

          {/* Top Score */}
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Trophy className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Top Score</h3>
                <p className="text-sm text-gray-500">This Gameweek</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-yellow-600">
                {(mostRecentGW?.highest_score || currentGW?.highest_score || 120)?.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Points</div>
            </div>
          </div>

          {/* Quick Search */}
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Search className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Quick Search</h3>
                <p className="text-sm text-gray-500">Find Players</p>
              </div>
            </div>
            <Link 
              href="/players"
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm flex items-center justify-center gap-2"
            >
              <Target className="w-4 h-4" />
              {getSlangPhrase('actions', 'view')} Database
            </Link>
          </div>
        </div>

        {/* Current Gameweek Fixtures */}
        {fixtures && fixtures.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-800">
                {currentGW?.name} Fixtures
              </h2>
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Live SAST 🇿🇦
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fixtures.slice(0, 4).map((fixture) => (
                <div key={fixture.id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <img 
                          src={getTeamBadgeUrl(fixture.team_h_info.code)}
                          alt={fixture.team_h_info.name}
                          className="w-8 h-8"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/team-placeholder.svg';
                          }}
                        />
                        <span className="font-semibold text-gray-800">
                          {fixture.team_h_info.short_name}
                        </span>
                      </div>
                      <div className="text-gray-400 font-bold">vs</div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-800">
                          {fixture.team_a_info.short_name}
                        </span>
                        <img 
                          src={getTeamBadgeUrl(fixture.team_a_info.code)}
                          alt={fixture.team_a_info.name}
                          className="w-8 h-8"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/team-placeholder.svg';
                          }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="w-3 h-3" />
                        {formatKickoffSAST(fixture.kickoff_time)}
                      </div>
                      {fixture.finished && (
                        <div className="text-lg font-bold text-gray-800 mt-1">
                          {fixture.team_h_score} - {fixture.team_a_score}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Link 
                href="/fixtures"
                className="text-green-600 hover:text-green-700 font-semibold text-sm"
              >
                View All Fixtures →
              </Link>
            </div>
          </div>
        )}

        {/* Top Performers */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Flame className="w-6 h-6 text-orange-600" />
            <h2 className="text-2xl font-bold text-gray-800">
              Boerie Burners 🔥
            </h2>
            <div className="text-sm text-gray-500">
              {getSlangPhrase('culture', 'braai')}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topPerformers.map((player, index) => (
              <div key={player.id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img 
                      src={getPlayerPhotoUrl(player.code)}
                      alt={player.web_name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/player-placeholder.svg';
                      }}
                    />
                    <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-green-600'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{player.web_name}</div>
                    <div className="text-sm text-gray-600">
                      {player.team_info?.short_name} • {player.position_info?.singular_name_short}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatPrice(player.now_cost)} • {parseFloat(player.selected_by_percent).toFixed(1)}% owned
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">{player.total_points}</div>
                    <div className="text-xs text-gray-500">pts</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link 
              href="/players"
              className="text-green-600 hover:text-green-700 font-semibold text-sm"
            >
              {getSlangPhrase('actions', 'compare')} All Players →
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link 
            href="/players"
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105 border border-gray-100"
          >
            <Users className="w-8 h-8 text-green-600 mb-4" />
            <h3 className="font-bold text-gray-800 mb-2">Player Database</h3>
            <p className="text-sm text-gray-600">Advanced filtering and comparison tools with ICT stats</p>
          </Link>
          
          <Link 
            href="/fixtures"
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105 border border-gray-100"
          >
            <Calendar className="w-8 h-8 text-green-600 mb-4" />
            <h3 className="font-bold text-gray-800 mb-2">Fixture Planner</h3>
            <p className="text-sm text-gray-600">Plan transfers with FDR analysis & team schedules</p>
          </Link>
          
          <Link 
            href="/my-team"
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105 border border-gray-100"
          >
            <Trophy className="w-8 h-8 text-green-600 mb-4" />
            <h3 className="font-bold text-gray-800 mb-2">My Team</h3>
            <p className="text-sm text-gray-600">Analyze your squad, transfers & chip strategy</p>
          </Link>
        </div>

        {/* SA Slang Footer */}
        <div className="mt-12 text-center">
          <div className="bg-green-50 rounded-xl p-6 border border-green-200">
            <h3 className="text-lg font-bold text-green-800 mb-2">
              "{getSlangPhrase('culture', 'general')}"
            </h3>
            <p className="text-green-600 text-sm">
              Keep it lekker with live FPL insights, boet! 🇿🇦🔥
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
