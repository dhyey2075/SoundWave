import type { Song } from '@/lib/types';

export interface SongPlay {
  id: string;
  user_id: string;
  song_id: string;
  song_title: string;
  song_artist: string;
  song_album: string;
  played_at: string;
  duration_seconds: number;
  completed: boolean;
}

export interface ListeningSession {
  id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  total_duration_seconds: number;
  songs_played: number;
}

export interface MostPlayedSong {
  song_id: string;
  song_title: string;
  song_artist: string;
  play_count: number;
  total_duration: number;
}

export interface UserListeningStats {
  user_id: string;
  total_duration_seconds: number;
  total_songs_played: number;
  total_sessions: number;
}

export interface AdminStats {
  totalUsers: number;
  totalSongsPlayed: number;
  totalListeningTime: number; // in seconds
  mostPlayedSongs: MostPlayedSong[];
  topUsers: UserListeningStats[];
  dailyStats: {
    date: string;
    plays: number;
    listeningTime: number;
  }[];
  hourlyStats: {
    hour: number;
    plays: number;
  }[];
}

// Type definitions for admin dashboard
// Note: Actual tracking is done via API routes (/api/track/play and /api/track/session)

