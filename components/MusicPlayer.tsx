'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2,
  VolumeX,
  ListMusic
} from 'lucide-react';
import { Song } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { chipSounds } from '@/lib/sounds';

interface MusicPlayerProps {
  song: Song | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onToggleQueue: () => void;
  isQueueOpen: boolean;
  queueCount: number;
}

export function MusicPlayer({ 
  song, 
  isPlaying, 
  onPlayPause, 
  onNext, 
  onPrevious,
  onToggleQueue,
  isQueueOpen,
  queueCount
}: MusicPlayerProps) {
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const previousSongIdRef = useRef<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const sessionStartTimeRef = useRef<number>(0);
  const songsPlayedInSessionRef = useRef<number>(0);
  const lastTrackedTimeRef = useRef<number>(0);
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // Start listening session when song starts playing
  useEffect(() => {
    if (isPlaying && song && !sessionIdRef.current) {
      // Start a new listening session
      fetch('/api/track/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.sessionId) {
            sessionIdRef.current = data.sessionId;
            sessionStartTimeRef.current = Date.now();
            songsPlayedInSessionRef.current = 1;
          }
        })
        .catch((err) => console.error('Error starting session:', err));
    }

    return () => {
      // End session when component unmounts or song changes
      if (sessionIdRef.current) {
        const totalDuration = Math.floor((Date.now() - sessionStartTimeRef.current) / 1000);
        fetch('/api/track/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update',
            sessionId: sessionIdRef.current,
            totalDurationSeconds: totalDuration,
            songsPlayed: songsPlayedInSessionRef.current,
          }),
        }).catch((err) => console.error('Error ending session:', err));
        sessionIdRef.current = null;
      }
    };
  }, [isPlaying, song]);

  // Track song plays and listening duration
  useEffect(() => {
    if (isPlaying && song) {
      // Track song play when it starts
      fetch('/api/track/play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          song,
          durationSeconds: 0,
          completed: false,
        }),
      }).catch((err) => console.error('Error tracking song play:', err));

      // Track listening duration every 10 seconds
      trackingIntervalRef.current = setInterval(() => {
        if (audioRef.current && song) {
          const listenedSeconds = Math.floor(audioRef.current.currentTime - lastTrackedTimeRef.current);
          if (listenedSeconds > 5) {
            // Track every 10 seconds of listening
            fetch('/api/track/play', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                song,
                durationSeconds: listenedSeconds,
                completed: false,
              }),
            }).catch((err) => console.error('Error tracking listening:', err));
            lastTrackedTimeRef.current = audioRef.current.currentTime;
          }
        }
      }, 10000); // Track every 10 seconds

      // Track when song ends
      const handleEnded = () => {
        if (audioRef.current && song) {
          const totalDuration = Math.floor(audioRef.current.duration);
          fetch('/api/track/play', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              song,
              durationSeconds: totalDuration,
              completed: true,
            }),
          }).catch((err) => console.error('Error tracking completed play:', err));
          
          if (sessionIdRef.current) {
            songsPlayedInSessionRef.current++;
          }
        }
      };

      const audio = audioRef.current;
      if (audio) {
        audio.addEventListener('ended', handleEnded);
      }

      return () => {
        if (trackingIntervalRef.current) {
          clearInterval(trackingIntervalRef.current);
        }
        if (audio) {
          audio.removeEventListener('ended', handleEnded);
        }
      };
    } else {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
        trackingIntervalRef.current = null;
      }
    }
  }, [isPlaying, song]);

  // Update current time and duration from audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      if (lastTrackedTimeRef.current === 0) {
        lastTrackedTimeRef.current = audio.currentTime;
      }
    };
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('durationchange', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('durationchange', updateDuration);
      lastTrackedTimeRef.current = 0;
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
              onClick={() => {
                chipSounds.navigate();
                onPrevious();
              }}
              className="glass hover:bg-white/10 rounded-full h-10 w-10"
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              onClick={() => {
                chipSounds.click();
                onPlayPause();
              }}
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
              onClick={() => {
                chipSounds.navigate();
                onNext();
              }}
              className="glass hover:bg-white/10 rounded-full h-10 w-10"
            >
              <SkipForward className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                chipSounds.click();
                onToggleQueue();
              }}
              className={`glass hover:bg-white/10 rounded-full h-10 w-10 relative transition-all ${
                isQueueOpen ? 'bg-white/15 ring-1 ring-primary/60' : ''
              }`}
            >
              <ListMusic className="h-5 w-5" />
              {queueCount > 0 && (
                <span className="absolute -top-1 -right-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary text-background">
                  {queueCount}
                </span>
              )}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                chipSounds.hover();
                setIsMuted(!isMuted);
              }}
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