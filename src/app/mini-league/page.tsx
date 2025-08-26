'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  useBootstrapData, 
  useMiniLeague, 
  useManagerTeam, 
  useManagerPicks, 
  useCurrentGameweek,
  useHistoricalStandings
} from '@/hooks/useFplData';
import { getSlangPhrase, getLoadingText } from '@/utils/slang';
import PositionTracker from '@/components/PositionTracker';
import { ExportableStandings } from '@/components/ShareableExport';
import {
  Trophy,
  Users,
  Zap,
  TrendingUp,
  TrendingDown,
  Star,
  Crown,
  Target,
  DollarSign,
  Calendar,
  ChevronRight,
  Home,
  Plane,
  BarChart3,
  Info,
  Settings,
  Lightbulb,
  AlertCircle,
  CheckCircle2,
  X,
  Search,
  LogIn,
  RefreshCw,
  Flame,
  Shield,
  Skull,
  Award,
  Frown,
  Smile,
  Meh,
  LineChart,
  Eye,
  EyeOff
} from 'lucide-react';

// Helper functions
const getPlayerPhotoUrl = (playerCode: number) =>
  `https://resources.premierleague.com/premierleague/photos/players/110x140/p${playerCode}.png`;

const getTeamBadgeUrl = (teamCode: number) => 
  `https://resources.premierleague.com/premierleague/badges/25/t${teamCode}.png`;

const formatPrice = (price: number) => `£${(price / 10).toFixed(1)}m`;

const getBanterComment = (rank: number, total: number) => {
  const percentage = rank / total;
  const comments = {
    top10: [
      "🔥 Absolute unit on top!",
      "🏆 The boet is cooking!",
      "⚡ Lightning fast decisions, hey!",
      "🎯 Sharp as a tack this one!"
    ],
    middle: [
      "🤔 Ag man, holding the line...",
      "⚖️ Playing it safe, neh?",
      "🎭 The silent operator",
      "🔄 Steady as she goes"
    ],
    bottom10: [
      "💀 Eish, tough times boet...",
      "🤕 Walking wounded this week",
      "😬 Time for a braai and rethink?",
      "🆘 Send help, quickly!"
    ]
  };

  if (percentage <= 0.3) {
    return comments.top10[Math.floor(Math.random() * comments.top10.length)];
  } else if (percentage <= 0.7) {
    return comments.middle[Math.floor(Math.random() * comments.middle.length)];
  } else {
    return comments.bottom10[Math.floor(Math.random() * comments.bottom10.length)];
  }
};

const getPerformanceIcon = (rank: number, total: number) => {
  const percentage = rank / total;
  if (percentage <= 0.3) return <Smile className="w-5 h-5 text-green-500" />;
  if (percentage <= 0.7) return <Meh className="w-5 h-5 text-yellow-500" />;
  return <Frown className="w-5 h-5 text-red-500" />;
};

export default function MiniLeague() {
  const { data: session } = useSession();
  const { data: bootstrap, isLoading: bootstrapLoading, error: bootstrapError } = useBootstrapData();
  const { current: currentGW } = useCurrentGameweek();
  
  const [leagueId, setLeagueId] = useState<string>('');
  const [submittedLeagueId, setSubmittedLeagueId] = useState<number | null>(null);
  const [selectedManager, setSelectedManager] = useState<any>(null);
  const [showRivalry, setShowRivalry] = useState(false);
  const [showPositionTracker, setShowPositionTracker] = useState(false);
  
  // Fetch league data only when league ID is submitted
  const { data: leagueData, isLoading: leagueLoading, error: leagueError } = useMiniLeague(submittedLeagueId);
  
  // Fetch historical data for position tracking (last 6 gameweeks for better performance)
  const gameweeksToFetch = useMemo(() => {
    if (!currentGW?.id) return [];
    const startGW = Math.max(1, currentGW.id - 5); // Last 6 gameweeks
    return Array.from({ length: currentGW.id - startGW + 1 }, (_, i) => startGW + i);
  }, [currentGW?.id]);
  
  const historicalStandings = useHistoricalStandings(submittedLeagueId, gameweeksToFetch);

  // Get saved mini-league IDs from user profile
  const savedMiniLeagues = useMemo(() => {
    const leagues = [];
    if (session?.user?.miniLeague1Id) {
      leagues.push({ id: session.user.miniLeague1Id, label: 'Mini League 1' });
    }
    if (session?.user?.miniLeague2Id) {
      leagues.push({ id: session.user.miniLeague2Id, label: 'Mini League 2' });
    }
    return leagues;
  }, [session?.user?.miniLeague1Id, session?.user?.miniLeague2Id]);
  
  const handleLeagueIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(leagueId.trim());
    if (id && !isNaN(id)) {
      setSubmittedLeagueId(id);
    }
  };
  
  const resetLeagueId = () => {
    setSubmittedLeagueId(null);
    setLeagueId('');
    setSelectedManager(null);
  };

  if (bootstrapLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">{getLoadingText()}</p>
          <p className="text-sm text-gray-500 mt-2">Loading bootstrap data...</p>
        </div>
      </div>
    );
  }

  if (bootstrapError || !bootstrap) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😅</div>
          <h2 className="text-2xl font-bold text-red-800 mb-4">Eish, bootstrap data not loading...</h2>
          <p className="text-red-600 mb-6">Check your connection!</p>
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

  // Show league ID input if no league is selected
  if (!submittedLeagueId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-yellow-50">
        <div className="max-w-2xl mx-auto px-6 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black mb-4 text-gray-900">
              Mini League Hub
              <span className="block text-2xl md:text-3xl mt-2 text-transparent bg-clip-text"
                style={{
                  background: 'linear-gradient(135deg, #007A3D 0%, #16a34a 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Dominate Your Rivals!
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {getSlangPhrase('culture', 'braai')} Time to show your mates who's boss! 🏆🇿🇦
            </p>
          </div>

          {/* Saved Mini Leagues */}
          {savedMiniLeagues.length > 0 && (
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <Star className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-800">Your Saved Leagues</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedMiniLeagues.map((league) => (
                  <button
                    key={league.id}
                    onClick={() => setSubmittedLeagueId(league.id)}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
                  >
                    <div className="text-left">
                      <div className="font-semibold text-gray-800 group-hover:text-green-700">
                        {league.label}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {league.id}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600" />
                  </button>
                ))}
              </div>
              <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-5 h-5 text-yellow-600" />
                  <h4 className="font-bold text-yellow-800">Saved from Profile</h4>
                </div>
                <p className="text-sm text-yellow-700">
                  These leagues are saved in your profile settings. You can edit them in your profile page.
                </p>
              </div>
            </div>
          )}

          {/* League ID Input Form */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-800">{savedMiniLeagues.length > 0 ? 'Or Enter Different League' : 'Enter Your Mini League'}</h2>
            </div>
            
            <form onSubmit={handleLeagueIdSubmit} className="space-y-6">
              <div>
                <label htmlFor="leagueId" className="block text-sm font-semibold text-gray-700 mb-2">
                  Mini League ID
                </label>
                <input
                  type="text"
                  id="leagueId"
                  value={leagueId}
                  onChange={(e) => setLeagueId(e.target.value)}
                  placeholder="e.g. 123456"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  Find your League ID in the FPL app/website under "Leagues" → "View" → Look at the URL
                </p>
              </div>
              
              <button
                type="submit"
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                Analyze League Rivals
              </button>
            </form>

            {/* How to Find League ID */}
            <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-blue-800">How to Find Your League ID</h4>
              </div>
              <div className="text-sm text-blue-700 space-y-2">
                <p>1. Go to the official FPL website</p>
                <p>2. Navigate to "Leagues" and select your mini-league</p>
                <p>3. Look at the URL - your League ID is the number after "/leagues-classic/"</p>
                <p>4. Example: fantasy.premierleague.com/leagues-classic/<strong>123456</strong>/standings/c</p>
              </div>
            </div>

            {/* Features Preview */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-5 h-5 text-green-600" />
                  <h4 className="font-bold text-green-800">Live Standings</h4>
                </div>
                <p className="text-sm text-green-700">Real-time league positions with SA banter!</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <h4 className="font-bold text-blue-800">Captain Analysis</h4>
                </div>
                <p className="text-sm text-blue-700">See who's backing which players</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-yellow-600" />
                  <h4 className="font-bold text-yellow-800">Performance Stats</h4>
                </div>
                <p className="text-sm text-yellow-700">Top & worst performers with friendly roasting</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  <h4 className="font-bold text-purple-800">Transfer Intel</h4>
                </div>
                <p className="text-sm text-purple-700">See what moves your rivals are making</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while fetching league data
  if (leagueLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">{getLoadingText()}</p>
          <p className="text-sm text-gray-500 mt-2">Loading league {submittedLeagueId}...</p>
        </div>
      </div>
    );
  }

  // Show error if league data couldn't be loaded
  if (leagueError || !leagueData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😅</div>
          <h2 className="text-2xl font-bold text-red-800 mb-4">Eish, league not found...</h2>
          <p className="text-red-600 mb-6">
            League ID {submittedLeagueId} doesn't exist or is private. Check the ID and try again, boet!
          </p>
          <div className="space-y-3">
            <button 
              onClick={resetLeagueId}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Try Different League
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Process league standings
  const standings = (leagueData as any)?.standings?.results || [];
  const leagueInfo = (leagueData as any)?.league || {};
  
  // Get best and worst performers this gameweek (or most recent if gameweek is over)
  // Filter out zero scores if all games are finished and everyone has 0 for current event
  const validStandings = standings.filter((manager: any) => manager.event_total > 0);
  
  // If no one has points this "gameweek" (likely because it's between gameweeks),
  // we'll show overall best/worst based on recent performance or total points
  const hasCurrentGameweekData = validStandings.length > 0;
  
  const bestPerformer = hasCurrentGameweekData 
    ? validStandings.reduce((best: any, current: any) =>
        current.event_total > (best?.event_total || 0) ? current : best, validStandings[0])
    : standings.reduce((best: any, current: any) =>
        current.total > (best?.total || 0) ? current : best, standings[0]);
  
  const worstPerformer = hasCurrentGameweekData 
    ? validStandings.reduce((worst: any, current: any) =>
        current.event_total < (worst?.event_total || Number.MAX_VALUE) ? current : worst, validStandings[0])
    : standings.reduce((worst: any, current: any) =>
        current.total < (worst?.total || Number.MAX_VALUE) ? current : worst, standings[0]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-yellow-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-gray-900">
            Mini League Hub
            <span className="block text-2xl md:text-3xl mt-2 text-transparent bg-clip-text"
              style={{
                background: 'linear-gradient(135deg, #007A3D 0%, #16a34a 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {leagueInfo.name}
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {standings.length} managers battling it out! Time to settle who's the real boet! 🏆
          </p>
          
          {/* Action Buttons */}
          <div className="mt-4 flex gap-3 justify-center">
            <button 
              onClick={resetLeagueId}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Change League
            </button>
            
            <button 
              onClick={() => setShowPositionTracker(!showPositionTracker)}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium flex items-center gap-2"
            >
              {showPositionTracker ? <EyeOff className="w-4 h-4" /> : <LineChart className="w-4 h-4" />}
              {showPositionTracker ? 'Hide Tracker' : 'Position Tracker'}
            </button>
          </div>
        </div>

        {/* Performance Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Best Performer */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{hasCurrentGameweekData ? 'Boet of the Week! 🔥' : 'League Leader! 🏆'}</h3>
                <p className="text-green-100">{hasCurrentGameweekData ? `GW${currentGW?.id} Top Scorer` : 'Overall Top Position'}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-black mb-1">
                  {bestPerformer?.player_name || 'TBC'}
                </div>
                <div className="text-green-100">
                  {bestPerformer?.entry_name || 'Team TBC'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black">{hasCurrentGameweekData ? (bestPerformer?.event_total || 0) : (bestPerformer?.total || 0)}</div>
                <div className="text-sm text-green-100">{hasCurrentGameweekData ? 'points' : 'total pts'}</div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-white/10 rounded-lg">
              <p className="text-sm text-green-100 italic">
                "{getBanterComment(1, standings.length)}"
              </p>
            </div>
          </div>

          {/* Worst Performer */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Skull className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{hasCurrentGameweekData ? 'Braai Duty! 💀' : 'Needs Work! 📈'}</h3>
                <p className="text-red-100">{hasCurrentGameweekData ? `GW${currentGW?.id} Wooden Spoon` : 'Bottom of the League'}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-black mb-1">
                  {worstPerformer?.player_name || 'TBC'}
                </div>
                <div className="text-red-100">
                  {worstPerformer?.entry_name || 'Team TBC'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black">{hasCurrentGameweekData ? (worstPerformer?.event_total || 0) : (worstPerformer?.total || 0)}</div>
                <div className="text-sm text-red-100">{hasCurrentGameweekData ? 'points' : 'total pts'}</div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-white/10 rounded-lg">
              <p className="text-sm text-red-100 italic">
                "{getBanterComment(standings.length, standings.length)}"
              </p>
            </div>
          </div>
        </div>

        {/* League Standings */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-800">Live Standings</h2>
              </div>
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                GW{currentGW?.id} • Updated Live
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Manager
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    GW{currentGW?.id}
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Move
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Banter
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {standings.map((manager: any, index: number) => (
                  <tr 
                    key={manager.entry}
                    className={`hover:bg-gray-50 transition-colors ${
                      manager.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : ''
                    }`}
                  >
                    {/* Rank */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          manager.rank === 1 ? 'bg-yellow-500 text-white' :
                          manager.rank === 2 ? 'bg-gray-400 text-white' :
                          manager.rank === 3 ? 'bg-amber-600 text-white' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {manager.rank}
                        </div>
                        {manager.rank <= 3 && (
                          <Crown className="w-4 h-4 text-yellow-500 ml-2" />
                        )}
                      </div>
                    </td>
                    
                    {/* Manager Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {manager.player_name}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-48">
                          {manager.entry_name}
                        </div>
                      </div>
                    </td>
                    
                    {/* Gameweek Points */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className={`text-lg font-bold ${
                        manager.event_total >= 60 ? 'text-green-600' :
                        manager.event_total >= 40 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {manager.event_total}
                      </div>
                    </td>
                    
                    {/* Total Points */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-semibold text-gray-900">
                        {manager.total.toLocaleString()}
                      </div>
                    </td>
                    
                    {/* Movement */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {manager.last_rank ? (
                        <div className="flex items-center justify-center">
                          {manager.last_rank > manager.rank ? (
                            <div className="flex items-center text-green-600">
                              <TrendingUp className="w-4 h-4 mr-1" />
                              <span className="text-sm font-semibold">
                                +{manager.last_rank - manager.rank}
                              </span>
                            </div>
                          ) : manager.last_rank < manager.rank ? (
                            <div className="flex items-center text-red-600">
                              <TrendingDown className="w-4 h-4 mr-1" />
                              <span className="text-sm font-semibold">
                                -{manager.rank - manager.last_rank}
                              </span>
                            </div>
                          ) : (
                            <div className="text-gray-400">
                              <span className="text-sm">-</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">New</span>
                      )}
                    </td>
                    
                    {/* Banter */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center">
                        {getPerformanceIcon(manager.rank, standings.length)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Position Tracker */}
        {showPositionTracker && (
          <div className="mb-8">
            <PositionTracker 
              historicalData={historicalStandings.map(item => ({
                gameweek: item.gameweek,
                data: item.data ? {
                  standings: {
                    results: (item.data as any)?.standings?.results || []
                  }
                } : null,
                error: item.error,
                isLoading: item.isLoading
              }))}
              currentGameweek={currentGW?.id || 1}
              leagueName={leagueInfo.name || ''}
              exportable={true}
            />
          </div>
        )}

        {/* League Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">League Size</h3>
                <p className="text-sm text-gray-500">Active Managers</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-600">
                {standings.length}
              </div>
              <div className="text-sm text-gray-500">Managers</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Average Score</h3>
                <p className="text-sm text-gray-500">This Gameweek</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(
                  standings.reduce((sum: number, m: any) => sum + m.event_total, 0) / standings.length
                ) || 0}
              </div>
              <div className="text-sm text-gray-500">Points</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Points Range</h3>
                <p className="text-sm text-gray-500">High - Low</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-lg font-bold text-purple-600">
                {Math.max(...standings.map((m: any) => m.event_total))} - {Math.min(...standings.map((m: any) => m.event_total))}
              </div>
              <div className="text-sm text-gray-500">Spread</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Crown className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Leader Gap</h3>
                <p className="text-sm text-gray-500">1st vs 2nd</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-yellow-600">
                {standings[0] && standings[1] 
                  ? (standings[0].total - standings[1].total).toLocaleString()
                  : 0
                }
              </div>
              <div className="text-sm text-gray-500">Points</div>
            </div>
          </div>
        </div>

        {/* SA Footer */}
        <div className="mt-8 text-center">
          <div className="bg-green-50 rounded-xl p-6 border border-green-200">
            <h3 className="text-lg font-bold text-green-800 mb-2">
              "{getSlangPhrase('culture', 'general')}"
            </h3>
            <p className="text-green-600 text-sm">
              May the best manager win! Time for some proper FPL bragging rights, hey! 🇿🇦🏆
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
