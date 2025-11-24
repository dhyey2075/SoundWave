'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export function CursorFollower() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const isVisibleRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const colors = [
      'rgba(255, 110, 199,',
      'rgba(255, 235, 110,',
      'rgba(110, 255, 199,',
      'rgba(159, 110, 255,',
      'rgba(255, 159, 110,',
      'rgba(110, 199, 255,',
    ];

    const createParticle = (x: number, y: number, velocity: { x: number; y: number }) => {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const life = 0.8 + Math.random() * 0.4;
      
      particlesRef.current.push({
        x,
        y,
        vx: velocity.x + (Math.random() - 0.5) * 0.5,
        vy: velocity.y + (Math.random() - 0.5) * 0.5,
        life: life,
        maxLife: life,
        size: 2 + Math.random() * 3,
        color,
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.95; // Friction
        particle.vy *= 0.95;
        particle.life -= 0.02;

        if (particle.life > 0) {
          const alpha = (particle.life / particle.maxLife) * 0.6;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = `${particle.color}${alpha})`;
          ctx.fill();
          
          // Add glow effect
          ctx.shadowBlur = 10;
          ctx.shadowColor = particle.color.replace('rgba', 'rgba').replace(')', ', 0.8)');
          ctx.fill();
          ctx.shadowBlur = 0;
          
          return true;
        }
        return false;
      });

      // Create trail particles
      if (isVisibleRef.current) {
        const dx = mousePosRef.current.x - lastMousePosRef.current.x;
        const dy = mousePosRef.current.y - lastMousePosRef.current.y;
        const speed = Math.sqrt(dx * dx + dy * dy);
        
        if (speed > 0.5) {
          // Create particles along the trail
          const steps = Math.min(Math.floor(speed / 2), 3);
          for (let i = 0; i < steps; i++) {
            const t = i / steps;
            const x = lastMousePosRef.current.x + dx * t;
            const y = lastMousePosRef.current.y + dy * t;
            createParticle(x, y, { x: -dx * 0.1, y: -dy * 0.1 });
          }
        }
        
        // Draw main cursor with smooth trail
        const gradient = ctx.createRadialGradient(
          mousePosRef.current.x,
          mousePosRef.current.y,
          0,
          mousePosRef.current.x,
          mousePosRef.current.y,
          40
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(0.3, 'rgba(255, 110, 199, 0.2)');
        gradient.addColorStop(0.6, 'rgba(110, 255, 199, 0.15)');
        gradient.addColorStop(1, 'transparent');
        
        ctx.beginPath();
        ctx.arc(mousePosRef.current.x, mousePosRef.current.y, 40, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Inner bright dot
        ctx.beginPath();
        ctx.arc(mousePosRef.current.x, mousePosRef.current.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
      }

      lastMousePosRef.current = { ...mousePosRef.current };
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
      isVisibleRef.current = true;
      
      if (!animationFrameRef.current) {
        animate();
      }
    };

    const handleMouseLeave = () => {
      isVisibleRef.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    // Start animation
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}

