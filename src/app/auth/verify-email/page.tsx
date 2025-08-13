'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Mail, Loader2, RefreshCw, Home } from 'lucide-react';
import { getSASlang } from '@/utils/slang';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('error');
      setMessage('No verification token provided');
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${verificationToken}`);
      const data = await response.json();

      if (response.ok && data.verified) {
        setStatus('success');
        setMessage(data.message);
        
        // Redirect to sign in after a delay
        setTimeout(() => {
          router.push('/auth/signin?message=Email verified! Please sign in to continue.');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage('Failed to verify email. Please try again.');
    }
  };

  const resendVerification = async () => {
    setIsResending(true);
    
    try {
      // This would need user email - in a real app, you'd get this from the token or ask the user
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // For demo, we'll just show the UI - in real app, get email from somewhere
          email: 'user@example.com'
        }),
      });

      if (response.ok) {
        setMessage('New verification email sent! Check your inbox.');
      } else {
        setMessage('Failed to resend email. Please try again later.');
      }
    } catch (error) {
      console.error('Resend error:', error);
      setMessage('Failed to resend email. Please try again later.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-yellow-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            {status === 'loading' && (
              <div className="p-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="p-4 rounded-full bg-gradient-to-r from-green-500 to-green-600 shadow-lg">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
            )}
            {(status === 'error' || status === 'expired') && (
              <div className="p-4 rounded-full bg-gradient-to-r from-red-500 to-red-600 shadow-lg">
                <XCircle className="w-10 h-10 text-white" />
              </div>
            )}
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {status === 'loading' && 'Verifying Your Email...'}
            {status === 'success' && `${getSASlang('success', 'celebration')} Email Verified!`}
            {(status === 'error' || status === 'expired') && 'Verification Failed'}
          </h1>
          
          <p className="text-gray-600">
            {status === 'loading' && 'Please wait while we confirm your email address'}
            {status === 'success' && 'Welcome to the Boet Ball family! 🇿🇦'}
            {(status === 'error' || status === 'expired') && 'There was a problem verifying your email'}
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-8 py-6">
            
            {/* Loading State */}
            {status === 'loading' && (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="animate-pulse flex space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  {getSASlang('loading', 'general')}
                </p>
              </div>
            )}

            {/* Success State */}
            {status === 'success' && (
              <div className="text-center space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-semibold mb-2">🎉 Welcome aboard!</p>
                  <p className="text-green-700 text-sm">
                    Your email has been verified successfully. You can now access all Boet Ball features 
                    and start dominating your FPL season!
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Email confirmed and account activated</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Access to all FPL insights and tools</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Weekly FPL tips and SA banter (if opted in)</span>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    🚀 You'll be redirected to sign in shortly, or click the button below to continue.
                  </p>
                </div>
              </div>
            )}

            {/* Error State */}
            {(status === 'error' || status === 'expired') && (
              <div className="text-center space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 font-semibold mb-2">❌ Verification Failed</p>
                  <p className="text-red-700 text-sm">
                    {message || 'The verification link may have expired or is invalid.'}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <p className="text-gray-600 text-sm">
                    Don't worry! Here are a few things you can try:
                  </p>
                  
                  <div className="text-left space-y-2">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-blue-500" />
                      <span>Check your spam/junk folder for the verification email</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <RefreshCw className="w-4 h-4 text-green-500" />
                      <span>Request a new verification email</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Home className="w-4 h-4 text-purple-500" />
                      <span>Try signing up again if the issue persists</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="bg-gradient-to-r from-green-50 to-yellow-50 px-8 py-4 border-t border-green-100 space-y-3">
            
            {/* Success Actions */}
            {status === 'success' && (
              <div className="flex flex-col sm:flex-row gap-3">
                <Link 
                  href="/auth/signin"
                  className="flex-1 bg-gradient-to-r from-green-600 to-yellow-500 hover:from-green-700 hover:to-yellow-600 text-white py-3 px-4 rounded-lg font-semibold focus:ring-4 focus:ring-green-200 transition-all duration-200 text-center"
                >
                  Sign In Now
                </Link>
                <Link 
                  href="/"
                  className="flex-1 bg-white hover:bg-gray-50 text-gray-700 py-3 px-4 rounded-lg font-semibold border border-gray-300 focus:ring-4 focus:ring-gray-200 transition-all duration-200 text-center"
                >
                  Back to Home
                </Link>
              </div>
            )}

            {/* Error Actions */}
            {(status === 'error' || status === 'expired') && (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={resendVerification}
                  disabled={isResending}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-semibold focus:ring-4 focus:ring-blue-200 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  {isResending ? 'Sending...' : 'Resend Email'}
                </button>
                <Link 
                  href="/auth/signup"
                  className="flex-1 bg-white hover:bg-gray-50 text-gray-700 py-3 px-4 rounded-lg font-semibold border border-gray-300 focus:ring-4 focus:ring-gray-200 transition-all duration-200 text-center"
                >
                  Sign Up Again
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Need help? Contact us at{' '}
            <a href="mailto:support@boetball.co.za" className="text-green-600 hover:underline">
              support@boetball.co.za
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-600" />
          <p className="mt-2 text-gray-600">Loading verification...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
