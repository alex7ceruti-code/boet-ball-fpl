'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Mail,
  MapPin,
  Heart,
  Calendar,
  Shield,
  Bell,
  Volume2,
  Crown,
  LogOut,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Edit,
  Trash2,
  Download,
  BarChart3
} from 'lucide-react';
import { useBootstrapData } from '@/hooks/useFplData';
import { getSlangPhrase, getTimeBasedGreeting } from '@/utils/slang';

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

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const { data: bootstrap } = useBootstrapData();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    fplTeamId: '',
    favoriteTeam: '',
    location: '',
    preferences: {
      slangIntensity: 'MODERATE' as 'NONE' | 'LIGHT' | 'MODERATE' | 'HEAVY',
      emailNotifications: true,
      weeklyReports: true,
      transferReminders: true,
      showAdvancedStats: false,
      darkMode: false,
      compactView: false,
    },
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Load user data
  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || '',
        email: session.user.email || '',
        fplTeamId: '', // We'll fetch this from API
        favoriteTeam: '',
        location: '',
        preferences: {
          slangIntensity: session.user.preferences?.slangIntensity || 'MODERATE',
          emailNotifications: session.user.preferences?.emailNotifications ?? true,
          weeklyReports: session.user.preferences?.weeklyReports ?? true,
          transferReminders: session.user.preferences?.transferReminders ?? true,
          showAdvancedStats: session.user.preferences?.showAdvancedStats ?? false,
          darkMode: session.user.preferences?.darkMode ?? false,
          compactView: session.user.preferences?.compactView ?? false,
        },
      });
    }
  }, [session]);

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

  const handleSave = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/profile/update', {
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

      // Update the session
      await update();
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
      setError(error instanceof Error ? error.message : 'Update failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const subscriptionBadge = session?.user?.subscriptionType === 'PREMIUM' ? (
    <div className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 rounded-full text-sm font-semibold">
      <Crown className="w-4 h-4" />
      Premium
    </div>
  ) : (
    <div className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
      <Shield className="w-4 h-4" />
      Free
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-yellow-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getTimeBasedGreeting()}, {session?.user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-gray-600">
            {getSlangPhrase('culture', 'general')} Manage your Boet Ball profile
          </p>
        </div>

        {/* Status Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className="text-green-700 text-sm">{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{session?.user?.name}</h2>
                  <p className="text-green-100">{session?.user?.email}</p>
                  <div className="mt-2">{subscriptionBadge}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-green-100 mb-1">Member since</div>
                <div className="text-lg font-semibold">
                  {new Date().toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' })}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'profile', label: 'Profile', icon: User },
                { id: 'preferences', label: 'Preferences', icon: Volume2 },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'account', label: 'Account', icon: Shield },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">Profile Information</h3>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">FPL Team ID</label>
                    <input
                      type="number"
                      value={formData.fplTeamId}
                      onChange={(e) => handleInputChange('fplTeamId', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="e.g. 123456"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Favorite Team</label>
                    <select
                      value={formData.favoriteTeam}
                      onChange={(e) => handleInputChange('favoriteTeam', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    >
                      <option value="">Select team</option>
                      {bootstrap?.teams?.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <select
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    >
                      <option value="">Select location</option>
                      {SOUTH_AFRICAN_LOCATIONS.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800">User Preferences</h3>

                <div className="space-y-6">
                  {/* Slang Intensity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      South African Slang Level
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {SLANG_INTENSITY_OPTIONS.map((option) => (
                        <div
                          key={option.value}
                          className={`border rounded-lg p-3 cursor-pointer transition-all ${
                            formData.preferences.slangIntensity === option.value
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          onClick={() => handleInputChange('preferences.slangIntensity', option.value)}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="slangIntensity"
                              value={option.value}
                              checked={formData.preferences.slangIntensity === option.value}
                              onChange={() => handleInputChange('preferences.slangIntensity', option.value)}
                              className="text-green-600 focus:ring-green-500"
                            />
                            <div>
                              <div className="font-medium text-gray-800">{option.label}</div>
                              <div className="text-sm text-gray-600">{option.description}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Display Options */}
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-medium text-gray-800 mb-4">Display Options</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-800">Show Advanced Stats</h5>
                          <p className="text-sm text-gray-600">Display detailed FPL statistics and metrics</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.preferences.showAdvancedStats}
                            onChange={(e) => handleInputChange('preferences.showAdvancedStats', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-800">Compact View</h5>
                          <p className="text-sm text-gray-600">Use a more condensed layout</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.preferences.compactView}
                            onChange={(e) => handleInputChange('preferences.compactView', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-800">Dark Mode</h5>
                          <p className="text-sm text-gray-600">Switch to dark theme (coming soon)</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.preferences.darkMode}
                            onChange={(e) => handleInputChange('preferences.darkMode', e.target.checked)}
                            className="sr-only peer"
                            disabled
                          />
                          <div className="w-11 h-6 bg-gray-200 rounded-full opacity-50 cursor-not-allowed"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-4 border-t">
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800">Notification Settings</h3>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-gray-800">Email Notifications</h5>
                        <p className="text-sm text-gray-600">Receive general updates and announcements</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.preferences.emailNotifications}
                          onChange={(e) => handleInputChange('preferences.emailNotifications', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-gray-800">Weekly FPL Reports</h5>
                        <p className="text-sm text-gray-600">Get weekly summaries and insights</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.preferences.weeklyReports}
                          onChange={(e) => handleInputChange('preferences.weeklyReports', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-gray-800">Transfer Reminders</h5>
                        <p className="text-sm text-gray-600">Notifications about upcoming deadline and transfer suggestions</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.preferences.transferReminders}
                          onChange={(e) => handleInputChange('preferences.transferReminders', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Email Frequency Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">📧 Email Frequency</h4>
                    <div className="text-blue-700 text-sm space-y-1">
                      <p>• <strong>General notifications</strong>: As needed (account updates, important news)</p>
                      <p>• <strong>Weekly reports</strong>: Every Sunday after gameweek completion</p>
                      <p>• <strong>Transfer reminders</strong>: 24 hours before deadline</p>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-4 border-t">
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Notification Settings
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800">Account Settings</h3>

                {/* Subscription Status */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {session?.user?.subscriptionType === 'PREMIUM' ? (
                        <Crown className="w-8 h-8 text-yellow-500" />
                      ) : (
                        <Shield className="w-8 h-8 text-gray-500" />
                      )}
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {session?.user?.subscriptionType === 'PREMIUM' ? 'Premium Plan' : 'Free Plan'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {session?.user?.subscriptionType === 'PREMIUM' 
                            ? 'You have access to all premium features'
                            : 'Upgrade to unlock premium features'
                          }
                        </p>
                      </div>
                    </div>
                    {session?.user?.subscriptionType === 'FREE' && (
                      <button className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg font-semibold hover:from-yellow-600 hover:to-yellow-700 transition-all">
                        Upgrade to Premium
                      </button>
                    )}
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="border border-red-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-red-800 mb-4">Danger Zone</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-gray-800">Sign Out</h5>
                        <p className="text-sm text-gray-600">Sign out of your account</p>
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                    
                    <div className="border-t border-red-200 pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-red-800">Delete Account</h5>
                          <p className="text-sm text-red-600">Permanently delete your account and all data</p>
                        </div>
                        <Link
                          href="/account/delete"
                          className="flex items-center gap-2 px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Account
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
