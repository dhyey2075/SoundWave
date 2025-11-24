'use client';

import { useState, useEffect } from 'react';
import { WifiOff, CloudOff } from 'lucide-react';

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check initial status only on client
    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);

      const handleOnline = () => {
        setIsOffline(false);
      };
      
      const handleOffline = () => {
        setIsOffline(true);
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // Don't render on server or if online
  if (!mounted || !isOffline) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-strong rounded-3xl p-12 max-w-md mx-4 text-center relative overflow-hidden">
        {/* Animated background glow */}
        <div 
          className="absolute inset-0 rounded-3xl opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(255, 110, 199, 0.3) 0%, rgba(110, 255, 199, 0.2) 50%, transparent 100%)',
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />
        
        <div className="relative z-10">
          {/* Cute offline icon with animation */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              {/* Main icon */}
              <div className="relative w-24 h-24 mx-auto">
                <WifiOff 
                  className="w-full h-full text-pink-400"
                  style={{
                    animation: 'bounce 2s ease-in-out infinite',
                  }}
                />
                
                {/* Floating cloud icon */}
                <CloudOff
                  className="absolute -top-2 -right-2 w-8 h-8 text-cyan-400"
                  style={{
                    animation: 'float 3s ease-in-out infinite',
                    animationDelay: '0.5s',
                  }}
                />
                
                {/* Pulsing rings */}
                <div 
                  className="absolute inset-0 rounded-full border-2 border-pink-400/30"
                  style={{
                    animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
                  }}
                />
                <div 
                  className="absolute inset-0 rounded-full border-2 border-cyan-400/30"
                  style={{
                    animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
                    animationDelay: '0.5s',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Message */}
          <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-pink-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Oops! No Internet
          </h2>
          <p className="text-muted-foreground mb-6">
            Looks like you're offline. Please check your connection and try again.
          </p>

          {/* Animated dots */}
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full bg-gradient-to-r from-pink-400 to-cyan-400"
                style={{
                  animation: 'bounce 1.4s ease-in-out infinite',
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

