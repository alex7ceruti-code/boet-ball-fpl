'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useBootstrapData, useTeamFDR } from '@/hooks/useFplData';
import { useAdvancedPlayerStats, categorizePlayer, calculateAdvancedMetrics, type AdvancedPlayerStats } from '@/hooks/useAdvancedStats';
import { useWatchlist } from '@/hooks/useWatchlist';
import { getSlangPhrase, getLoadingText } from '@/utils/slang';
import SocialMediaImageGenerator from '@/components/SocialMediaImageGenerator';
import {
  Users,
  Search,
  Filter,
  Star,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Eye,
  Plus,
  Minus,
  ChevronDown,
  Trophy,
  Target,
  DollarSign,
  Clock,
  X,
  Zap,
  Lightbulb,
  Crosshair,
  Calendar,
  AlertCircle,
  Info,
  Camera,
  Download
} from 'lucide-react';

type SortField = 'web_name' | 'total_points' | 'form' | 'now_cost' | 'selected_by_percent' | 'goals_scored' | 'assists' | 'clean_sheets' | 'saves' | 'ict_index' | 'expected_goals' | 'expected_assists' | 'value_season' | 'minutes' | 'bonus' | 'consistencyRating' | 'valueEfficiency' | 'attackingThreat' | 'xG90' | 'xA90';
type SortOrder = 'asc' | 'desc';

interface PlayerRowData {
  id: number;
  web_name: string;
  first_name: string;
  second_name: string;
  total_points: number;
  form: string;
  now_cost: number;
  selected_by_percent: string;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  saves: number;
  ict_index: string;
  expected_goals: string;
  expected_assists: string;
  value_season: string;
  minutes: number;
  bonus: number;
  element_type: number;
  team: number;
  code: number;
  team_info?: any;
  position_info?: any;
  news: string;
  status: string;
  chance_of_playing_this_round: number | null;
  chance_of_playing_next_round: number | null;
}

// Helper functions
const getPlayerPhotoUrl = (playerCode: number) =>
  `https://resources.premierleague.com/premierleague/photos/players/110x140/p${playerCode}.png`;

const getTeamBadgeUrl = (teamCode: number) => 
  `https://resources.premierleague.com/premierleague/badges/25/t${teamCode}.png`;

const formatPrice = (price: number) => `£${(price / 10).toFixed(1)}m`;

const getFormColor = (form: string) => {
  const formValue = parseFloat(form);
  if (formValue >= 6) return 'text-green-600 bg-green-50';
  if (formValue >= 4) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
};

const getOwnershipColor = (ownership: number) => {
  if (ownership >= 20) return 'text-red-600';
  if (ownership >= 10) return 'text-orange-600';
  if (ownership >= 5) return 'text-yellow-600';
  return 'text-green-600';
};

const getValueColor = (value: string) => {
  const valueNum = parseFloat(value);
  if (valueNum >= 8) return 'text-green-600';
  if (valueNum >= 6) return 'text-yellow-600';
  return 'text-red-600';
};

const getAvailabilityStatus = (news: string, status: string, chanceThisRound: number | null, chanceNextRound: number | null) => {
  if (status === 'u') return { text: 'Unavailable', color: 'bg-red-100 text-red-800', icon: '❌' };
  if (chanceThisRound === 0) return { text: 'Injured', color: 'bg-red-100 text-red-800', icon: '🏥' };
  if (chanceThisRound === 25) return { text: '25% chance', color: 'bg-orange-100 text-orange-800', icon: '⚠️' };
  if (chanceThisRound === 50) return { text: '50% chance', color: 'bg-yellow-100 text-yellow-800', icon: '❓' };
  if (chanceThisRound === 75) return { text: '75% chance', color: 'bg-green-100 text-green-700', icon: '✅' };
  if (news && news.trim()) return { text: 'News', color: 'bg-blue-100 text-blue-800', icon: '📰' };
  return { text: 'Available', color: 'bg-green-100 text-green-800', icon: '✅' };
};

const getFdrColor = (fdr: number) => {
  if (fdr <= 2) return 'text-green-600 bg-green-100';
  if (fdr <= 3) return 'text-yellow-600 bg-yellow-100';
  if (fdr <= 4) return 'text-orange-600 bg-orange-100';
  return 'text-red-600 bg-red-100';
};

const getIctColor = (value: number, max: number) => {
  const percentage = (value / max) * 100;
  if (percentage >= 80) return 'text-green-600';
  if (percentage >= 60) return 'text-yellow-600';
  if (percentage >= 40) return 'text-orange-600';
  return 'text-red-600';
};

// Player Comparison Card Component
const PlayerComparisonCard = ({ player, onRemove, bootstrap }: { player: any, onRemove: () => void, bootstrap: any }) => {
  const { data: teamFDR } = useTeamFDR(player.team, 5);
  
  const availability = getAvailabilityStatus(
    player.news,
    player.status,
    player.chance_of_playing_this_round,
    player.chance_of_playing_next_round
  );
  
  // ICT metrics
  const influence = parseFloat(player.influence || '0');
  const creativity = parseFloat(player.creativity || '0');
  const threat = parseFloat(player.threat || '0');
  const ictIndex = parseFloat(player.ict_index || '0');
  
  // Calculate max ICT values for color coding
  const maxInfluence = Math.max(...(bootstrap?.elements?.map((p: any) => parseFloat(p.influence || '0')) || [100]));
  const maxCreativity = Math.max(...(bootstrap?.elements?.map((p: any) => parseFloat(p.creativity || '0')) || [100]));
  const maxThreat = Math.max(...(bootstrap?.elements?.map((p: any) => parseFloat(p.threat || '0')) || [100]));
  
  return (
    <div className="bg-gradient-to-br from-braai-50 to-orange-50 rounded-xl p-4 border border-braai-200 relative">
      {/* Remove button */}
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
      
      {/* Player Header */}
      <div className="text-center mb-4">
        <div className="relative inline-block mb-2">
          <Image 
            src={getPlayerPhotoUrl(player.code)}
            alt={player.web_name}
            width={64}
            height={64}
            className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg mx-auto"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/player-placeholder.svg';
            }}
            unoptimized
          />
          <Image 
            src={getTeamBadgeUrl(player.team_info?.code)}
            alt={player.team_info?.name || ''}
            width={32}
            height={32}
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-2 border-white shadow-sm"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/team-placeholder.svg';
            }}
            unoptimized
          />
        </div>
        <h3 className="font-bold text-gray-800 text-lg">{player.web_name}</h3>
        <p className="text-sm text-gray-600">
          {player.team_info?.short_name} • {player.position_info?.singular_name}
        </p>
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mt-1 ${availability.color}`}>
          <span>{availability.icon}</span>
          <span>{availability.text}</span>
        </div>
      </div>
      
      {/* Key Stats */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
            <Trophy className="w-3 h-3" />
            Points
          </span>
          <span className="text-lg font-bold text-braai-primary">{player.total_points}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Form
          </span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getFormColor(player.form)}`}>
            {player.form}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            Price
          </span>
          <span className="font-semibold text-gray-800">{formatPrice(player.now_cost)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
            <Eye className="w-3 h-3" />
            Owned
          </span>
          <span className={`font-semibold ${getOwnershipColor(parseFloat(player.selected_by_percent))}`}>
            {parseFloat(player.selected_by_percent).toFixed(1)}%
          </span>
        </div>
      </div>
      
      {/* Performance Stats */}
      <div className="pt-3 border-t border-braai-200 mb-4">
        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <div className="text-center">
            <div className="font-semibold text-gray-800">{player.goals_scored}</div>
            <div className="text-gray-500">Goals</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-800">{player.assists}</div>
            <div className="text-gray-500">Assists</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-center">
            <div className="font-semibold text-gray-700">{parseFloat(player.expected_goals).toFixed(1)}</div>
            <div className="text-gray-500">xG</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-700">{parseFloat(player.expected_assists).toFixed(1)}</div>
            <div className="text-gray-500">xA</div>
          </div>
        </div>
      </div>
      
      {/* ICT Metrics */}
      <div className="pt-3 border-t border-braai-200 mb-4">
        <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
          <Zap className="w-3 h-3" />
          ICT Breakdown
        </h4>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 flex items-center gap-1">
              <Zap className="w-2 h-2" />
              Influence
            </span>
            <span className={`font-semibold ${getIctColor(influence, maxInfluence)}`}>
              {influence.toFixed(1)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 flex items-center gap-1">
              <Lightbulb className="w-2 h-2" />
              Creativity
            </span>
            <span className={`font-semibold ${getIctColor(creativity, maxCreativity)}`}>
              {creativity.toFixed(1)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 flex items-center gap-1">
              <Crosshair className="w-2 h-2" />
              Threat
            </span>
            <span className={`font-semibold ${getIctColor(threat, maxThreat)}`}>
              {threat.toFixed(1)}
            </span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-braai-100">
            <span className="text-gray-700 font-medium">ICT Index</span>
            <span className="text-lg font-bold text-braai-primary">{ictIndex.toFixed(1)}</span>
          </div>
        </div>
      </div>
      
      {/* Fixture Analysis */}
      {teamFDR && (
        <div className="pt-3 border-t border-braai-200 mb-4">
          <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Next 5 Fixtures (FDR: {teamFDR.averageFdr})
          </h4>
          <div className="space-y-1">
            {teamFDR.fixtures.slice(0, 5).map((fixture: any, index: number) => {
              const isHome = fixture.team_h === player.team;
              const opponent = isHome ? fixture.team_a_info : fixture.team_h_info;
              const difficulty = isHome ? fixture.team_h_difficulty : fixture.team_a_difficulty;
              
              return (
                <div key={fixture.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">GW{fixture.event}</span>
                    <span className={isHome ? 'text-green-700' : 'text-blue-700'}>
                      {isHome ? 'vs' : '@'} {opponent?.short_name}
                    </span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getFdrColor(difficulty)}`}>
                    {difficulty}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Advanced Analytics */}
      {(player.braaiRating || player.biltongValue || player.klapPotential) && (
        <div className="pt-3 border-t border-braai-200 mb-4">
          <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Advanced Analytics
          </h4>
          <div className="space-y-2 text-xs">
            {player.braaiRating && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Consistency Rating</span>
                <span className="font-semibold text-purple-600">{player.braaiRating.toFixed(0)}</span>
              </div>
            )}
            {player.biltongValue && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Value Efficiency</span>
                <span className="font-semibold text-orange-600">{player.biltongValue.toFixed(0)}</span>
              </div>
            )}
            {player.klapPotential && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Attacking Threat</span>
                <span className="font-semibold text-green-600">{player.klapPotential.toFixed(0)}</span>
              </div>
            )}
            {(player.xG90 || player.xA90) && (
              <div className="pt-1 border-t border-braai-100">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {player.xG90 && (
                    <div className="text-center">
                      <div className="font-semibold text-blue-600">{player.xG90.toFixed(2)}</div>
                      <div className="text-gray-500">xG90</div>
                    </div>
                  )}
                  {player.xA90 && (
                    <div className="text-center">
                      <div className="font-semibold text-indigo-600">{player.xA90.toFixed(2)}</div>
                      <div className="text-gray-500">xA90</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Additional Metrics */}
      <div className="pt-3 border-t border-braai-200 space-y-2 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Value</span>
          <span className={`font-semibold ${getValueColor(player.value_season)}`}>
            {parseFloat(player.value_season).toFixed(1)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 flex items-center gap-1">
            <Clock className="w-2 h-2" />
            Minutes
          </span>
          <span className="font-semibold text-gray-800">{player.minutes}</span>
        </div>
      </div>
      
      {/* News */}
      {player.news && (
        <div className="mt-3 pt-3 border-t border-braai-200">
          <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded-lg">
            <div className="flex items-start gap-1">
              <span className="text-blue-600">📰</span>
              <span className="line-clamp-3">{player.news}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function PlayersDatabase() {
  const { data: session } = useSession();
  const { data: bootstrap, isLoading, error } = useBootstrapData();
  const { watchlist, isLoading: watchlistLoading, error: watchlistError, isOnWatchlist, getWatchlistData, getPriorityIcon, getConfidenceLevel } = useWatchlist();
  
  // Check if user is admin
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN';
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState<number | null>(null);
  const [teamFilter, setTeamFilter] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([40, 150]); // £4.0m to £15.0m
  const [ownershipRange, setOwnershipRange] = useState<[number, number]>([0, 100]);
  const [differentialsOnly, setDifferentialsOnly] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAdvancedView, setShowAdvancedView] = useState(false);
  const [sortField, setSortField] = useState<SortField>('total_points');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(true);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [resultsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [showWatchlistTooltip, setShowWatchlistTooltip] = useState<number | null>(null);
  const [showSocialGenerator, setShowSocialGenerator] = useState(false);
  const [selectedPlayerForCard, setSelectedPlayerForCard] = useState<number | null>(null);

  // Process players with advanced analytics
  const processedPlayers = useMemo(() => {
    if (!bootstrap) return [];
    
    return bootstrap.elements.map((player: any) => {
      const team = bootstrap.teams.find((t: any) => t.id === player.team);
      const position = bootstrap.element_types.find((p: any) => p.id === player.element_type);
      
      // Calculate advanced metrics
      const advancedMetrics = calculateAdvancedMetrics(player);
      
      // Get player category
      const playerWithMetrics = {
        ...player,
        ...advancedMetrics,
        team_info: team,
        position_info: position
      };
      
      const category = categorizePlayer(playerWithMetrics as AdvancedPlayerStats);
      
      return {
        ...playerWithMetrics,
        category,
        xG90: advancedMetrics.xG90 || 0,
        xA90: advancedMetrics.xA90 || 0,
        braaiRating: advancedMetrics.braaiRating || 0,
        biltongValue: advancedMetrics.biltongValue || 0,
        klapPotential: advancedMetrics.klapPotential || 0,
      } as PlayerRowData & { category: any, xG90: number, xA90: number, braaiRating: number, biltongValue: number, klapPotential: number };
    });
  }, [bootstrap]);

  const filteredPlayers = useMemo(() => {
    let filtered = processedPlayers.filter(player => {
      const matchesSearch = searchTerm === '' || 
        player.web_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${player.first_name} ${player.second_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.team_info?.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPosition = !positionFilter || player.element_type === positionFilter;
      const matchesTeam = !teamFilter || player.team === teamFilter;
      const matchesPrice = player.now_cost >= priceRange[0] && player.now_cost <= priceRange[1];
      const ownership = parseFloat(player.selected_by_percent);
      const matchesOwnership = ownership >= ownershipRange[0] && ownership <= ownershipRange[1];
      const matchesDifferential = !differentialsOnly || ownership <= 5;
      
      return matchesSearch && matchesPosition && matchesTeam && matchesPrice && matchesOwnership && matchesDifferential;
    });
    
    // Sort players
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];
      
      // Handle string numbers
      if (typeof aValue === 'string' && !isNaN(parseFloat(aValue))) {
        aValue = parseFloat(aValue);
      }
      if (typeof bValue === 'string' && !isNaN(parseFloat(bValue))) {
        bValue = parseFloat(bValue);
      }
      
      // Handle strings
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filtered;
  }, [processedPlayers, searchTerm, positionFilter, teamFilter, priceRange, ownershipRange, differentialsOnly, sortField, sortOrder]);

  // Paginated players
  const paginatedPlayers = useMemo(() => {
    const startIndex = (currentPage - 1) * resultsPerPage;
    const endIndex = startIndex + resultsPerPage;
    return filteredPlayers.slice(startIndex, endIndex);
  }, [filteredPlayers, currentPage, resultsPerPage]);

  const totalPages = Math.ceil(filteredPlayers.length / resultsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const togglePlayerSelection = (playerId: number) => {
    setSelectedPlayers(prev => 
      prev.includes(playerId) 
        ? prev.filter(id => id !== playerId)
        : prev.length < 4 ? [...prev, playerId] : prev
    );
  };

  const clearAllSelections = () => {
    setSelectedPlayers([]);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setPositionFilter(null);
    setTeamFilter(null);
    setPriceRange([40, 150]);
    setOwnershipRange([0, 100]);
    setDifferentialsOnly(false);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-braai-primary mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">Finding the ballers...</p>
          <p className="text-sm text-gray-500 mt-2">Loading the player database...</p>
        </div>
      </div>
    );
  }

  if (error || !bootstrap) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😅</div>
          <h2 className="text-2xl font-bold text-red-800 mb-4">Eish, something's not lekker...</h2>
          <p className="text-red-600 mb-6">Having trouble loading player data. Check your connection, boet!</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-gray-900">
            Players Database
            <span className="block text-2xl md:text-3xl mt-2 text-transparent bg-clip-text"
              style={{
                background: 'linear-gradient(135deg, #007A3D 0%, #16a34a 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Find Your Next FPL Gem
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Live FPL data with advanced filtering and comparison tools! 🏆
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-600">
            <div className="w-2 h-2 bg-springbok-green rounded-full animate-pulse"></div>
            <span>Live data from FPL API • Updated in real-time</span>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 mb-8">
          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search players by name or team..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-braai-primary focus:border-transparent"
              />
            </div>
            
<div className="flex gap-3">
              <button
                onClick={() => setShowAdvancedView(!showAdvancedView)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-semibold ${
                  showAdvancedView 
                    ? 'bg-purple-600 text-white hover:bg-purple-700' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Zap className="w-5 h-5" />
                {showAdvancedView ? 'Basic View' : 'Advanced Analytics'}
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-6 py-3 bg-springbok-green text-white rounded-lg hover:bg-springbok-700 transition-colors"
              >
                <Filter className="w-5 h-5" />
                Filters
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="p-6 bg-gray-50 rounded-xl space-y-6">
              {/* First Row - Dropdowns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Position Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                  <select
                    value={positionFilter || ''}
                    onChange={(e) => setPositionFilter(e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-braai-primary focus:border-transparent"
                  >
                    <option value="">All Positions</option>
                    {bootstrap?.element_types.map((pos: any) => (
                      <option key={pos.id} value={pos.id}>
                        {pos.singular_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Team Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Team</label>
                  <select
                    value={teamFilter || ''}
                    onChange={(e) => setTeamFilter(e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-braai-primary focus:border-transparent"
                  >
                    <option value="">All Teams</option>
                    {bootstrap?.teams.map((team: any) => (
                      <option key={team.id} value={team.id}>
                        {team.short_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Second Row - Ranges */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Price Range</label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 min-w-[3rem]">£{(priceRange[0] / 10).toFixed(1)}m</span>
                      <input
                        type="range"
                        min="40"
                        max="150"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                        className="flex-1"
                      />
                      <input
                        type="range"
                        min="40"
                        max="150"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="flex-1"
                      />
                      <span className="text-xs text-gray-500 min-w-[3rem] text-right">£{(priceRange[1] / 10).toFixed(1)}m</span>
                    </div>
                  </div>
                </div>

                {/* Ownership Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Ownership Range</label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 min-w-[3rem]">{ownershipRange[0]}%</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={ownershipRange[0]}
                        onChange={(e) => setOwnershipRange([parseInt(e.target.value), ownershipRange[1]])}
                        className="flex-1"
                      />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={ownershipRange[1]}
                        onChange={(e) => setOwnershipRange([ownershipRange[0], parseInt(e.target.value)])}
                        className="flex-1"
                      />
                      <span className="text-xs text-gray-500 min-w-[3rem] text-right">{ownershipRange[1]}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Third Row - Differentials Toggle */}
              <div className="flex justify-center">
                <div className="w-48">
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Differentials Only</label>
                  <button
                    onClick={() => setDifferentialsOnly(!differentialsOnly)}
                    className={`w-full px-4 py-2 rounded-lg border transition-colors flex items-center justify-center gap-2 ${
                      differentialsOnly
                        ? 'bg-braai-primary text-white border-braai-primary'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${differentialsOnly ? 'fill-current' : ''}`} />
                    <span className="text-sm font-medium">{differentialsOnly ? 'On (≤5% owned)' : 'Off'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Results Summary */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {paginatedPlayers.length} of {filteredPlayers.length} players
            </div>
            
            {selectedPlayers.length > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-braai-primary font-semibold">
                  {selectedPlayers.length}/4 selected for comparison
                </span>
                <button
                  onClick={clearAllSelections}
                  className="text-sm text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              </div>
            )}
            
            <button
              onClick={resetFilters}
              className="text-sm text-gray-600 hover:text-gray-800 font-semibold"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Selected Players Comparison Bar with Compare Button */}
        {selectedPlayers.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-800">Selected {selectedPlayers.length} Player{selectedPlayers.length > 1 ? 's' : ''}:</span>
                <div className="flex items-center gap-2">
                  {selectedPlayers.slice(0, 4).map(playerId => {
                    const player = processedPlayers.find(p => p.id === playerId);
                    return player ? (
                      <div key={playerId} className="flex items-center gap-2 bg-white px-3 py-1 rounded-full text-sm">
                        <img 
                          src={getPlayerPhotoUrl(player.code)}
                          alt={player.web_name}
                          className="w-6 h-6 rounded-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/player-placeholder.svg';
                          }}
                        />
                        <span className="font-medium">{player.web_name}</span>
                        <button
                          onClick={() => togglePlayerSelection(playerId)}
                          className="text-gray-500 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSocialGenerator(true)}
                  className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md"
                >
                  <Camera className="w-5 h-5" />
                  Share
                </button>
                <button
                  onClick={() => setShowCompareModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md"
                >
                  <Target className="w-5 h-5" />
                  Compare Players
                </button>
                <button
                  onClick={clearAllSelections}
                  className="text-sm text-red-600 hover:text-red-700 font-semibold"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Player Comparison */}
        {showCompareModal && selectedPlayers.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <Target className="w-8 h-8 text-springbok-green" />
                    Player Comparison
                  </h2>
                  <button
                    onClick={() => setShowCompareModal(false)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="text-lg text-gray-600 mt-2">
                  {getSlangPhrase('comparison')}
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {selectedPlayers.slice(0, 4).map(playerId => {
                    const player = processedPlayers.find(p => p.id === playerId);
                    if (!player) return null;
                    
                    return (
                      <PlayerComparisonCard
                        key={playerId}
                        player={player}
                        onRemove={() => togglePlayerSelection(playerId)}
                        bootstrap={bootstrap}
                      />
                    );
                  })}
                </div>
                
                {/* Comparison Summary in Modal */}
                {selectedPlayers.length > 1 && (
                  <div className="mt-8 p-6 bg-springbok-50 rounded-xl border border-springbok-200">
                    <h4 className="text-xl font-bold text-springbok-800 mb-4 flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      Quick Comparison Summary
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-springbok-green mb-2">
                          {selectedPlayers.reduce((max, playerId) => {
                            const player = processedPlayers.find(p => p.id === playerId);
                            return player && player.total_points > max ? player.total_points : max;
                          }, 0)}
                        </div>
                        <div className="text-gray-600 font-medium">Highest Points</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                          £{(Math.min(...selectedPlayers.map(playerId => {
                            const player = processedPlayers.find(p => p.id === playerId);
                            return player ? player.now_cost : Infinity;
                          })) / 10).toFixed(1)}m
                        </div>
                        <div className="text-gray-600 font-medium">Cheapest</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-600 mb-2">
                          {Math.max(...selectedPlayers.map(playerId => {
                            const player = processedPlayers.find(p => p.id === playerId);
                            return player ? parseFloat(player.form) : 0;
                          })).toFixed(1)}
                        </div>
                        <div className="text-gray-600 font-medium">Best Form</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                          {Math.min(...selectedPlayers.map(playerId => {
                            const player = processedPlayers.find(p => p.id === playerId);
                            return player ? parseFloat(player.selected_by_percent) : 100;
                          })).toFixed(1)}%
                        </div>
                        <div className="text-gray-600 font-medium">Lowest Owned</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Players Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      onChange={() => {
                        if (selectedPlayers.length === paginatedPlayers.length) {
                          setSelectedPlayers([]);
                        } else {
                          setSelectedPlayers(paginatedPlayers.slice(0, 4).map(p => p.id));
                        }
                      }}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('total_points')}
                      className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-braai-primary"
                    >
                      Points
                      {sortField === 'total_points' ? (
                        sortOrder === 'asc' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('form')}
                      className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-braai-primary"
                    >
                      Form
                      {sortField === 'form' ? (
                        sortOrder === 'asc' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('now_cost')}
                      className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-braai-primary"
                    >
                      Price
                      {sortField === 'now_cost' ? (
                        sortOrder === 'asc' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('selected_by_percent')}
                      className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-braai-primary"
                    >
                      Owned
                      {sortField === 'selected_by_percent' ? (
                        sortOrder === 'asc' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('goals_scored')}
                      className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-braai-primary"
                    >
                      G
                      {sortField === 'goals_scored' ? (
                        sortOrder === 'asc' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('assists')}
                      className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-braai-primary"
                    >
                      A
                      {sortField === 'assists' ? (
                        sortOrder === 'asc' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('expected_goals')}
                      className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-braai-primary"
                    >
                      xG
                      {sortField === 'expected_goals' ? (
                        sortOrder === 'asc' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('expected_assists')}
                      className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-braai-primary"
                    >
                      xA
                      {sortField === 'expected_assists' ? (
                        sortOrder === 'asc' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('value_season')}
                      className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-braai-primary"
                    >
                      Value
                      {sortField === 'value_season' ? (
                        sortOrder === 'asc' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3" />
                      )}
                    </button>
                  </th>
                  {showAdvancedView && (
                    <>
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={() => handleSort('consistencyRating')}
                          className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-braai-primary"
                        >
                          Consistency Rating
                          {sortField === 'consistencyRating' ? (
                            sortOrder === 'asc' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3" />
                          )}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={() => handleSort('valueEfficiency')}
                          className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-braai-primary"
                        >
                          Value Efficiency
                          {sortField === 'valueEfficiency' ? (
                            sortOrder === 'asc' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3" />
                          )}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={() => handleSort('attackingThreat')}
                          className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-braai-primary"
                        >
                          Attacking Threat
                          {sortField === 'attackingThreat' ? (
                            sortOrder === 'asc' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3" />
                          )}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={() => handleSort('xG90')}
                          className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-braai-primary"
                        >
                          xG90
                          {sortField === 'xG90' ? (
                            sortOrder === 'asc' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3" />
                          )}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={() => handleSort('xA90')}
                          className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-braai-primary"
                        >
                          xA90
                          {sortField === 'xA90' ? (
                            sortOrder === 'asc' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3" />
                          )}
                        </button>
                      </th>
                    </>
                  )}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedPlayers.map((player) => {
                  const availability = getAvailabilityStatus(
                    player.news,
                    player.status,
                    player.chance_of_playing_this_round,
                    player.chance_of_playing_next_round
                  );
                  
                  return (
                    <tr
                      key={player.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        selectedPlayers.includes(player.id) ? 'bg-braai-50 border-l-4 border-braai-primary' : ''
                      }`}
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedPlayers.includes(player.id)}
                          onChange={() => togglePlayerSelection(player.id)}
                          disabled={!selectedPlayers.includes(player.id) && selectedPlayers.length >= 4}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img 
                              src={getPlayerPhotoUrl(player.code)}
                              alt={player.web_name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/player-placeholder.svg';
                              }}
                            />
                            <img 
                              src={getTeamBadgeUrl(player.team_info?.code)}
                              alt={player.team_info?.name}
                              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/team-placeholder.svg';
                              }}
                            />
                            {/* Watchlist indicator */}
                            {isOnWatchlist(player.id) && (
                              <div className="absolute -top-1 -left-1 w-5 h-5">
                                <div 
                                  className="w-full h-full bg-yellow-400 rounded-full flex items-center justify-center text-xs cursor-pointer shadow-md border border-yellow-500 hover:bg-yellow-300 transition-colors"
                                  onMouseEnter={() => setShowWatchlistTooltip(player.id)}
                                  onMouseLeave={() => setShowWatchlistTooltip(null)}
                                  title="On Admin Watchlist"
                                >
                                  {getPriorityIcon(getWatchlistData(player.id)?.priority || 'MEDIUM').icon}
                                </div>
                                {/* Watchlist Tooltip */}
                                {showWatchlistTooltip === player.id && (
                                  <div className="absolute top-6 left-0 z-10 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl w-64 border border-gray-700">
                                    <div className="font-semibold mb-1 flex items-center gap-2">
                                      <AlertCircle className="w-3 h-3 text-yellow-400" />
                                      Admin Watchlist
                                    </div>
                                    <div className="space-y-1">
                                      {getWatchlistData(player.id)?.reason && (
                                        <div className="text-gray-300">
                                          <span className="font-medium">Reason:</span> {getWatchlistData(player.id)?.reason}
                                        </div>
                                      )}
                                      {getWatchlistData(player.id)?.eyeTestNotes && (
                                        <div className="text-gray-300">
                                          <span className="font-medium">Notes:</span> {getWatchlistData(player.id)?.eyeTestNotes}
                                        </div>
                                      )}
                                      <div className="flex items-center justify-between pt-1 border-t border-gray-700">
                                        <span className="text-gray-400">Priority:</span>
                                        <span className="flex items-center gap-1 font-medium">
                                          {getPriorityIcon(getWatchlistData(player.id)?.priority || 'MEDIUM').icon}
                                          {getWatchlistData(player.id)?.priority || 'MEDIUM'}
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-gray-400">Confidence:</span>
                                        <span className={`font-medium ${getConfidenceLevel(getWatchlistData(player.id)?.confidence || 50).color}`}>
                                          {getConfidenceLevel(getWatchlistData(player.id)?.confidence || 50).text}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 flex items-center gap-2">
                              {player.web_name}
                              {isOnWatchlist(player.id) && (
                                <span className="text-xs px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded-full font-medium">
                                  Watch
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {player.team_info?.short_name} • {player.position_info?.singular_name_short}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-lg font-bold text-braai-primary">{player.total_points}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                          getFormColor(player.form)
                        }`}>
                          {player.form}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-semibold text-gray-900">{formatPrice(player.now_cost)}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className={`font-semibold ${
                          getOwnershipColor(parseFloat(player.selected_by_percent))
                        }`}>
                          {parseFloat(player.selected_by_percent).toFixed(1)}%
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="font-semibold text-gray-900">{player.goals_scored}</div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="font-semibold text-gray-900">{player.assists}</div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="font-semibold text-gray-700">{parseFloat(player.expected_goals).toFixed(1)}</div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="font-semibold text-gray-700">{parseFloat(player.expected_assists).toFixed(1)}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className={`font-semibold ${
                          getValueColor(player.value_season)
                        }`}>
                          {parseFloat(player.value_season).toFixed(1)}
                        </div>
                      </td>
                      {showAdvancedView && (
                        <>
                          <td className="px-4 py-4 text-center">
                            <div className="font-semibold text-purple-600">{(player as any).consistencyRating?.toFixed(0) || '0'}</div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="font-semibold text-orange-600">{(player as any).valueEfficiency?.toFixed(0) || '0'}</div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="font-semibold text-green-600">{(player as any).attackingThreat?.toFixed(0) || '0'}</div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="font-semibold text-blue-600">{(player as any).xG90?.toFixed(2) || '0.00'}</div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="font-semibold text-indigo-600">{(player as any).xA90?.toFixed(2) || '0.00'}</div>
                          </td>
                        </>
                      )}
                      <td className="px-4 py-4">
                        <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${availability.color}`}>
                          <span>{availability.icon}</span>
                          <span>{availability.text}</span>
                        </div>
                        {player.news && (
                          <div className="text-xs text-gray-500 mt-1 max-w-xs truncate" title={player.news}>
                            {player.news}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {isAdmin ? (
                          <button
                            onClick={() => setSelectedPlayerForCard(player.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 text-xs font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                            title="Create FUT Card for Instagram"
                          >
                            <Camera className="w-3 h-3" />
                            <span>FUT Card</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-300 text-gray-500 rounded-lg text-xs font-semibold" title="FUT Cards available to admin users only">
                            <Camera className="w-3 h-3" />
                            <span>Premium</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 text-sm border rounded-md ${
                        currentPage === pageNum
                          ? 'bg-braai-primary text-white border-braai-primary'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Tips and Usage Guide */}
        <div className="mt-8 bg-braai-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-braai-primary" />
            Player Database Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <h4 className="font-semibold text-braai-primary mb-2">🔍 Search & Filter:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Use search to quickly find specific players or teams</li>
                <li>Apply position and price filters to narrow results</li>
                <li>Toggle differentials to find low-owned gems (≤5%)</li>
                <li>Click column headers to sort by any stat</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-braai-primary mb-2">🎯 Compare Players:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Select up to 4 players using checkboxes</li>
                <li>Use the comparison bar to see selected players</li>
                <li>Click "Compare Players" to open detailed comparison</li>
                <li>Perfect for finding your next transfer target!</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Social Media Image Generator Modal */}
        {showSocialGenerator && selectedPlayers.length > 0 && (
          <SocialMediaImageGenerator
            data={selectedPlayers.map(id => processedPlayers.find(p => p.id === id)).filter(Boolean)}
            template="player-comparison"
            title={`Boet Ball Player Comparison - ${selectedPlayers.length} Players`}
            onClose={() => setShowSocialGenerator(false)}
          />
        )}
        
        {/* Individual Player FUT Card Modal */}
        {selectedPlayerForCard && (
          <SocialMediaImageGenerator
            data={processedPlayers.find(p => p.id === selectedPlayerForCard)}
            template="fut-card"
            title={`${processedPlayers.find(p => p.id === selectedPlayerForCard)?.web_name} - FUT Card`}
            onClose={() => setSelectedPlayerForCard(null)}
          />
        )}
      </div>
    </div>
  );
}
