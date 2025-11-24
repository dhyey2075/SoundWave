'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2,
  VolumeX
} from 'lucide-react';
import { Song } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface MusicPlayerProps {
  song: Song | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function MusicPlayer({ 
  song, 
  isPlaying, 
  onPlayPause, 
  onNext, 
  onPrevious 
}: MusicPlayerProps) {
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const previousSongIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle song changes - load new audio
  useEffect(() => {
    if (audioRef.current && song) {
      const songChanged = previousSongIdRef.current !== song.id;
      
      if (songChanged) {
        previousSongIdRef.current = song.id;
        setCurrentTime(0); // Reset current time when song changes
        const audio = audioRef.current;
        const shouldPlay = isPlaying;
        
        // Set up event handler for when audio is ready to play
        const handleCanPlay = () => {
          if (shouldPlay) {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
              playPromise.catch((error) => {
                console.error('Error playing audio:', error);
              });
            }
          }
        };
        
        audio.addEventListener('canplay', handleCanPlay, { once: true });
        
        // Also check if audio is already ready (cached)
        if (audio.readyState >= 2) { // HAVE_CURRENT_DATA
          handleCanPlay();
        } else {
          // Load the new audio source
          audio.load();
        }
        
        return () => {
          audio.removeEventListener('canplay', handleCanPlay);
        };
      }
    }
  }, [song, isPlaying]);

  // Handle play/pause state changes
  useEffect(() => {
    if (audioRef.current && song) {
      // Only handle play/pause if the song is already loaded (not changing)
      if (previousSongIdRef.current === song.id) {
        if (isPlaying) {
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch((error) => {
              console.error('Error playing audio:', error);
            });
          }
        } else {
          audioRef.current.pause();
        }
      }
    }
  }, [isPlaying, song]);

  // Update current time and duration from audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('durationchange', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('durationchange', updateDuration);
    };
  }, [song]);

  // Handle seeking
  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  // Format time in MM:SS
  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!song) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="glass-strong border-t border-white/10 backdrop-blur-2xl">
        {/* Progress bar */}
        <div className="container px-6 py-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground min-w-[3rem] text-right font-mono">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground min-w-[3rem] font-mono">
              {formatTime(duration)}
            </span>
          </div>
        </div>
        
        <div className="container flex items-center justify-between py-4 px-6">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="relative h-14 w-14 flex-shrink-0 rounded-xl overflow-hidden ring-2 ring-primary/30">
              <img
                src={song.image}
                alt={song.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-base truncate text-foreground">
                {song.title}
              </div>
              <div className="text-sm text-muted-foreground truncate">
                {song.artist}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mx-4">
            <Button
              size="icon"
              variant="ghost"
              onClick={onPrevious}
              className="glass hover:bg-white/10 rounded-full h-10 w-10"
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              onClick={onPlayPause}
              className="glass-strong bg-primary/20 hover:bg-primary/30 rounded-full h-12 w-12"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-0.5" />
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={onNext}
              className="glass hover:bg-white/10 rounded-full h-10 w-10"
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsMuted(!isMuted)}
              className="glass hover:bg-white/10 rounded-full h-10 w-10"
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>
            <Slider
              className="w-24"
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.1}
              onValueChange={(value) => setVolume(value[0])}
            />
          </div>

          <audio
            ref={audioRef}
            src={song.url}
            onEnded={onNext}
          />
        </div>
      </div>
    </div>
  );
}