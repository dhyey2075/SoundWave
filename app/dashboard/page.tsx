'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Music2, LogOut, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BackgroundDots } from '@/components/BackgroundDots';
import { CursorFollower } from '@/components/CursorFollower';
import { SearchBar } from '@/components/SearchBar';
import { SongCard } from '@/components/SongCard';
import { MusicPlayer } from '@/components/MusicPlayer';
import { MusicLoader } from '@/components/MusicLoader';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { createClient } from '@/lib/supabase/client';
import { searchSongs } from '@/lib/api';
import { chipSounds } from '@/lib/sounds';
import type { Song } from '@/lib/types';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export default function DashboardPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [mounted, setMounted] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isQueueDragActive, setIsQueueDragActive] = useState(false);
  const [draggedQueueIndex, setDraggedQueueIndex] = useState<number | null>(null);
  const [dragOverQueueIndex, setDragOverQueueIndex] = useState<number | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    // Check authentication
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error || !user) {
        router.push('/signin');
      } else {
        setUser(user);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/signin');
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/signin');
  };

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

  const playNextFromQueue = () => {
    if (queue.length === 0) return false;
    const [nextSong, ...rest] = queue;
    setQueue(rest);
    setCurrentSong(nextSong);
    setIsPlaying(true);
    return true;
  };

  const handleNext = () => {
    if (playNextFromQueue()) return;
    if (!currentSong || songs.length === 0) return;
    chipSounds.navigate();
    const currentIndex = songs.findIndex((song) => song.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    setCurrentSong(songs[nextIndex]);
    setIsPlaying(true);
  };

  const handlePrevious = () => {
    if (!currentSong || songs.length === 0) return;
    chipSounds.navigate();
    const currentIndex = songs.findIndex((song) => song.id === currentSong.id);
    const previousIndex = (currentIndex - 1 + songs.length) % songs.length;
    setCurrentSong(songs[previousIndex]);
    setIsPlaying(true);
  };

  const handleToggleQueue = () => {
    chipSounds.click();
    setIsQueueOpen((prev) => !prev);
  };

  const handleQueueDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const data = event.dataTransfer.getData('application/json');
    if (!data) {
      setIsQueueDragActive(false);
      return;
    }
    try {
      const droppedSong: Song = JSON.parse(data);
      setQueue((prev) => {
        if (prev.some((item) => item.id === droppedSong.id)) {
          return prev;
        }
        return [...prev, droppedSong];
      });
    } catch (error) {
      console.error('Unable to parse dropped song', error);
    } finally {
      setIsQueueDragActive(false);
    }
  };

  const handleQueueDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isQueueDragActive) {
      setIsQueueDragActive(true);
    }
  };

  const handleQueueDragLeave = () => {
    setIsQueueDragActive(false);
  };

  const handleRemoveFromQueue = (songId: string) => {
    setQueue((prev) => prev.filter((song) => song.id !== songId));
  };

  const handlePlayFromQueue = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    setQueue((prev) => prev.filter((item) => item.id !== song.id));
  };

  const handleQueueItemDragStart = (index: number) => {
    setDraggedQueueIndex(index);
  };

  const handleQueueItemDragOver = (event: React.DragEvent<HTMLDivElement>, index: number) => {
    event.preventDefault();
    event.stopPropagation();
    // Only handle reordering if we're dragging a queue item
    if (draggedQueueIndex !== null && draggedQueueIndex !== index) {
      setDragOverQueueIndex(index);
    }
  };

  const handleQueueItemDragLeave = () => {
    setDragOverQueueIndex(null);
  };

  const handleQueueItemDrop = (event: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    event.preventDefault();
    event.stopPropagation();
    
    // Only reorder if we're dragging a queue item (not from main list)
    if (draggedQueueIndex === null) {
      // This might be a drop from the main list, let parent handle it
      return;
    }

    setQueue((prev) => {
      const newQueue = [...prev];
      const draggedItem = newQueue[draggedQueueIndex];
      newQueue.splice(draggedQueueIndex, 1);
      newQueue.splice(dropIndex, 0, draggedItem);
      return newQueue;
    });

    setDraggedQueueIndex(null);
    setDragOverQueueIndex(null);
  };

  const handleQueueItemDragEnd = () => {
    setDraggedQueueIndex(null);
    setDragOverQueueIndex(null);
  };

  if (!mounted || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <MusicLoader />
      </div>
    );
  }

  return (
    <main className="relative min-h-screen pb-32 overflow-hidden">
      <BackgroundDots />
      <CursorFollower />
      {mounted && <OfflineIndicator />}

      {/* Header with user info and sign out */}
      <div className="relative z-10 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between glass-strong rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="glass-strong rounded-xl p-2">
                <Music2 className="h-6 w-6 text-primary glow-text" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-400 via-yellow-400 via-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
                SoundWave
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {user.email || user.user_metadata?.full_name || 'User'}
                </span>
              </div>
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="glass hover:bg-white/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full flex justify-center py-12">
        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col items-center gap-6 text-center">
            <div className="w-full max-w-2xl">
              <SearchBar onSearch={handleSearch} />
            </div>
          </div>

          {isLoading ? (
            <MusicLoader />
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
              <p className="text-xl text-muted-foreground">
                Search for your favorite songs to start listening
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Queue Panel */}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-96 z-40 transition-transform duration-300 ${
          isQueueOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'
        }`}
      >
        <div
          className={`h-full bg-black/80 backdrop-blur-2xl border-l border-white/10 p-6 flex flex-col gap-4 transition-colors ${
            isQueueDragActive ? 'ring-2 ring-primary/60' : ''
          }`}
          onDrop={handleQueueDrop}
          onDragOver={handleQueueDragOver}
          onDragLeave={handleQueueDragLeave}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-muted-foreground">Now Playing Queue</p>
              <h2 className="text-2xl font-bold text-foreground">
                {queue.length > 0 ? `${queue.length} song${queue.length > 1 ? 's' : ''}` : 'Queue is empty'}
              </h2>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsQueueOpen(false)}
              className="rounded-full hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Drag songs from the main list to add them, or drag items within the queue to reorder.
          </p>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2 queue-scrollbar">
            {queue.length === 0 ? (
              <div
                className={`rounded-2xl border border-dashed border-white/15 p-6 text-center ${
                  isQueueDragActive ? 'bg-white/5' : 'bg-white/0'
                }`}
              >
                <p className="text-sm text-muted-foreground">
                  Drop songs from the main list to start building your queue.
                </p>
              </div>
            ) : (
              queue.map((song, index) => (
                <div
                  key={song.id}
                  draggable
                  onDragStart={() => handleQueueItemDragStart(index)}
                  onDragOver={(e) => handleQueueItemDragOver(e, index)}
                  onDragLeave={handleQueueItemDragLeave}
                  onDrop={(e) => handleQueueItemDrop(e, index)}
                  onDragEnd={handleQueueItemDragEnd}
                  className={`
                    glass-strong rounded-2xl p-4 flex items-center gap-4 
                    hover:bg-white/10 transition-all duration-200 cursor-move
                    ${draggedQueueIndex === index ? 'opacity-50 scale-95' : ''}
                    ${dragOverQueueIndex === index ? 'ring-2 ring-primary/60 bg-primary/10 scale-105' : ''}
                  `}
                  title="Drag to reorder"
                >
                  <div className="h-14 w-14 rounded-xl overflow-hidden ring-1 ring-white/10 flex-shrink-0">
                    <img src={song.image} alt={song.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-semibold text-foreground truncate cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handlePlayFromQueue(song)}
                    >
                      {song.title}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleRemoveFromQueue(song.id)}
                    className="rounded-full hover:bg-white/10 flex-shrink-0"
                    title="Remove from queue"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>

      <MusicPlayer
        song={currentSong}
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onToggleQueue={handleToggleQueue}
        isQueueOpen={isQueueOpen}
        queueCount={queue.length}
      />
    </main>
  );
}

