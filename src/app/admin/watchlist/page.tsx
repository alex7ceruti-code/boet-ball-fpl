'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useBootstrapData } from '@/hooks/useFplData';
import { calculateAdvancedMetrics } from '@/hooks/useAdvancedStats';
import {
  Eye,
  Star,
  Target,
  TrendingUp,
  TrendingDown,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  X,
  Lightbulb,
  BarChart3,
  Zap,
  Award,
  DollarSign,
  Users,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus,
  Crown
} from 'lucide-react';

interface WatchlistPlayer {
  id: string;
  fplPlayerId: number;
  playerName: string;
  teamName: string;
  position: string;
  currentPrice: number;
  reason: string;
  eyeTestNotes?: string;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  status: 'ACTIVE' | 'MONITORING' | 'TRIGGERED' | 'ARCHIVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  reliabilityScore: number;
  valueScore: number;
  attackingThreat: number;
  targetPrice?: number;
  targetGW?: number;
  addedAt: string;
  updatedAt: string;
  admin: {
    name: string;
    email: string;
  };
}

export default function AdminWatchlist() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { data: bootstrap, isLoading: bootstrapLoading } = useBootstrapData();
  
  const [watchlistPlayers, setWatchlistPlayers] = useState<WatchlistPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [formData, setFormData] = useState({
    fplPlayerId: '',
    playerName: '',
    teamName: '',
    position: '',
    currentPrice: '',
    reason: '',
    eyeTestNotes: '',
    confidence: 'MEDIUM',
    priority: 'MEDIUM',
    targetPrice: '',
    targetGW: '',
    reliabilityScore: 0,
    valueScore: 0,
    attackingThreat: 0
  });

  // Check admin access
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Fetch watchlist data
  useEffect(() => {
    if (session?.user?.id) {
      fetchWatchlist();
    }
  }, [session, statusFilter, priorityFilter]);

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);

      const response = await fetch(`/api/admin/watchlist?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          setError('You need admin access to manage the watchlist. Contact support for admin privileges.');
          return;
        }
        throw new Error(data.error || 'Failed to fetch watchlist');
      }

      setWatchlistPlayers(data.players || []);
    } catch (error) {
      console.error('Watchlist fetch error:', error);
      setError(error instanceof Error ? error.message : 'Failed to load watchlist');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerSelect = (player: any) => {
    if (!player) return;
    
    // Calculate advanced metrics
    const metrics = calculateAdvancedMetrics(player);
    
    setFormData({
      fplPlayerId: player.id.toString(),
      playerName: player.web_name,
      teamName: player.team_info?.name || '',
      position: player.position_info?.singular_name || '',
      currentPrice: (player.now_cost / 10).toString(),
      reason: '',
      eyeTestNotes: '',
      confidence: 'MEDIUM',
      priority: 'MEDIUM',
      targetPrice: '',
      targetGW: '',
      reliabilityScore: metrics.consistencyRating || 0,
      valueScore: metrics.valueEfficiency || 0,
      attackingThreat: metrics.attackingThreat || 0
    });
    
    setSelectedPlayer(player);
  };

  const handleAddToWatchlist = async () => {
    try {
      setError('');
      
      if (!formData.reason.trim()) {
        setError('Please provide a reason for watching this player');
        return;
      }

      console.log('Submitting form data:', formData);

      const response = await fetch('/api/admin/watchlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add player to watchlist');
      }

      // Reset form and close modal
      setFormData({
        fplPlayerId: '',
        playerName: '',
        teamName: '',
        position: '',
        currentPrice: '',
        reason: '',
        eyeTestNotes: '',
        confidence: 'MEDIUM',
        priority: 'MEDIUM',
        targetPrice: '',
        targetGW: '',
        reliabilityScore: 0,
        valueScore: 0,
        attackingThreat: 0
      });
      setSelectedPlayer(null);
      setShowAddModal(false);
      
      // Refresh watchlist
      fetchWatchlist();
    } catch (error) {
      console.error('Add watchlist error:', error);
      setError(error instanceof Error ? error.message : 'Failed to add player');
    }
  };

  const handleRemovePlayer = async (id: string) => {
    if (!confirm('Are you sure you want to remove this player from the watchlist?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/watchlist/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove player');
      }

      // Refresh watchlist
      fetchWatchlist();
    } catch (error) {
      console.error('Remove player error:', error);
      setError(error instanceof Error ? error.message : 'Failed to remove player');
    }
  };

  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case 'VERY_HIGH': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'HIGH': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'MEDIUM': return <Minus className="w-4 h-4 text-blue-500" />;
      case 'LOW': return <TrendingDown className="w-4 h-4 text-gray-500" />;
      default: return <Minus className="w-4 h-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'LOW': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200';
      case 'MONITORING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'TRIGGERED': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  // Filter players for search
  const filteredPlayers = bootstrap?.elements?.filter((player: any) => {
    return (
      player.web_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${player.first_name} ${player.second_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }) || [];

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">Loading watchlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Eye className="w-8 h-8 text-springbok-green" />
                Players to Watch
              </h1>
              <p className="text-gray-600">
                Curate your FPL watchlist combining advanced stats with the eye test
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-springbok-green text-white rounded-lg font-semibold hover:bg-springbok-800 transition-colors shadow-md"
            >
              <Plus className="w-5 h-5" />
              Add Player
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-springbok-green focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="MONITORING">Monitoring</option>
                <option value="TRIGGERED">Triggered</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-springbok-green focus:border-transparent"
              >
                <option value="">All Priorities</option>
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchWatchlist}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Watchlist Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Current Watchlist ({watchlistPlayers.length} players)</h3>
          </div>
          
          {watchlistPlayers.length === 0 ? (
            <div className="text-center py-12">
              <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No players on watchlist</h3>
              <p className="text-gray-500 mb-6">Start building your curated FPL watchlist with advanced analytics</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-springbok-green text-white rounded-lg font-semibold hover:bg-springbok-800 transition-colors"
              >
                Add First Player
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Analytics</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Eye Test</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {watchlistPlayers.map((player) => (
                    <tr key={player.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-gray-900">{player.playerName}</div>
                          <div className="text-sm text-gray-500">{player.teamName} • {player.position} • £{player.currentPrice}m</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              <span>Reliability: {player.reliabilityScore}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              <span>Value: {player.valueScore}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Attack: {player.attackingThreat}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(player.status)}`}>
                            {player.status.toLowerCase()}
                          </div>
                          <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(player.priority)}`}>
                            {getConfidenceIcon(player.confidence)}
                            {player.priority.toLowerCase()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          <p className="line-clamp-2">{player.reason}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-500 max-w-xs">
                          {player.eyeTestNotes ? (
                            <p className="line-clamp-2">{player.eyeTestNotes}</p>
                          ) : (
                            <span className="italic">No notes</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div>{new Date(player.addedAt).toLocaleDateString()}</div>
                        <div className="text-xs">by {player.admin.name}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleRemovePlayer(player.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Remove from watchlist"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Player Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col">
              <div className="p-6 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <Plus className="w-6 h-6 text-springbok-green" />
                    Add Player to Watchlist
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setSelectedPlayer(null);
                    }}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                {/* Player Search */}
                {!selectedPlayer && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Search Players</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search for a player..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-springbok-green focus:border-transparent"
                      />
                    </div>
                    
                    {/* Player Results */}
                    {searchTerm && (
                      <div className="mt-4 max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                        {filteredPlayers.slice(0, 20).map((player: any) => {
                          const metrics = calculateAdvancedMetrics(player);
                          return (
                            <div
                              key={player.id}
                              onClick={() => handlePlayerSelect(player)}
                              className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                            >
                              <div>
                                <div className="font-medium text-gray-900">{player.web_name}</div>
                                <div className="text-sm text-gray-500">
                                  {player.team_info?.name} • {player.position_info?.singular_name} • £{(player.now_cost / 10).toFixed(1)}m
                                </div>
                              </div>
                              <div className="text-xs text-gray-500">
                                R:{metrics.consistencyRating} V:{metrics.valueEfficiency} A:{metrics.attackingThreat}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Selected Player Form */}
                {selectedPlayer && (
                  <div className="space-y-6">
                    {/* Player Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Selected Player</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="font-medium">{selectedPlayer.web_name}</div>
                          <div className="text-sm text-gray-500">{selectedPlayer.team_info?.name} • {selectedPlayer.position_info?.singular_name}</div>
                        </div>
                        <div>
                          <div className="font-medium">£{(selectedPlayer.now_cost / 10).toFixed(1)}m</div>
                          <div className="text-sm text-gray-500">Current price</div>
                        </div>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Reason for Watching *
                        </label>
                        <textarea
                          value={formData.reason}
                          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                          placeholder="Why are you watching this player? What caught your attention?"
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-springbok-green focus:border-transparent"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Eye Test Notes
                        </label>
                        <textarea
                          value={formData.eyeTestNotes}
                          onChange={(e) => setFormData({ ...formData, eyeTestNotes: e.target.value })}
                          placeholder="What did you notice from watching games? Positioning, chances, team role..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-springbok-green focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confidence</label>
                        <select
                          value={formData.confidence}
                          onChange={(e) => setFormData({ ...formData, confidence: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-springbok-green focus:border-transparent"
                        >
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                          <option value="VERY_HIGH">Very High</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                        <select
                          value={formData.priority}
                          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-springbok-green focus:border-transparent"
                        >
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                          <option value="URGENT">Urgent</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Target Price (£m)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.targetPrice}
                          onChange={(e) => setFormData({ ...formData, targetPrice: e.target.value })}
                          placeholder="e.g. 8.5"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-springbok-green focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Target GW</label>
                        <input
                          type="number"
                          value={formData.targetGW}
                          onChange={(e) => setFormData({ ...formData, targetGW: e.target.value })}
                          placeholder="e.g. 15"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-springbok-green focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Advanced Analytics Display */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Advanced Analytics
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{formData.reliabilityScore}</div>
                          <div className="text-sm text-gray-600">Reliability</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">{formData.valueScore}</div>
                          <div className="text-sm text-gray-600">Value</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{formData.attackingThreat}</div>
                          <div className="text-sm text-gray-600">Attack</div>
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>
              
              {/* Modal Footer with Actions - Always visible */}
              {selectedPlayer && (
                <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-sm text-gray-600">
                      * Required fields must be filled
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setSelectedPlayer(null);
                          setSearchTerm('');
                        }}
                        className="px-6 py-3 text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-all duration-200 font-medium"
                      >
                        Back to Search
                      </button>
                      <button
                        onClick={handleAddToWatchlist}
                        disabled={!formData.reason.trim()}
                        className="px-8 py-3 bg-gradient-to-r from-springbok-green to-sa-gold text-white rounded-lg font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
                      >
                        🚀 Add to Watchlist
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
