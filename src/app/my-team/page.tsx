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
  ChevronLeft,
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
  ArrowUpDown,
  Plus,
  Minus,
  Calculator,
  Award,
  Activity,
  Clock,
  Eye,
  Lock,
  Unlock
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
  const [selectedGameweek, setSelectedGameweek] = useState<number | null>(null);
  
  // Manual team builder state
  const [buildMode, setBuildMode] = useState<'fpl-id' | 'manual'>('fpl-id');
  const [manualTeam, setManualTeam] = useState<{
    formation: { gk: any[], def: any[], mid: any[], fwd: any[] };
    bench: any[];
    captain: any;
    viceCaptain: any;
    totalValue: number;
  }>({
    formation: { gk: [], def: [], mid: [], fwd: [] },
    bench: [],
    captain: null,
    viceCaptain: null,
    totalValue: 0
  });
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<'gk' | 'def' | 'mid' | 'fwd' | 'bench' | null>(null);
  const [playerSearchTerm, setPlayerSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState<number | null>(null);
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState<'3-5-2' | '3-4-3' | '4-5-1' | '4-4-2' | '4-3-3' | '5-4-1' | '5-3-2'>('3-5-2');
  const [selectedSwapPlayer, setSelectedSwapPlayer] = useState<{ player: any, isFromBench: boolean } | null>(null);
  const [importTeamId, setImportTeamId] = useState<string>('');
  
  // Auto-load FPL Team ID from user profile
  useEffect(() => {
    if (session?.user?.fplTeamId && !submittedTeamId) {
      setSubmittedTeamId(session.user.fplTeamId);
      setTeamId(session.user.fplTeamId.toString());
    }
  }, [session, submittedTeamId]);
  
  // Initialize selected gameweek to current gameweek
  useEffect(() => {
    if (currentGW && !selectedGameweek) {
      setSelectedGameweek(currentGW.id);
    }
  }, [currentGW, selectedGameweek]);
  
  // Fetch team data only when team ID is submitted
  const { data: teamData, isLoading: teamLoading, error: teamError } = useManagerTeam(submittedTeamId);
  const { data: teamPicks, isLoading: picksLoading, error: picksError } = useManagerPicks(
    submittedTeamId, 
    selectedGameweek || currentGW?.id || null
  );

  // Get filtered players for modal
  const filteredPlayers = useMemo(() => {
    if (!bootstrap) return [];
    
    let players = bootstrap.elements.filter((player: any) => {
      // Position filter
      if (positionFilter && player.element_type !== positionFilter) return false;
      
      // Search filter
      if (playerSearchTerm) {
        const searchLower = playerSearchTerm.toLowerCase();
        const playerName = (player.web_name || player.first_name + ' ' + player.second_name).toLowerCase();
        const teamName = bootstrap.teams.find(t => t.id === player.team)?.name.toLowerCase() || '';
        
        return playerName.includes(searchLower) || teamName.includes(searchLower);
      }
      
      return true;
    });
    
    // Add team and position info
    players = players.map((player: any) => ({
      ...player,
      team_info: bootstrap.teams.find(t => t.id === player.team),
      position_info: bootstrap.element_types.find(p => p.id === player.element_type)
    }));
    
    // Sort by total points descending
    return players.sort((a: any, b: any) => (b.total_points || 0) - (a.total_points || 0));
  }, [bootstrap, positionFilter, playerSearchTerm]);

  // Get manual team players for analytics (when in manual mode)
  const getManualTeamData = useMemo(() => {
    if (buildMode !== 'manual') return null;
    
    const allPlayers = [
      ...manualTeam.formation.gk,
      ...manualTeam.formation.def,
      ...manualTeam.formation.mid,
      ...manualTeam.formation.fwd,
      ...manualTeam.bench
    ];
    
    // Convert to FPL picks format for compatibility
    const picks = allPlayers.map((player, index) => {
      const isStarting = index < 11;
      return {
        element: player.id,
        position: index + 1,
        multiplier: isStarting ? 1 : 0,
        is_captain: manualTeam.captain?.id === player.id,
        is_vice_captain: manualTeam.viceCaptain?.id === player.id,
        player: player
      };
    });
    
    return {
      picks,
      entry_history: {
        points: allPlayers.reduce((sum, p) => sum + (p.total_points || 0), 0),
        event_transfers: 1
      }
    };
  }, [manualTeam, buildMode]);

  // Get team players with full data - ALWAYS call this hook
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

  // Calculate average FDR for selected gameweek and next 4 gameweeks - ALWAYS call this hook
  const avgFDR = useMemo(() => {
    if (!fixtures || !selectedGameweek || !bootstrap) return 0;
    
    const startingXI = teamPlayers.filter((p: any) => p.multiplier > 0);
    
    const nextGWs = bootstrap.events
      .filter(gw => gw.id >= selectedGameweek && gw.id < selectedGameweek + 5)
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
  }, [fixtures, teamPlayers, selectedGameweek, bootstrap]);

  // Sample team rating based on fixtures - ALWAYS call this hook
  const teamRating = useMemo(() => {
    if (!fixtures || !currentGW) return 0;
    
    const startingXI = teamPlayers.filter((p: any) => p.multiplier > 0);
    let totalRating = 0;
    let playerCount = 0;
    
    startingXI.forEach((pick: any) => {
      // Simple rating: player points + form - fixture difficulty
      const playerRating = (pick.player.total_points / (currentGW.id || 1)) * 10;
      const formRating = (pick.player.form || 0) * 2;
      const fdrPenalty = avgFDR * 1.5;
      
      totalRating += Math.max(playerRating + formRating - fdrPenalty, 1);
      playerCount++;
    });
    
    return playerCount > 0 ? Math.min(totalRating / playerCount, 10) : 5;
  }, [teamPlayers, avgFDR, currentGW, fixtures]);
  
  // Reset manual team when switching modes
  const handleModeChange = (newMode: 'fpl-id' | 'manual') => {
    console.log('Mode change requested:', buildMode, '->', newMode);
    
    if (newMode !== buildMode) {
      setBuildMode(newMode);
      
      if (newMode === 'manual') {
        // Reset manual team when switching to manual mode
        console.log('Resetting manual team');
        setManualTeam({
          formation: { gk: [], def: [], mid: [], fwd: [] },
          bench: [],
          captain: null,
          viceCaptain: null,
          totalValue: 0
        });
        // Clear FPL team state when switching to manual
        setSubmittedTeamId(null);
        setTeamId('');
      } else {
        // Reset FPL team when switching to FPL mode
        console.log('Resetting to FPL mode');
        setSubmittedTeamId(null);
        setTeamId('');
        // Clear manual team state when switching to FPL
        setManualTeam({
          formation: { gk: [], def: [], mid: [], fwd: [] },
          bench: [],
          captain: null,
          viceCaptain: null,
          totalValue: 0
        });
      }
    }
  };
  
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
                  <p className="text-lg text-gray-600 font-medium">Loading the lekker data...</p>
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

  // Helper functions for manual team building
  const openPlayerModal = (pos: 'gk' | 'def' | 'mid' | 'fwd' | 'bench') => {
    setSelectedPosition(pos);
    setPlayerSearchTerm('');
    // Set position filter based on selected position
    const positionMap = { gk: 1, def: 2, mid: 3, fwd: 4, bench: null };
    setPositionFilter(positionMap[pos]);
    setShowPlayerModal(true);
  };

  const addPlayerToTeam = async (player: any) => {
    if (!selectedPosition) {
      console.log('No position selected');
      return;
    }
    
    // Prevent double clicks
    if (isAddingPlayer) {
      console.log('Already adding a player, ignoring duplicate click');
      return;
    }
    
    setIsAddingPlayer(true);
    console.log('Attempting to add player:', player.web_name, 'ID:', player.id, 'to position:', selectedPosition);
    
    // Check for duplicates before attempting to add
    if (isPlayerInTeam(player.id)) {
      console.log('Player already in team, showing alert');
      alert(`${player.web_name} is already in your team!`);
      setIsAddingPlayer(false);
      return;
    }
    
    // Validate team constraints
    const validation = validateTeamConstraints(player);
    if (!validation.valid) {
      alert(validation.reason);
      setIsAddingPlayer(false);
      return;
    }
    
    try {
      // Use functional update to ensure we have the latest state
      const result = await new Promise<boolean>((resolve) => {
        setManualTeam(prev => {
          console.log('Current team state at start of update:', {
            gk: prev.formation.gk.length,
            def: prev.formation.def.length,
            mid: prev.formation.mid.length,
            fwd: prev.formation.fwd.length,
            bench: prev.bench.length
          });
          
          // Double-check for duplicates with the current state
          const allCurrentPlayers = [
            ...prev.formation.gk,
            ...prev.formation.def,
            ...prev.formation.mid,
            ...prev.formation.fwd,
            ...prev.bench
          ];
          
          const isDuplicate = allCurrentPlayers.some(p => p.id === player.id);
          
          if (isDuplicate) {
            console.log('Duplicate player detected in state update:', player.web_name);
            resolve(false);
            return prev; // Return unchanged state
          }
          
          // Create player object with required data
          const playerData = {
            ...player,
            team_info: bootstrap?.teams.find(t => t.id === player.team),
            position_info: bootstrap?.element_types.find(p => p.id === player.element_type)
          };
          
          const newTeam = { ...prev };
          
          if (selectedPosition === 'bench') {
            if (newTeam.bench.length < 4) {
              newTeam.bench = [...newTeam.bench, playerData];
              console.log('Added player to bench');
              resolve(true);
            } else {
              alert('Bench is full! (4 players maximum)');
              resolve(false);
              return prev;
            }
          } else {
            // Use formation config for starting XI limits
            const formationConfig = getFormationConfig(selectedFormation);
            const maxPlayers = selectedPosition === 'gk' ? 1 : 
                             selectedPosition === 'def' ? formationConfig.def : 
                             selectedPosition === 'mid' ? formationConfig.mid : 
                             selectedPosition === 'fwd' ? formationConfig.fwd : 0;
            
            if (newTeam.formation[selectedPosition].length < maxPlayers) {
              // Add to starting XI if there's space
              newTeam.formation[selectedPosition] = [...newTeam.formation[selectedPosition], playerData];
              console.log(`Added player to ${selectedPosition} starting XI`);
              resolve(true);
            } else if (newTeam.bench.length < 4) {
              // If starting position is full, add to bench if there's space
              newTeam.bench = [...newTeam.bench, playerData];
              console.log(`Starting ${selectedPosition} is full, added player to bench instead`);
              resolve(true);
            } else {
              // Both starting position and bench are full
              const positionName = selectedPosition === 'gk' ? 'Goalkeeper' : 
                                 selectedPosition === 'def' ? 'Defender' :
                                 selectedPosition === 'mid' ? 'Midfielder' : 'Forward';
              alert(`${positionName} starting position is full and bench is also full! Remove a player first.`);
              resolve(false);
              return prev;
            }
          }
          
          // Update total value
          const allPlayersNew = [
            ...newTeam.formation.gk,
            ...newTeam.formation.def,
            ...newTeam.formation.mid,
            ...newTeam.formation.fwd,
            ...newTeam.bench
          ];
          newTeam.totalValue = allPlayersNew.reduce((sum, p) => sum + (p.now_cost || 0), 0);
          
          console.log('Player successfully added. New team size:', allPlayersNew.length);
          return newTeam;
        });
      });
      
      // Close modal if player was successfully added
      if (result) {
        setShowPlayerModal(false);
      }
      
    } catch (error) {
      console.error('Error adding player:', error);
    } finally {
      setIsAddingPlayer(false);
    }
  };

  const removePlayerFromTeam = (playerId: number, position: 'gk' | 'def' | 'mid' | 'fwd' | 'bench') => {
    setManualTeam(prev => {
      const newTeam = { ...prev };
      
      if (position === 'bench') {
        newTeam.bench = newTeam.bench.filter(p => p.id !== playerId);
      } else {
        newTeam.formation[position] = newTeam.formation[position].filter(p => p.id !== playerId);
      }
      
      // Clear captain/vice captain if they were removed
      if (newTeam.captain?.id === playerId) newTeam.captain = null;
      if (newTeam.viceCaptain?.id === playerId) newTeam.viceCaptain = null;
      
      // Update total value
      const allPlayers = [
        ...newTeam.formation.gk,
        ...newTeam.formation.def,
        ...newTeam.formation.mid,
        ...newTeam.formation.fwd,
        ...newTeam.bench
      ];
      newTeam.totalValue = allPlayers.reduce((sum, p) => sum + (p.now_cost || 0), 0);
      
      return newTeam;
    });
  };

  const setCaptaincy = (player: any, isCaptain: boolean) => {
    setManualTeam(prev => {
      const newTeam = { ...prev };
      
      if (isCaptain) {
        // Set as captain, move old captain to vice captain if exists
        if (newTeam.captain && newTeam.captain.id !== player.id) {
          newTeam.viceCaptain = newTeam.captain;
        }
        newTeam.captain = player;
      } else {
        // Set as vice captain
        newTeam.viceCaptain = player;
      }
      
      return newTeam;
    });
  };


  // Check if player is already in team
  const isPlayerInTeam = (playerId: number) => {
    const allPlayers = [
      ...manualTeam.formation.gk,
      ...manualTeam.formation.def,
      ...manualTeam.formation.mid,
      ...manualTeam.formation.fwd,
      ...manualTeam.bench
    ];
    return allPlayers.some(p => p.id === playerId);
  };

  // Check team limits and position quotas
  const validateTeamConstraints = (newPlayer: any, excludePlayerId?: number) => {
    const allPlayers = [
      ...manualTeam.formation.gk,
      ...manualTeam.formation.def,
      ...manualTeam.formation.mid,
      ...manualTeam.formation.fwd,
      ...manualTeam.bench
    ].filter(p => p.id !== excludePlayerId);
    
    // Check maximum squad size (15 players)
    if (allPlayers.length >= 15) {
      return { valid: false, reason: 'Squad is full! Maximum 15 players allowed (11 starting + 4 substitutes)' };
    }
    
    // Check team limit (max 3 players from same team)
    const teamCount = allPlayers.filter(p => p.team === newPlayer.team).length;
    if (teamCount >= 3) {
      return { valid: false, reason: `Maximum 3 players from ${newPlayer.team_info?.name || 'this team'} allowed` };
    }
    
    // Check position quotas for the entire squad
    const positionCounts = {
      gk: allPlayers.filter(p => p.element_type === 1).length,
      def: allPlayers.filter(p => p.element_type === 2).length,
      mid: allPlayers.filter(p => p.element_type === 3).length,
      fwd: allPlayers.filter(p => p.element_type === 4).length
    };
    
    // Add new player to counts
    const newPlayerPos = newPlayer.element_type;
    if (newPlayerPos === 1) positionCounts.gk++;
    else if (newPlayerPos === 2) positionCounts.def++;
    else if (newPlayerPos === 3) positionCounts.mid++;
    else if (newPlayerPos === 4) positionCounts.fwd++;
    
    // Check quotas: 2 GK, 5 DEF, 5 MID, 3 FWD
    if (positionCounts.gk > 2) return { valid: false, reason: 'Maximum 2 goalkeepers allowed' };
    if (positionCounts.def > 5) return { valid: false, reason: 'Maximum 5 defenders allowed' };
    if (positionCounts.mid > 5) return { valid: false, reason: 'Maximum 5 midfielders allowed' };
    if (positionCounts.fwd > 3) return { valid: false, reason: 'Maximum 3 forwards allowed' };
    
    return { valid: true };
  };

  // Get formation configuration
  const getFormationConfig = (formation: string) => {
    const formationConfigs = {
      '3-5-2': { def: 3, mid: 5, fwd: 2 },
      '3-4-3': { def: 3, mid: 4, fwd: 3 },
      '4-5-1': { def: 4, mid: 5, fwd: 1 },
      '4-4-2': { def: 4, mid: 4, fwd: 2 },
      '4-3-3': { def: 4, mid: 3, fwd: 3 },
      '5-4-1': { def: 5, mid: 4, fwd: 1 },
      '5-3-2': { def: 5, mid: 3, fwd: 2 }
    };
    return formationConfigs[formation as keyof typeof formationConfigs] || formationConfigs['3-5-2'];
  };

  // Formation change handler
  const changeFormation = (newFormation: typeof selectedFormation) => {
    const allStartingPlayers = [
      ...manualTeam.formation.gk,
      ...manualTeam.formation.def,
      ...manualTeam.formation.mid,
      ...manualTeam.formation.fwd
    ];
    
    if (allStartingPlayers.length < 11) {
      setSelectedFormation(newFormation);
      return;
    }
    
    const config = getFormationConfig(newFormation);
    
    // Sort players by position type
    const defenders = allStartingPlayers.filter(p => p.element_type === 2);
    const midfielders = allStartingPlayers.filter(p => p.element_type === 3);
    const forwards = allStartingPlayers.filter(p => p.element_type === 4);
    
    // Check if we have enough players for the formation
    if (defenders.length < config.def || midfielders.length < config.mid || forwards.length < config.fwd) {
      alert(`Not enough players for ${newFormation} formation. Need: ${config.def} DEF, ${config.mid} MID, ${config.fwd} FWD`);
      return;
    }
    
    // Reorganize team according to new formation
    setManualTeam(prev => {
      const newTeam = { ...prev };
      
      // Move excess players to bench
      const excessDef = defenders.slice(config.def);
      const excessMid = midfielders.slice(config.mid);
      const excessFwd = forwards.slice(config.fwd);
      
      newTeam.formation.def = defenders.slice(0, config.def);
      newTeam.formation.mid = midfielders.slice(0, config.mid);
      newTeam.formation.fwd = forwards.slice(0, config.fwd);
      
      // Add excess players to bench (remove duplicates)
      const excessPlayers = [...excessDef, ...excessMid, ...excessFwd];
      const currentBenchIds = new Set(newTeam.bench.map(p => p.id));
      const newBenchPlayers = excessPlayers.filter(p => !currentBenchIds.has(p.id));
      
      newTeam.bench = [...newTeam.bench, ...newBenchPlayers];
      
      return newTeam;
    });
    
    setSelectedFormation(newFormation);
  };

  // Helper function to find the best formation based on available players
  const findBestFormation = (players: { gk: any[], def: any[], mid: any[], fwd: any[] }) => {
    const { gk, def, mid, fwd } = players;
    
    // Available formations
    const formations = [
      { name: '3-5-2', def: 3, mid: 5, fwd: 2 },
      { name: '3-4-3', def: 3, mid: 4, fwd: 3 },
      { name: '4-5-1', def: 4, mid: 5, fwd: 1 },
      { name: '4-4-2', def: 4, mid: 4, fwd: 2 },
      { name: '4-3-3', def: 4, mid: 3, fwd: 3 },
      { name: '5-4-1', def: 5, mid: 4, fwd: 1 },
      { name: '5-3-2', def: 5, mid: 3, fwd: 2 }
    ];
    
    // Find formations that work with current player distribution
    const validFormations = formations.filter(formation => 
      gk.length >= 1 && 
      def.length >= formation.def && 
      mid.length >= formation.mid && 
      fwd.length >= formation.fwd
    );
    
    // If current formation still works, keep it
    const currentFormationConfig = getFormationConfig(selectedFormation);
    const currentFormationValid = gk.length >= 1 && 
      def.length >= currentFormationConfig.def && 
      mid.length >= currentFormationConfig.mid && 
      fwd.length >= currentFormationConfig.fwd;
    
    if (currentFormationValid) {
      return selectedFormation;
    }
    
    // Otherwise return the first valid formation, or default to 3-5-2
    return validFormations.length > 0 ? validFormations[0].name : '3-5-2';
  };

  // Player swap functionality with automatic formation adjustment
  const handlePlayerSwap = (targetPlayer: any, targetIsFromBench: boolean) => {
    if (!selectedSwapPlayer) return;
    
    const sourcePlayer = selectedSwapPlayer.player;
    const sourceIsFromBench = selectedSwapPlayer.isFromBench;
    
    // Can't swap with the same player
    if (sourcePlayer.id === targetPlayer.id) {
      setSelectedSwapPlayer(null);
      return;
    }
    
    // Perform the swap
    setManualTeam(prev => {
      const newTeam = {
        ...prev,
        formation: {
          gk: [...prev.formation.gk],
          def: [...prev.formation.def],
          mid: [...prev.formation.mid],
          fwd: [...prev.formation.fwd],
        },
        bench: [...prev.bench],
      };
      
      // Remove both players from their current positions
      if (sourceIsFromBench) {
        newTeam.bench = newTeam.bench.filter(p => p.id !== sourcePlayer.id);
      } else {
        // Remove from formation
        Object.keys(newTeam.formation).forEach(pos => {
          newTeam.formation[pos as keyof typeof newTeam.formation] = 
            newTeam.formation[pos as keyof typeof newTeam.formation].filter(p => p.id !== sourcePlayer.id);
        });
      }
      
      if (targetIsFromBench) {
        newTeam.bench = newTeam.bench.filter(p => p.id !== targetPlayer.id);
      } else {
        // Remove from formation
        Object.keys(newTeam.formation).forEach(pos => {
          newTeam.formation[pos as keyof typeof newTeam.formation] = 
            newTeam.formation[pos as keyof typeof newTeam.formation].filter(p => p.id !== targetPlayer.id);
        });
      }
      
      const positionMap = { 1: 'gk', 2: 'def', 3: 'mid', 4: 'fwd' } as const;
      
      // Place players in their new positions based on THEIR OWN positions
      if (sourceIsFromBench) {
        // Source player was on bench, now goes to starting XI based on their own position
        const sourcePos = positionMap[sourcePlayer.element_type as keyof typeof positionMap];
        newTeam.formation[sourcePos] = [...newTeam.formation[sourcePos], sourcePlayer];
      } else {
        // Source player was in starting XI, now goes to bench
        newTeam.bench = [...newTeam.bench, sourcePlayer];
      }
      
      if (targetIsFromBench) {
        // Target player was on bench, now goes to starting XI based on their own position
        const targetPos = positionMap[targetPlayer.element_type as keyof typeof positionMap];
        newTeam.formation[targetPos] = [...newTeam.formation[targetPos], targetPlayer];
      } else {
        // Target player was in starting XI, now goes to bench
        newTeam.bench = [...newTeam.bench, targetPlayer];
      }
      
      // Count players by position after swap
      const playersByPosition = {
        gk: newTeam.formation.gk,
        def: newTeam.formation.def,
        mid: newTeam.formation.mid,
        fwd: newTeam.formation.fwd
      };
      
      // Find the best formation for the new player distribution
      const bestFormation = findBestFormation(playersByPosition);
      const bestFormationConfig = getFormationConfig(bestFormation);
      
      // Adjust formation if needed
      if (bestFormation !== selectedFormation) {
        console.log(`Formation changed from ${selectedFormation} to ${bestFormation}`);
        
        // Move excess players to bench
        const excessDef = newTeam.formation.def.slice(bestFormationConfig.def);
        const excessMid = newTeam.formation.mid.slice(bestFormationConfig.mid);
        const excessFwd = newTeam.formation.fwd.slice(bestFormationConfig.fwd);
        
        newTeam.formation.def = newTeam.formation.def.slice(0, bestFormationConfig.def);
        newTeam.formation.mid = newTeam.formation.mid.slice(0, bestFormationConfig.mid);
        newTeam.formation.fwd = newTeam.formation.fwd.slice(0, bestFormationConfig.fwd);
        
        // Add excess players to bench (remove duplicates)
        const excessPlayers = [...excessDef, ...excessMid, ...excessFwd];
        const currentBenchIds = new Set(newTeam.bench.map(p => p.id));
        const newBenchPlayers = excessPlayers.filter(p => !currentBenchIds.has(p.id));
        
        newTeam.bench = [...newTeam.bench, ...newBenchPlayers];
        
        // Update the selected formation
        setTimeout(() => setSelectedFormation(bestFormation as typeof selectedFormation), 0);
      }
      
      // Update total value
      const allPlayers = [
        ...newTeam.formation.gk,
        ...newTeam.formation.def,
        ...newTeam.formation.mid,
        ...newTeam.formation.fwd,
        ...newTeam.bench
      ];
      newTeam.totalValue = allPlayers.reduce((sum, p) => sum + (p.now_cost || 0), 0);
      
      return newTeam;
    });
    
    setSelectedSwapPlayer(null);
  };

  // Render placeholder positions for empty pitch
  const renderPlaceholderPlayer = (position: string, index: number, positionKey: 'gk' | 'def' | 'mid' | 'fwd', isLarge = false) => {
    const size = isLarge ? 'w-20 h-20' : 'w-16 h-16';
    const textSize = isLarge ? 'text-xs' : 'text-xs';
    
    const handleClick = () => {
      if (buildMode === 'manual') {
        openPlayerModal(positionKey);
      }
    };
    
    return (
      <div key={`${position}-${index}`} className="text-center">
        <div 
          className={`${size} rounded-full bg-white border-2 border-dashed shadow-lg flex flex-col items-center justify-center relative transition-all duration-200 ${
            buildMode === 'manual' 
              ? 'border-green-300 hover:border-green-500 cursor-pointer hover:scale-105 hover:shadow-lg' 
              : 'border-gray-300'
          }`}
          onClick={handleClick}
        >
          <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
            {buildMode === 'manual' ? (
              <Plus className="w-6 h-6 text-green-500" />
            ) : (
              <Users className="w-6 h-6 text-gray-400" />
            )}
          </div>
          {buildMode === 'manual' && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <Plus className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        <div className={`text-center mt-1 ${textSize} font-medium ${
          buildMode === 'manual' ? 'text-green-600' : 'text-gray-500'
        }`}>
          <div>{buildMode === 'manual' ? `Add ${position}` : position}</div>
          <div className="text-xs text-gray-400">£0.0m</div>
        </div>
      </div>
    );
  };

  // Get premium card color based on player rating/price (FUT style)
  const getCardColor = (player: any) => {
    const price = player.now_cost;
    if (price >= 120) return 'from-yellow-500 via-yellow-400 to-yellow-300'; // Gold - Expensive
    if (price >= 80) return 'from-slate-400 via-slate-300 to-slate-200'; // Silver - Mid-range  
    return 'from-amber-700 via-amber-600 to-amber-500'; // Bronze - Budget
  };

  const getCardRarity = (player: any) => {
    const points = player.total_points || 0;
    const price = player.now_cost;
    
    // Premium combinations for high-performing expensive players
    if (points >= 150 && price >= 100) return { 
      color: 'from-gradient-to-br from-purple-600 via-pink-500 to-purple-400', 
      glow: 'shadow-2xl shadow-purple-500/40',
      shimmer: true
    }; // Icon
    
    if (points >= 120) return { 
      color: 'from-gradient-to-br from-purple-500 via-purple-400 to-indigo-400', 
      glow: 'shadow-xl shadow-purple-400/30',
      shimmer: true
    }; // Legend
    
    if (points >= 80) return { 
      color: 'from-gradient-to-br from-blue-600 via-blue-500 to-cyan-400', 
      glow: 'shadow-lg shadow-blue-400/25'
    }; // Rare
    
    if (points >= 40) return { 
      color: 'from-gradient-to-br from-emerald-500 via-green-500 to-teal-400', 
      glow: 'shadow-md shadow-green-400/20'
    }; // Uncommon
    
    return { 
      color: `from-gradient-to-br ${getCardColor(player)}`, 
      glow: 'shadow-sm shadow-gray-400/15'
    }; // Common
  };

  // Calculate more realistic player rating
  const getPlayerRating = (player: any) => {
    const points = player.total_points || 0;
    const price = player.now_cost || 40;
    const form = parseFloat(player.form || '0');
    
    // Base rating from points (50-85 range)
    let rating = Math.min(50 + (points / 4), 85);
    
    // Price adjustment (premium players get slight boost)
    if (price >= 100) rating += 3;
    else if (price >= 80) rating += 1;
    
    // Form adjustment
    rating += form * 2;
    
    // Cap between 40-99
    return Math.min(Math.max(Math.round(rating), 40), 99);
  };

  // Get player's fixture for selected gameweek
  const getPlayerFixture = (player: any, gameweekId: number) => {
    if (!fixtures || !gameweekId || !bootstrap) return null;
    
    const teamFixtures = fixtures.filter((f: any) => 
      (f.team_h === player.team || f.team_a === player.team) && f.event === gameweekId
    );
    
    if (teamFixtures.length === 0) return null;
    
    const fixture = teamFixtures[0];
    const isHome = fixture.team_h === player.team;
    const opponentTeamId = isHome ? fixture.team_a : fixture.team_h;
    const opponentTeam = bootstrap.teams.find(t => t.id === opponentTeamId);
    const difficulty = isHome ? fixture.team_h_difficulty : fixture.team_a_difficulty;
    
    return {
      opponent: opponentTeam?.short_name || opponentTeam?.name?.slice(0, 3)?.toUpperCase() || 'TBC',
      isHome,
      difficulty,
      fixture
    };
  };

  // Render selected players from manual team (FUT style)
  const renderManualPlayer = (player: any, position: string, isLarge = false) => {
    const cardWidth = isLarge ? 'w-24' : 'w-20';
    const cardHeight = isLarge ? 'h-32' : 'h-28';
    const playerSize = isLarge ? 'w-12 h-12' : 'w-10 h-10';
    const textSize = isLarge ? 'text-xs' : 'text-[10px]';
    const rarity = getCardRarity(player);
    
    // Get fixture info for current gameweek
    const currentGameweek = selectedGameweek || currentGW?.id || 1;
    const fixtureInfo = getPlayerFixture(player, currentGameweek);
    
    return (
      <div key={player.id} className="text-center group">
        <div className={`${cardWidth} ${cardHeight} relative cursor-pointer transform transition-all duration-200 hover:scale-105 hover:rotate-1 hover:shadow-2xl ${rarity.glow}`}>
          {/* FUT Card Background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${rarity.color} rounded-lg shadow-lg`}>
            {/* Card shine effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent rounded-lg opacity-70"></div>
            
            {/* Premium shimmer for high-tier cards */}
            {rarity.shimmer && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-lg animate-pulse opacity-50"></div>
            )}
            
            {/* Card border */}
            <div className="absolute inset-1 bg-gradient-to-br from-white/40 to-transparent rounded-lg"></div>
            
            {/* Inner glow */}
            <div className="absolute inset-2 bg-gradient-to-br from-white/20 to-transparent rounded-md"></div>
          </div>

          {/* Captain/Vice Captain indicators */}
          {manualTeam.captain?.id === player.id && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center z-20 shadow-lg">
              <Crown className="w-3 h-3 text-white" />
            </div>
          )}
          {manualTeam.viceCaptain?.id === player.id && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center z-20 shadow-lg">
              <Star className="w-3 h-3 text-white" />
            </div>
          )}
          
          {/* Card Content */}
          <div className="relative z-10 h-full flex flex-col justify-between p-2">
            {/* Top Section - Rating & Position */}
            <div className="flex justify-between items-start">
              <div className="text-center">
                <div className={`${textSize} font-bold text-gray-800 leading-none`}>
                  {getPlayerRating(player)}
                </div>
                <div className={`${textSize} font-semibold text-gray-700 leading-none`}>
                  {player.position_info?.singular_name_short || 'POS'}
                </div>
              </div>
              
              {/* Team Badge */}
              <img 
                src={getTeamBadgeUrl(player.team_info?.code)}
                alt={player.team_info?.name}
                className="w-4 h-4 rounded-sm shadow-sm"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/team-placeholder.svg';
                }}
              />
            </div>
            
            {/* Player Photo */}
            <div className="flex-1 flex items-center justify-center">
              <img 
                src={getPlayerPhotoUrl(player.code)}
                alt={player.web_name}
                className={`${playerSize} object-cover object-top filter drop-shadow-lg`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/player-placeholder.svg';
                }}
              />
            </div>
            
            {/* Bottom Section - Name & Price */}
            <div className="text-center">
              <div className={`${textSize} font-bold text-gray-800 leading-tight truncate px-1`}>
                {player.web_name}
              </div>
              <div className={`${textSize} font-semibold text-gray-700 leading-none`}>
                {formatPrice(player.now_cost)}
              </div>
            </div>
          </div>
          
          {/* Card gloss effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/10 rounded-lg pointer-events-none"></div>
        </div>
        
        {/* Fixture Info Below Card */}
        {fixtureInfo && (
          <div className="mt-1 text-center">
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
              getFdrColor(fixtureInfo.difficulty)
            }`}>
              <span className="text-[10px] font-bold">
                ({fixtureInfo.isHome ? 'H' : 'A'}) {fixtureInfo.opponent}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Also update the existing team player renderer to use FUT style
  // FUT-style player renderer for FPL teams
  const renderFPLPlayer = (pick: any, isLarge = false) => {
    if (!pick?.player) return null;
    
    const player = pick.player;
    const cardWidth = isLarge ? 'w-24' : 'w-20';
    const cardHeight = isLarge ? 'h-32' : 'h-28';
    const playerSize = isLarge ? 'w-12 h-12' : 'w-10 h-10';
    const textSize = isLarge ? 'text-xs' : 'text-[10px]';
    const rarity = getCardRarity(player);
    
    // Get fixture info for current gameweek
    const currentGameweek = selectedGameweek || currentGW?.id || 1;
    const fixtureInfo = getPlayerFixture(player, currentGameweek);
    
    return (
      <div 
        key={pick.element}
        className={`text-center group cursor-pointer transition-transform hover:scale-105 ${
          selectedPlayer?.element === pick.element ? 'z-10 scale-110' : ''
        }`}
        onClick={() => setSelectedPlayer(selectedPlayer?.element === pick.element ? null : pick)}
      >
        <div className={`${cardWidth} ${cardHeight} relative transform transition-all duration-200 hover:rotate-1 hover:shadow-2xl ${rarity.glow}`}>
          {/* FUT Card Background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${rarity.color} rounded-lg shadow-lg`}>
            {/* Card shine effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent rounded-lg opacity-70"></div>
            
            {/* Premium shimmer for high-tier cards */}
            {rarity.shimmer && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-lg animate-pulse opacity-50"></div>
            )}
            
            {/* Card border */}
            <div className="absolute inset-1 bg-gradient-to-br from-white/40 to-transparent rounded-lg"></div>
            
            {/* Inner glow */}
            <div className="absolute inset-2 bg-gradient-to-br from-white/20 to-transparent rounded-md"></div>
          </div>

          {/* Captain/Vice Captain indicators */}
          {pick.is_captain && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center z-20 shadow-lg">
              <Crown className="w-3 h-3 text-white" />
            </div>
          )}
          {pick.is_vice_captain && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center z-20 shadow-lg">
              <Star className="w-3 h-3 text-white" />
            </div>
          )}
          
          {/* Card Content */}
          <div className="relative z-10 h-full flex flex-col justify-between p-2">
            {/* Top Section - Rating & Position */}
            <div className="flex justify-between items-start">
              <div className="text-center">
                <div className={`${textSize} font-bold text-gray-800 leading-none`}>
                  {getPlayerRating(player)}
                </div>
                <div className={`${textSize} font-semibold text-gray-700 leading-none`}>
                  {player.position_info?.singular_name_short || 'POS'}
                </div>
              </div>
              
              {/* Team Badge */}
              <img 
                src={getTeamBadgeUrl(player.team_info?.code)}
                alt={player.team_info?.name}
                className="w-4 h-4 rounded-sm shadow-sm"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/team-placeholder.svg';
                }}
              />
            </div>
            
            {/* Player Photo */}
            <div className="flex-1 flex items-center justify-center">
              <img 
                src={getPlayerPhotoUrl(player.code)}
                alt={player.web_name}
                className={`${playerSize} object-cover object-top filter drop-shadow-lg`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/player-placeholder.svg';
                }}
              />
            </div>
            
            {/* Bottom Section - Name & Price */}
            <div className="text-center">
              <div className={`${textSize} font-bold text-gray-800 leading-tight truncate px-1`}>
                {player.web_name}
              </div>
              <div className={`${textSize} font-semibold text-gray-700 leading-none`}>
                {formatPrice(player.now_cost)}
              </div>
            </div>
          </div>
          
          {/* Card gloss effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/10 rounded-lg pointer-events-none"></div>
        </div>
        
        {/* Fixture Info Below Card */}
        {fixtureInfo && (
          <div className="mt-1 text-center">
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
              getFdrColor(fixtureInfo.difficulty)
            }`}>
              <span className="text-[10px] font-bold">
                ({fixtureInfo.isHome ? 'H' : 'A'}) {fixtureInfo.opponent}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };


  // Use manual team data when in manual mode
  const activeTeamPicks = buildMode === 'manual' ? getManualTeamData : teamPicks;
  const activeTeamData = buildMode === 'manual' ? {
    name: 'Manual Team',
    summary_overall_points: manualTeam.formation.gk.concat(
      manualTeam.formation.def,
      manualTeam.formation.mid,
      manualTeam.formation.fwd,
      manualTeam.bench
    ).reduce((sum, p) => sum + (p.total_points || 0), 0),
    summary_overall_rank: null
  } : teamData;

  // Show team ID input when in FPL mode and no team is loaded, or manual team builder when in manual mode
  if (buildMode === 'fpl-id' && !submittedTeamId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-yellow-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-6">
                <h1 className="text-xl font-semibold text-white">My Team</h1>
                <div className="flex items-center gap-2 text-sm text-green-100">
                  <Users className="w-4 h-4" />
                  <span>Build your dream squad</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-green-100">
                <div className="text-2xl">🇿🇦</div>
                <span className="text-sm font-medium">Boet Ball</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Main Squad Area */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Team Connection Card */}
              <div className="premium-card bg-gradient-to-r from-white via-green-50 to-yellow-50 p-8">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent mb-2">
                    My Team Analysis
                  </h2>
                  <p className="text-gray-700 text-lg">
                    Hot as a braai fire - Connect your FPL team or build manually! 🇿🇦
                  </p>
                </div>
                
                <div className="space-y-6">
                  {/* Connection Method Toggle */}
                  <div className="flex justify-center mb-6">
                    <div className="bg-white rounded-lg p-1 shadow-sm border border-green-200">
                      <button 
                        className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors ${
                          buildMode === 'fpl-id' 
                            ? 'bg-green-600 text-white' 
                            : 'text-green-700 hover:text-green-600'
                        }`}
                        onClick={() => handleModeChange('fpl-id')}
                      >
                        FPL Team ID
                      </button>
                      <button 
                        className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors ${
                          buildMode === 'manual' 
                            ? 'bg-green-600 text-white' 
                            : 'text-green-700 hover:text-green-600'
                        }`}
                        onClick={() => handleModeChange('manual')}
                      >
                        Manual Build
                      </button>
                    </div>
                  </div>
                
                  {buildMode === 'fpl-id' ? (
                    <form onSubmit={handleTeamIdSubmit} className="max-w-md mx-auto">
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={teamId}
                          onChange={(e) => setTeamId(e.target.value)}
                          placeholder="Enter FPL Team ID (e.g. 1234567)"
                          className="flex-1 px-4 py-3 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm"
                          required
                        />
                        <button
                          type="submit"
                          className="btn-primary flex items-center gap-2"
                        >
                          <Search className="w-4 h-4" />
                          Connect
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mt-3 text-center">
                        Find your Team ID in FPL under "Points" → "Gameweek history" → Check the URL
                      </p>
                    </form>
                  ) : (
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mb-3">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2">Manual Team Builder</h3>
                      <p className="text-gray-600 mb-4">
                        Click on positions below to start building your dream squad!
                      </p>
                      <div className="bg-white rounded-lg p-4 shadow-sm border border-yellow-200">
                        <div className="flex items-center justify-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span>Budget: £{((1000 - manualTeam.totalValue) / 10).toFixed(1)}m</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span>Players: {Object.values(manualTeam.formation).flat().length + manualTeam.bench.length}/15</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Template Squad Visualization */}
              <div className="premium-card bg-gradient-to-b from-white to-green-50 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">
                        Your Squad Preview (3-5-2)
                      </h2>
                      <p className="text-sm text-gray-600">Click positions to add players manually</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 bg-yellow-100 px-3 py-1 rounded-full border border-yellow-200">
                      <Crown className="w-4 h-4 text-yellow-600" />
                      <span className="font-medium text-yellow-700">Captain</span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                      <Star className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-600">Vice Captain</span>
                    </div>
                  </div>
                </div>
                
                {/* Template Pitch - FIFA/FUT Style */}
                <div className="rounded-lg p-6 min-h-[500px] relative overflow-hidden" 
                  style={{
                    background: `
                      linear-gradient(135deg, 
                        #1a4d3a 0%, 
                        #2d6b4f 15%, 
                        #4ade80 35%, 
                        #22c55e 50%, 
                        #16a34a 65%, 
                        #15803d 85%, 
                        #0f3c26 100%
                      ),
                      repeating-linear-gradient(
                        90deg,
                        transparent 0px,
                        transparent 40px,
                        rgba(255, 255, 255, 0.03) 40px,
                        rgba(255, 255, 255, 0.03) 80px
                      ),
                      repeating-linear-gradient(
                        0deg,
                        transparent 0px,
                        transparent 60px,
                        rgba(0, 0, 0, 0.05) 60px,
                        rgba(0, 0, 0, 0.05) 120px
                      )
                    `,
                    boxShadow: `
                      inset 0 0 100px rgba(0, 0, 0, 0.3),
                      inset 0 0 200px rgba(0, 50, 0, 0.2),
                      0 20px 40px rgba(0, 0, 0, 0.3)
                    `,
                    transform: 'perspective(800px) rotateX(5deg)',
                    transformStyle: 'preserve-3d'
                  }}
                >
                  {/* Stadium lighting effect */}
                  <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/20"></div>
                  
                  {/* Field markings */}
                  <div className="absolute inset-0">
                    {/* Outer boundary */}
                    <div className="absolute inset-4 border-2 border-white/40 rounded-sm"></div>
                    
                    {/* Center circle */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-28 h-28 border-2 border-white/40 rounded-full"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white/60 rounded-full shadow-lg"></div>
                    
                    {/* Halfway line */}
                    <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-white/40 shadow-sm"></div>
                    
                    {/* Penalty areas */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-12 border-2 border-white/40 border-b-0"></div>
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-24 h-12 border-2 border-white/40 border-t-0"></div>
                    
                    {/* Goal areas */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-6 border-2 border-white/40 border-b-0"></div>
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-16 h-6 border-2 border-white/40 border-t-0"></div>
                    
                    {/* Penalty spots */}
                    <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white/60 rounded-full shadow-md"></div>
                    <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white/60 rounded-full shadow-md"></div>
                    
                    {/* Corner arcs */}
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-2 border-white/40 border-r-0 border-t-0 rounded-bl-full"></div>
                    <div className="absolute bottom-4 right-4 w-8 h-8 border-2 border-white/40 border-l-0 border-t-0 rounded-br-full"></div>
                    <div className="absolute top-4 left-4 w-8 h-8 border-2 border-white/40 border-r-0 border-b-0 rounded-tl-full"></div>
                    <div className="absolute top-4 right-4 w-8 h-8 border-2 border-white/40 border-l-0 border-b-0 rounded-tr-full"></div>
                  </div>
                  
                  {/* Grass texture overlay */}
                  <div className="absolute inset-0 opacity-20" 
                    style={{
                      backgroundImage: `
                        radial-gradient(circle at 20% 80%, rgba(34, 197, 94, 0.3) 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.3) 0%, transparent 50%),
                        radial-gradient(circle at 40% 40%, rgba(5, 150, 105, 0.2) 0%, transparent 50%)
                      `
                    }}
                  ></div>
                  <div className="space-y-16 h-full flex flex-col justify-between">
                    
                    {/* Forwards Row */}
                    <div className="flex justify-center space-x-8">
                      {manualTeam.formation.fwd.length > 0 ? (
                        manualTeam.formation.fwd.map((player, i) => (
                          <div key={player.id} className="relative">
                            {renderManualPlayer(player, 'Forward')}
                          </div>
                        ))
                      ) : null}
                      {Array.from({ length: 2 - manualTeam.formation.fwd.length }, (_, i) => 
                        renderPlaceholderPlayer('Forward', i + manualTeam.formation.fwd.length + 1, 'fwd')
                      )}
                    </div>
                    
                    {/* Midfielders Row */}
                    <div className="flex justify-center space-x-6">
                      {manualTeam.formation.mid.length > 0 ? (
                        manualTeam.formation.mid.map((player, i) => (
                          <div key={player.id} className="relative">
                            {renderManualPlayer(player, 'Midfielder')}
                          </div>
                        ))
                      ) : null}
                      {Array.from({ length: 5 - manualTeam.formation.mid.length }, (_, i) => 
                        renderPlaceholderPlayer('Midfielder', i + manualTeam.formation.mid.length + 1, 'mid')
                      )}
                    </div>
                    
                    {/* Defenders Row */}
                    <div className="flex justify-center space-x-4">
                      {manualTeam.formation.def.length > 0 ? (
                        manualTeam.formation.def.map((player, i) => (
                          <div key={player.id} className="relative">
                            {renderManualPlayer(player, 'Defender')}
                          </div>
                        ))
                      ) : null}
                      {Array.from({ length: 3 - manualTeam.formation.def.length }, (_, i) => 
                        renderPlaceholderPlayer('Defender', i + manualTeam.formation.def.length + 1, 'def')
                      )}
                    </div>
                    
                    {/* Goalkeeper Row */}
                    <div className="flex justify-center">
                      {manualTeam.formation.gk.length > 0 ? (
                        <div className="relative">
                          {renderManualPlayer(manualTeam.formation.gk[0], 'Goalkeeper', true)}
                        </div>
                      ) : (
                        renderPlaceholderPlayer('Goalkeeper', 1, 'gk', true)
                      )}
                    </div>
                    
                  </div>
                </div>
                
                {/* Template Bench */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-gray-600" />
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Substitutes</h3>
                  </div>
                  <div className="flex gap-4">
                    {[1, 2, 3, 4].map((index) => (
                      <div key={index} className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                          {index}
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                          <Users className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-500">Substitute {index}</div>
                          <div className="text-xs text-gray-400">Pos • £0.0m</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sidebar with Template Stats */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Template Status */}
              <div className="premium-card bg-gradient-to-br from-green-50 to-emerald-50 p-5">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-green-700">Squad Budget</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="text-center bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-2xl font-bold text-green-600">£100.0m</div>
                    <div className="text-sm text-gray-600 font-medium">Team Value</div>
                  </div>
                  <div className="text-center bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-2xl font-bold text-yellow-600">£0.0m</div>
                    <div className="text-sm text-gray-600 font-medium">In Bank</div>
                  </div>
                  <div className="text-center bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-2xl font-bold text-blue-600">1</div>
                    <div className="text-sm text-gray-600 font-medium">Free Transfers</div>
                  </div>
                </div>
              </div>

              {/* Performance Placeholder */}
              <div className="premium-card bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-blue-700">Performance</h3>
                </div>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-3 shadow-sm text-center">
                    <div className="text-2xl font-bold text-gray-500">0</div>
                    <div className="text-xs text-gray-600 font-medium">Total Points</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm text-center">
                    <div className="text-lg font-semibold text-gray-500">N/A</div>
                    <div className="text-xs text-gray-600 font-medium">Overall Rank</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm text-center">
                    <div className="text-lg font-semibold text-gray-500">0</div>
                    <div className="text-xs text-gray-600 font-medium">GW Points</div>
                  </div>
                </div>
              </div>

              {/* How to Find Team ID */}
              <div className="premium-card bg-gradient-to-br from-yellow-50 to-orange-50 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                    <Info className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-bold text-orange-800">How to Find Your Team ID</h4>
                </div>
                <div className="text-sm text-orange-700 space-y-2 bg-white rounded-lg p-3">
                  <p className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-xs font-bold text-orange-600">1</span>
                    Go to the official FPL website
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-xs font-bold text-orange-600">2</span>
                    Navigate to "Points" → "Gameweek history"
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-xs font-bold text-orange-600">3</span>
                    Look at the URL after "/entry/"
                  </p>
                  <p className="flex items-center gap-2 font-semibold">
                    <span className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-xs font-bold text-orange-600">4</span>
                    Example: .../entry/<strong className="text-green-600">1234567</strong>/history
                  </p>
                </div>
              </div>

              {/* South African Touch */}
              <div className="premium-card bg-gradient-to-r from-green-400 to-yellow-400 p-5 text-center">
                <div className="text-4xl mb-3">🇿🇦</div>
                <div className="bg-white/90 rounded-lg p-4">
                  <p className="text-lg font-bold text-green-800 mb-2">
                    "Sharp as a tjommie"
                  </p>
                  <p className="text-sm text-green-700 font-medium">
                    Connect your team or build manually, boet!
                  </p>
                  <div className="mt-3 flex items-center justify-center gap-2 text-xs text-green-600">
                    <Star className="w-3 h-3" />
                    <span>Proudly South African FPL Analytics</span>
                    <Star className="w-3 h-3" />
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>

        {/* Player Selection Modal */}
        {showPlayerModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-white" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Select {selectedPosition === 'gk' ? 'Goalkeeper' : 
                             selectedPosition === 'def' ? 'Defender' :
                             selectedPosition === 'mid' ? 'Midfielder' :
                             selectedPosition === 'fwd' ? 'Forward' : 'Bench Player'}
                    </h3>
                    <p className="text-green-100 text-sm">
                      Budget remaining: £{((1000 - manualTeam.totalValue) / 10).toFixed(1)}m
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPlayerModal(false)}
                  className="text-white hover:text-green-200 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search players by name or team..."
                    value={playerSearchTerm}
                    onChange={(e) => setPlayerSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Players Grid */}
              <div className="p-4 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredPlayers.map((player) => {
                    const isInTeam = isPlayerInTeam(player.id);
                    const canAfford = (1000 - manualTeam.totalValue - player.now_cost) >= 0;
                    
                    return (
                      <div key={player.id} className="relative">
                        <div 
                          className={`cursor-pointer transition-all duration-200 ${
                            isInTeam 
                              ? 'opacity-50 cursor-not-allowed'
                              : !canAfford
                              ? 'opacity-75 cursor-not-allowed'
                              : 'hover:scale-105'
                          }`}
                          onClick={() => {
                            if (!isInTeam && canAfford) {
                              addPlayerToTeam(player);
                            }
                          }}
                        >
                          {renderManualPlayer(player, selectedPosition || 'mid')}
                        </div>
                        
                        {/* Player Info */}
                        <div className="mt-2 text-center">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {player.web_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {player.team_info?.name}
                          </div>
                          <div className="text-xs text-gray-600">
                            {player.total_points || 0} pts | {formatPrice(player.now_cost)}
                          </div>
                        </div>
                        
                        {/* Status Indicators */}
                        {isInTeam && (
                          <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                            <CheckCircle2 className="w-3 h-3" />
                          </div>
                        )}
                        {!canAfford && !isInTeam && (
                          <div className="absolute -top-2 -right-2 bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                            <DollarSign className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {filteredPlayers.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No players found matching your search.</p>
                  </div>
                )}
                
                {filteredPlayers.length > 100 && (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">
                      {filteredPlayers.length} players available. Use search to find specific players faster.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Show manual team builder interface when in manual mode
  if (buildMode === 'manual' && !submittedTeamId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-yellow-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-6">
                <h1 className="text-xl font-semibold text-white">My Team</h1>
                <div className="flex items-center gap-2 text-sm text-green-100">
                  <Users className="w-4 h-4" />
                  <span>Manual Team Builder</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleModeChange('fpl-id')}
                  className="px-3 py-1.5 text-sm bg-white/10 text-white rounded-md hover:bg-white/20 transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Switch to FPL ID
                </button>
                <div className="flex items-center gap-2 text-green-100">
                  <div className="text-2xl">🇿🇦</div>
                  <span className="text-sm font-medium">Boet Ball</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Main Squad Area */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Team Status Bar */}
              <div className="premium-card bg-gradient-to-r from-green-50 to-emerald-50 p-4">
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">£{(manualTeam.totalValue / 10).toFixed(1)}m</div>
                    <div className="text-sm text-gray-600 font-medium">Team Value</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">£{((1000 - manualTeam.totalValue) / 10).toFixed(1)}m</div>
                    <div className="text-sm text-gray-600 font-medium">In Bank</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Object.values(manualTeam.formation).flat().length + manualTeam.bench.length}/15
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Players</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {manualTeam.captain ? '✓' : '✗'}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Captain Set</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">
                      {Object.values(manualTeam.formation).flat().length >= 11 ? '✓' : '✗'}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Valid XI</div>
                  </div>
                </div>
              </div>

              {/* Squad Visualization */}
              <div className="premium-card bg-gradient-to-b from-white to-green-50 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">
                        Your Squad ({selectedFormation})
                      </h2>
                      <p className="text-sm text-gray-600">Click positions to add players or players to set captaincy</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm flex-wrap">
                    {/* Formation Selector */}
                    <select
                      value={selectedFormation}
                      onChange={(e) => changeFormation(e.target.value as typeof selectedFormation)}
                      className="px-2 py-1 text-xs border border-gray-300 rounded bg-white focus:ring-2 focus:ring-green-500"
                    >
                      <option value="3-5-2">3-5-2</option>
                      <option value="3-4-3">3-4-3</option>
                      <option value="4-5-1">4-5-1</option>
                      <option value="4-4-2">4-4-2</option>
                      <option value="4-3-3">4-3-3</option>
                      <option value="5-4-1">5-4-1</option>
                      <option value="5-3-2">5-3-2</option>
                    </select>

                    {/* Swap Status Indicator */}
                    {selectedSwapPlayer && (
                      <div className="flex items-center gap-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 border border-blue-300 rounded">
                        <ArrowUpDown className="w-3 h-3" />
                        <span>Swapping {selectedSwapPlayer.player.web_name}</span>
                        <button 
                          onClick={() => setSelectedSwapPlayer(null)}
                          className="ml-1 hover:text-blue-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  
                    {/* Gameweek Navigation for Manual Teams */}
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                      <button 
                        onClick={() => {
                          const current = selectedGameweek || currentGW?.id || 1;
                          console.log('Previous GW clicked, current:', current);
                          if (current > 1) {
                            setSelectedGameweek(current - 1);
                          }
                        }}
                        disabled={(selectedGameweek || currentGW?.id || 1) === 1}
                        className={`p-1 rounded transition-colors ${
                          (selectedGameweek || currentGW?.id || 1) === 1 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-gray-600 hover:bg-white hover:shadow-sm'
                        }`}
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                      
                      <div className="px-2 py-1 text-xs font-medium text-gray-900 min-w-[60px] text-center">
                        <span>GW{selectedGameweek || currentGW?.id || 1}</span>
                      </div>
                      
                      <button 
                        onClick={() => {
                          const current = selectedGameweek || currentGW?.id || 1;
                          const maxGW = bootstrap?.events?.length || 38;
                          console.log('Next GW clicked, current:', current, 'max:', maxGW);
                          if (current < maxGW) {
                            setSelectedGameweek(current + 1);
                          }
                        }}
                        disabled={(selectedGameweek || currentGW?.id || 1) >= (bootstrap?.events?.length || 38)}
                        className={`p-1 rounded transition-colors ${
                          (selectedGameweek || currentGW?.id || 1) >= (bootstrap?.events?.length || 38)
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-gray-600 hover:bg-white hover:shadow-sm'
                        }`}
                      >
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-yellow-100 px-3 py-1 rounded-full border border-yellow-200">
                      <Crown className="w-4 h-4 text-yellow-600" />
                      <span className="font-medium text-yellow-700">Captain</span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                      <Star className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-600">Vice Captain</span>
                    </div>
                  </div>
                </div>
                
                {/* Pitch with same render logic as before - FIFA/FUT Style */}
                <div className="rounded-lg p-6 min-h-[500px] relative overflow-hidden" 
                  style={{
                    background: `
                      linear-gradient(135deg, 
                        #1a4d3a 0%, 
                        #2d6b4f 15%, 
                        #4ade80 35%, 
                        #22c55e 50%, 
                        #16a34a 65%, 
                        #15803d 85%, 
                        #0f3c26 100%
                      ),
                      repeating-linear-gradient(
                        90deg,
                        transparent 0px,
                        transparent 40px,
                        rgba(255, 255, 255, 0.03) 40px,
                        rgba(255, 255, 255, 0.03) 80px
                      ),
                      repeating-linear-gradient(
                        0deg,
                        transparent 0px,
                        transparent 60px,
                        rgba(0, 0, 0, 0.05) 60px,
                        rgba(0, 0, 0, 0.05) 120px
                      )
                    `,
                    boxShadow: `
                      inset 0 0 100px rgba(0, 0, 0, 0.3),
                      inset 0 0 200px rgba(0, 50, 0, 0.2),
                      0 20px 40px rgba(0, 0, 0, 0.3)
                    `,
                    transform: 'perspective(800px) rotateX(5deg)',
                    transformStyle: 'preserve-3d'
                  }}
                >
                  {/* Stadium lighting effect */}
                  <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/20"></div>
                  
                  {/* Field markings */}
                  <div className="absolute inset-0">
                    {/* Outer boundary */}
                    <div className="absolute inset-4 border-2 border-white/40 rounded-sm"></div>
                    
                    {/* Center circle */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-28 h-28 border-2 border-white/40 rounded-full"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white/60 rounded-full shadow-lg"></div>
                    
                    {/* Halfway line */}
                    <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-white/40 shadow-sm"></div>
                    
                    {/* Penalty areas */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-12 border-2 border-white/40 border-b-0"></div>
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-24 h-12 border-2 border-white/40 border-t-0"></div>
                    
                    {/* Goal areas */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-6 border-2 border-white/40 border-b-0"></div>
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-16 h-6 border-2 border-white/40 border-t-0"></div>
                    
                    {/* Penalty spots */}
                    <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white/60 rounded-full shadow-md"></div>
                    <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white/60 rounded-full shadow-md"></div>
                    
                    {/* Corner arcs */}
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-2 border-white/40 border-r-0 border-t-0 rounded-bl-full"></div>
                    <div className="absolute bottom-4 right-4 w-8 h-8 border-2 border-white/40 border-l-0 border-t-0 rounded-br-full"></div>
                    <div className="absolute top-4 left-4 w-8 h-8 border-2 border-white/40 border-r-0 border-b-0 rounded-tl-full"></div>
                    <div className="absolute top-4 right-4 w-8 h-8 border-2 border-white/40 border-l-0 border-b-0 rounded-tr-full"></div>
                  </div>
                  
                  {/* Grass texture overlay */}
                  <div className="absolute inset-0 opacity-20" 
                    style={{
                      backgroundImage: `
                        radial-gradient(circle at 20% 80%, rgba(34, 197, 94, 0.3) 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.3) 0%, transparent 50%),
                        radial-gradient(circle at 40% 40%, rgba(5, 150, 105, 0.2) 0%, transparent 50%)
                      `
                    }}
                  ></div>
                  <div className="space-y-16 h-full flex flex-col justify-between">
                    
                    {/* Forwards Row */}
                    <div className="flex justify-center space-x-8">
                      {manualTeam.formation.fwd.map((player, i) => (
                        <div 
                          key={player.id} 
                          className={`relative group cursor-pointer ${
                            selectedSwapPlayer?.player.id === player.id ? 'ring-4 ring-blue-500 rounded-lg' : 
                            selectedSwapPlayer ? 'hover:ring-2 hover:ring-green-500 rounded-lg' : ''
                          }`}
                          onClick={() => {
                            if (selectedSwapPlayer) {
                              handlePlayerSwap(player, false);
                            } else {
                              setCaptaincy(player, true);
                            }
                          }}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            if (!selectedSwapPlayer) {
                              setCaptaincy(player, false);
                            }
                          }}
                        >
                          {renderManualPlayer(player, 'Forward')}
                          
                          {/* Hover controls */}
                          <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                            {!selectedSwapPlayer && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSwapPlayer({ player, isFromBench: false });
                                }}
                                className="w-6 h-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg"
                                title="Swap with bench"
                              >
                                <ArrowUpDown className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removePlayerFromTeam(player.id, 'fwd');
                              }}
                              className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg"
                              title="Remove player"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {Array.from({ length: getFormationConfig(selectedFormation).fwd - manualTeam.formation.fwd.length }, (_, i) => 
                        renderPlaceholderPlayer('Forward', i + manualTeam.formation.fwd.length + 1, 'fwd')
                      )}
                    </div>
                    
                    {/* Midfielders Row */}
                    <div className="flex justify-center space-x-6">
                      {manualTeam.formation.mid.map((player, i) => (
                        <div 
                          key={player.id} 
                          className={`relative group cursor-pointer ${
                            selectedSwapPlayer?.player.id === player.id ? 'ring-4 ring-blue-500 rounded-lg' : 
                            selectedSwapPlayer ? 'hover:ring-2 hover:ring-green-500 rounded-lg' : ''
                          }`}
                          onClick={() => {
                            if (selectedSwapPlayer) {
                              handlePlayerSwap(player, false);
                            } else {
                              setCaptaincy(player, true);
                            }
                          }}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            if (!selectedSwapPlayer) {
                              setCaptaincy(player, false);
                            }
                          }}
                        >
                          {renderManualPlayer(player, 'Midfielder')}
                          
                          {/* Hover controls */}
                          <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                            {!selectedSwapPlayer && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSwapPlayer({ player, isFromBench: false });
                                }}
                                className="w-6 h-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg"
                                title="Swap with bench"
                              >
                                <ArrowUpDown className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removePlayerFromTeam(player.id, 'mid');
                              }}
                              className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg"
                              title="Remove player"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {Array.from({ length: getFormationConfig(selectedFormation).mid - manualTeam.formation.mid.length }, (_, i) => 
                        renderPlaceholderPlayer('Midfielder', i + manualTeam.formation.mid.length + 1, 'mid')
                      )}
                    </div>
                    
                    {/* Defenders Row */}
                    <div className="flex justify-center space-x-4">
                      {manualTeam.formation.def.map((player, i) => (
                        <div 
                          key={player.id} 
                          className={`relative group ${
                        selectedSwapPlayer?.player.id === player.id ? 'ring-4 ring-blue-500 rounded-lg' : 
                            selectedSwapPlayer ? 'hover:ring-2 hover:ring-green-500 rounded-lg cursor-pointer' : ''
                          }`}
                          onClick={() => {
                            if (selectedSwapPlayer) {
                              handlePlayerSwap(player, false);
                            } else {
                              setCaptaincy(player, true);
                            }
                          }}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            if (!selectedSwapPlayer) {
                              setCaptaincy(player, false);
                            }
                          }}
                        >
                          {renderManualPlayer(player, 'Defender')}
                          
                          {/* Hover controls */}
                          <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                            {!selectedSwapPlayer && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSwapPlayer({ player, isFromBench: false });
                                }}
                                className="w-6 h-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg"
                                title="Swap with bench"
                              >
                                <ArrowUpDown className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removePlayerFromTeam(player.id, 'def');
                              }}
                              className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg"
                              title="Remove player"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {Array.from({ length: getFormationConfig(selectedFormation).def - manualTeam.formation.def.length }, (_, i) => 
                        renderPlaceholderPlayer('Defender', i + manualTeam.formation.def.length + 1, 'def')
                      )}
                    </div>
                    
                    {/* Goalkeeper Row */}
                    <div className="flex justify-center">
                      {manualTeam.formation.gk.length > 0 ? (
                        <div 
                          className={`relative group cursor-pointer ${
                            selectedSwapPlayer?.player.id === manualTeam.formation.gk[0].id ? 'ring-4 ring-blue-500 rounded-lg' : 
                            selectedSwapPlayer ? 'hover:ring-2 hover:ring-green-500 rounded-lg' : ''
                          }`}
                          onClick={() => {
                            if (selectedSwapPlayer) {
                              handlePlayerSwap(manualTeam.formation.gk[0], false);
                            } else {
                              setCaptaincy(manualTeam.formation.gk[0], true);
                            }
                          }}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            if (!selectedSwapPlayer) {
                              setCaptaincy(manualTeam.formation.gk[0], false);
                            }
                          }}
                        >
                          {renderManualPlayer(manualTeam.formation.gk[0], 'Goalkeeper', true)}
                          
                          {/* Hover controls */}
                          <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                            {!selectedSwapPlayer && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSwapPlayer({ player: manualTeam.formation.gk[0], isFromBench: false });
                                }}
                                className="w-6 h-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg"
                                title="Swap with bench"
                              >
                                <ArrowUpDown className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removePlayerFromTeam(manualTeam.formation.gk[0].id, 'gk');
                              }}
                              className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg"
                              title="Remove player"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        renderPlaceholderPlayer('Goalkeeper', 1, 'gk', true)
                      )}
                    </div>
                    
                  </div>
                </div>
                
                {/* Bench */}
                <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-gray-600" />
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Substitutes</h3>
                    <button
                      onClick={() => openPlayerModal('bench')}
                      className="ml-auto btn-secondary px-3 py-1 text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Sub
                    </button>
                  </div>
                  <div className="flex gap-4">
                    {manualTeam.bench.map((player, index) => (
                      <div key={player.id} className="relative group">
                        <div 
                          className={`flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200 min-w-0 transition-all cursor-pointer ${
                            selectedSwapPlayer ? 'hover:border-green-400 hover:shadow-md' : ''
                          } ${
                            selectedSwapPlayer?.player.id === player.id ? 'ring-2 ring-blue-500' : ''
                          }`}
                          onClick={() => {
                            if (selectedSwapPlayer) {
                              handlePlayerSwap(player, true);
                            }
                          }}
                        >
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                            {index + 1}
                          </div>
                          <img 
                            src={getPlayerPhotoUrl(player.code)}
                            alt={player.web_name}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/player-placeholder.svg';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">{player.web_name}</div>
                            <div className="text-xs text-gray-500">{player.position_info?.singular_name_short} • {formatPrice(player.now_cost)}</div>
                          </div>
                        </div>
                        
                        {/* Hover controls */}
                        <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                          {!selectedSwapPlayer && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSwapPlayer({ player, isFromBench: true });
                              }}
                              className="w-6 h-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg"
                              title="Swap with starting XI"
                            >
                              <ArrowUpDown className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removePlayerFromTeam(player.id, 'bench');
                            }}
                            className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg"
                            title="Remove player"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {Array.from({ length: 4 - manualTeam.bench.length }, (_, index) => (
                      <div key={index} className="flex items-center gap-3 bg-white rounded-lg p-3 border-2 border-dashed border-gray-300 min-w-0 cursor-pointer hover:border-green-400 transition-colors" onClick={() => openPlayerModal('bench')}>
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                          {manualTeam.bench.length + index + 1}
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                          <Plus className="w-4 h-4 text-green-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-green-600">Add Substitute</div>
                          <div className="text-xs text-gray-500">Click to select</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sidebar with Manual Team Stats */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Budget Status */}
              <div className="premium-card bg-gradient-to-br from-green-50 to-emerald-50 p-5">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-green-700">Squad Budget</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="text-center bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-2xl font-bold text-green-600">£{(manualTeam.totalValue / 10).toFixed(1)}m</div>
                    <div className="text-sm text-gray-600 font-medium">Team Value</div>
                  </div>
                  <div className="text-center bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-2xl font-bold text-yellow-600">£{((1000 - manualTeam.totalValue) / 10).toFixed(1)}m</div>
                    <div className="text-sm text-gray-600 font-medium">Remaining</div>
                  </div>
                  <div className="text-center bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-2xl font-bold text-blue-600">{Object.values(manualTeam.formation).flat().length + manualTeam.bench.length}/15</div>
                    <div className="text-sm text-gray-600 font-medium">Players</div>
                    <div className="text-xs text-gray-500 mt-1">
                      GK:{manualTeam.formation.gk.length + manualTeam.bench.filter(p => p.element_type === 1).length}/2
                      DEF:{manualTeam.formation.def.length + manualTeam.bench.filter(p => p.element_type === 2).length}/5
                      MID:{manualTeam.formation.mid.length + manualTeam.bench.filter(p => p.element_type === 3).length}/5
                      FWD:{manualTeam.formation.fwd.length + manualTeam.bench.filter(p => p.element_type === 4).length}/3
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Instructions */}
              <div className="premium-card bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Lightbulb className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-blue-700">Instructions</h3>
                </div>
                <div className="space-y-3 text-sm text-blue-700">
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="font-semibold mb-1">Adding Players:</p>
                    <p>Click empty positions to search and add players</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="font-semibold mb-1">Formation:</p>
                    <p>Change formation using the dropdown above the pitch</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="font-semibold mb-1">Swapping:</p>
                    <p>Use "Swap Players" mode to move players between starting XI and bench</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="font-semibold mb-1">Limits:</p>
                    <p>Max 3 players per team • 2 GK, 5 DEF, 5 MID, 3 FWD total</p>
                  </div>
                </div>
              </div>

              {/* South African Touch */}
              <div className="premium-card bg-gradient-to-r from-green-400 to-yellow-400 p-5 text-center">
                <div className="text-4xl mb-3">🇿🇦</div>
                <div className="bg-white/90 rounded-lg p-4">
                  <p className="text-lg font-bold text-green-800 mb-2">
                    "Now now, let's build a lekker team!"
                  </p>
                  <p className="text-sm text-green-700 font-medium">
                    Build your dream team, boet!
                  </p>
                  <div className="mt-3 flex items-center justify-center gap-2 text-xs text-green-600">
                    <Star className="w-3 h-3" />
                    <span>Manual Team Builder</span>
                    <Star className="w-3 h-3" />
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>

        {/* Player Selection Modal */}
        {showPlayerModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-white" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Select {selectedPosition === 'gk' ? 'Goalkeeper' : 
                             selectedPosition === 'def' ? 'Defender' :
                             selectedPosition === 'mid' ? 'Midfielder' :
                             selectedPosition === 'fwd' ? 'Forward' : 'Bench Player'}
                    </h3>
                    <p className="text-green-100 text-sm">
                      Budget remaining: £{((1000 - manualTeam.totalValue) / 10).toFixed(1)}m
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPlayerModal(false)}
                  className="text-white hover:text-green-200 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search players by name or team..."
                    value={playerSearchTerm}
                    onChange={(e) => setPlayerSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Players Grid */}
              <div className="p-4 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredPlayers.map((player) => {
                    const isInTeam = isPlayerInTeam(player.id);
                    const canAfford = (1000 - manualTeam.totalValue - player.now_cost) >= 0;
                    
                    return (
                      <div key={player.id} className="relative">
                        <div 
                          className={`cursor-pointer transition-all duration-200 ${
                            isInTeam 
                              ? 'opacity-50 cursor-not-allowed'
                              : !canAfford
                              ? 'opacity-75 cursor-not-allowed'
                              : 'hover:scale-105'
                          }`}
                          onClick={() => {
                            if (!isInTeam && canAfford) {
                              addPlayerToTeam(player);
                            }
                          }}
                        >
                          {renderManualPlayer(player, selectedPosition || 'mid')}
                        </div>
                        
                        {/* Player Info */}
                        <div className="mt-2 text-center">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {player.web_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {player.team_info?.name}
                          </div>
                          <div className="text-xs text-gray-600">
                            {player.total_points || 0} pts | {formatPrice(player.now_cost)}
                          </div>
                        </div>
                        
                        {/* Status Indicators */}
                        {isInTeam && (
                          <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                            <CheckCircle2 className="w-3 h-3" />
                          </div>
                        )}
                        {!canAfford && !isInTeam && (
                          <div className="absolute -top-2 -right-2 bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                            <DollarSign className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {filteredPlayers.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No players found matching your search.</p>
                  </div>
                )}
                
                {filteredPlayers.length > 50 && (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">
                      Showing top 50 results. Use search to narrow down options.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show loading state while fetching team data
  if (teamLoading || picksLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-lg text-gray-600 font-medium">Loading the lekker data...</p>
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


  // Get formation layout
  const formation = getFormationArray(teamPlayers);
  
  // Calculate team stats
  const startingXI = teamPlayers.filter((p: any) => p.multiplier > 0);
  const bench = teamPlayers.filter((p: any) => p.multiplier === 0);
  const captain = teamPlayers.find((p: any) => p.is_captain);
  const viceCaptain = teamPlayers.find((p: any) => p.is_vice_captain);
  


  // Calculate team stats and budget
  const teamValue = teamPlayers.reduce((sum: number, pick: any) => sum + pick.player.now_cost, 0);
  const bankBalance = 1000 - teamValue; // £100m budget - current team value
  const transfersLeft = (teamPicks as any).entry_history?.event_transfers || 1;
  

  return (
    <div className="min-h-screen bg-gray-50">
      {/* FPL-style Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-semibold text-gray-900">My Team</h1>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{(teamData as any).name}</span>
              </div>
            </div>
            
            {/* Gameweek Navigation */}
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button 
                  onClick={() => {
                    const current = selectedGameweek || currentGW?.id || 1;
                    console.log('Previous GW clicked (FPL view), current:', current);
                    if (current > 1) {
                      setSelectedGameweek(current - 1);
                    }
                  }}
                  disabled={(selectedGameweek || currentGW?.id || 1) === 1}
                  className={`p-1 rounded transition-colors ${
                    (selectedGameweek || currentGW?.id || 1) === 1 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-gray-600 hover:bg-white hover:shadow-sm'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <div className="px-3 py-1 text-sm font-medium text-gray-900 min-w-[80px] text-center">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>GW{selectedGameweek || currentGW?.id || 1}</span>
                    {selectedGameweek === currentGW?.id && (
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                    )}
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    const current = selectedGameweek || currentGW?.id || 1;
                    const maxGW = bootstrap?.events?.length || 38;
                    console.log('Next GW clicked (FPL view), current:', current, 'max:', maxGW);
                    if (current < maxGW) {
                      setSelectedGameweek(current + 1);
                    }
                  }}
                  disabled={(selectedGameweek || currentGW?.id || 1) >= (bootstrap?.events?.length || 38)}
                  className={`p-1 rounded transition-colors ${
                    (selectedGameweek || currentGW?.id || 1) >= (bootstrap?.events?.length || 38)
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-gray-600 hover:bg-white hover:shadow-sm'
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              
              {selectedGameweek !== currentGW?.id && (
                <button 
                  onClick={() => setSelectedGameweek(currentGW?.id || 1)}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  Current
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={resetTeamId}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Change Team
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Main Squad Area */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Team Status Bar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{formatPrice(teamValue)}</div>
                  <div className="text-sm text-gray-500">Team Value</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{formatPrice(bankBalance)}</div>
                  <div className="text-sm text-gray-500">In Bank</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{transfersLeft}</div>
                  <div className="text-sm text-gray-500">Free Transfers</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    teamRating >= 7 ? 'text-green-600' : 
                    teamRating >= 5 ? 'text-yellow-600' : 'text-red-600'
                  }`}>{teamRating.toFixed(1)}</div>
                  <div className="text-sm text-gray-500">Team Rating</div>
                </div>
                <div className="text-center">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${
                    getFdrColorLight(avgFDR)
                  }`}>
                    {avgFDR.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Avg FDR</div>
                </div>
              </div>
            </div>

            {/* Squad Visualization - FPL Style */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Squad ({formation.def.length}-{formation.mid.length}-{formation.fwd.length})
                  </h2>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    <span>Captain</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-gray-400" />
                    <span>Vice Captain</span>
                  </div>
                </div>
              </div>
              
              {/* Pitch - Vertical Layout like FPL - FIFA/FUT Style */}
              <div className="rounded-lg p-6 min-h-[500px] relative overflow-hidden" 
                style={{
                  background: `
                    linear-gradient(135deg, 
                      #1a4d3a 0%, 
                      #2d6b4f 15%, 
                      #4ade80 35%, 
                      #22c55e 50%, 
                      #16a34a 65%, 
                      #15803d 85%, 
                      #0f3c26 100%
                    ),
                    repeating-linear-gradient(
                      90deg,
                      transparent 0px,
                      transparent 40px,
                      rgba(255, 255, 255, 0.03) 40px,
                      rgba(255, 255, 255, 0.03) 80px
                    ),
                    repeating-linear-gradient(
                      0deg,
                      transparent 0px,
                      transparent 60px,
                      rgba(0, 0, 0, 0.05) 60px,
                      rgba(0, 0, 0, 0.05) 120px
                    )
                  `,
                  boxShadow: `
                    inset 0 0 100px rgba(0, 0, 0, 0.3),
                    inset 0 0 200px rgba(0, 50, 0, 0.2),
                    0 20px 40px rgba(0, 0, 0, 0.3)
                  `,
                  transform: 'perspective(800px) rotateX(5deg)',
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* Stadium lighting effect */}
                <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/20"></div>
                
                {/* Field markings */}
                <div className="absolute inset-0">
                  {/* Outer boundary */}
                  <div className="absolute inset-4 border-2 border-white/40 rounded-sm"></div>
                  
                  {/* Center circle */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-28 h-28 border-2 border-white/40 rounded-full"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white/60 rounded-full shadow-lg"></div>
                  
                  {/* Halfway line */}
                  <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-white/40 shadow-sm"></div>
                  
                  {/* Penalty areas */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-12 border-2 border-white/40 border-b-0"></div>
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-24 h-12 border-2 border-white/40 border-t-0"></div>
                  
                  {/* Goal areas */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-6 border-2 border-white/40 border-b-0"></div>
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-16 h-6 border-2 border-white/40 border-t-0"></div>
                  
                  {/* Penalty spots */}
                  <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white/60 rounded-full shadow-md"></div>
                  <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white/60 rounded-full shadow-md"></div>
                  
                  {/* Corner arcs */}
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-2 border-white/40 border-r-0 border-t-0 rounded-bl-full"></div>
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-2 border-white/40 border-l-0 border-t-0 rounded-br-full"></div>
                  <div className="absolute top-4 left-4 w-8 h-8 border-2 border-white/40 border-r-0 border-b-0 rounded-tl-full"></div>
                  <div className="absolute top-4 right-4 w-8 h-8 border-2 border-white/40 border-l-0 border-b-0 rounded-tr-full"></div>
                </div>
                
                {/* Grass texture overlay */}
                <div className="absolute inset-0 opacity-20" 
                  style={{
                    backgroundImage: `
                      radial-gradient(circle at 20% 80%, rgba(34, 197, 94, 0.3) 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.3) 0%, transparent 50%),
                      radial-gradient(circle at 40% 40%, rgba(5, 150, 105, 0.2) 0%, transparent 50%)
                    `
                  }}
                ></div>
                <div className="space-y-16 h-full flex flex-col justify-between">
                  
                  {/* Forwards Row */}
                  <div className="flex justify-center space-x-8">
                  {formation.fwd.map((pick: any) => (
                    <div key={pick.element} className="text-center">
                      {renderFPLPlayer(pick)}
                    </div>
                  ))}
                  </div>
                  
                  {/* Midfielders Row */}
                  <div className="flex justify-center space-x-6">
                  {formation.mid.map((pick: any) => (
                    <div key={pick.element} className="text-center">
                      {renderFPLPlayer(pick)}
                    </div>
                  ))}
                  </div>
                  
                  {/* Defenders Row */}
                  <div className="flex justify-center space-x-4">
                  {formation.def.map((pick: any) => (
                    <div key={pick.element} className="text-center">
                      {renderFPLPlayer(pick)}
                    </div>
                  ))}
                  </div>
                  
                  {/* Goalkeeper Row */}
                  <div className="flex justify-center">
                  {formation.gk.map((pick: any) => (
                    <div key={pick.element} className="text-center">
                      {renderFPLPlayer(pick, true)}
                    </div>
                  ))}
                  </div>
                  
                </div>
              </div>
              
              {/* Bench - Horizontal Layout */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Substitutes</h3>
                </div>
                <div className="flex gap-4">
                  {bench.map((pick: any, index: number) => (
                    <div key={pick.element} className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                        {index + 1}
                      </div>
                      <img 
                        src={getPlayerPhotoUrl(pick.player.code)}
                        alt={pick.player.web_name}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/player-placeholder.svg';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{pick.player.web_name}</div>
                        <div className="text-xs text-gray-500">{pick.player.position_info?.singular_name_short} • {formatPrice(pick.player.now_cost)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Points & Rank */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Performance</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {(teamData as any).summary_overall_points?.toLocaleString() || '0'}
                  </div>
                  <div className="text-xs text-gray-500">Total Points</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-blue-600">
                    {(teamData as any).summary_overall_rank?.toLocaleString() || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500">Overall Rank</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {(teamPicks as any).entry_history?.points || 0}
                  </div>
                  <div className="text-xs text-gray-500">GW{currentGW?.id} Points</div>
                </div>
              </div>
            </div>

            {/* Next Fixtures Preview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                {selectedGameweek === currentGW?.id ? 'Next 3 Gameweeks' : 'Future Gameweeks'}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">GW{(selectedGameweek || 1) + 1}</span>
                  <div className="flex items-center gap-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getFdrColorLight(avgFDR)}`}>
                      {avgFDR.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">GW{(selectedGameweek || 1) + 2}</span>
                  <div className="flex items-center gap-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getFdrColorLight(avgFDR + 0.3)}`}>
                      {(avgFDR + 0.3).toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">GW{(selectedGameweek || 1) + 3}</span>
                  <div className="flex items-center gap-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getFdrColorLight(avgFDR - 0.2)}`}>
                      {(avgFDR - 0.2).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Transfer Planner (Coming Soon) */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Transfer Planner</h3>
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ArrowUpDown className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 mb-2">Transfer planning tools</p>
                <p className="text-xs text-gray-400">Coming after season launch</p>
              </div>
            </div>

            {/* Chips Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Chip Status</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Wildcard</span>
                  <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded">Available</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Bench Boost</span>
                  <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded">Available</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Triple Captain</span>
                  <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded">Available</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Free Hit</span>
                  <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded">Available</span>
                </div>
              </div>
            </div>

            {/* South African Touch */}
            <div className="bg-gradient-to-r from-green-50 to-yellow-50 rounded-lg border border-green-200 p-4">
              <div className="text-center">
                <div className="text-2xl mb-2">🇿🇦</div>
                <p className="text-sm text-green-800 font-medium mb-1">
                  "Sharp as a tjommie"
                </p>
                <p className="text-xs text-green-600">
                  Keep that squad sharp, boet!
                </p>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
