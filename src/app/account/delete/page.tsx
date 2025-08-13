'use client';

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertTriangle,
  Shield,
  Trash2,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { getSASlang } from '@/utils/slang';

export default function DeleteAccountPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [confirmation, setConfirmation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'warning' | 'confirm' | 'deleting' | 'success'>('warning');

  const handleDeleteAccount = async () => {
    if (confirmation !== 'DELETE_ACCOUNT') {
      setError('Please type "DELETE_ACCOUNT" exactly as shown to confirm.');
      return;
    }

    setIsLoading(true);
    setError('');
    setStep('deleting');

    try {
      const response = await fetch('/api/account/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirmation }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account');
      }

      setStep('success');
      
      // Sign out and redirect after a delay
      setTimeout(async () => {
        await signOut({ redirect: false });
        router.push('/?deleted=true');
      }, 3000);

    } catch (error) {
      console.error('Delete account error:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete account');
      setStep('confirm');
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-yellow-50 flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6">You must be signed in to access account deletion.</p>
          <Link 
            href="/auth/signin"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-gradient-to-r from-red-500 to-orange-500 shadow-lg">
              <AlertTriangle className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Delete Account</h1>
          <p className="text-gray-600">
            {getSASlang('culture', 'farewell')} We're sad to see you go, but we understand.
          </p>
        </div>

        {/* Warning Step */}
        {step === 'warning' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-red-500 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <AlertTriangle className="w-6 h-6" />
                Important: Account Deletion Warning
              </h2>
            </div>
            
            <div className="px-6 py-8 space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-bold text-red-800 mb-3">⚠️ This action cannot be undone!</h3>
                <p className="text-red-700 text-sm">
                  Deleting your account will permanently remove all your data from our servers.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-gray-800">What will be deleted:</h3>
                <div className="grid gap-3">
                  <div className="flex items-center gap-3 text-sm">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span>Your profile and account information</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span>All saved FPL teams and preferences</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span>Mini league tracking and history</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span>Any articles or content you've created</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span>All login sessions and connected accounts</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-blue-800 mb-2">💡 Alternative Options:</h3>
                <div className="space-y-2 text-blue-700 text-sm">
                  <p>• Update your preferences to reduce emails</p>
                  <p>• Contact support if you're having technical issues</p>
                  <p>• Take a break - your data will be safe when you return</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Link
                  href="/profile"
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Keep My Account
                </Link>
                <button
                  onClick={() => setStep('confirm')}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  I Still Want to Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Step */}
        {step === 'confirm' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-yellow-500 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <Shield className="w-6 h-6" />
                Final Confirmation Required
              </h2>
            </div>
            
            <div className="px-6 py-8 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}

              <div className="text-center space-y-4">
                <p className="text-gray-700">
                  To confirm account deletion for <strong>{session.user?.email}</strong>,
                  please type the following exactly:
                </p>
                
                <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <code className="text-lg font-mono font-bold text-red-600">DELETE_ACCOUNT</code>
                </div>
                
                <div>
                  <input
                    type="text"
                    value={confirmation}
                    onChange={(e) => setConfirmation(e.target.value)}
                    placeholder="Type DELETE_ACCOUNT here"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-center font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep('warning')}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Go Back
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isLoading || confirmation !== 'DELETE_ACCOUNT'}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  {isLoading ? 'Deleting Account...' : 'Delete My Account'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Deleting Step */}
        {step === 'deleting' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-6 py-12 text-center space-y-6">
              <div className="flex justify-center">
                <Loader2 className="w-16 h-16 text-red-500 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Deleting Account...</h2>
              <p className="text-gray-600">
                Please wait while we permanently remove your account and all associated data.
                This may take a few moments.
              </p>
            </div>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-6 py-12 text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-green-100">
                  <CheckCircle2 className="w-16 h-16 text-green-500" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Account Deleted Successfully</h2>
              <div className="space-y-4">
                <p className="text-gray-700">
                  Your account has been permanently deleted from our servers.
                  All your data has been removed as requested.
                </p>
                <p className="text-gray-600 text-sm">
                  You will be automatically signed out and redirected to the home page shortly.
                </p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 text-sm">
                  Thank you for using Boet Ball FPL. We hope to see you again in the future! 🇿🇦
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
