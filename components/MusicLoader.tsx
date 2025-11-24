'use client';

import { Music2 } from 'lucide-react';

export function MusicLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6">
      <div className="glass-strong rounded-2xl p-8 relative overflow-hidden">
        {/* Animated music notes */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* Central rotating music icon */}
          <Music2 
            className="w-16 h-16 text-primary absolute"
            style={{
              animation: 'spin 2s linear infinite',
            }}
          />
          
          {/* Floating music notes around */}
          <div
            className="absolute top-2 left-2 w-8 h-8 text-pink-400"
            style={{
              animation: 'musicNoteFloat 2s ease-in-out infinite',
              animationDelay: '0s',
            }}
          >
            <Music2 className="w-full h-full" />
          </div>
          
          <div
            className="absolute top-2 right-2 w-6 h-6 text-cyan-400"
            style={{
              animation: 'musicNoteFloat 2s ease-in-out infinite',
              animationDelay: '0.4s',
            }}
          >
            <Music2 className="w-full h-full" />
          </div>
          
          <div
            className="absolute bottom-2 left-4 w-7 h-7 text-yellow-400"
            style={{
              animation: 'musicNoteFloat 2s ease-in-out infinite',
              animationDelay: '0.8s',
            }}
          >
            <Music2 className="w-full h-full" />
          </div>
          
          <div
            className="absolute bottom-2 right-4 w-5 h-5 text-purple-400"
            style={{
              animation: 'musicNoteFloat 2s ease-in-out infinite',
              animationDelay: '1.2s',
            }}
          >
            <Music2 className="w-full h-full" />
          </div>
        </div>
        
        {/* Sound waves equalizer */}
        <div className="flex items-end justify-center gap-1.5 mt-8 h-12">
          {[12, 20, 16, 24, 18, 22, 14].map((height, i) => (
            <div
              key={i}
              className="w-2 rounded-full bg-gradient-to-t from-primary via-pink-400 to-cyan-400"
              style={{
                height: `${height}px`,
                animation: `soundWave 1.2s ease-in-out infinite`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>
      
      <p className="text-muted-foreground text-sm animate-pulse flex items-center gap-2">
        <span className="inline-block">🎵</span>
        Finding your music...
        <span className="inline-block">🎵</span>
      </p>
    </div>
  );
}

