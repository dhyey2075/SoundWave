'use client';

import { useState } from 'react';
import { Music2 } from 'lucide-react';
import { SearchBar } from '@/components/SearchBar';
import { SongCard } from '@/components/SongCard';
import { MusicPlayer } from '@/components/MusicPlayer';
import { BackgroundDots } from '@/components/BackgroundDots';
import { CursorFollower } from '@/components/CursorFollower';
import { searchSongs } from '@/lib/api';
import type { Song } from '@/lib/types';

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    const results = await searchSongs(query);
    setSongs(results);
    setIsLoading(false);
  };

  const handlePlay = (song: Song) => {
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    if (!currentSong || songs.length === 0) return;
    const currentIndex = songs.findIndex(song => song.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    setCurrentSong(songs[nextIndex]);
    setIsPlaying(true);
  };

  const handlePrevious = () => {
    if (!currentSong || songs.length === 0) return;
    const currentIndex = songs.findIndex(song => song.id === currentSong.id);
    const previousIndex = (currentIndex - 1 + songs.length) % songs.length;
    setCurrentSong(songs[previousIndex]);
    setIsPlaying(true);
  };

  return (
    <main className="relative min-h-screen pb-32 overflow-hidden">
      <BackgroundDots />
      <CursorFollower />
      
      <div className="relative z-10 w-full flex justify-center py-12">
        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col items-center gap-6 text-center">
          <div className="flex items-center gap-3">
            <div className="glass-strong rounded-2xl p-3">
              <Music2 className="h-10 w-10 text-primary glow-text" />
            </div>
            <h1 
              className="text-5xl font-extrabold bg-gradient-to-r from-pink-400 via-yellow-400 via-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent"
              style={{
                backgroundSize: '200% auto',
                animation: 'gradient 3s ease infinite',
              }}
            >
              SoundWave
            </h1>
          </div>
          <div className="w-full max-w-2xl">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="glass-strong rounded-full p-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          </div>
        ) : songs.length > 0 ? (
          <div className="flex justify-center w-full">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full">
              {songs.map((song) => (
                <SongCard
                  key={song.id}
                  song={song}
                  isPlaying={isPlaying}
                  isActive={currentSong?.id === song.id}
                  onPlay={handlePlay}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="glass-strong rounded-2xl p-8 inline-block">
              <p className="text-xl text-muted-foreground">
                Search for your favorite songs to start listening
              </p>
            </div>
          </div>
        )}
        </div>
      </div>

      <MusicPlayer
        song={currentSong}
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />
    </main>
  );
}