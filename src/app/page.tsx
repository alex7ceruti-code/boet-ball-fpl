'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useBootstrapData, useCurrentGameweek, useGameweekFixtures } from '@/hooks/useFplData';
import { getLoadingText, getSlangPhrase, formatSATime, getTimeBasedGreeting } from '@/utils/slang';
import { getSATimeGreeting, getTimeBasedBg } from '@/lib/utils';
import { Clock, MapPin, Users, TrendingUp, Flame, Calendar, Trophy, Activity } from 'lucide-react';
import { Button, Card, CardHeader, CardContent, Badge, LoadingSpinner, LiveIndicator } from '@/components/ui';
import { BoerieBurnerCard, SALoading, PriceChange } from '@/components/ui/SAComponents';
import { CoachRassie } from '@/components/CoachRassie';
import { getSASlang } from '@/utils/saTheme';
import ArticleCarousel from '@/components/ArticleCarousel';

// Team badge URLs (FPL standard format) - Higher resolution
const getTeamBadgeUrl = (teamCode: number) => 
  `https://resources.premierleague.com/premierleague/badges/70/t${teamCode}.png`;

// Player photo URLs (FPL standard format)  
const getPlayerPhotoUrl = (playerCode: number) =>
  `https://resources.premierleague.com/premierleague/photos/players/250x250/p${playerCode}.png`;

// FDR color mapping
const getFDRColor = (difficulty: number) => {
  const colors = {
    1: 'bg-green-100 text-green-800 border-green-200',
    2: 'bg-green-50 text-green-700 border-green-200',
    3: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    4: 'bg-orange-50 text-orange-700 border-orange-200',
    5: 'bg-red-100 text-red-800 border-red-200',
  };
  return colors[difficulty as keyof typeof colors] || colors[3];
};

// Format kickoff time to SAST
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

export default function LiveHomePage() {
  const { data: session } = useSession();
  const { data: bootstrap, isLoading: bootstrapLoading, error: bootstrapError } = useBootstrapData();
  const { current: currentGW, next: nextGW } = useCurrentGameweek();
  const displayGW = currentGW || nextGW; // Use next GW if current is not active (season hasn't started)
  const { data: fixtures, isLoading: fixturesLoading } = useGameweekFixtures(displayGW?.id || null);

  if (bootstrapLoading || fixturesLoading) {
    return (
      <div className={`min-h-screen ${getTimeBasedBg()} flex items-center justify-center`}>
        <Card className="text-center" padding="lg">
          <LoadingSpinner size="xl" className="mx-auto mb-4" />
          <p className="text-lg text-gray-600 font-medium">Checking the fixtures, sharp sharp...</p>
          <p className="text-sm text-gray-500 mt-2">Sharp as a tjommie</p>
        </Card>
      </div>
    );
  }

  if (bootstrapError || !bootstrap) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😅</div>
          <h2 className="text-2xl font-bold text-red-800 mb-4">Eish, something's not lekker...</h2>
          <p className="text-red-600 mb-6">Having trouble connecting to the FPL servers. Check your connection, boet!</p>
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

  // Get top 3 players by total points for "Boerie Burners"
  const topPlayers = bootstrap.elements
    .sort((a, b) => b.total_points - a.total_points)
    .slice(0, 3)
    .map(player => {
      const team = bootstrap.teams.find(t => t.id === player.team);
      const position = bootstrap.element_types.find(p => p.id === player.element_type);
      return { ...player, team_info: team, position_info: position };
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-yellow-50">
      <div className="container mx-auto px-6 py-8">
        
        {/* Hero Section with Live GW Info */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 bg-springbok-green text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Calendar className="w-4 h-4" />
              {displayGW ? `${displayGW.name} • ${displayGW.finished ? 'Done and dusted' : displayGW.is_current ? 'Live now!' : 'Coming up!'}` : 'Loading...'}
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-4 text-gray-800">
              {getTimeBasedGreeting()} <br />
              <span 
                className="text-transparent bg-clip-text"
                style={{
                  background: 'linear-gradient(135deg, #007A3D 0%, #FFD700 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Ready for Some FPL, Boet?
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-4">
              {displayGW?.finished ? 'Done and dusted' : displayGW?.is_current ? 'This week\'s action' : 'Coming up next'} - 
              Hot as a braai fire 🔥
            </p>
            <div className="inline-flex items-center gap-2 bg-springbok-green/10 border border-springbok-green/20 text-springbok-700 px-4 py-2 rounded-full text-sm font-medium">
              <span>🇿🇦</span>
              <span>{getSASlang('strategy', 'general')} - Built for SA FPL managers!</span>
            </div>
          </div>

          {/* Quick Stats */}
          {displayGW && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
              <Card variant="premium" padding="md" className="text-center">
                <div className="text-2xl font-bold text-springbok-600">{displayGW.average_entry_score || 'TBC'}</div>
                <div className="text-sm text-gray-600">Average Score</div>
                <LiveIndicator className="justify-center mt-2" text={displayGW.is_current ? "Live" : "Soon"} variant={displayGW.is_current ? "green" : "blue"} />
              </Card>
              <Card variant="premium" padding="md" className="text-center">
                <div className="text-2xl font-bold text-springbok-600">{displayGW.highest_score || 'TBC'}</div>
                <div className="text-sm text-gray-600">Highest Score</div>
                <Badge variant="springbok" size="sm" className="mt-1">🏆 Best</Badge>
              </Card>
              <Card variant="premium" padding="md" className="text-center">
                <div className="text-2xl font-bold text-springbok-600">{bootstrap.total_players.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Managers</div>
                <Badge variant="gold" size="sm" className="mt-1">Active</Badge>
              </Card>
              <Card variant="premium" padding="md" className="text-center">
                <div className="text-2xl font-bold text-springbok-600">{fixtures?.length || 0}</div>
                <div className="text-sm text-gray-600">GW Fixtures</div>
                <Badge variant="info" size="sm" className="mt-1">SAST</Badge>
              </Card>
            </div>
          )}
        </div>

        {/* Latest FPL Articles Carousel */}
        <div className="max-w-7xl mx-auto mb-12">
          <ArticleCarousel 
            autoRotate={true}
            rotationInterval={10000}
            showControls={true}
            className=""
          />
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Current GW Fixtures - Takes up 2/3 width */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-6 h-6 text-braai-primary" />
                <h2 className="text-2xl font-bold text-gray-800">
                  {displayGW?.name || 'Upcoming'} Fixtures
                </h2>
                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  All times SAST 🇿🇦
                </div>
              </div>

              {fixtures && fixtures.length > 0 ? (
                <div className="space-y-4">
                  {fixtures.map((fixture) => (
                    <div 
                      key={fixture.id} 
                      className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {/* Home Team */}
                          <div className="flex items-center space-x-3">
                            <img 
                              src={getTeamBadgeUrl(fixture.team_h_info.code)}
                              alt={fixture.team_h_info.name}
                              className="w-10 h-10 object-contain bg-white rounded-full p-1 shadow-sm"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/team-placeholder.svg';
                              }}
                            />
                            <span className="font-semibold text-gray-800 min-w-[120px] text-left">
                              {fixture.team_h_info.short_name}
                            </span>
                            <div className={`px-2 py-1 rounded-full text-xs font-semibold border ${getFDRColor(fixture.team_h_difficulty)}`}>
                              {fixture.team_h_difficulty}
                            </div>
                          </div>

                          <div className="text-gray-400 font-bold text-lg">vs</div>

                          {/* Away Team */}
                          <div className="flex items-center space-x-3">
                            <div className={`px-2 py-1 rounded-full text-xs font-semibold border ${getFDRColor(fixture.team_a_difficulty)}`}>
                              {fixture.team_a_difficulty}
                            </div>
                            <span className="font-semibold text-gray-800 min-w-[120px] text-right">
                              {fixture.team_a_info.short_name}
                            </span>
                            <img 
                              src={getTeamBadgeUrl(fixture.team_a_info.code)}
                              alt={fixture.team_a_info.name}
                              className="w-10 h-10 object-contain bg-white rounded-full p-1 shadow-sm"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/team-placeholder.svg';
                              }}
                            />
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
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
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No fixtures available yet, boet!</p>
                </div>
              )}
            </div>
          </div>

          {/* Boerie Burners of the Week - Takes up 1/3 width */}
          <div className="xl:col-span-1">
            <Card variant="premium" padding="lg" className="h-fit">
              <CardHeader 
                title="Boerie Burners 🔥"
                subtitle={getSASlang('system', 'success') + '! These okes are cooking with gas!'}
                className="pb-4"
              />
              <CardContent className="space-y-4">
                {topPlayers.map((player, index) => (
                  <BoerieBurnerCard 
                    key={player.id}
                    player={{
                      name: player.web_name,
                      points: player.total_points,
                      team: player.team_info?.short_name || 'Unknown',
                      position: player.position_info?.singular_name_short || 'Unknown',
                      isSelected: false // You can add logic to check if player is in user's team
                    }}
                    rank={index + 1}
                  />
                ))}

                <div className="pt-4 border-t border-gray-200">
                  <Link href="/players" className="block">
                    <Button variant="secondary" size="sm" className="w-full">
                      <Users className="w-4 h-4" />
                      {getSASlang('interactions', 'good-choice')} View All Players
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="max-w-4xl mx-auto mt-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-gray-800 font-accent mb-2">Ready to Dominate?</h2>
            <p className="text-gray-600">Sharp as a tjommie - Choose your weapon, boet!</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/dashboard">
              <Card variant="premium" padding="lg" interactive className="h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-springbok-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-springbok-600" />
                  </div>
                  <Badge variant="gold" size="sm">Live</Badge>
                </div>
                <h3 className="font-bold text-gray-800 mb-2 font-accent text-lg">Dashboard</h3>
                <p className="text-sm text-gray-600">Live scores, player insights & mini-league domination</p>
              </Card>
            </Link>
            
            <Link href="/fixtures">
              <Card variant="premium" padding="lg" interactive className="h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-springbok-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-springbok-600" />
                  </div>
                  <Badge variant="success" size="sm">Plan</Badge>
                </div>
                <h3 className="font-bold text-gray-800 mb-2 font-accent text-lg">Fixture Planner</h3>
                <p className="text-sm text-gray-600">Smart transfers with FDR analysis & SAST schedules</p>
              </Card>
            </Link>
            
            <Link href="/my-team">
              <Card variant="premium" padding="lg" interactive className="h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-springbok-100 rounded-lg">
                    <Trophy className="w-6 h-6 text-springbok-600" />
                  </div>
                  <Badge variant="premium" size="sm">Analyze</Badge>
                </div>
                <h3 className="font-bold text-gray-800 mb-2 font-accent text-lg">My Team</h3>
                <p className="text-sm text-gray-600">Squad analysis, transfer strategy & chip timing</p>
              </Card>
            </Link>
          </div>
          
          <div className="text-center mt-8">
            <Button variant="premium" size="lg" className="font-accent">
              <Activity className="w-5 h-5" />
              Explore All Features
            </Button>
          </div>
          
          {/* Coach Rassie Tips - Fixed Bottom Right (Only for authenticated users) */}
          {session && (
            <CoachRassie 
              context="mini-league-advice"
              trigger="auto"
              position="bottom-right"
              className="fixed bottom-6 right-6 z-50"
            />
          )}
        </div>
      </div>
    </div>
  );
}
