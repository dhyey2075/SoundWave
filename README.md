# 🎵 SoundWave - Modern Music Streaming Platform

A beautiful, modern music streaming web application built with Next.js, featuring playlist management, Spotify integration, and a sleek glassmorphism UI design.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat-square&logo=supabase)
![Spotify API](https://img.shields.io/badge/Spotify-API-1DB954?style=flat-square&logo=spotify)

## ✨ Features

- 🎶 **Music Search & Playback** - Search and play songs with a beautiful music player
- 📋 **Playlist Management** - Create, manage, and organize your playlists
- 🎧 **Queue System** - Drag-and-drop queue management with reordering
- 🎨 **Modern UI** - Glassmorphism design with smooth animations
- 🔐 **Authentication** - Secure Google OAuth authentication via Supabase
- 🎵 **Spotify Integration** - Import playlists directly from Spotify
- 📊 **Admin Dashboard** - Track listening statistics and user analytics
- 🌐 **Offline Support** - Offline indicator and graceful error handling
- 🎯 **Voice Search** - Voice-activated song search (when supported)

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom animations
- **UI Components**: [Radix UI](https://www.radix-ui.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: Supabase Auth with Google OAuth
- **Music API**: Spotify Web API + JioSaavn API (fallback)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) 18.x or higher
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A [Supabase](https://supabase.com/) account
- A [Spotify Developer](https://developer.spotify.com/) account (for Spotify features)
- A [Google Cloud Console](https://console.cloud.google.com/) account (for OAuth)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/soundwave.git
cd soundwave
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Spotify API Configuration
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/spotify/callback

# Application URL (for production)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Where to find these values:**

- **Supabase**: Go to your project → Settings → API
- **Spotify**: Create an app at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
  - Add redirect URI: `http://localhost:3000/api/spotify/callback`
  - For production, add your production URL

### 4. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase-schema.sql`
4. Click **Run** to execute the script

This creates:
- `playlists` table for user playlists
- `playlist_songs` table for songs in playlists
- Row Level Security (RLS) policies
- Indexes for performance

**Optional - Admin Dashboard:**
If you want to use the admin dashboard, also run `admin-schema.sql`:

```sql
-- Run admin-schema.sql in Supabase SQL Editor
```

### 5. Supabase Authentication Setup

1. Go to **Authentication** → **Providers** in Supabase
2. Enable **Google** provider
3. Add your Google OAuth credentials:
   - Get Client ID and Secret from [Google Cloud Console](https://console.cloud.google.com/)
   - Configure redirect URI: `https://[your-project-ref].supabase.co/auth/v1/callback`

See [SETUP.md](./SETUP.md) for detailed OAuth setup instructions.

### 6. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
soundwave/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── spotify/         # Spotify integration endpoints
│   │   ├── admin/           # Admin dashboard APIs
│   │   └── track/           # Music tracking APIs
│   ├── admin/               # Admin dashboard pages
│   ├── dashboard/           # Main user dashboard
│   ├── signin/              # Authentication page
│   └── layout.tsx           # Root layout
├── components/              # React components
│   ├── ui/                 # shadcn/ui components
│   ├── MusicPlayer.tsx     # Music player component
│   ├── PlaylistManager.tsx # Playlist management
│   └── SpotifyImport.tsx   # Spotify import feature
├── lib/                     # Utility functions
│   ├── supabase/           # Supabase client setup
│   ├── api.ts              # Music API integration
│   ├── playlists.ts        # Playlist operations
│   └── spotify.ts          # Spotify utilities
├── hooks/                   # Custom React hooks
├── supabase-schema.sql      # Database schema
├── admin-schema.sql         # Admin dashboard schema
└── README.md               # This file
```

## 🔌 API Endpoints

### Spotify Integration

- `GET /api/spotify/authorize` - Initiate Spotify OAuth
- `GET /api/spotify/callback` - Handle OAuth callback
- `GET /api/spotify/playlists` - Get user's Spotify playlists
- `POST /api/spotify/import` - Import Spotify playlist
- `GET /api/spotify/import-progress` - Get import progress
- `GET /api/spotify/search` - Search Spotify tracks

### Music Tracking

- `POST /api/track/play` - Track song play
- `POST /api/track/session` - Track listening session

### Admin

- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/stats` - Get platform statistics

## 🎨 Key Features Explained

### Playlist Management
- Create unlimited playlists
- Add/remove songs with drag-and-drop
- Import entire playlists from Spotify
- Play entire playlists or individual songs

### Queue System
- Drag songs to queue panel
- Reorder queue items
- Remove songs from queue
- Auto-play next song

### Spotify Integration
- OAuth authentication
- Browse your Spotify playlists
- One-click playlist import
- Batch import with progress tracking

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation if needed
4. **Test your changes**
   - Test in development mode
   - Check for TypeScript errors: `npm run lint`
5. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Code Style Guidelines

- Use TypeScript for all new files
- Follow the existing component structure
- Use functional components with hooks
- Keep components small and focused
- Add JSDoc comments for public functions
- Use meaningful variable and function names

### Component Structure

```typescript
// Example component structure
'use client'; // If using client-side features

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ComponentProps {
  // Define props with TypeScript
}

export function Component({ prop }: ComponentProps) {
  // Component logic
  return (
    // JSX
  );
}
```

### Adding New Features

1. **Create feature branch**: `feature/feature-name`
2. **Update types** in `lib/types.ts` if needed
3. **Add components** in `components/` directory
4. **Add API routes** in `app/api/` if needed
5. **Update documentation** in README or relevant docs
6. **Test thoroughly** before submitting PR

## 🐛 Troubleshooting

### Common Issues

**Issue: Spotify OAuth not working**
- Check redirect URI matches exactly in Spotify dashboard
- Ensure `SPOTIFY_REDIRECT_URI` in `.env.local` is correct
- Clear cookies and try again

**Issue: Database errors**
- Verify Supabase connection in `.env.local`
- Check RLS policies are set up correctly
- Ensure schema has been run in Supabase SQL Editor

**Issue: Songs not playing**
- Check browser console for errors
- Verify music API is accessible
- Check network tab for failed requests

**Issue: Build errors**
- Run `npm install` to ensure all dependencies are installed
- Clear `.next` folder: `rm -rf .next`
- Check Node.js version matches requirements

## 📚 Additional Documentation

- [SETUP.md](./SETUP.md) - Detailed setup instructions
- [SPOTIFY_SETUP.md](./SPOTIFY_SETUP.md) - Spotify API setup guide
- [ADMIN_SETUP.md](./ADMIN_SETUP.md) - Admin dashboard setup
- [LOCAL_TESTING.md](./LOCAL_TESTING.md) - Local development tips

## 🗺️ Roadmap

- [ ] Music recommendations based on listening history
- [ ] Social features (share playlists, follow users)
- [ ] Mobile app (React Native)
- [ ] Offline music caching
- [ ] Multiple music source support
- [ ] Lyrics display
- [ ] Music visualization
- [ ] Collaborative playlists

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Supabase](https://supabase.com/) for backend infrastructure
- [Spotify](https://spotify.com/) for music API
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- All contributors who help improve this project

## 📧 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/soundwave/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/soundwave/discussions)

---

**Made with ❤️ by the SoundWave team**

Happy coding! 🎵

