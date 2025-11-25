'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, Loader2 } from 'lucide-react';
import { Song } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { chipSounds, stopAllChipSounds } from '@/lib/sounds';
import { downloadSongFile } from '@/lib/download';

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
  const [isDownloading, setIsDownloading] = useState(false);
  const textColor = getColorForSong(song.id);
  const showBorderAnimation = isActive && isPlaying;
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    // Clear any pending timeouts
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    
    // Stop any existing sounds
    stopAllChipSounds();
    
    setIsHovered(true);
    // Small delay to prevent rapid fire sounds
    hoverTimeoutRef.current = setTimeout(() => {
      chipSounds.hover();
    }, 10);
  };

  const handleMouseLeave = () => {
    // Clear timeout if still pending
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    
    // Stop all sounds immediately
    stopAllChipSounds();
    setIsHovered(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      stopAllChipSounds();
    };
  }, []);

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    try {
      event.dataTransfer.setData('application/json', JSON.stringify(song));
      event.dataTransfer.effectAllowed = 'copy';
    } catch (error) {
      console.error('Unable to attach song data to drag event', error);
    }
    setIsHovered(true);
  };

  const handleDragEnd = () => {
    setIsHovered(false);
    stopAllChipSounds();
  };

  const handlePlayClick = () => {
    chipSounds.click();
    onPlay(song);
  };

  const handleDownload = async (event?: React.MouseEvent<HTMLButtonElement>) => {
    event?.stopPropagation();
    if (isDownloading) return;
    chipSounds.select();
    setIsDownloading(true);
    try {
      await downloadSongFile(song);
    } catch (error) {
      console.error('Error downloading song:', error);
      alert('Unable to download this track. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      className="group relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      title="Drag to add this song to your queue"
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
        <div className="absolute top-4 right-4 z-30 flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleDownload}
            disabled={isDownloading}
            className="glass-strong bg-black/50 hover:bg-black/70 rounded-full h-9 w-9 text-white"
            title="Download track"
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </Button>
        </div>
        {/* Glowing colorful border on hover - around entire card */}
        {isHovered && (
          <div
            className="absolute -inset-1 rounded-2xl pointer-events-none z-0"
            style={{
              background: `linear-gradient(135deg, ${textColor.color}20, ${textColor.color}10)`,
              border: `2px solid ${textColor.color}`,
              boxShadow: `
                0 0 20px ${textColor.color}80,
                0 0 40px ${textColor.color}60,
                0 0 60px ${textColor.color}40,
                inset 0 0 20px ${textColor.color}30
              `,
              animation: 'glowPulse 2s ease-in-out infinite',
            }}
          />
        )}
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
                onClick={handlePlayClick}
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
    </div>
  );
}