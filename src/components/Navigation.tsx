'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { 
  Home, 
  BarChart3, 
  Calendar, 
  Users, 
  Trophy, 
  Shield, 
  Menu,
  X,
  Flame,
  User,
  LogIn,
  LogOut,
  Crown,
  Newspaper,
  TrendingUp
} from 'lucide-react';
import { getTimeBasedGreeting } from '@/utils/slang';

const navigationItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/fixtures', label: 'Fixtures', icon: Calendar },
  { href: '/players', label: 'Players', icon: Users },
  { href: '/mini-league', label: 'Mini League', icon: Trophy },
  { href: '/my-team', label: 'My Team', icon: Shield },
  { href: '/news', label: 'News', icon: Newspaper },
  { href: '/about', label: 'About', icon: Flame },
];

export default function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group" onClick={closeMobileMenu}>
            <div className="relative">
              <Flame 
                className="h-8 w-8 transition-colors duration-200" 
                style={{color: '#007A3D'}}
              />
            </div>
            <div className="flex flex-col">
              <span 
                className="text-xl font-black leading-tight"
                style={{
                  background: 'linear-gradient(135deg, #007A3D 0%, #FFD700 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                BOET BALL
              </span>
              <span className="text-xs text-gray-500 -mt-1 leading-tight">
                Premium FPL
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.href);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 group hover:bg-gray-50 ${
                    isActive ? 'bg-springbok-50' : ''
                  }`}
                  style={{
                    color: isActive ? '#007A3D' : '#6B7280'
                  }}
                >
                  <Icon 
                    className="h-4 w-4" 
                    style={{color: isActive ? '#007A3D' : '#6B7280'}}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}


            {/* Authentication Actions */}
            <div className="ml-2 flex items-center space-x-2">
              {status === 'loading' ? (
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              ) : session ? (
                <div className="flex items-center space-x-2">
                  {session.user.subscriptionType === 'PREMIUM' && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 rounded-full text-xs font-semibold">
                      <Crown className="w-3 h-3" />
                      Premium
                    </div>
                  )}
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/signin"
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-braai-primary hover:bg-gray-50 dark:text-gray-300 dark:hover:text-braai-gold dark:hover:bg-gray-800 transition-colors duration-200"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white shadow-lg rounded-b-lg mt-1">
            <div className="px-2 pb-3 space-y-1">
              {/* Greeting */}
              <div className="px-3 py-3 text-sm font-medium text-gray-700 border-b border-gray-100 mb-2">
                {getTimeBasedGreeting()}
              </div>
              
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveRoute(item.href);
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 flex items-center space-x-3 ${
                      isActive
                        ? 'bg-springbok-50 text-springbok-700 border border-springbok-200'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-springbok-600'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-springbok-600' : 'text-gray-500'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
    </nav>
  );
}
