'use client';

import { Music2, Mic, Headphones, Disc } from 'lucide-react';
import { useState, useEffect } from 'react';

const messages = [
  { icon: Mic, text: 'Your band is being created...', color: 'text-pink-400' },
  { icon: Headphones, text: 'The concert is about to start...', color: 'text-cyan-400' },
  { icon: Disc, text: 'Setting up your stage...', color: 'text-yellow-400' },
  { icon: Music2, text: 'Tuning the instruments...', color: 'text-purple-400' },
];

export function AuthLoader() {
  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = messages[currentMessage].icon;

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background gradients */}
      <div className="absolute inset-0">
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(255, 110, 199, 0.4) 0%, transparent 70%)',
            animation: 'pulse 3s ease-in-out infinite',
          }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(110, 255, 199, 0.4) 0%, transparent 70%)',
            animation: 'pulse 3s ease-in-out infinite',
            animationDelay: '1s',
          }}
        />
        <div 
          className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2"
          style={{
            background: 'radial-gradient(circle, rgba(255, 235, 110, 0.4) 0%, transparent 70%)',
            animation: 'pulse 3s ease-in-out infinite',
            animationDelay: '1.5s',
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center gap-8">
        {/* Main icon with rotation */}
        <div className="relative">
          <div className="glass-strong rounded-3xl p-8 relative overflow-hidden">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <CurrentIcon
                className={`w-20 h-20 ${messages[currentMessage].color} transition-all duration-500`}
                style={{
                  animation: 'spin 3s linear infinite',
                  filter: 'drop-shadow(0 0 20px currentColor)',
                }}
              />
              
              {/* Floating music notes around */}
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    top: `${50 + 40 * Math.cos((i * Math.PI) / 2)}%`,
                    left: `${50 + 40 * Math.sin((i * Math.PI) / 2)}%`,
                    transform: 'translate(-50%, -50%)',
                    animation: `musicNoteFloat 2s ease-in-out infinite`,
                    animationDelay: `${i * 0.3}s`,
                  }}
                >
                  <Music2
                    className={`w-6 h-6 ${['text-pink-400', 'text-cyan-400', 'text-yellow-400', 'text-purple-400'][i]}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Animated message */}
        <div className="text-center space-y-4">
          <h2
            key={currentMessage}
            className={`text-2xl md:text-3xl font-bold ${messages[currentMessage].color} transition-all duration-500`}
            style={{
              animation: 'fadeInUp 0.5s ease-out',
              textShadow: '0 0 20px currentColor',
            }}
          >
            {messages[currentMessage].text}
          </h2>
          
          {/* Sound wave equalizer */}
          <div className="flex items-end justify-center gap-1.5 mt-8 h-12">
            {[12, 20, 16, 24, 18, 22, 14, 20, 16].map((height, i) => (
              <div
                key={i}
                className="w-2 rounded-full bg-gradient-to-t from-pink-400 via-cyan-400 to-yellow-400"
                style={{
                  height: `${height}px`,
                  animation: `soundWave 1.2s ease-in-out infinite`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Loading dots */}
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full bg-primary"
              style={{
                animation: 'bounce 1.4s ease-in-out infinite',
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

