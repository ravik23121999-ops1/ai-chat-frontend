'use client';

import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useState } from 'react';

interface GoogleAuthProps {
  onLoginSuccess: (userData: any) => void;
}

export const GoogleAuth: React.FC<GoogleAuthProps> = ({ onLoginSuccess }) => {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSuccess = async (credentialResponse: any) => {
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
        setUser(data.user);
        onLoginSuccess(data.user);
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (error) {
      setError('Network error during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginError = () => {
    setError('Google login failed. Please check your Google Cloud Console configuration.');
    setIsLoading(false);
  };

  const handleLogout = () => {
    setUser(null);
    setError('');
  };

  if (user) {
    return (
      <div className="flex items-center justify-between gap-2 sm:gap-3 p-3 sm:p-4 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <img
            src={user.picture}
            alt={user.name}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-blue-100 flex-shrink-0"
          />
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">{user.name}</p>
            <p className="text-xs sm:text-sm text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200 flex-shrink-0"
        >
          Logout
        </button>
      </div>
    );
  }

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId || clientId === 'your_google_client_id_here' || clientId === '') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4 animate-pulse">
        <p className="text-red-800 font-medium text-sm sm:text-base">⚠️ Configuration Error</p>
        <p className="text-red-600 text-xs sm:text-sm mt-1">
          Google Client ID not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env.local
        </p>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="flex flex-col items-center gap-3 sm:gap-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4 w-full animate-shake">
            <p className="text-red-800 text-xs sm:text-sm font-medium">❌ {error}</p>
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
};
