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

## Related Repositories

- Frontend (this repo): https://github.com/ravik23121999-ops1/ai-chat-frontend
- Backend: https://github.com/ravik23121999-ops1/ai-chat-backend

---

## How to Access the Project (Step by Step)

Follow these steps in order to run and use the app locally.

### Step 1: Install Prerequisites

1. Install **Node.js v18 or higher** from [https://nodejs.org/](https://nodejs.org/)
2. Confirm installation:

```bash
node -v
npm -v
```

3. You will also need accounts for:
   - [Google Cloud Console](https://console.cloud.google.com/) (OAuth)
   - [Google AI Studio](https://aistudio.google.com/) (Gemini API)
   - [Razorpay Dashboard](https://dashboard.razorpay.com/) (payments)

### Step 2: Clone Both Repositories

```bash
git clone https://github.com/ravik23121999-ops1/ai-chat-backend.git
git clone https://github.com/ravik23121999-ops1/ai-chat-frontend.git
```

### Step 3: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Open **APIs & Services → OAuth consent screen** and configure it
4. Open **APIs & Services → Credentials**
5. Click **Create Credentials → OAuth client ID**
6. Application type: **Web application**
7. Under **Authorized JavaScript origins**, add:
   - `http://localhost:3000`
8. Under **Authorized redirect URIs**, add:
   - `http://localhost:3000`
9. Click **Create**
10. Copy the **Client ID** and **Client Secret**

### Step 4: Get Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click **Get API key** / **Create API key**
4. Copy the API key

### Step 5: Get Razorpay API Keys

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up or log in
3. Open **Settings → API Keys**
4. Generate a key pair (use **Test Mode** for local development)
5. Copy the **Key ID** and **Key Secret**

### Step 6: Set Up the Backend

1. Open a terminal and go to the backend folder:

```bash
cd ai-chat-backend
```

2. Install dependencies:

```bash
npm install
```

3. Create the env file from the example:

```bash
cp .env.example .env
```

On Windows (PowerShell):

```powershell
Copy-Item .env.example .env
```

4. Open `.env` and fill in your values:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
```

5. Start the backend:

```bash
npm run dev
```

6. Backend is ready at:

**http://localhost:5000**

Optional health check: **http://localhost:5000/health**

Keep this terminal open.

### Step 7: Set Up the Frontend

1. Open a **new** terminal and go to the frontend folder:

```bash
cd ai-chat-frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create the env file from the example:

```bash
cp .env.example .env.local
```

On Windows (PowerShell):

```powershell
Copy-Item .env.example .env.local
```

4. Open `.env.local` and fill in your values:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

Use the **same** Google Client ID from Step 3.

5. Start the frontend:

```bash
npm run dev
```

6. Frontend is ready at:

**http://localhost:3000**

### Step 8: Open and Use the App

1. Open your browser and go to:

**http://localhost:3000**

2. Click **Sign in with Google** and choose your Google account
3. After login, you enter the chat room
4. Open the same app in another browser/incognito window and sign in with a second account to chat in real time
5. Send messages and see them appear instantly via Socket.IO

### Step 9: Use Premium AI Features (Optional)

1. In the app, open the payment / upgrade option
2. Complete payment with Razorpay **test** cards (in test mode)
3. After successful payment, premium unlocks in real time
4. Use AI features:
   - **Suggest reply** – AI reply suggestion
   - **Summarize chat** – AI chat summary

---

## Quick Start (After Credentials Are Ready)

**Terminal 1 – Backend**

```bash
cd ai-chat-backend
npm install
cp .env.example .env
# edit .env with your keys
npm run dev
```

**Terminal 2 – Frontend**

```bash
cd ai-chat-frontend
npm install
cp .env.example .env.local
# edit .env.local with your keys
npm run dev
```

Then open **http://localhost:3000**

---

## Access URLs Summary

| Service   | Local URL                    | Purpose              |
|-----------|------------------------------|----------------------|
| Frontend  | http://localhost:3000        | Open the chat app    |
| Backend   | http://localhost:5000        | API + WebSocket      |
| Health    | http://localhost:5000/health | Backend health check |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_BACKEND_URL` | Backend API URL |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth Client ID |

## Deployment (Vercel)

1. Push this repo to GitHub
2. Import the project in [Vercel](https://vercel.com/)
3. Add environment variables:
   - `NEXT_PUBLIC_BACKEND_URL` = your deployed backend URL
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` = your Google Client ID
4. Deploy
5. Access the live app at your Vercel URL

Also add your Vercel URL to Google OAuth **Authorized JavaScript origins**.

## Troubleshooting

### Cannot open http://localhost:3000

- Make sure the frontend is running (`npm run dev`)
- Check that port 3000 is free

### Cannot connect to backend / chat not working

- Make sure the backend is running on `http://localhost:5000`
- Check `NEXT_PUBLIC_BACKEND_URL` in `.env.local`
- Open `http://localhost:5000/health` to verify the API

### Google OAuth Errors

- Verify Client ID matches in frontend `.env.local` and backend `.env`
- Add `http://localhost:3000` under Authorized JavaScript origins
- Clear browser cache / try incognito

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Socket.IO Documentation](https://socket.io/docs/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
