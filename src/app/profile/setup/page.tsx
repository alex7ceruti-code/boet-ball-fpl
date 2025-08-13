'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  User,
  MapPin,
  Users,
  Volume2,
  Mail,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Heart,
  Trophy,
  Flame
} from 'lucide-react';
import { ProfileSetupData } from '@/types/auth';
import { useBootstrapData } from '@/hooks/useFplData';
import { getSlangPhrase } from '@/utils/slang';

const SOUTH_AFRICAN_LOCATIONS = [
  'Cape Town', 'Johannesburg', 'Durban', 'Pretoria', 'Port Elizabeth',
  'Bloemfontein', 'East London', 'Pietermaritzburg', 'Rustenburg', 'Polokwane',
  'Kimberley', 'Nelspruit', 'George', 'Upington', 'Other'
];

const SLANG_INTENSITY_OPTIONS = [
  { value: 'NONE', label: 'No slang', description: 'Keep it professional' },
  { value: 'LIGHT', label: 'Light touch', description: 'Just a sprinkle of SA flavor' },
  { value: 'MODERATE', label: 'Proper boet', description: 'Good mix of English and slang' },
  { value: 'HEAVY', label: 'Full tilt', description: 'Maximum SA vibes, hey!' }
];

export default function ProfileSetupPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { data: bootstrap, isLoading: bootstrapLoading } = useBootstrapData();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<ProfileSetupData>({
    fplTeamId: undefined,
    favoriteTeam: undefined,
    location: '',
    preferences: {
      slangIntensity: 'MODERATE',
      emailNotifications: true,
      weeklyReports: true,
      transferReminders: true,
    },
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('preferences.')) {
      const prefField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefField]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        // Basic info is optional
        return true;
      case 2:
        // Preferences are optional
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 2) {
        setCurrentStep(currentStep + 1);
      } else {
        handleComplete();
      }
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/profile/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      // Redirect to dashboard
      router.push('/dashboard?welcome=true');
    } catch (error) {
      console.error('Profile setup error:', error);
      setError(error instanceof Error ? error.message : 'Profile setup failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || bootstrapLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-springbok-50 via-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">Setting up your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-springbok-50 via-green-50 to-emerald-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 shadow-lg">
              <Flame className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to the Family, {session?.user?.name?.split(' ')[0]}! 🇿🇦
          </h1>
          <p className="text-gray-600">
            {getSlangPhrase('culture', 'general')} Let's get you set up for FPL success!
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep} of 2
            </span>
            <span className="text-sm font-medium text-gray-600">
              {Math.round((currentStep / 2) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 2) * 100}%` }}
            ></div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Basic Information</h2>
                  <p className="text-gray-600">Tell us a bit about yourself (all optional)</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* FPL Team ID */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your FPL Team ID <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="number"
                    value={formData.fplTeamId || ''}
                    onChange={(e) => handleInputChange('fplTeamId', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g. 123456"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Find this in the FPL app/website under "Points" → Look at the URL
                  </p>
                </div>

                {/* Favorite Team */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Favorite Premier League Team <span className="text-gray-400">(optional)</span>
                  </label>
                  <select
                    value={formData.favoriteTeam || ''}
                    onChange={(e) => handleInputChange('favoriteTeam', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select your team</option>
                    {bootstrap?.teams?.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location in South Africa <span className="text-gray-400">(optional)</span>
                  </label>
                  <select
                    value={formData.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select your location</option>
                    {SOUTH_AFRICAN_LOCATIONS.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Helps us customize content for your timezone and local flavor
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Preferences */}
          {currentStep === 2 && (
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Volume2 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Your Preferences</h2>
                  <p className="text-gray-600">Customize your Boet Ball experience</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Slang Intensity */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    South African Slang Level
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SLANG_INTENSITY_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleInputChange('preferences.slangIntensity', option.value)}
                        className={`p-4 border rounded-lg text-left transition-all ${
                          formData.preferences?.slangIntensity === option.value
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="font-semibold text-gray-800">{option.label}</div>
                        <div className="text-sm text-gray-600">{option.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Email Preferences */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Email Notifications
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.preferences?.emailNotifications || false}
                        onChange={(e) => handleInputChange('preferences.emailNotifications', e.target.checked)}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">General notifications and updates</span>
                      </div>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.preferences?.weeklyReports || false}
                        onChange={(e) => handleInputChange('preferences.weeklyReports', e.target.checked)}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">Weekly FPL performance reports</span>
                      </div>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.preferences?.transferReminders || false}
                        onChange={(e) => handleInputChange('preferences.transferReminders', e.target.checked)}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">Transfer deadline reminders</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex justify-between items-center">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              Previous
            </button>

            <button
              onClick={handleNext}
              disabled={isLoading}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : currentStep === 2 ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              {isLoading ? 'Saving...' : currentStep === 2 ? 'Complete Setup' : 'Next'}
            </button>
          </div>
        </div>

        {/* Skip Option */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Skip setup for now
          </button>
        </div>
      </div>
    </div>
  );
}
