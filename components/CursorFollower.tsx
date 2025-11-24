'use client';

import { useEffect, useRef } from 'react';

export function CursorFollower() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const bgGradientRef = useRef<HTMLDivElement>(null);
  const bgGradient2Ref = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const isVisibleRef = useRef(false);

  useEffect(() => {
    const updatePosition = () => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${mousePosRef.current.x}px`;
        cursorRef.current.style.top = `${mousePosRef.current.y}px`;
        cursorRef.current.style.opacity = isVisibleRef.current ? '1' : '0';
      }
      
      if (bgGradientRef.current) {
        bgGradientRef.current.style.background = `radial-gradient(circle 1000px at ${mousePosRef.current.x}px ${mousePosRef.current.y}px, rgba(255, 110, 199, 0.2) 0%, rgba(255, 235, 110, 0.15) 20%, rgba(110, 255, 199, 0.15) 40%, rgba(159, 110, 255, 0.12) 60%, transparent 80%)`;
        bgGradientRef.current.style.opacity = isVisibleRef.current ? '0.4' : '0';
      }
      
      if (bgGradient2Ref.current) {
        bgGradient2Ref.current.style.background = `radial-gradient(circle 600px at ${mousePosRef.current.x}px ${mousePosRef.current.y}px, rgba(255, 159, 110, 0.15) 0%, rgba(110, 199, 255, 0.12) 30%, transparent 60%)`;
        bgGradient2Ref.current.style.opacity = isVisibleRef.current ? '0.2' : '0';
      }
      
      rafRef.current = null;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
      isVisibleRef.current = true;
      
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(updatePosition);
      }
    };

    const handleMouseLeave = () => {
      isVisibleRef.current = false;
      if (cursorRef.current) {
        cursorRef.current.style.opacity = '0';
      }
      if (bgGradientRef.current) {
        bgGradientRef.current.style.opacity = '0';
      }
      if (bgGradient2Ref.current) {
        bgGradient2Ref.current.style.opacity = '0';
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Main cursor glow - optimized for performance */}
      <div
        ref={cursorRef}
        className="fixed pointer-events-none z-50 will-change-transform"
        style={{
          transform: 'translate(-50%, -50%)',
          transition: 'opacity 0.1s ease-out',
        }}
      >
        <div className="relative w-32 h-32">
          {/* Outer gas cloud - colorful gradient */}
          <div
            className="absolute inset-0 rounded-full blur-2xl"
            style={{
              background: 'radial-gradient(circle, rgba(255, 110, 199, 0.5) 0%, rgba(255, 235, 110, 0.4) 20%, rgba(110, 255, 199, 0.4) 40%, rgba(159, 110, 255, 0.3) 60%, transparent 80%)',
            }}
          />
          {/* Inner core - colorful */}
          <div
            className="absolute inset-0 rounded-full blur-xl"
            style={{
              background: 'radial-gradient(circle, rgba(255, 159, 110, 0.7) 0%, rgba(255, 110, 199, 0.6) 30%, rgba(110, 199, 255, 0.5) 60%, transparent 85%)',
              transform: 'scale(0.5)',
            }}
          />
          {/* Bright center */}
          <div
            className="absolute inset-0 rounded-full blur-lg"
            style={{
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(255, 110, 199, 0.7) 40%, rgba(110, 255, 199, 0.6) 70%, transparent 90%)',
              transform: 'scale(0.25)',
            }}
          />
        </div>
      </div>

      {/* Large background gradient that follows cursor - optimized */}
      <div
        ref={bgGradientRef}
        className="fixed inset-0 pointer-events-none z-0 will-change-background"
        style={{
          transition: 'opacity 0.2s ease-out',
        }}
      />
      
      {/* Secondary gradient layer for depth */}
      <div
        ref={bgGradient2Ref}
        className="fixed inset-0 pointer-events-none z-0 will-change-background"
        style={{
          transition: 'opacity 0.3s ease-out',
        }}
      />
    </>
  );
}

