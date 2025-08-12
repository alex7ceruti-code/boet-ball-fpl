import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <div className="container mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-8">
            <h1 
              className="text-7xl md:text-9xl font-black mb-6 tracking-tight"
              style={{
                background: 'linear-gradient(135deg, #D2691E 0%, #FFD700 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              BOET BALL
            </h1>
          </div>
          
          <div className="max-w-3xl mx-auto mb-8">
            <p className="text-2xl md:text-3xl text-gray-700 mb-4 font-medium">
              Premium Fantasy Premier League for Mzansi
            </p>
            <div className="flex items-center justify-center gap-2 text-xl font-semibold" style={{color: '#D2691E'}}>
              <span>Sharp, Lekker, Built Different</span>
              <span className="text-2xl">🔥</span>
            </div>
          </div>
          
          {/* Key Features Badge */}
          <div className="inline-flex items-center gap-3 bg-white rounded-full px-8 py-4 shadow-lg border border-gray-200 mb-12">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Live FPL Data</span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{backgroundColor: '#D2691E'}}></div>
              <span className="text-sm font-medium text-gray-700">SA Time Zone</span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Local Flavor</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="max-w-6xl mx-auto">
          
          {/* Phase 2 Complete - Main Card */}
          <div className="bg-white rounded-2xl p-8 md:p-12 mb-8 shadow-xl border border-gray-100">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 bg-green-50 px-6 py-3 rounded-full mb-4">
                <span className="text-2xl">✅</span>
                <span className="text-xl font-bold text-green-800">Phase 2: Navigation Complete!</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{color: '#D2691E'}}>
                    <span>🛠️</span> Tech Stack Ready
                  </h3>
                  <div className="space-y-3">
                    {[
                      'Next.js 15 (App Router)',
                      'TypeScript',
                      'Tailwind CSS with custom theme',
                      'SWR for data fetching',
                      'Chart.js for visualizations'
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 text-xs font-bold">✓</span>
                        </div>
                        <span className="text-gray-700 font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{color: '#D2691E'}}>
                    <span>🏢</span> Infrastructure Ready
                  </h3>
                  <div className="space-y-3">
                    {[
                      'FPL API proxy (CORS handled)',
                      'Custom hooks for data fetching',
                      'SA slang localization',
                      'Premium brand colors (braai theme)',
                      'TypeScript types for FPL data'
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 text-xs font-bold">✓</span>
                        </div>
                        <span className="text-gray-700 font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              href="/test-api"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              style={{backgroundColor: '#D2691E'}}
            >
              <span>🚀</span>
              Test FPL API Connection
            </Link>
            <Link 
              href="/about"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold text-gray-700 bg-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border border-gray-200"
            >
              <span>✨</span>
              Try Navigation
            </Link>
          </div>

          {/* Navigation Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100">
              <h3 className="text-xl font-bold text-green-800 mb-6 flex items-center gap-2">
                <span>🌐</span> Navigation Ready
              </h3>
              <div className="space-y-3">
                {[
                  'Responsive top navigation',
                  'Logo with premium branding', 
                  'Mobile hamburger menu',
                  'Active state highlighting'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-green-600">•</span>
                    <span className="text-green-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
              <h3 className="text-xl font-bold text-blue-800 mb-6 flex items-center gap-2">
                <span>📄</span> Pages Created
              </h3>
              <div className="space-y-3">
                {[
                  'Dashboard (preview)',
                  'Fixtures (preview)',
                  'Players (preview)',
                  'Stats, My Team, About'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-blue-600">•</span>
                    <span className="text-blue-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Next Phase Preview */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 mb-12">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Next Up: Phase 3 - Home Page</h3>
            </div>
            <div className="max-w-2xl mx-auto">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-orange-200">
                <p className="text-gray-700 mb-4 leading-relaxed">
                  <strong>Coming next:</strong> Current GW fixtures with team badges, FDR color coding, 
                  SAST kickoff times, and the legendary &ldquo;Boerie Burners of the Week&rdquo; featuring 
                  the top scoring players.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm font-medium" style={{color: '#D2691E'}}>
                  <span>Ready to bring the FPL data to life!</span>
                  <span>🇿🇦</span>
                  <span>⚽</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center py-8 border-t border-gray-200">
            <p className="text-gray-500 flex items-center justify-center gap-2">
              <span>Built with</span>
              <span className="text-red-500">❤️</span>
              <span>for the South African FPL community</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
