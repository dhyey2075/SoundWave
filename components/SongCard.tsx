'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { Song } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface SongCardProps {
  song: Song;
  isPlaying: boolean;
  isActive: boolean;
  onPlay: (song: Song) => void;
}

const textColors = [
  { class: 'text-[#ff6ec7]', color: '#ff6ec7' },
  { class: 'text-[#6ec7ff]', color: '#6ec7ff' },
  { class: 'text-[#b86ec7]', color: '#b86ec7' },
  { class: 'text-[#6effc7]', color: '#6effc7' },
  { class: 'text-[#ff9f6e]', color: '#ff9f6e' },
  { class: 'text-[#ffeb6e]', color: '#ffeb6e' },
  { class: 'text-[#6eff9f]', color: '#6eff9f' },
  { class: 'text-[#ff6e9f]', color: '#ff6e9f' },
  { class: 'text-[#9f6eff]', color: '#9f6eff' },
];

// Generate a unique color based on song ID for consistency
const getColorForSong = (songId: string) => {
  const hash = songId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return textColors[hash % textColors.length];
};

export function SongCard({ song, isPlaying, isActive, onPlay }: SongCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const textColor = getColorForSong(song.id);
  const previewAudioRef = useRef<HTMLAudioElement>(null);
  const showBorderAnimation = isActive && isPlaying;

  // Handle hover preview
  useEffect(() => {
    const audio = previewAudioRef.current;
    if (!audio || !song.previewUrl) return;

    if (isHovered) {
      audio.currentTime = 6; // Skip first 6 seconds
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Silently fail if autoplay is blocked
      });
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [isHovered, song.previewUrl]);

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`
          glass-strong rounded-2xl p-6 relative
          transition-all duration-300 ease-out
          ${isActive ? 'ring-2 ring-primary ring-opacity-50' : ''}
          ${isHovered ? 'shadow-2xl shadow-primary/20' : 'shadow-lg'}
          ${showBorderAnimation ? 'border-wave border-pulse' : ''}
        `}
        style={{
          transform: isHovered 
            ? 'translateY(-8px) scale(1.02)' 
            : 'translateY(0) scale(1)',
          animation: !isHovered && !showBorderAnimation ? 'floating 3s ease-in-out infinite' : 'none',
        }}
      >
        {/* Live animated border when playing */}
        {showBorderAnimation && (
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-10">
            {/* Base pulsing border - colorful */}
            <div 
              className="absolute inset-0 rounded-2xl border-2"
              style={{
                borderColor: 'rgba(255, 110, 199, 0.6)',
                animation: 'borderPulse 2s ease-in-out infinite',
                boxShadow: '0 0 20px rgba(255, 110, 199, 0.5), 0 0 40px rgba(255, 235, 110, 0.3), inset 0 0 20px rgba(110, 255, 199, 0.3)',
              }}
            />
            {/* Top sliding light - pink to yellow */}
            <div 
              className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-pink-400 via-yellow-400 to-transparent"
              style={{
                animation: 'borderSlide 1.5s linear infinite',
                boxShadow: '0 0 15px rgba(255, 110, 199, 0.9), 0 0 30px rgba(255, 235, 110, 0.6)',
              }}
            />
            {/* Bottom sliding light - cyan to purple */}
            <div 
              className="absolute bottom-0 right-0 w-full h-1.5 bg-gradient-to-r from-transparent via-cyan-400 via-purple-400 to-transparent"
              style={{
                animation: 'borderSlide 1.5s linear infinite reverse',
                boxShadow: '0 0 15px rgba(110, 255, 199, 0.9), 0 0 30px rgba(159, 110, 255, 0.6)',
              }}
            />
            {/* Right sliding light - orange to pink */}
            <div 
              className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-transparent via-orange-400 via-pink-400 to-transparent"
              style={{
                animation: 'borderSlideVertical 1.5s linear infinite',
                boxShadow: '0 0 15px rgba(255, 159, 110, 0.9), 0 0 30px rgba(255, 110, 199, 0.6)',
              }}
            />
            {/* Left sliding light - green to cyan */}
            <div 
              className="absolute bottom-0 left-0 w-1.5 h-full bg-gradient-to-b from-transparent via-green-400 via-cyan-400 to-transparent"
              style={{
                animation: 'borderSlideVertical 1.5s linear infinite reverse',
                boxShadow: '0 0 15px rgba(110, 255, 159, 0.9), 0 0 30px rgba(110, 255, 199, 0.6)',
              }}
            />
          </div>
        )}
        <div className="flex flex-col gap-4 relative z-0">
          {/* Image with play button overlay */}
          <div className="relative aspect-square w-full overflow-hidden rounded-xl">
            <img
              src={song.image}
              alt={song.title}
              className={`
                h-full w-full object-cover transition-all duration-500
                ${isHovered ? 'scale-110 brightness-110' : 'scale-100 brightness-100'}
              `}
            />
            <div
              className={`
                absolute inset-0 flex items-center justify-center
                bg-black/40 backdrop-blur-sm transition-all duration-300
                ${isHovered ? 'opacity-100' : 'opacity-0'}
              `}
            >
              <Button
                size="icon"
                className={`
                  h-16 w-16 rounded-full bg-white/20 backdrop-blur-md
                  hover:bg-white/30 transition-all duration-300
                  ${isHovered ? 'scale-100' : 'scale-90'}
                `}
                onClick={() => onPlay(song)}
              >
                {isActive && isPlaying ? (
                  <Pause className="h-8 w-8 text-white" />
                ) : (
                  <Play className="h-8 w-8 text-white ml-1" />
                )}
              </Button>
            </div>
            
            {/* Active indicator */}
            {isActive && (
              <div className="absolute top-2 right-2">
                <div className="h-3 w-3 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
              </div>
            )}
          </div>

          {/* Song info */}
          <div className="flex flex-col gap-2">
            <h3
              className={`
                font-bold text-lg line-clamp-2 transition-all duration-300
                ${isHovered ? `${textColor.class} font-extrabold` : 'text-foreground'}
              `}
            >
              {song.title}
            </h3>
            <p
              className={`
                text-sm line-clamp-1 transition-all duration-300
                ${isHovered ? 'text-primary font-semibold' : 'text-muted-foreground'}
              `}
            >
              {song.artist}
            </p>
            <p className="text-xs text-muted-foreground/70 line-clamp-1">
              {song.album} • {song.year}
            </p>
          </div>
        </div>
      </div>

      {/* Hidden audio for preview */}
      {song.previewUrl && (
        <audio
          ref={previewAudioRef}
          src={song.previewUrl}
          preload="none"
        />
      )}
    </div>
  );
}