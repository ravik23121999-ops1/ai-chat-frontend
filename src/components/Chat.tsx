'use client';

import { useState, useEffect, useRef } from 'react';
import { socketService } from '../lib/socket';
import type { User } from '../types/user';

interface Message {
  id: string;
  message: string;
  userId: string;
  username: string;
  timestamp: string;
}

interface ChatProps {
  user: User;
  isPremium: boolean;
}

export function Chat({ user, isPremium }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState('');
  const [actionError, setActionError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastSavedMessagesRef = useRef('');

  useEffect(() => {
    setMessages([]);
    lastSavedMessagesRef.current = '';

    const savedMessages = localStorage.getItem(`chatHistory_${user.id}`);
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
        lastSavedMessagesRef.current = savedMessages;
      } catch {
        localStorage.removeItem(`chatHistory_${user.id}`);
      }
    }
  }, [user.id]);

  useEffect(() => {
    const messagesString = JSON.stringify(messages);
    if (messagesString !== lastSavedMessagesRef.current && messages.length > 0) {
      localStorage.setItem(`chatHistory_${user.id}`, messagesString);
      lastSavedMessagesRef.current = messagesString;
    }
  }, [messages, user.id]);

  useEffect(() => {
    let mounted = true;
    let hasJoinedRoom = false;
    const socket = socketService.connect();

    const joinRoom = () => {
      if (mounted && !hasJoinedRoom && socket.connected) {
        socket.emit('join-room', user.id);
        hasJoinedRoom = true;
      }
    };

    if (socket.connected) {
      joinRoom();
    } else {
      socket.once('connect', joinRoom);
    }

    const handleMessage = (message: Message) => {
      if (mounted) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on('receive-message', handleMessage);

    return () => {
      mounted = false;
      socket.off('receive-message', handleMessage);
      socket.off('connect');
    };
  }, [user.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (inputMessage.trim()) {
      const socket = socketService.getSocket();
      socket?.emit('send-message', {
        message: inputMessage,
        userId: user.id,
        username: user.name
      });
      setInputMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getSuggestReply = async () => {
    if (messages.length === 0) return;

    setLoadingSuggestion(true);
    setActionError('');
    try {
      const chatHistory = messages.map((m) => `${m.username}: ${m.message}`);
      const lastMessage = messages[messages.length - 1].message;

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat/suggest-reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: lastMessage,
          chatHistory
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSuggestion(data.suggestion);
      } else {
        setActionError(data.error || 'Could not suggest a reply. Please try again.');
      }
    } catch {
      setActionError('Could not suggest a reply. Please try again.');
    } finally {
      setLoadingSuggestion(false);
    }
  };

  const useSuggestion = () => {
    setInputMessage(suggestion);
    setSuggestion('');
  };

  const summarizeChat = async () => {
    if (messages.length === 0) return;

    setLoadingSummary(true);
    setActionError('');
    try {
      const chatHistory = messages.map((m) => `${m.username}: ${m.message}`);

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: chatHistory
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSummary(data.summary);
        setShowSummary(true);
      } else {
        setActionError(data.error || 'Could not summarize the chat. Please try again.');
      }
    } catch {
      setActionError('Could not summarize the chat. Please try again.');
    } finally {
      setLoadingSummary(false);
    }
  };

  const clearChatHistory = () => {
    setMessages([]);
    localStorage.removeItem(`chatHistory_${user.id}`);
    lastSavedMessagesRef.current = '';
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white shadow-lg p-3 sm:p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-xl sm:text-2xl">💬</span>
              <span className="truncate">Real-Time Chat</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 truncate">Signed in as {user.name}</p>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={clearChatHistory}
                className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                title="Clear chat history"
              >
                🗑️ Clear
              </button>
            )}
            {isPremium && (
              <span className="px-2 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-xs sm:text-sm font-medium shadow-md animate-pulse flex-shrink-0">
                <span className="hidden sm:inline">⭐ Premium</span>
                <span className="sm:hidden">⭐</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 px-4">
            <div className="text-4xl sm:text-6xl mb-4">👋</div>
            <p className="text-base sm:text-lg">No messages yet</p>
            <p className="text-sm text-center">Start the conversation!</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={msg.id}
            className={`flex ${msg.userId === user.id ? 'justify-end' : 'justify-start'} animate-fade-in`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div
              className={`max-w-[85%] sm:max-w-xs md:max-w-md lg:max-w-lg px-3 sm:px-4 py-2 sm:py-3 rounded-2xl shadow-md transform hover:scale-105 transition-transform duration-200 ${
                msg.userId === user.id
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-md'
                  : 'bg-white text-gray-800 rounded-bl-md'
              }`}
            >
              <p className="font-semibold text-xs sm:text-sm mb-1 opacity-90 truncate">{msg.username}</p>
              <p className="leading-relaxed text-sm sm:text-base break-words">{msg.message}</p>
              <p className={`text-xs mt-2 opacity-70 ${msg.userId === user.id ? 'text-blue-100' : 'text-gray-400'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {actionError && (
        <div className="mx-3 sm:mx-4 mb-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs sm:text-sm text-red-700">
          {actionError}
        </div>
      )}

      {suggestion && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-500 p-3 sm:p-4 mx-3 sm:mx-4 mb-3 sm:mb-4 rounded-lg shadow-md animate-slide-up">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="text-xl sm:text-2xl flex-shrink-0">💡</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-purple-800 mb-1">Suggested reply:</p>
              <p className="text-xs sm:text-sm text-purple-700 break-words">{suggestion}</p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={useSuggestion}
              className="flex-1 px-3 sm:px-4 py-2 bg-purple-500 text-white rounded-lg text-xs sm:text-sm hover:bg-purple-600 transition-colors duration-200 flex items-center justify-center gap-1"
            >
              <span>✓</span> <span className="hidden sm:inline">Use suggestion</span>
              <span className="sm:hidden">Use</span>
            </button>
            <button
              onClick={() => setSuggestion('')}
              className="flex-1 px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-xs sm:text-sm hover:bg-gray-300 transition-colors duration-200"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {showSummary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-4 sm:p-6 animate-scale-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                <span>📝</span> Chat summary
              </h3>
              <button
                onClick={() => setShowSummary(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close summary"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{summary}</p>
            <button
              onClick={() => setShowSummary(false)}
              className="mt-4 w-full py-2 sm:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm sm:text-base"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="bg-white p-3 sm:p-4 border-t border-gray-100 shadow-lg">
        <div className="flex gap-2 sm:gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
            />
            {inputMessage && (
              <button
                onClick={() => setInputMessage('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Clear message"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim()}
            className="px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 flex items-center gap-2 shadow-md"
          >
            <span className="hidden sm:inline">Send</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>

        {isPremium && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={getSuggestReply}
              disabled={loadingSuggestion || messages.length === 0}
              className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium shadow-md"
            >
              {loadingSuggestion ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="hidden sm:inline">Thinking...</span>
                </>
              ) : (
                <>
                  <span>💡</span>
                  <span className="hidden sm:inline">Suggest reply</span>
                  <span className="sm:hidden">Suggest</span>
                </>
              )}
            </button>
            <button
              onClick={summarizeChat}
              disabled={loadingSummary || messages.length === 0}
              className="flex-1 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium shadow-md"
            >
              {loadingSummary ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="hidden sm:inline">Summarizing...</span>
                </>
              ) : (
                <>
                  <span>📝</span>
                  <span className="hidden sm:inline">Summarize chat</span>
                  <span className="sm:hidden">Summarize</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
