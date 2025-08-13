'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  useBootstrapData, 
  useFixtures, 
  useManagerTeam, 
  useManagerPicks, 
  useCurrentGameweek 
} from '@/hooks/useFplData';
import { getSlangPhrase, getLoadingText } from '@/utils/slang';
import {
  Shield,
  Users,
  Zap,
  TrendingUp,
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
  RefreshCw
} from 'lucide-react';

// Helper functions
const getPlayerPhotoUrl = (playerCode: number) =>
  `https://resources.premierleague.com/premierleague/photos/players/110x140/p${playerCode}.png`;

const getTeamBadgeUrl = (teamCode: number) => 
  `https://resources.premierleague.com/premierleague/badges/25/t${teamCode}.png`;

const formatPrice = (price: number) => `£${(price / 10).toFixed(1)}m`;

const getFdrColor = (fdr: number) => {
  if (fdr <= 2) return 'bg-green-500 text-white';
  if (fdr <= 3) return 'bg-yellow-500 text-white';
  if (fdr <= 4) return 'bg-orange-500 text-white';
  return 'bg-red-500 text-white';
};

const getFdrColorLight = (fdr: number) => {
  if (fdr <= 2) return 'bg-green-100 text-green-800 border-green-200';
  if (fdr <= 3) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  if (fdr <= 4) return 'bg-orange-100 text-orange-800 border-orange-200';
  return 'bg-red-100 text-red-800 border-red-200';
};

const getFormationArray = (picks: any[]) => {
  const startingXI = picks.filter(p => p.multiplier > 0).sort((a, b) => a.position - b.position);
  
  // Standard formation: GK-DEF-MID-FWD
  return {
    gk: startingXI.slice(0, 1),
    def: startingXI.slice(1, 5),
    mid: startingXI.slice(5, 10),
    fwd: startingXI.slice(10, 11)
  };
};

export default function MyTeam() {
  const { data: session } = useSession();
  const { data: bootstrap, isLoading: bootstrapLoading, error: bootstrapError } = useBootstrapData();
  const { data: fixtures, isLoading: fixturesLoading } = useFixtures();
  const { current: currentGW } = useCurrentGameweek();
  
  const [teamId, setTeamId] = useState<string>('');
  const [submittedTeamId, setSubmittedTeamId] = useState<number | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [showTransferSuggestions, setShowTransferSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState<'squad' | 'analysis' | 'transfers' | 'chips'>('squad');
  
  // Auto-load FPL Team ID from user profile
  useEffect(() => {
    if (session?.user?.fplTeamId && !submittedTeamId) {
      setSubmittedTeamId(session.user.fplTeamId);
      setTeamId(session.user.fplTeamId.toString());
    }
  }, [session, submittedTeamId]);
  
  // Fetch team data only when team ID is submitted
  const { data: teamData, isLoading: teamLoading, error: teamError } = useManagerTeam(submittedTeamId);
  const { data: teamPicks, isLoading: picksLoading, error: picksError } = useManagerPicks(
    submittedTeamId, 
    currentGW?.id || null
  );
  
  const handleTeamIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(teamId.trim());
    if (id && !isNaN(id)) {
      setSubmittedTeamId(id);
    }
  };
  
  const resetTeamId = () => {
    setSubmittedTeamId(null);
    setTeamId('');
    setSelectedPlayer(null);
  };

  if (bootstrapLoading || fixturesLoading) {
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

  // Show team ID input if no team is selected
  if (!submittedTeamId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-yellow-50">
        <div className="max-w-2xl mx-auto px-6 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black mb-4 text-gray-900">
              My Team Analysis
              <span className="block text-2xl md:text-3xl mt-2 text-transparent bg-clip-text"
                style={{
                  background: 'linear-gradient(135deg, #007A3D 0%, #16a34a 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Enter Your FPL Team ID
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {getSlangPhrase('culture', 'braai')} Let's analyze your FPL squad! 🇿🇦
            </p>
          </div>

          {/* Team ID Input Form */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <LogIn className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-800">Connect Your Team</h2>
            </div>
            
            <form onSubmit={handleTeamIdSubmit} className="space-y-6">
              <div>
                <label htmlFor="teamId" className="block text-sm font-semibold text-gray-700 mb-2">
                  FPL Team ID
                </label>
                <input
                  type="text"
                  id="teamId"
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  placeholder="e.g. 1234567"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  Find your Team ID in the FPL app/website under "Points" → "Gameweek history" → Look at the URL
                </p>
              </div>
              
              <button
                type="submit"
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                Analyze My Team
              </button>
            </form>

            {/* How to Find Team ID */}
            <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-blue-800">How to Find Your Team ID</h4>
              </div>
              <div className="text-sm text-blue-700 space-y-2">
                <p>1. Go to the official FPL website or app</p>
                <p>2. Navigate to "Points" → "Gameweek history"</p>
                <p>3. Look at the URL - your Team ID is the number after "/entry/"</p>
                <p>4. Example: fantasy.premierleague.com/entry/<strong>1234567</strong>/history</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while fetching team data
  if (teamLoading || picksLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">{getLoadingText()}</p>
          <p className="text-sm text-gray-500 mt-2">Loading team {submittedTeamId}...</p>
        </div>
      </div>
    );
  }

  // Show error if team data couldn't be loaded
  if (teamError || picksError || !teamData || !teamPicks) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😅</div>
          <h2 className="text-2xl font-bold text-red-800 mb-4">Eish, team not found...</h2>
          <p className="text-red-600 mb-6">
            Team ID {submittedTeamId} doesn't exist or isn't public. Check the ID and try again, boet!
          </p>
          <div className="space-y-3">
            <button 
              onClick={resetTeamId}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Try Different Team ID
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get team players with full data
  const teamPlayers = useMemo(() => {
    if (!(teamPicks as any)?.picks || !bootstrap) return [];
    
    return (teamPicks as any).picks.map((pick: any) => {
      const player = bootstrap.elements.find(p => p.id === pick.element);
      if (!player) return null;
      
      const team = bootstrap.teams.find(t => t.id === player.team);
      const position = bootstrap.element_types.find(p => p.id === player.element_type);
      
      return {
        ...pick,
        player: {
          ...player,
          team_info: team,
          position_info: position
        }
      };
    }).filter(Boolean);
  }, [bootstrap, teamPicks]);

  // Get formation layout
  const formation = getFormationArray(teamPlayers);
  
  // Calculate team stats
  const startingXI = teamPlayers.filter((p: any) => p.multiplier > 0);
  const bench = teamPlayers.filter((p: any) => p.multiplier === 0);
  const captain = teamPlayers.find((p: any) => p.is_captain);
  const viceCaptain = teamPlayers.find((p: any) => p.is_vice_captain);
  
  // Calculate average FDR for next 5 gameweeks
  const avgFDR = useMemo(() => {
    if (!fixtures || !currentGW) return 0;
    
    const nextGWs = bootstrap.events
      .filter(gw => gw.id >= currentGW.id && gw.id < currentGW.id + 5)
      .map(gw => gw.id);
    
    let totalFDR = 0;
    let fixtureCount = 0;
    
    startingXI.forEach((pick: any) => {
      const teamId = pick.player.team;
      const teamFixtures = fixtures.filter((f: any) => 
        (f.team_h === teamId || f.team_a === teamId) && 
        nextGWs.includes(f.event)
      );
      
      teamFixtures.forEach((fixture: any) => {
        const fdr = fixture.team_h === teamId ? fixture.team_h_difficulty : fixture.team_a_difficulty;
        totalFDR += fdr;
        fixtureCount++;
      });
    });
    
    return fixtureCount > 0 ? totalFDR / fixtureCount : 0;
  }, [fixtures, startingXI, currentGW, bootstrap]);

  const renderPlayer = (pick: any, isLarge = false) => {
    if (!pick?.player) return null;
    
    const player = pick.player;
    const size = isLarge ? 'w-20 h-20' : 'w-16 h-16';
    const textSize = isLarge ? 'text-xs' : 'text-xs';
    
    return (
      <div 
        key={pick.element}
        className={`relative cursor-pointer transition-transform hover:scale-105 ${
          selectedPlayer?.element === pick.element ? 'z-10' : ''
        }`}
        onClick={() => setSelectedPlayer(selectedPlayer?.element === pick.element ? null : pick)}
      >
        {/* Player Circle */}
        <div className={`${size} rounded-full bg-white border-2 shadow-lg flex flex-col items-center justify-center relative ${
          getFdrColorLight(2.5) // Default FDR color
        }`}>
          {/* Captain/Vice Captain indicators */}
          {pick.is_captain && (
            <Crown className="absolute -top-1 -right-1 w-5 h-5 text-yellow-500 z-10" />
          )}
          {pick.is_vice_captain && (
            <Star className="absolute -top-1 -right-1 w-4 h-4 text-gray-500 z-10" />
          )}
          
          {/* Player Photo */}
          <img 
            src={getPlayerPhotoUrl(player.code)}
            alt={player.web_name}
            className="w-12 h-12 rounded-full object-cover border border-gray-200"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/player-placeholder.svg';
            }}
          />
        </div>
        
        {/* Player Name */}
        <div className={`text-center mt-1 ${textSize} font-semibold text-gray-800 max-w-16`}>
          <div className="truncate">{player.web_name}</div>
          <div className="text-xs text-gray-500">{formatPrice(player.now_cost)}</div>
        </div>
        
        {/* Team Badge */}
        <div className="absolute -bottom-1 -right-1">
          <img 
            src={getTeamBadgeUrl(player.team_info.code)}
            alt={player.team_info.name}
            className="w-4 h-4 rounded-full border border-white shadow-sm"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/team-placeholder.svg';
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-yellow-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-gray-900">
            My Team Analysis
            <span className="block text-2xl md:text-3xl mt-2 text-transparent bg-clip-text"
              style={{
                background: 'linear-gradient(135deg, #007A3D 0%, #16a34a 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {(teamData as any).name}
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {getSlangPhrase('culture', 'braai')} squad breakdown and transfer planning! 🏆
          </p>
          
          {/* Change Team Button */}
          <div className="mt-4">
            <button 
              onClick={resetTeamId}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Change Team
            </button>
          </div>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Overall Rank</h3>
                <p className="text-sm text-gray-500">Global Position</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-600">
                {(teamData as any).summary_overall_rank?.toLocaleString() || 'N/A'}
              </div>
              <div className="text-sm text-gray-500">
                {(teamData as any).summary_overall_rank 
                  ? `Top ${Math.round(((teamData as any).summary_overall_rank / 9600000) * 100)}%`
                  : 'No rank data'
                }
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Total Points</h3>
                <p className="text-sm text-gray-500">Season Score</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-600">
                {(teamData as any).summary_overall_points?.toLocaleString() || 'N/A'}
              </div>
              <div className="text-sm text-gray-500">
                GW{currentGW?.id}: {(teamPicks as any).entry_history?.points || 0} pts
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Team Value</h3>
                <p className="text-sm text-gray-500">Squad Worth</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-purple-600">
                {formatPrice((teamPicks as any).entry_history?.value || 1000)}
              </div>
              <div className="text-sm text-gray-500">
                Bank: {formatPrice((teamPicks as any).entry_history?.bank || 0)}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Avg FDR</h3>
                <p className="text-sm text-gray-500">Next 5 GWs</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                getFdrColorLight(avgFDR)
              }`}>
                {avgFDR.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">
                {(teamPicks as any).entry_history?.event_transfers_cost || 0} transfer cost
              </div>
            </div>
          </div>
        </div>

        {/* Squad Visualization */}
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-800">
                Squad ({formation.def.length}-{formation.mid.length}-{formation.fwd.length})
              </h2>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-500" />
                <span>Captain</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-gray-500" />
                <span>Vice Captain</span>
              </div>
            </div>
          </div>
          
          {/* Pitch Background */}
          <div className="bg-gradient-to-b from-green-400 to-green-500 rounded-2xl p-8 min-h-96 relative" style={{
            backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.1) 50%, transparent 50%)',
            backgroundSize: '100px 100px'
          }}>
            
            {/* Formation Layout */}
            <div className="space-y-12 h-full flex flex-col justify-between">
              
              {/* Forwards */}
              <div className="flex justify-center space-x-12">
                {formation.fwd.map((pick: any) => renderPlayer(pick))}
              </div>
              
              {/* Midfielders */}
              <div className="flex justify-center space-x-8">
                {formation.mid.map((pick: any) => renderPlayer(pick))}
              </div>
              
              {/* Defenders */}
              <div className="flex justify-center space-x-6">
                {formation.def.map((pick: any) => renderPlayer(pick))}
              </div>
              
              {/* Goalkeeper */}
              <div className="flex justify-center">
                {formation.gk.map((pick: any) => renderPlayer(pick, true))}
              </div>
              
            </div>
          </div>
          
          {/* Bench */}
          <div className="mt-8 p-6 bg-gray-50 rounded-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Bench</h3>
            <div className="grid grid-cols-4 gap-4">
              {bench.map((pick: any) => (
                <div key={pick.element} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                  <img 
                    src={getPlayerPhotoUrl(pick.player.code)}
                    alt={pick.player.web_name}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/player-placeholder.svg';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-800 truncate">{pick.player.web_name}</div>
                    <div className="text-xs text-gray-500">{pick.player.position_info?.singular_name_short}</div>
                  </div>
                  <div className="text-xs text-gray-500">{formatPrice(pick.player.now_cost)}</div>
                </div>
              ))}
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
              Keep analyzing your squad for maximum points, boet! 🇿🇦⚽
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
