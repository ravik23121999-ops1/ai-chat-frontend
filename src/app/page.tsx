'use client';

import { useState, useCallback, useEffect } from 'react';
import { GoogleAuth } from '../components/GoogleAuth';
import { Chat } from '../components/Chat';
import { Payment } from '../components/Payment';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('chatUser');
    const savedPremium = localStorage.getItem('isPremium');
    
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setShowWelcome(false);
        if (savedPremium === 'true') {
          setIsPremium(true);
        }
      } catch (error) {
        console.error('Failed to parse saved user data:', error);
        localStorage.removeItem('chatUser');
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('chatUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('chatUser');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('isPremium', String(isPremium));
  }, [isPremium]);

  const handleLoginSuccess = useCallback((userData: any) => {
    setUser(userData);
    setShowWelcome(false);
  }, []);

  const handlePaymentSuccess = useCallback(() => {
    setIsPremium(true);
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    setIsPremium(false);
    setShowWelcome(true);
    setShowSidebar(false);
    localStorage.removeItem('chatUser');
    localStorage.removeItem('isPremium');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      ) : !user ? (
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl max-w-md w-full transform hover:scale-[1.02] transition-transform duration-300">
            <div className="text-center mb-6 sm:mb-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                <span className="text-2xl sm:text-3xl">🤖</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                AI Real-Time Chat
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Sign in to start chatting with AI-powered features
              </p>
            </div>
            
            <div className="space-y-4">
              <GoogleAuth onLoginSuccess={handleLoginSuccess} />
              
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 flex-wrap">
                  <span>✨ Fast Responses</span>
                  <span>•</span>
                  <span>🔒 Secure</span>
                  <span>•</span>
                  <span>🎯 Smart AI</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-screen overflow-hidden">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {showSidebar ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {showSidebar && (
            <div
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowSidebar(false)}
            />
          )}

          <div className={`fixed lg:static inset-y-0 left-0 z-40 w-80 bg-white shadow-xl p-4 sm:p-6 overflow-y-auto border-r border-gray-100 transform transition-transform duration-300 ease-in-out ${
            showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}>
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                Welcome, {user.name?.split(' ')[0]}!
              </h2>
              <p className="text-sm text-gray-500">Start chatting with AI</p>
            </div>
            
            <Payment user={user} onPaymentSuccess={handlePaymentSuccess} />
            
            <button
              onClick={handleLogout}
              className="mt-6 w-full py-3 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors duration-200"
            >
              Sign Out
            </button>
          </div>
          
          <div className="flex-1 min-w-0">
            <Chat user={user} isPremium={isPremium} />
          </div>
        </div>
      )}
    </div>
  );
}
