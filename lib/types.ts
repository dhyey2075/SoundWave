export interface Song {
  id: string;
  title: string;
  image: string;
  album: string;
  url: string;
  previewUrl?: string;
  duration: string;
  year: string;
  artist: string;
}

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  song_count?: number;
}

export interface PlaylistSong {
  id: string;
  playlist_id: string;
  song_id: string;
  song_data: Song;
  position: number;
  created_at: string;
}
