-- Admin Dashboard Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Create song_plays table to track individual song plays
CREATE TABLE IF NOT EXISTS song_plays (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  song_id TEXT NOT NULL,
  song_title TEXT NOT NULL,
  song_artist TEXT,
  song_album TEXT,
  played_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  duration_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false
);

-- Create listening_sessions table to track continuous listening sessions
CREATE TABLE IF NOT EXISTS listening_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  total_duration_seconds INTEGER DEFAULT 0,
  songs_played INTEGER DEFAULT 0
);

-- Create admin_users table for admin authentication
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  last_login TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_song_plays_user_id ON song_plays(user_id);
CREATE INDEX IF NOT EXISTS idx_song_plays_song_id ON song_plays(song_id);
CREATE INDEX IF NOT EXISTS idx_song_plays_played_at ON song_plays(played_at);
CREATE INDEX IF NOT EXISTS idx_listening_sessions_user_id ON listening_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_listening_sessions_started_at ON listening_sessions(started_at);

-- Enable Row Level Security (RLS)
ALTER TABLE song_plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE listening_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for song_plays
-- Users can insert their own song plays
CREATE POLICY "Users can insert their own song plays"
  ON song_plays FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own song plays
CREATE POLICY "Users can view their own song plays"
  ON song_plays FOR SELECT
  USING (auth.uid() = user_id);

-- Create policies for listening_sessions
-- Users can insert their own listening sessions
CREATE POLICY "Users can insert their own listening sessions"
  ON listening_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own listening sessions
CREATE POLICY "Users can update their own listening sessions"
  ON listening_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can view their own listening sessions
CREATE POLICY "Users can view their own listening sessions"
  ON listening_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Admin users policies (only admins can view)
-- Note: Admin access will be handled via API routes with service role key
-- RLS policies here are for basic protection

-- Create a function to get most played songs
CREATE OR REPLACE FUNCTION get_most_played_songs(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  song_id TEXT,
  song_title TEXT,
  song_artist TEXT,
  play_count BIGINT,
  total_duration BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.song_id,
    sp.song_title,
    sp.song_artist,
    COUNT(*)::BIGINT as play_count,
    SUM(sp.duration_seconds)::BIGINT as total_duration
  FROM song_plays sp
  GROUP BY sp.song_id, sp.song_title, sp.song_artist
  ORDER BY play_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get total listening time by user
CREATE OR REPLACE FUNCTION get_user_listening_stats()
RETURNS TABLE (
  user_id UUID,
  total_duration_seconds BIGINT,
  total_songs_played BIGINT,
  total_sessions BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ls.user_id,
    COALESCE(SUM(ls.total_duration_seconds), 0)::BIGINT as total_duration_seconds,
    COALESCE(SUM(ls.songs_played), 0)::BIGINT as total_songs_played,
    COUNT(DISTINCT ls.id)::BIGINT as total_sessions
  FROM listening_sessions ls
  GROUP BY ls.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default admin user (username: admin, password: admin123)
-- Password hash for 'admin123' using bcrypt (you should change this!)
-- This is a placeholder - in production, use a proper password hashing library
INSERT INTO admin_users (username, password_hash)
VALUES ('admin', '$2b$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZq')
ON CONFLICT (username) DO NOTHING;

-- Note: The password hash above is a placeholder. 
-- You should generate a proper bcrypt hash for your admin password.
-- Use a tool like: https://bcrypt-generator.com/
-- For 'admin123', a proper hash would be generated there.

