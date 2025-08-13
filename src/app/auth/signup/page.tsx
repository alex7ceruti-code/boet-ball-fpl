'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  Shield,
  Flame,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Crown,
  Heart
} from 'lucide-react';
import { SignUpFormData } from '@/types/auth';
import { getSlangPhrase } from '@/utils/slang';

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<SignUpFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    marketingOptIn: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    try {
      // Register user
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          marketingOptIn: formData.marketingOptIn,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Auto-sign in after successful registration
      const signInResult = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.ok && !signInResult?.error) {
        // Successfully signed in, redirect to profile setup
        router.push('/profile/setup');
      } else {
        // Auto sign-in failed, show success message and redirect to signin
        console.log('Auto sign-in failed:', signInResult?.error);
        router.push('/auth/signin?message=Registration successful! Please sign in with your new account.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-springbok-50 via-green-50 to-emerald-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-springbok-500 to-springbok-600 shadow-lg">
              <Flame className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Join the Boet Ball Family!
          </h2>
          <p className="text-gray-600">
            {getSlangPhrase('culture', 'general')} Let's get you set up for FPL domination! 🇿🇦
          </p>
        </div>

        {/* Benefits Preview */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 mb-8">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            What You Get For Free:
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Live FPL dashboard with SA flair</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Fixtures planner with difficulty ratings</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Team analysis and transfer suggestions</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Mini league rivalry tracking</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 text-sm">
              <Crown className="w-4 h-4 text-yellow-600" />
              <span className="font-semibold text-yellow-800">Premium features coming soon!</span>
            </div>
          </div>
        </div>

        {/* Sign Up Form */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-8 py-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-springbok-500 focus:border-springbok-500 transition-all bg-white text-gray-900 placeholder-gray-500 shadow-sm"
                    placeholder="Enter your full name"
                  />
                  <User className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-springbok-500 focus:border-springbok-500 transition-all bg-white text-gray-900 placeholder-gray-500 shadow-sm"
                    placeholder="your.email@example.com"
                  />
                  <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-springbok-500 focus:border-springbok-500 transition-all bg-white text-gray-900 placeholder-gray-500 shadow-sm"
                    placeholder="Create a strong password"
                  />
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-springbok-500 focus:border-springbok-500 transition-all bg-white text-gray-900 placeholder-gray-500 shadow-sm"
                    placeholder="Confirm your password"
                  />
                  <Shield className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Marketing Opt-in */}
              <div className="flex items-center gap-3">
                <input
                  id="marketingOptIn"
                  name="marketingOptIn"
                  type="checkbox"
                  checked={formData.marketingOptIn}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="marketingOptIn" className="text-sm text-gray-600 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-400" />
                  Send me FPL tips, updates, and SA banter
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-springbok-600 to-springbok-700 text-white py-3 rounded-lg font-semibold hover:from-springbok-700 hover:to-springbok-800 focus:ring-4 focus:ring-springbok-200 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <UserPlus className="w-5 h-5" />
                )}
                {isLoading ? 'Creating Account...' : 'Join Boet Ball'}
              </button>
            </form>
          </div>

          {/* Sign In Link */}
          <div className="bg-springbok-50 px-8 py-4 border-t border-springbok-100">
            <p className="text-center text-sm text-gray-700">
              Already have an account?{' '}
              <Link 
                href="/auth/signin" 
                className="text-springbok-700 hover:text-springbok-800 font-semibold transition-colors hover:underline"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="text-springbok-600 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-springbok-600 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
