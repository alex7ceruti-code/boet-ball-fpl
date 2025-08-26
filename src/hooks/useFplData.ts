import useSWR from 'swr';
import { BootstrapData, Fixture, LiveData, FixtureWithTeams } from '@/types/fpl';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Base hook for FPL API calls
export function useFplApi<T>(endpoint: string, refreshInterval?: number) {
  const { data, error, isLoading, mutate } = useSWR<T>(
    endpoint ? `/api/fpl?endpoint=${encodeURIComponent(endpoint)}` : null,
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

// Bootstrap data hook (teams, players, gameweeks)
export function useBootstrapData() {
  return useFplApi<BootstrapData>('bootstrap-static/');
}

// Fixtures hook
export function useFixtures() {
  return useFplApi<Fixture[]>('fixtures/');
}

// Live gameweek data hook
export function useLiveData(gameweek: number | null) {
  return useFplApi<LiveData>(
    gameweek ? `event/${gameweek}/live/` : '',
    30000 // Refresh every 30 seconds for live data
  );
}

// Team entry hook
export function useEntry(entryId: number | null) {
  return useFplApi(entryId ? `entry/${entryId}/` : '');
}

// Entry history hook
export function useEntryHistory(entryId: number | null) {
  return useFplApi(entryId ? `entry/${entryId}/history/` : '');
}

// League standings hook
export function useLeagueStandings(leagueId: number | null, page = 1) {
  return useFplApi(leagueId ? `leagues-classic/${leagueId}/standings/?page_standings=${page}` : '');
}

// Entry picks hook
export function useEntryPicks(entryId: number | null, gameweek: number | null) {
  return useFplApi(entryId && gameweek ? `entry/${entryId}/event/${gameweek}/picks/` : '');
}

// Derived data hooks with processing
export function useProcessedFixtures() {
  const { data: fixtures, error, isLoading } = useFixtures();
  const { data: bootstrap } = useBootstrapData();

  const processedData = fixtures && bootstrap ? fixtures.map(fixture => {
    const homeTeam = bootstrap.teams.find(t => t.id === fixture.team_h);
    const awayTeam = bootstrap.teams.find(t => t.id === fixture.team_a);
    
    const kickoffDate = new Date(fixture.kickoff_time);
    const sastTime = kickoffDate.toLocaleString('en-ZA', { 
      timeZone: 'Africa/Johannesburg',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });

    return {
      ...fixture,
      team_h_info: homeTeam!,
      team_a_info: awayTeam!,
      kickoff_time_formatted: kickoffDate.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      }),
      kickoff_time_sast: sastTime,
    } as FixtureWithTeams;
  }) : null;

  return {
    data: processedData,
    error,
    isLoading,
  };
}

// Get current gameweek
export function useCurrentGameweek() {
  const { data: bootstrap } = useBootstrapData();
  
  const currentGw = bootstrap?.events.find(event => event.is_current);
  const nextGw = bootstrap?.events.find(event => event.is_next);
  
  return {
    current: currentGw,
    next: nextGw,
    all: bootstrap?.events || [],
  };
}

// Get fixtures for specific gameweek
export function useGameweekFixtures(gameweek: number | null) {
  const { data: fixtures, error, isLoading } = useProcessedFixtures();
  
  const gameweekFixtures = fixtures?.filter(f => f.event === gameweek) || null;
  
  return {
    data: gameweekFixtures,
    error,
    isLoading,
  };
}

// Get next 5 fixtures for a team
export function useTeamFixtures(teamId: number | null, count = 5) {
  const { data: fixtures } = useProcessedFixtures();
  const { current } = useCurrentGameweek();
  
  if (!fixtures || !current || !teamId) return { data: null };
  
  const upcomingFixtures = fixtures
    .filter(f => f.event >= current.id && (f.team_h === teamId || f.team_a === teamId))
    .slice(0, count);
  
  return { data: upcomingFixtures };
}

// Calculate FDR for a team's next N fixtures
export function useTeamFDR(teamId: number | null, count = 5) {
  const { data: fixtures } = useTeamFixtures(teamId, count);
  
  if (!fixtures) return { data: null };
  
  const totalFdr = fixtures.reduce((sum, fixture) => {
    return sum + (fixture.team_h === teamId ? fixture.team_h_difficulty : fixture.team_a_difficulty);
  }, 0);
  
  const averageFdr = fixtures.length > 0 ? totalFdr / fixtures.length : 0;
  
  return {
    data: {
      fixtures,
      totalFdr,
      averageFdr: Number(averageFdr.toFixed(1)),
      count: fixtures.length,
    }
  };
}

// Get FPL manager's team data
export function useManagerTeam(managerId: number | null) {
  return useFplApi(managerId ? `entry/${managerId}/` : '');
}

// Get manager's current gameweek picks
export function useManagerPicks(managerId: number | null, gameweek: number | null) {
  return useFplApi(
    managerId && gameweek ? `entry/${managerId}/event/${gameweek}/picks/` : ''
  );
}

// Get manager's season history
export function useManagerHistory(managerId: number | null) {
  return useFplApi(managerId ? `entry/${managerId}/history/` : '');
}

// Get mini league standings
export function useMiniLeague(leagueId: number | null) {
  return useFplApi(leagueId ? `leagues-classic/${leagueId}/standings/` : '');
}

// Get multiple manager entries for comparison
export function useMultipleManagers(managerIds: number[]) {
  // This is a helper to get multiple managers at once
  // In practice, we'd make individual calls and combine them
  const results = managerIds.map(id => useManagerTeam(id));
  return results;
}

// Get manager's gameweek history to reconstruct historical positions
export function useManagerGameweekHistory(managerId: number | null) {
  return useFplApi(managerId ? `entry/${managerId}/history/` : '');
}

// Hook to fetch and reconstruct historical standings for multiple gameweeks
export function useHistoricalStandings(leagueId: number | null, gameweeks: number[]) {
  // First get current league standings to get all manager IDs
  const { data: currentLeague, error: leagueError, isLoading: leagueLoading } = useMiniLeague(leagueId);
  
  // Get all manager histories
  const managerIds = (currentLeague as any)?.standings?.results?.map((manager: any) => manager.entry) || [];
  const managerHistories = managerIds.map((managerId: number) => {
    const { data, error, isLoading } = useManagerGameweekHistory(managerId);
    return { managerId, data, error, isLoading };
  });
  
  // Reconstruct historical standings for each gameweek
  const results = gameweeks.map(targetGameweek => {
    if (leagueLoading || managerHistories.some((h: any) => h.isLoading)) {
      return {
        gameweek: targetGameweek,
        data: null,
        error: null,
        isLoading: true
      };
    }
    
    if (leagueError || managerHistories.some((h: any) => h.error)) {
      return {
        gameweek: targetGameweek,
        data: null,
        error: leagueError || managerHistories.find((h: any) => h.error)?.error,
        isLoading: false
      };
    }
    
    // Reconstruct standings for this gameweek
    const gameweekStandings: any[] = [];
    
    for (const managerHistory of managerHistories) {
      if (!managerHistory.data?.current) continue;
      
      const manager = (currentLeague as any)?.standings?.results?.find((m: any) => m.entry === managerHistory.managerId);
      if (!manager) continue;
      
      // Find the gameweek data
      const gameweekData = managerHistory.data.current.find((gw: any) => gw.event === targetGameweek);
      
      if (gameweekData) {
        gameweekStandings.push({
          entry: manager.entry,
          player_name: manager.player_name,
          entry_name: manager.entry_name,
          total: gameweekData.total_points,
          event_total: gameweekData.points,
          rank: 1 // Will be calculated after sorting
        });
      }
    }
    
    // Sort by total points and assign ranks
    gameweekStandings.sort((a, b) => b.total - a.total);
    gameweekStandings.forEach((manager, index) => {
      manager.rank = index + 1;
    });
    
    return {
      gameweek: targetGameweek,
      data: gameweekStandings.length > 0 ? {
        standings: {
          results: gameweekStandings
        }
      } : null,
      error: null,
      isLoading: false
    };
  });
  
  return results;
}
