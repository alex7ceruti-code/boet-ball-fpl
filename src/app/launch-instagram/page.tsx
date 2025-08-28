'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import InstagramLaunchCarousel from '@/components/InstagramLaunchCarousel';
import { 
  Camera, 
  Instagram, 
  Users, 
  Trophy,
  Sparkles,
  Rocket,
  Heart,
  Share
} from 'lucide-react';

export default function LaunchInstagramPage() {
  const { data: session } = useSession();
  const [showCarousel, setShowCarousel] = useState(false);
  
  // Check if user is admin (SUPER_ADMIN or ADMIN)
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN';

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Camera className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-red-800 mb-4">Admin Access Required</h2>
          <p className="text-red-600 mb-6">
            The Instagram launch carousel generator is available to admin users only.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Instagram className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900">
                Instagram Launch
              </h1>
              <p className="text-xl text-gray-600">Create your Boet Ball announcement carousel</p>
            </div>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Ready to launch Boet Ball to the world? 🚀 Create a stunning Instagram carousel that showcases 
              all the amazing features, South African personality, and FPL expertise that makes Boet Ball special.
            </p>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Sparkles className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="font-semibold text-gray-700">Welcome Slide</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Trophy className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="font-semibold text-gray-700">Key Features</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Camera className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="font-semibold text-gray-700">Analytics Demo</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                  <p className="font-semibold text-gray-700">Community</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Rocket className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="font-semibold text-gray-700">Call to Action</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
              <Instagram className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Perfect for Instagram</h3>
            <p className="text-gray-600 leading-relaxed">
              Optimized 1080x1080 square format, perfect for Instagram carousel posts. 
              Each slide tells part of the Boet Ball story with stunning South African-inspired visuals.
            </p>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">South African Style</h3>
            <p className="text-gray-600 leading-relaxed">
              Authentic South African colors, emojis, and cultural references. 
              Features flag-inspired backgrounds and local FPL community elements.
            </p>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center mb-4">
              <Share className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Ready to Share</h3>
            <p className="text-gray-600 leading-relaxed">
              High-resolution PNG exports ready for immediate posting. 
              Includes relevant hashtags and clear calls-to-action for maximum engagement.
            </p>
          </div>
        </div>

        {/* Launch Button */}
        <div className="text-center">
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-white/30 shadow-xl max-w-md mx-auto">
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Rocket className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Let's Launch! 🚀</h2>
              <p className="text-gray-600">
                Create your Instagram carousel and introduce Boet Ball to the South African FPL community
              </p>
            </div>
            
            <button
              onClick={() => setShowCarousel(true)}
              className="w-full bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white py-4 px-8 rounded-2xl font-bold text-lg hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-3"
            >
              <Camera className="w-6 h-6" />
              Create Launch Carousel
              <Heart className="w-5 h-5 text-red-300" />
            </button>
            
            <p className="text-sm text-gray-500 mt-3">
              Generates 5 high-quality slides ready for Instagram
            </p>
          </div>
        </div>

        {/* Pro Tips */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 border border-blue-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            Pro Instagram Tips
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-600 mb-2">📱 Posting Strategy:</h4>
              <ul className="space-y-2 list-disc list-inside">
                <li>Upload all 5 slides as a carousel post</li>
                <li>Use the first slide as your main hook</li>
                <li>Post during peak South African hours (7-9 PM)</li>
                <li>Pin this post to highlight your launch</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-green-600 mb-2">🏷️ Hashtag Suggestions:</h4>
              <ul className="space-y-2 list-disc list-inside">
                <li>#BoetBall #FPL #SouthAfrica #Mzansi</li>
                <li>#FantasyPremierLeague #FPLCommunity</li>
                <li>#FPLAnalytics #FPLTips #PremierLeague</li>
                <li>#SouthAfricanFPL #FPLManager</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Instagram Launch Carousel Modal */}
      {showCarousel && (
        <InstagramLaunchCarousel onClose={() => setShowCarousel(false)} />
      )}
    </div>
  );
}
