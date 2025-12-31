# Latzu Frontend - Setup Guide

## Required Environment Variables

Create a `.env.local` file in the `frontend` directory with the following variables:

```bash
# ============================================
# NEXTAUTH CONFIGURATION
# ============================================

# The URL where your app is running (for development)
NEXTAUTH_URL=http://localhost:3000

# Secret for encrypting JWT tokens - generate with:
# openssl rand -base64 32
NEXTAUTH_SECRET=your-super-secret-key-generate-this-with-openssl

# ============================================
# GOOGLE OAUTH CREDENTIALS
# ============================================
# Get these from Google Cloud Console:
# 1. Go to https://console.cloud.google.com/
# 2. Create a new project or select existing
# 3. Go to "APIs & Services" > "Credentials"
# 4. Click "Create Credentials" > "OAuth client ID"
# 5. Select "Web application"
# 6. Add authorized redirect URIs:
#    - http://localhost:3000/api/auth/callback/google (development)
#    - https://yourdomain.com/api/auth/callback/google (production)

GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# ============================================
# BACKEND API URLS
# ============================================
# These connect the frontend to your FastAPI backends

# Main API (apps/api) - Port 8000
NEXT_PUBLIC_API_URL=http://localhost:8000

# AI API (apps/ai) - Port 8001
NEXT_PUBLIC_AI_URL=http://localhost:8001

# WebSocket URL (same as API for now)
NEXT_PUBLIC_WS_URL=http://localhost:8000
```

## Getting Google OAuth Credentials (Step by Step)

### 1. Go to Google Cloud Console
- Visit [https://console.cloud.google.com/](https://console.cloud.google.com/)
- Sign in with your Google account

### 2. Create or Select a Project
- Click the project dropdown at the top
- Click "New Project" or select an existing one
- Give it a name like "Latzu Platform"

### 3. Enable Google+ API (Optional but recommended)
- Go to "APIs & Services" > "Library"
- Search for "Google+ API" and enable it

### 4. Configure OAuth Consent Screen
- Go to "APIs & Services" > "OAuth consent screen"
- Select "External" (for testing) or "Internal" (for organization)
- Fill in:
  - App name: "Latzu"
  - User support email: your email
  - Developer contact: your email
- Add scopes: `email`, `profile`, `openid`
- Add test users if using External

### 5. Create OAuth Credentials
- Go to "APIs & Services" > "Credentials"
- Click "Create Credentials" > "OAuth client ID"
- Application type: "Web application"
- Name: "Latzu Web Client"
- **Authorized JavaScript origins:**
  ```
  http://localhost:3000
  https://yourdomain.com  (for production)
  ```
- **Authorized redirect URIs:**
  ```
  http://localhost:3000/api/auth/callback/google
  https://yourdomain.com/api/auth/callback/google  (for production)
  ```
- Click "Create"
- Copy the **Client ID** and **Client Secret**

### 6. Add Credentials to .env.local
```bash
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx
```

## Running the Application

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start the Backend (in separate terminals)
```bash
# Terminal 1: Main API
cd /path/to/latzu_platform
python -m uvicorn apps.api.main:app --reload --port 8000

# Terminal 2: AI API
cd /path/to/latzu_platform
python -m uvicorn apps.ai.main:app --reload --port 8001
```

### 3. Start the Frontend
```bash
cd frontend
npm run dev
```

### 4. Access the Application
- Open [http://localhost:3000](http://localhost:3000)
- Click "Probar sin registrarse" to try without login
- Or click "Continuar con Google" to sign in

## Troubleshooting

### "redirect_uri_mismatch" Error
- Make sure the redirect URI in Google Cloud Console matches exactly:
  `http://localhost:3000/api/auth/callback/google`

### "NEXTAUTH_SECRET" Error
- Generate a proper secret: `openssl rand -base64 32`
- Add it to `.env.local`

### Backend Connection Errors
- Make sure both APIs are running on ports 8000 and 8001
- Check that `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_AI_URL` are correct

### Guest Mode Not Working
- Clear browser localStorage
- Refresh the page
- Try clicking "Probar sin registrarse" again

## Production Deployment

For production, update:

1. `NEXTAUTH_URL` to your production domain
2. Add production redirect URIs to Google Cloud Console
3. Use secure, randomly generated `NEXTAUTH_SECRET`
4. Update `NEXT_PUBLIC_*` URLs to production API endpoints



