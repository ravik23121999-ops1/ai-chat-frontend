'use client';

import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useState } from 'react';
import type { User } from '../types/user';

interface GoogleAuthProps {
  onLoginSuccess: (userData: User) => void;
}

export function GoogleAuth({ onLoginSuccess }: GoogleAuthProps) {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      setError('');
      setIsLoading(true);

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken: credentialResponse.credential }),
      });

      const data = await response.json();

      if (data.success) {
        onLoginSuccess(data.user);
      } else {
        setError(data.error || 'Could not sign you in. Please try again.');
      }
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginError = () => {
    setError('Google sign-in did not work. Please try again.');
    setIsLoading(false);
  };

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId || clientId === 'your_google_client_id_here') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4">
        <p className="text-red-800 font-medium text-sm sm:text-base">Sign-in is not set up yet</p>
        <p className="text-red-600 text-xs sm:text-sm mt-1">
          Ask the app owner to add Google sign-in settings before you can log in.
        </p>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="flex flex-col items-center gap-3 sm:gap-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4 w-full">
            <p className="text-red-800 text-xs sm:text-sm font-medium">{error}</p>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center gap-2 text-blue-600">
            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs sm:text-sm font-medium">Signing in...</span>
          </div>
        )}

        <div className="transform hover:scale-105 transition-transform duration-200 w-full flex justify-center">
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={handleLoginError}
            useOneTap={false}
            width="100%"
          />
        </div>

        <p className="text-xs text-gray-400 text-center">
          Secure sign-in powered by Google
        </p>
      </div>
    </GoogleOAuthProvider>
  );
}
