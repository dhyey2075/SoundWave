'use client';

import { useState } from 'react';
import { Play, Pause, X } from 'lucide-react';
import { Song } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { chipSounds } from '@/lib/sounds';

interface PlaylistSongRowProps {
  song: Song;
  isPlaying: boolean;
  isActive: boolean;
  onPlay: (song: Song) => void;
  onRemove: (songId: string) => void;
}

export function PlaylistSongRow({ song, isPlaying, isActive, onPlay, onRemove }: PlaylistSongRowProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handlePlay = () => {
    chipSounds.click();
    onPlay(song);
  };

  const handleRemove = () => {
    chipSounds.click();
    onRemove(song.id);
  };

  return (
    <div
      className={`
        glass-strong rounded-xl p-4 flex items-center gap-4
        transition-all duration-300
        ${isActive && isPlaying ? 'ring-2 ring-primary/50 bg-primary/10' : ''}
        ${isHovered ? 'bg-white/5 shadow-lg' : ''}
        hover:bg-white/5 cursor-pointer
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handlePlay}
    >
      {/* Album Art */}
      <div className="relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-white/10">
        <img
          src={song.image}
          alt={song.title}
          className="h-full w-full object-cover"
        />
        {isActive && isPlaying && (
          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          </div>
        )}
      </div>

      {/* Song Info */}
      <div className="flex-1 min-w-0">
        <h3
          className={`
            font-semibold text-base truncate
            ${isActive ? 'text-primary' : 'text-foreground'}
            transition-colors
          `}
        >
          {song.title}
        </h3>
        <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {song.album} {song.year ? `• ${song.year}` : ''}
        </p>
      </div>

      {/* Play/Pause Button */}
      <Button
        size="icon"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          handlePlay();
        }}
        className={`
          rounded-full flex-shrink-0
          ${isActive && isPlaying ? 'bg-primary/20 hover:bg-primary/30' : 'glass hover:bg-white/10'}
        `}
        title={isActive && isPlaying ? 'Pause' : 'Play'}
      >
        {isActive && isPlaying ? (
          <Pause className="h-5 w-5" />
        ) : (
          <Play className="h-5 w-5 ml-0.5" />
        )}
      </Button>

      {/* Remove Button */}
      <Button
        size="icon"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          handleRemove();
        }}
        className="rounded-full flex-shrink-0 glass hover:bg-red-500/20 text-red-400"
        title="Remove from playlist"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

