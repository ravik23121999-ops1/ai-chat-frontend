# AI Chat Frontend

A real-time AI-powered chat application built with Next.js, featuring Google OAuth authentication, Socket.IO messaging, and AI-powered features.

## Features

- Google OAuth authentication
- Real-time messaging with Socket.IO
- AI-powered reply suggestions
- Chat summarization
- Razorpay payment integration for premium features
- Responsive design for mobile, tablet, and desktop
- Session and chat history persistence

## Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn
- Backend API running on your server

## Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.onrender.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### Required Environment Variables

- `NEXT_PUBLIC_BACKEND_URL`: The URL of your backend API
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Your Google OAuth Client ID from Google Cloud Console

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your actual values
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import your project in Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_BACKEND_URL`: Your backend URL
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Your Google Client ID
4. Deploy

### Environment Variables Setup

For local development, create a `.env.local` file with your environment variables. For production, set these variables in your deployment platform's environment settings.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Socket.IO Documentation](https://socket.io/docs/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
