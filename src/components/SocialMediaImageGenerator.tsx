'use client';

import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { useSession } from 'next-auth/react';
import { 
  Download, 
  Share, 
  Instagram, 
  Twitter, 
  Loader2,
  Camera,
  Palette,
  Zap,
  Trophy,
  TrendingUp,
  Target,
  Calendar,
  Star
} from 'lucide-react';

interface SocialMediaImageGeneratorProps {
  data: any;
  template: 'player-comparison' | 'player-spotlight' | 'weekly-insights' | 'top-performers' | 'squad-analysis' | 'captain-picks' | 'fut-card';
  title?: string;
  onClose?: () => void;
}

interface PlayerData {
  id: number;
  web_name: string;
  first_name: string;
  second_name: string;
  team_info?: { short_name: string; code?: number };
  position_info?: { singular_name: string };
  total_points: number;
  form: string;
  now_cost: number;
  selected_by_percent: string;
  goals_scored: number;
  assists: number;
  expected_goals: string;
  expected_assists: string;
  ict_index: string;
  value_season: string;
  minutes?: number;
  code?: number;
}

// Player Image component with export-friendly fallback handling
const PlayerImageWithFallback: React.FC<{
  player: PlayerData;
  playerImageUrl: string | null;
  className: string;
}> = ({ player, playerImageUrl, className }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div className={`${className} bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center`}>
      {playerImageUrl && !imageError ? (
        <>
          <img 
            src={playerImageUrl} 
            alt={player.web_name}
            className="w-full h-full object-cover"
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              console.log('Image failed to load:', playerImageUrl);
              setImageError(true);
            }}
            style={{ display: imageError ? 'none' : 'block' }}
          />
          {/* Fallback overlay that shows while image is loading or on error */}
          <div 
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
              imageLoaded && !imageError ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            <div className="text-5xl font-black text-gray-400">
              {player.web_name.charAt(0)}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Player Initial fallback */}
          <div className="text-5xl font-black text-gray-400">
            {player.web_name.charAt(0)}
          </div>
        </>
      )}
      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
    </div>
  );
};

const SocialMediaImageGenerator: React.FC<SocialMediaImageGeneratorProps> = ({ 
  data, 
  template, 
  title = "Boet Ball FPL Analysis",
  onClose 
}) => {
  const { data: session } = useSession();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'instagram-post' | 'instagram-story' | 'twitter'>('instagram-post');
  const [selectedStyle, setSelectedStyle] = useState<'totw' | 'inform' | 'icon' | 'hero'>('totw');
  
  // Check if user is admin for FUT card access
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN';
  
  // Prevent FUT card generation for non-admin users
  if (template === 'fut-card' && !isAdmin) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Premium Feature</h2>
            <p className="text-gray-600 mb-6">
              FUT Card generation is available to admin users only. This premium feature requires special access.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Preload all images before generating canvas
  const preloadImages = async (element: HTMLElement): Promise<void> => {
    const images = element.querySelectorAll('img');
    const imagePromises = Array.from(images).map((img) => {
      return new Promise<void>((resolve) => {
        if (img.complete) {
          resolve();
        } else {
          const handleLoad = () => {
            img.removeEventListener('load', handleLoad);
            img.removeEventListener('error', handleError);
            resolve();
          };
          const handleError = () => {
            img.removeEventListener('load', handleLoad);
            img.removeEventListener('error', handleError);
            // Replace failed image with fallback
            const playerName = img.alt || 'Player';
            const fallbackDiv = document.createElement('div');
            fallbackDiv.className = 'w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-5xl font-black text-gray-400';
            fallbackDiv.textContent = playerName.charAt(0);
            img.parentElement?.appendChild(fallbackDiv);
            img.style.display = 'none';
            resolve();
          };
          img.addEventListener('load', handleLoad);
          img.addEventListener('error', handleError);
        }
      });
    });
    
    await Promise.all(imagePromises);
  };

  const generateImage = async () => {
    if (!canvasRef.current) return;

    setIsGenerating(true);
    
    try {
      // Preload all images first
      await preloadImages(canvasRef.current);
      
      // Wait a bit more for images to fully render
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(canvasRef.current, {
        scale: 2, // High DPI for social media
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true, // Allow cross-origin images
        foreignObjectRendering: false, // Better compatibility
        logging: true, // Enable logging for debugging
        width: selectedFormat === 'instagram-post' ? 1080 : selectedFormat === 'instagram-story' ? 1080 : 1200,
        height: selectedFormat === 'instagram-post' ? 1080 : selectedFormat === 'instagram-story' ? 1920 : 675,
      });

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (!blob) return;
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `boet-ball-${template}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 'image/png');

    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getFormatDimensions = () => {
    switch (selectedFormat) {
      case 'instagram-post':
        return { width: 540, height: 540 }; // 1:1 ratio, display at half scale
      case 'instagram-story':
        return { width: 337.5, height: 600 }; // 9:16 ratio
      case 'twitter':
        return { width: 600, height: 337.5 }; // 16:9 ratio
      default:
        return { width: 540, height: 540 };
    }
  };

  const formatDimensions = getFormatDimensions();

  const renderPlayerComparison = () => {
    if (!Array.isArray(data) || data.length === 0) return null;

    const players = data.slice(0, 4) as PlayerData[];

    return (
      <div 
        ref={canvasRef}
        className="bg-gradient-to-br from-green-500 to-green-700 text-white relative overflow-hidden"
        style={formatDimensions}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4 w-12 h-12 border-2 border-white rounded-full"></div>
          <div className="absolute top-8 right-8 w-8 h-8 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-8 left-8 w-6 h-6 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-4 right-4 w-10 h-10 border-2 border-white rounded-full"></div>
          
          {/* Football pattern */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-24 h-24 border border-white rounded-full opacity-50">
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="relative z-10 p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img 
              src="/instagram-logo-analytics-v3.svg" 
              alt="Boet Ball" 
              className="w-8 h-8"
            />
            <h1 className="text-xl font-black tracking-wide">BOET BALL</h1>
          </div>
          <p className="text-sm opacity-90 font-semibold">FPL PLAYER COMPARISON</p>
          <div className="w-16 h-0.5 bg-yellow-400 mx-auto mt-2"></div>
        </div>

        {/* Players Grid */}
        <div className="relative z-10 px-4 pb-6">
          {selectedFormat === 'instagram-post' ? (
            // Square layout - 2x2 grid for Instagram post
            <div className="grid grid-cols-2 gap-3">
              {players.map((player, index) => (
                <div key={player.id} className="bg-white/95 backdrop-blur-sm rounded-xl p-3 text-gray-800">
                  <div className="text-center mb-2">
                    <h3 className="font-bold text-sm text-green-700 truncate">{player.web_name}</h3>
                    <p className="text-xs text-gray-600">{player.team_info?.short_name} • {player.position_info?.singular_name}</p>
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Points</span>
                      <span className="font-bold text-green-600 text-sm">{player.total_points}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Form</span>
                      <span className="font-bold text-blue-600 text-sm">{player.form}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Price</span>
                      <span className="font-bold text-orange-600 text-sm">£{(player.now_cost / 10).toFixed(1)}m</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Owned</span>
                      <span className="font-bold text-purple-600 text-sm">{parseFloat(player.selected_by_percent).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Other layouts - single column
            <div className="space-y-2">
              {players.slice(0, 3).map((player, index) => (
                <div key={player.id} className="bg-white/95 backdrop-blur-sm rounded-lg p-3 text-gray-800">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-sm text-green-700">{player.web_name}</h3>
                      <p className="text-xs text-gray-600">{player.team_info?.short_name} • £{(player.now_cost / 10).toFixed(1)}m</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-green-600">{player.total_points}</div>
                      <div className="text-xs text-gray-600">points</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/20 p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-xs">
            <Calendar className="w-3 h-3" />
            <span>GW {new Date().getDate()} • boetball.com</span>
          </div>
        </div>
      </div>
    );
  };

  const renderPlayerSpotlight = () => {
    if (!data || typeof data !== 'object') return null;

    const player = data as PlayerData;

    return (
      <div 
        ref={canvasRef}
        className="bg-gradient-to-br from-blue-600 to-purple-700 text-white relative overflow-hidden"
        style={formatDimensions}
      >
        {/* Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400 rounded-full transform translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-400 rounded-full transform -translate-x-12 translate-y-12"></div>
        </div>

        {/* Header */}
        <div className="relative z-10 p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img 
              src="/instagram-logo-analytics-v3.svg" 
              alt="Boet Ball" 
              className="w-8 h-8"
            />
            <h1 className="text-xl font-black">BOET BALL</h1>
          </div>
          <p className="text-sm opacity-90">PLAYER SPOTLIGHT</p>
        </div>

        {/* Player Info */}
        <div className="relative z-10 text-center px-6 mb-6">
          <h2 className="text-3xl font-black mb-2">{player.web_name}</h2>
          <p className="text-lg opacity-90 mb-4">{player.team_info?.short_name} • {player.position_info?.singular_name}</p>
          
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-4">
            <div className="text-4xl font-black text-yellow-400 mb-1">{player.total_points}</div>
            <div className="text-sm opacity-90">TOTAL POINTS</div>
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 px-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-green-400">{player.form}</div>
              <div className="text-xs opacity-90">Form</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-orange-400">£{(player.now_cost / 10).toFixed(1)}m</div>
              <div className="text-xs opacity-90">Price</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-blue-400">{player.goals_scored + player.assists}</div>
              <div className="text-xs opacity-90">G+A</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-purple-400">{parseFloat(player.selected_by_percent).toFixed(1)}%</div>
              <div className="text-xs opacity-90">Owned</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/20 p-4 text-center">
          <p className="text-xs">GW {new Date().getDate()} • boetball.com • #FPL</p>
        </div>
      </div>
    );
  };

  const renderCaptainPicks = () => {
    if (!Array.isArray(data) || data.length === 0) return null;

    const captains = data.slice(0, 3) as PlayerData[];

    return (
      <div 
        ref={canvasRef}
        className="bg-gradient-to-br from-yellow-500 via-orange-500 to-red-600 text-white relative overflow-hidden"
        style={formatDimensions}
      >
        {/* SA Flag inspired background pattern */}
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-r from-green-600 to-green-500"></div>
          <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-r from-blue-600 to-blue-500"></div>
          <div className="absolute top-1/4 right-4 w-16 h-16 border-4 border-white rounded-full flex items-center justify-center">
            <Trophy className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Header */}
        <div className="relative z-10 p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img 
              src="/instagram-logo-analytics-v3.svg" 
              alt="Boet Ball" 
              className="w-8 h-8"
            />
            <h1 className="text-xl font-black tracking-wide">BOET BALL</h1>
          </div>
          <p className="text-sm font-bold mb-1">🇿🇦 CAPTAIN PICKS 👑</p>
          <p className="text-xs opacity-90">Gameweek {new Date().getDate()} Recommendations</p>
          <div className="w-20 h-1 bg-white mx-auto mt-2 rounded-full"></div>
        </div>

        {/* Captain Cards */}
        <div className="relative z-10 px-4 space-y-3">
          {captains.map((captain, index) => (
            <div key={captain.id} className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 text-gray-800 relative overflow-hidden">
              <div className="absolute top-2 left-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-black text-sm">
                {index + 1}
              </div>
              <div className="ml-10">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-black text-gray-800">{captain.web_name}</h3>
                    <p className="text-sm text-gray-600 font-medium">{captain.team_info?.short_name} • {captain.position_info?.singular_name}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-green-600">{captain.total_points}</div>
                    <div className="text-xs text-gray-500">pts</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="text-center bg-gray-50 rounded-lg p-2">
                    <div className="text-sm font-bold text-blue-600">{captain.form}</div>
                    <div className="text-xs text-gray-600">Form</div>
                  </div>
                  <div className="text-center bg-gray-50 rounded-lg p-2">
                    <div className="text-sm font-bold text-orange-600">£{(captain.now_cost / 10).toFixed(1)}m</div>
                    <div className="text-xs text-gray-600">Price</div>
                  </div>
                  <div className="text-center bg-gray-50 rounded-lg p-2">
                    <div className="text-sm font-bold text-purple-600">{parseFloat(captain.selected_by_percent).toFixed(1)}%</div>
                    <div className="text-xs text-gray-600">Owned</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/30 p-3 text-center">
          <div className="flex items-center justify-center gap-2 text-sm font-bold">
            <Star className="w-4 h-4 text-yellow-300" />
            <span>boetball.com • #FPL #BoetBall</span>
            <Star className="w-4 h-4 text-yellow-300" />
          </div>
        </div>
      </div>
    );
  };

  const renderSquadAnalysis = () => {
    if (!data || typeof data !== 'object') return null;

    const { totalCost = 100, totalPoints = 0, avgForm = 0, squadSize = 15, topPlayers = [] } = data;
    const displayPlayers = Array.isArray(topPlayers) ? topPlayers.slice(0, 4) : [];

    return (
      <div 
        ref={canvasRef}
        className="bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 text-white relative overflow-hidden"
        style={formatDimensions}
      >
        {/* South African inspired geometric background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 left-4 w-20 h-20 border-2 border-white transform rotate-45"></div>
          <div className="absolute top-16 right-8 w-12 h-12 border-2 border-yellow-400 rounded-full"></div>
          <div className="absolute bottom-8 left-8 w-16 h-16 border-2 border-white transform rotate-12"></div>
          <div className="absolute bottom-4 right-4 w-8 h-8 bg-yellow-400 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/30 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="relative z-10 p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img 
              src="/instagram-logo-analytics-v3.svg" 
              alt="Boet Ball" 
              className="w-8 h-8"
            />
            <h1 className="text-xl font-black tracking-wide">BOET BALL</h1>
          </div>
          <p className="text-sm font-bold mb-1">🏆 SQUAD ANALYSIS 📊</p>
          <p className="text-xs opacity-90">Your FPL Team Breakdown</p>
          <div className="w-20 h-1 bg-yellow-400 mx-auto mt-2 rounded-full"></div>
        </div>

        {/* Key Stats */}
        <div className="relative z-10 px-4 mb-4">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
              <div className="text-2xl font-black text-yellow-400">£{totalCost.toFixed(1)}m</div>
              <div className="text-xs opacity-90">Squad Value</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
              <div className="text-2xl font-black text-green-300">{totalPoints}</div>
              <div className="text-xs opacity-90">Total Points</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
              <div className="text-xl font-black text-orange-300">{avgForm.toFixed(1)}</div>
              <div className="text-xs opacity-90">Avg Form</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
              <div className="text-xl font-black text-blue-300">{squadSize}</div>
              <div className="text-xs opacity-90">Players</div>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        {displayPlayers.length > 0 && (
          <div className="relative z-10 px-4 mb-4">
            <h3 className="text-sm font-bold mb-3 text-center text-yellow-300">⭐ Top Performers</h3>
            <div className="space-y-2">
              {displayPlayers.map((player: any, index: number) => (
                <div key={index} className="bg-white/95 backdrop-blur-sm rounded-lg p-2 text-gray-800 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-sm text-green-700">{player.web_name || player.name}</span>
                    <span className="text-xs text-gray-600 ml-2">({player.team_info?.short_name || player.team})</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-green-600">{player.total_points || player.points}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/30 p-3 text-center">
          <div className="flex items-center justify-center gap-2 text-sm font-bold">
            <Trophy className="w-4 h-4 text-yellow-300" />
            <span>GW{new Date().getDate()} • boetball.com • #BoetBall</span>
            <Trophy className="w-4 h-4 text-yellow-300" />
          </div>
        </div>
      </div>
    );
  };

  // Get premium card colors with variants
  const getCardColors = (variant = 'totw') => {
    switch (variant) {
      case 'totw': // Original TOTW style
        return {
          gradient: 'from-black via-gray-900 to-yellow-900',
          accent: 'text-yellow-400',
          glow: 'shadow-yellow-400/50',
          border: 'border-yellow-400'
        };
      case 'inform': // Premium blue/purple INFORM style
        return {
          gradient: 'from-indigo-900 via-purple-900 to-pink-800',
          accent: 'text-pink-300',
          glow: 'shadow-pink-400/50',
          border: 'border-pink-400'
        };
      case 'icon': // Premium gold/bronze ICON style
        return {
          gradient: 'from-amber-900 via-yellow-800 to-orange-900',
          accent: 'text-amber-200',
          glow: 'shadow-amber-400/50',
          border: 'border-amber-300'
        };
      case 'hero': // Premium green/teal HERO style
        return {
          gradient: 'from-emerald-900 via-teal-800 to-cyan-900',
          accent: 'text-emerald-300',
          glow: 'shadow-emerald-400/50',
          border: 'border-emerald-400'
        };
      default:
        return {
          gradient: 'from-black via-gray-900 to-yellow-900',
          accent: 'text-yellow-400',
          glow: 'shadow-yellow-400/50',
          border: 'border-yellow-400'
        };
    }
  };

  // Get actual gradient CSS colors for background
  const getGradientColors = (variant = 'totw') => {
    switch (variant) {
      case 'totw':
        return '#000000, #1f2937, #92400e';
      case 'inform':
        return '#312e81, #581c87, #9d174d';
      case 'icon':
        return '#92400e, #ca8a04, #ea580c';
      case 'hero':
        return '#064e3b, #0f766e, #164e63';
      default:
        return '#000000, #1f2937, #92400e';
    }
  };

  // Get player image with proper fallback handling
  const getPlayerImage = (playerCode: number, playerName: string) => {
    if (!playerCode) {
      return null;
    }
    // Use our proxy API to handle CORS and caching
    return `/api/proxy/player-image?code=${playerCode}`;
  };

  const renderFUTCard = () => {
    if (!data || typeof data !== 'object') return null;

    const player = data as PlayerData;
    const colors = getCardColors(selectedStyle);
    
    // Get player image with fallback
    const playerImageUrl = getPlayerImage(player.code || 0, player.web_name);

    // Enhanced analytics
    const enhancedStats = {
      pointsPerGame: player.total_points > 0 ? (player.total_points / Math.max(player.minutes || 90, 90) * 90).toFixed(1) : '0.0',
      valueRating: player.total_points > 0 ? (player.total_points / (player.now_cost / 10)).toFixed(1) : '0.0',
      expectedGoals: parseFloat(player.expected_goals || '0').toFixed(1),
      expectedAssists: parseFloat(player.expected_assists || '0').toFixed(1),
      ictIndex: parseFloat(player.ict_index || '0').toFixed(0),
      ownership: parseFloat(player.selected_by_percent || '0').toFixed(1)
    };

    // Calculate overall rating
    const calculateOverallRating = () => {
      const points = player.total_points;
      const form = parseFloat(player.form || '0');
      const pointsScore = Math.min(99, Math.max(50, (points / 150) * 99));
      const formScore = Math.min(99, Math.max(50, form * 10));
      return Math.round((pointsScore * 0.7) + (formScore * 0.3));
    };

    const overallRating = calculateOverallRating();

    return (
      <div 
        ref={canvasRef}
        className="relative overflow-hidden"
        style={{
          ...formatDimensions,
          background: `linear-gradient(135deg, ${getGradientColors(selectedStyle)})`,
        }}
      >
        {/* Premium Background Effects */}
        <div className="absolute inset-0">
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/20"></div>
          
          {/* Geometric pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-8 left-8 w-16 h-16 border-2 border-white rotate-45"></div>
            <div className="absolute top-12 right-12 w-12 h-12 border border-white rounded-full"></div>
            <div className="absolute bottom-16 left-12 w-8 h-8 bg-white/30 rotate-12"></div>
            <div className="absolute bottom-8 right-8 w-6 h-6 bg-white/40 rounded-full"></div>
          </div>
          
          {/* Premium shine effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"></div>
        </div>

        {/* Header Section */}
        <div className="relative z-10 p-6 text-center">
          <div className="flex items-center justify-between mb-3">
            {/* Boet Ball Branding */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center border border-white/30">
                <span className="text-sm font-black text-white">BB</span>
              </div>
              <div className="text-left">
                <div className="text-sm font-black text-white tracking-wider">BOET BALL</div>
                <div className="text-xs text-white/70 font-medium">FPL PREMIUM</div>
              </div>
            </div>
            
            {/* Overall Rating Badge */}
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center border-2 border-white/50 shadow-xl">
                <span className="text-lg font-black text-white drop-shadow-lg">{overallRating}</span>
              </div>
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-xs font-bold text-white/90 bg-black/30 px-2 py-0.5 rounded-full">
                OVR
              </div>
            </div>
          </div>
          
          {/* Card Type Badge */}
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 rounded-full px-4 py-1.5">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
            <span className="text-xs font-bold text-white tracking-widest">{selectedStyle.toUpperCase()} CARD</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="relative z-10 px-6 mb-6">
          {/* Player Image Section */}
          <div className="text-center mb-4">
            <div className="relative inline-block">
              <PlayerImageWithFallback 
                player={player} 
                playerImageUrl={playerImageUrl}
                className="w-32 h-40 relative overflow-hidden rounded-2xl shadow-2xl border-2 border-white/20"
              />
              
              {/* Team Badge Overlay */}
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full p-1.5 border-2 border-gray-200 shadow-lg">
                <div className="text-xs font-bold text-gray-700">
                  {player.team_info?.short_name?.substring(0, 3) || 'TBD'}
                </div>
              </div>
            </div>
            
            {/* Player Name & Position */}
            <div className="mt-4">
              <h2 className="text-2xl font-black text-white mb-1 tracking-wide drop-shadow-lg">
                {player.web_name.toUpperCase()}
              </h2>
              <div className="flex items-center justify-center gap-2 text-white/90">
                <span className="text-sm font-semibold">{player.team_info?.short_name}</span>
                <span className="w-1 h-1 bg-white/60 rounded-full"></span>
                <span className="text-sm font-semibold">{player.position_info?.singular_name}</span>
              </div>
            </div>
          </div>

          {/* Key Stats Grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
              <div className="text-xl font-black text-white mb-1">{player.total_points}</div>
              <div className="text-xs font-medium text-white/80">TOTAL PTS</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
              <div className="text-xl font-black text-white mb-1">{player.form}</div>
              <div className="text-xs font-medium text-white/80">FORM</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
              <div className="text-xl font-black text-white mb-1">£{(player.now_cost / 10).toFixed(1)}m</div>
              <div className="text-xs font-medium text-white/80">PRICE</div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-white/80">Goals + Assists</span>
                <span className="text-lg font-black text-white">{(player.goals_scored || 0) + (player.assists || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-white/80">Expected (xG+xA)</span>
                <span className="text-sm font-bold text-white">{(parseFloat(enhancedStats.expectedGoals) + parseFloat(enhancedStats.expectedAssists)).toFixed(1)}</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-white/80">Value Rating</span>
                <span className="text-lg font-black text-white">{enhancedStats.valueRating}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-white/80">Ownership</span>
                <span className="text-sm font-bold text-white">{enhancedStats.ownership}%</span>
              </div>
            </div>
          </div>

          {/* ICT Index Bar */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-bold text-white/90">ICT INDEX</span>
              <span className="text-2xl font-black text-yellow-400">{enhancedStats.ictIndex}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 mb-2">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full shadow-lg"
                style={{ width: `${Math.min(100, (parseFloat(enhancedStats.ictIndex) / 200) * 100)}%` }}
              ></div>
            </div>
            <div className="text-center text-xs text-white/80 font-medium">
              Influence • Creativity • Threat
            </div>
          </div>
        </div>

        {/* Premium Footer */}
        <div className="relative z-10 bg-black/30 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
                <span className="text-xs font-black text-white">🇿🇦</span>
              </div>
              <div>
                <div className="text-xs font-bold text-white">BOETBALL.COM</div>
                <div className="text-xs text-white/70">Premium FPL Analytics</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-white">GW{new Date().getDate()} • 2024/25</div>
              <div className="text-xs text-white/70">#BoetBall #FPL</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTemplate = () => {
    switch (template) {
      case 'player-comparison':
        return renderPlayerComparison();
      case 'player-spotlight':
        return renderPlayerSpotlight();
      case 'fut-card':
        return renderFUTCard();
      case 'captain-picks':
        return renderCaptainPicks();
      case 'squad-analysis':
        return renderSquadAnalysis();
      default:
        return renderPlayerComparison();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Social Media Generator</h2>
                <p className="text-sm text-gray-600">Create high-quality images for Instagram and Twitter</p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {/* Format Selection */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Select Format</h3>
            <div className="flex gap-3">
              {[
                { id: 'instagram-post', name: 'Instagram Post', icon: Instagram, size: '1:1 (1080×1080)' },
                { id: 'instagram-story', name: 'Instagram Story', icon: Instagram, size: '9:16 (1080×1920)' },
                { id: 'twitter', name: 'Twitter Post', icon: Twitter, size: '16:9 (1200×675)' }
              ].map((format) => (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id as any)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    selectedFormat === format.id
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <format.icon className="w-5 h-5" />
                  <div className="text-center">
                    <div className="text-xs font-medium">{format.name}</div>
                    <div className="text-xs opacity-70">{format.size}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Card Style Selection */}
          {template === 'fut-card' && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Select Card Style</h3>
              <div className="flex gap-3 flex-wrap">
                {[
                  { id: 'totw', name: 'TOTW', desc: 'Black & Gold', gradient: 'from-black to-yellow-900' },
                  { id: 'inform', name: 'INFORM', desc: 'Blue & Pink', gradient: 'from-indigo-900 to-pink-800' },
                  { id: 'icon', name: 'ICON', desc: 'Gold & Bronze', gradient: 'from-amber-900 to-orange-900' },
                  { id: 'hero', name: 'HERO', desc: 'Green & Teal', gradient: 'from-emerald-900 to-cyan-900' }
                ].map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id as any)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all min-w-20 ${
                      selectedStyle === style.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    {/* Mini gradient preview */}
                    <div className={`w-8 h-6 rounded bg-gradient-to-r ${style.gradient} border border-white/20`}></div>
                    <div className="text-center">
                      <div className="text-xs font-bold">{style.name}</div>
                      <div className="text-xs opacity-70">{style.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Preview */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Preview</h3>
            <div className="flex justify-center p-4 bg-gray-50 rounded-xl">
              <div style={{ maxWidth: '400px', transform: 'scale(0.8)' }}>
                {renderTemplate()}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              High-resolution image ready for social media
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={generateImage}
                disabled={isGenerating}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Download Image
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaImageGenerator;
