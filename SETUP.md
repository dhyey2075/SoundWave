# Supabase Google OAuth Setup Guide

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings:
1. Go to https://app.supabase.com
2. Select your project
3. Go to Settings → API
4. Copy the "Project URL" and "anon public" key

## Supabase Configuration

1. **Enable Google OAuth in Supabase:**
   - Go to Authentication → Providers in your Supabase dashboard
   - Enable Google provider
   - Add your Google OAuth credentials:
     - Client ID (from Google Cloud Console)
     - Client Secret (from Google Cloud Console)

2. **Configure Redirect URL:**
   - In Supabase, go to Authentication → URL Configuration
   - Add your redirect URL: `http://localhost:3000/auth/callback` (for development)
   - For production, add: `https://yourdomain.com/auth/callback`

## Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure the consent screen if prompted
6. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Authorized redirect URIs: 
     - `https://[your-project-ref].supabase.co/auth/v1/callback`
     - (You can find your project ref in Supabase project settings)
7. Copy the Client ID and Client Secret to Supabase

## Routes

- `/signin` - Sign in page with Google OAuth button
- `/dashboard` - Protected dashboard page (requires authentication)
- `/auth/callback` - OAuth callback handler (automatically redirects to dashboard)
- `/` - Home page (redirects to signin or dashboard based on auth status)

## Database Setup

1. **Create Playlist Tables:**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `supabase-schema.sql`
   - Click "Run" to execute the SQL script
   - This will create:
     - `playlists` table for storing user playlists
     - `playlist_songs` table for storing songs in playlists
     - Row Level Security (RLS) policies for data protection
     - Indexes for better query performance

## Features

- ✅ Google OAuth sign-in
- ✅ Protected dashboard route
- ✅ Automatic redirects based on auth status
- ✅ Sign out functionality
- ✅ User session management
- ✅ Playlist creation and management
- ✅ Add songs to playlists
- ✅ Play songs from playlists
- ✅ Queue management with drag-and-drop

