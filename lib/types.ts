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
  volume: number;
}