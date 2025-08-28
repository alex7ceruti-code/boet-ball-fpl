'use client';

import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { 
  Download, 
  ChevronLeft, 
  ChevronRight,
  Trophy,
  Users,
  Target,
  BarChart3,
  Zap,
  Heart,
  Star,
  TrendingUp,
  Camera,
  Sparkles
} from 'lucide-react';

const InstagramLaunchCarousel = ({ onClose }: { onClose?: () => void }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  const slides = [
    {
      id: 'welcome',
      title: 'Welcome to Boet Ball',
      component: WelcomeSlide
    },
    {
      id: 'features',
      title: 'Key Features',
      component: FeaturesSlide
    },
    {
      id: 'analytics',
      title: 'Advanced Analytics',
      component: AnalyticsSlide
    },
    {
      id: 'community',
      title: 'Join the Community',
      component: CommunitySlide
    },
    {
      id: 'cta',
      title: 'Get Started',
      component: CTASlide
    }
  ];

  const generateAllImages = async () => {
    setIsGenerating(true);
    
    for (let i = 0; i < slides.length; i++) {
      const slideRef = slideRefs.current[i];
      if (!slideRef) continue;

      try {
        const canvas = await html2canvas(slideRef, {
          scale: 2,
          backgroundColor: '#ffffff',
          useCORS: true,
          allowTaint: false,
          width: 1080,
          height: 1080,
        });

        canvas.toBlob((blob) => {
          if (!blob) return;
          
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `boet-ball-launch-slide-${i + 1}-${slides[i].id}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 'image/png');

        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error generating slide ${i + 1}:`, error);
      }
    }

    setIsGenerating(false);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Instagram Launch Carousel</h2>
                <p className="text-sm text-gray-600">Create your Boet Ball launch post</p>
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
          {/* Slide Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevSlide}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            
            <div className="flex items-center gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentSlide ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={nextSlide}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Current Slide Preview */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Slide {currentSlide + 1}: {slides[currentSlide].title}
            </h3>
            <div className="flex justify-center p-4 bg-gray-50 rounded-xl">
              <div style={{ maxWidth: '400px', transform: 'scale(0.8)' }}>
                {slides.map((slide, index) => {
                  const SlideComponent = slide.component;
                  return (
                    <div
                      key={slide.id}
                      ref={(el) => (slideRefs.current[index] = el)}
                      style={{ display: index === currentSlide ? 'block' : 'none' }}
                    >
                      <SlideComponent />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              {slides.length} slides ready for Instagram carousel
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={generateAllImages}
                disabled={isGenerating}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 animate-spin border-2 border-white border-t-transparent rounded-full" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Download All Slides
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

// Slide 1: Welcome to Boet Ball
const WelcomeSlide = () => (
  <div className="w-[540px] h-[540px] bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 text-white relative overflow-hidden flex flex-col">
    {/* South African Flag Pattern Background */}
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-0 left-0 w-full h-1/6 bg-red-500"></div>
      <div className="absolute top-1/6 left-0 w-full h-1/6 bg-blue-600"></div>
      <div className="absolute bottom-0 left-0 w-full h-1/6 bg-orange-500"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-4 border-white/20 rounded-full"></div>
    </div>

    {/* Header */}
    <div className="relative z-10 text-center pt-16 px-8">
      <div className="mb-6">
        <img 
          src="/instagram-logo-analytics-v3.svg" 
          alt="Boet Ball" 
          className="w-16 h-16 mx-auto mb-4"
        />
        <h1 className="text-4xl font-black mb-2 tracking-wide">BOET BALL</h1>
        <div className="w-20 h-1 bg-yellow-400 mx-auto rounded-full"></div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 leading-tight">
          🇿🇦 South African<br />FPL Companion
        </h2>
        <p className="text-lg opacity-90 leading-relaxed">
          Your lekker guide to<br />
          Fantasy Premier League<br />
          success, boet! 🏆
        </p>
      </div>
    </div>

    {/* Bottom CTA */}
    <div className="absolute bottom-0 left-0 right-0 bg-black/30 p-6 text-center">
      <p className="text-lg font-bold mb-2">Ready to dominate your mini-league?</p>
      <p className="text-sm opacity-90">#BoetBall #FPL #SouthAfrica</p>
    </div>
  </div>
);

// Slide 2: Key Features
const FeaturesSlide = () => (
  <div className="w-[540px] h-[540px] bg-gradient-to-br from-blue-600 via-purple-700 to-pink-600 text-white relative overflow-hidden">
    {/* Background Pattern */}
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-8 right-8 w-20 h-20 border-4 border-white rounded-full"></div>
      <div className="absolute bottom-8 left-8 w-16 h-16 border-4 border-white transform rotate-45"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-2 border-white/20 rounded-full"></div>
    </div>

    {/* Header */}
    <div className="relative z-10 text-center pt-8 px-6">
      <h1 className="text-2xl font-black mb-2">WHAT WE OFFER</h1>
      <div className="w-16 h-0.5 bg-yellow-400 mx-auto mb-8"></div>
    </div>

    {/* Features Grid */}
    <div className="relative z-10 px-6 space-y-4">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-gray-900" />
          </div>
          <h3 className="font-bold text-lg">Advanced Analytics</h3>
        </div>
        <p className="text-sm opacity-90">Deep player insights, xG, xA, form trends & more</p>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-green-400 rounded-full flex items-center justify-center">
            <Target className="w-5 h-5 text-gray-900" />
          </div>
          <h3 className="font-bold text-lg">Player Comparison</h3>
        </div>
        <p className="text-sm opacity-90">Compare up to 4 players side-by-side</p>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-gray-900" />
          </div>
          <h3 className="font-bold text-lg">FUT-Style Cards</h3>
        </div>
        <p className="text-sm opacity-90">Create stunning player cards for social media</p>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-pink-400 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-gray-900" />
          </div>
          <h3 className="font-bold text-lg">South African Flair</h3>
        </div>
        <p className="text-sm opacity-90">Local slang, culture & community vibes</p>
      </div>
    </div>

    {/* Bottom */}
    <div className="absolute bottom-0 left-0 right-0 bg-black/30 p-4 text-center">
      <p className="text-sm font-semibold">#BoetBall • Your FPL Advantage</p>
    </div>
  </div>
);

// Slide 3: Advanced Analytics
const AnalyticsSlide = () => (
  <div className="w-[540px] h-[540px] bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900 text-white relative overflow-hidden">
    {/* Tech Background Pattern */}
    <div className="absolute inset-0 opacity-5">
      <div className="grid grid-cols-8 grid-rows-8 h-full">
        {Array.from({ length: 64 }).map((_, i) => (
          <div key={i} className="border border-white/10"></div>
        ))}
      </div>
    </div>

    {/* Header */}
    <div className="relative z-10 text-center pt-8 px-6">
      <div className="mb-4">
        <Zap className="w-12 h-12 mx-auto mb-2 text-yellow-400" />
        <h1 className="text-2xl font-black">ADVANCED ANALYTICS</h1>
        <div className="w-16 h-0.5 bg-yellow-400 mx-auto mt-2"></div>
      </div>
    </div>

    {/* Analytics Preview */}
    <div className="relative z-10 px-6 py-6">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-6">
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold mb-1">Erling Haaland</h3>
          <p className="text-sm opacity-80">Manchester City • Forward</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <div className="text-lg font-black text-yellow-400">156</div>
            <div className="text-xs opacity-80">Total Points</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-black text-green-400">8.2</div>
            <div className="text-xs opacity-80">Form</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-black text-blue-400">94</div>
            <div className="text-xs opacity-80">Overall</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>xG (Expected Goals)</span>
            <span className="font-semibold text-green-400">18.4</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Value Rating</span>
            <span className="font-semibold text-orange-400">11.2</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>ICT Index</span>
            <span className="font-semibold text-pink-400">245.8</span>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm font-semibold mb-2">🔍 Deep Insights Include:</p>
        <div className="text-xs opacity-90 space-y-1">
          <p>• Form Trends & Consistency Ratings</p>
          <p>• Fixture Difficulty Analysis</p>
          <p>• Value Efficiency Scoring</p>
          <p>• Rotation Risk Assessment</p>
        </div>
      </div>
    </div>

    {/* Bottom */}
    <div className="absolute bottom-0 left-0 right-0 bg-black/40 p-4 text-center">
      <p className="text-sm font-semibold">Make data-driven FPL decisions 📊</p>
    </div>
  </div>
);

// Slide 4: Community
const CommunitySlide = () => (
  <div className="w-[540px] h-[540px] bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 text-white relative overflow-hidden">
    {/* Community Background */}
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-12 left-12 w-16 h-16 bg-white rounded-full"></div>
      <div className="absolute top-20 right-16 w-12 h-12 bg-white rounded-full"></div>
      <div className="absolute bottom-16 left-16 w-14 h-14 bg-white rounded-full"></div>
      <div className="absolute bottom-12 right-12 w-10 h-10 bg-white rounded-full"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full"></div>
      
      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full">
        <line x1="80" y1="80" x2="270" y2="270" stroke="white" strokeWidth="2" opacity="0.1" />
        <line x1="460" y1="100" x2="270" y2="270" stroke="white" strokeWidth="2" opacity="0.1" />
        <line x1="100" y1="400" x2="270" y2="270" stroke="white" strokeWidth="2" opacity="0.1" />
        <line x1="440" y1="420" x2="270" y2="270" stroke="white" strokeWidth="2" opacity="0.1" />
      </svg>
    </div>

    {/* Header */}
    <div className="relative z-10 text-center pt-12 px-6">
      <div className="mb-6">
        <Users className="w-14 h-14 mx-auto mb-3 text-yellow-300" />
        <h1 className="text-2xl font-black">JOIN THE COMMUNITY</h1>
        <div className="w-20 h-1 bg-yellow-300 mx-auto mt-2 rounded-full"></div>
      </div>
    </div>

    {/* Community Stats/Features */}
    <div className="relative z-10 px-8 py-8">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-6">
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold mb-2">🇿🇦 South African FPL Hub</h3>
          <p className="text-sm opacity-90 leading-relaxed">
            Connect with fellow South African FPL managers, share strategies, and celebrate victories together!
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center bg-white/10 rounded-lg p-3">
            <div className="text-lg font-black text-yellow-300">🏆</div>
            <div className="text-sm font-semibold">Mini-League</div>
            <div className="text-xs opacity-80">Competitions</div>
          </div>
          <div className="text-center bg-white/10 rounded-lg p-3">
            <div className="text-lg font-black text-green-300">💬</div>
            <div className="text-sm font-semibold">Local Insights</div>
            <div className="text-xs opacity-80">& Banter</div>
          </div>
        </div>

        <div className="text-center">
          <div className="flex justify-center gap-4 text-2xl mb-3">
            <span>🍖</span><span>⚽</span><span>🏆</span><span>🇿🇦</span>
          </div>
          <p className="text-sm font-semibold">
            "Braai, banter, and brilliant FPL decisions!" 
          </p>
        </div>
      </div>
    </div>

    {/* Bottom CTA */}
    <div className="absolute bottom-0 left-0 right-0 bg-black/40 p-6 text-center">
      <p className="text-lg font-bold mb-1">Ready to join the community?</p>
      <p className="text-sm opacity-90">#BoetBall #FPLCommunity #Mzansi</p>
    </div>
  </div>
);

// Slide 5: Call to Action
const CTASlide = () => (
  <div className="w-[540px] h-[540px] bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 text-white relative overflow-hidden">
    {/* Success Pattern Background */}
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-8 left-8">
        <Trophy className="w-16 h-16" />
      </div>
      <div className="absolute top-12 right-12">
        <Star className="w-12 h-12" />
      </div>
      <div className="absolute bottom-16 left-12">
        <TrendingUp className="w-14 h-14" />
      </div>
      <div className="absolute bottom-12 right-16">
        <Heart className="w-10 h-10" />
      </div>
      
      {/* Celebration elements */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
      <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
      <div className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
    </div>

    {/* Main Content */}
    <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
      <div className="mb-8">
        <img 
          src="/instagram-logo-analytics-v3.svg" 
          alt="Boet Ball" 
          className="w-16 h-16 mx-auto mb-4"
        />
        <h1 className="text-3xl font-black mb-3">GET STARTED TODAY!</h1>
        <div className="w-24 h-1 bg-yellow-400 mx-auto rounded-full mb-6"></div>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/30 mb-8">
        <h2 className="text-xl font-bold mb-4">🚀 Launch Special</h2>
        <div className="space-y-3 mb-4">
          <p className="text-sm">✅ Free advanced analytics access</p>
          <p className="text-sm">✅ Premium FUT card generation</p>
          <p className="text-sm">✅ Exclusive South African features</p>
          <p className="text-sm">✅ Community access & insights</p>
        </div>
        
        <div className="bg-yellow-400 text-gray-900 rounded-xl p-4 font-bold">
          <p className="text-lg">Visit: boetball.com</p>
          <p className="text-sm">Your FPL success starts here! 🏆</p>
        </div>
      </div>

      <div className="text-center">
        <p className="text-lg font-bold mb-2">Follow us for daily FPL content!</p>
        <div className="flex items-center justify-center gap-2 text-sm">
          <span className="bg-white/20 px-3 py-1 rounded-full">#BoetBall</span>
          <span className="bg-white/20 px-3 py-1 rounded-full">#FPL</span>
          <span className="bg-white/20 px-3 py-1 rounded-full">#SouthAfrica</span>
        </div>
      </div>
    </div>

    {/* Bottom accent */}
    <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400"></div>
  </div>
);

export default InstagramLaunchCarousel;
