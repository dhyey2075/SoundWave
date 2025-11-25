# Admin Dashboard Setup Guide

## Overview
The admin dashboard provides comprehensive analytics and statistics about your music app, including:
- Most played songs
- Total listening time per user
- Daily and hourly activity patterns
- User statistics
- And more!

## Setup Instructions

### 1. Database Setup

Run the SQL schema in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of admin-schema.sql into Supabase SQL Editor
```

This will create the following tables:
- `song_plays` - Tracks individual song plays
- `listening_sessions` - Tracks continuous listening sessions
- `admin_users` - Stores admin credentials (optional, currently using environment variables)

### 2. Environment Variables

Create a `.env.local` file in your project root (if it doesn't exist) and add the following:

```env
# Admin Credentials (change these from defaults!)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

**⚠️ Important:** 
- The default credentials are: `admin` / `admin123`
- **You MUST change these in production!**
- After changing, restart your Next.js dev server (`npm run dev`)

#### How to Change Admin Password:

1. **Create or edit `.env.local` file** in your project root:
   ```env
   ADMIN_USERNAME=your_new_username
   ADMIN_PASSWORD=your_new_password
   ```

2. **Restart your Next.js server** for changes to take effect:
   ```bash
   # Stop the server (Ctrl+C) and restart
   npm run dev
   ```

3. **Use the new credentials** to login at `/admin/login`

**Note:** The `.env.local` file is gitignored and won't be committed to version control, keeping your credentials safe.

### 3. Access the Admin Dashboard

1. Navigate to `/admin/login` in your browser
2. Enter the admin credentials
3. You'll be redirected to `/admin/dashboard` with all statistics

## Features

### Statistics Tracked

1. **Total Users** - Number of unique users who have played music
2. **Total Songs Played** - Total number of song plays across all users
3. **Total Listening Time** - Cumulative listening time across all users
4. **Active Users** - Number of users with listening sessions

### Charts & Visualizations

1. **Most Played Songs** - Bar chart showing top 5 most played songs
2. **Daily Listening Activity** - Line chart showing plays and listening time over the last 30 days
3. **Hourly Activity Distribution** - Bar chart showing when users listen most during the day
4. **Top Users** - Horizontal bar chart showing users by total listening time
5. **Most Played Songs Table** - Detailed table with top 10 songs including play counts and total duration

### Data Collection

The system automatically tracks:
- When a song starts playing
- Listening duration (tracked every 10 seconds)
- When a song completes
- Listening sessions (continuous play periods)
- User activity patterns

## Security Notes

1. **Admin Authentication**: Currently uses simple cookie-based sessions. For production:
   - Use proper JWT tokens
   - Implement session expiration
   - Add rate limiting
   - Use HTTPS only

2. **Database Security**: 
   - RLS (Row Level Security) is enabled
   - Users can only see their own data
   - Admin access uses service role key in API routes

3. **Credentials**:
   - Never commit admin credentials to version control
   - Use environment variables
   - Consider implementing proper password hashing in the database

## API Routes

- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/login` - Check admin session
- `GET /api/admin/stats` - Fetch all statistics (requires admin auth)
- `POST /api/track/play` - Track a song play (requires user auth)
- `POST /api/track/session` - Track listening sessions (requires user auth)

## Troubleshooting

### No data showing?
- Make sure users have played some songs
- Check that the database tables were created correctly
- Verify RLS policies allow data insertion

### Can't login?
- Check environment variables are set correctly
- Verify the admin credentials match
- Check browser console for errors

### Charts not rendering?
- Ensure `recharts` is installed: `npm install recharts`
- Check browser console for errors
- Verify data is being returned from the API

## Future Enhancements

Potential improvements:
- Real-time statistics updates
- Export data to CSV/JSON
- User-specific analytics
- Genre/artist analytics
- Playlist statistics
- Geographic distribution (if tracking location)
- Advanced filtering and date ranges

