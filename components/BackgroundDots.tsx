'use client';

import { useEffect, useRef } from 'react';

export function BackgroundDots() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    // Music symbols to use
    const musicSymbols = ['♪', '♫', '♬', '♭', '♯', '𝄞', '𝄢', '𝄐', '𝄑', '𝄒', '𝄓', '𝄔', '𝄕', '𝄖', '𝄗', '𝄘', '𝄙', '𝄚', '𝄛', '𝄜', '𝄝', '𝄞', '𝄟'];
    
    // Generate random music symbols
    const symbols: Array<{ x: number; y: number; symbol: string; size: number; opacity: number; speed: number; rotation: number; rotationSpeed: number }> = [];
    const symbolCount = 80;

    for (let i = 0; i < symbolCount; i++) {
      symbols.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        symbol: musicSymbols[Math.floor(Math.random() * musicSymbols.length)],
        size: Math.random() * 45 + 40, // Font size between 20-55
        opacity: Math.random() * 0.6 + 0.15,
        speed: Math.random() * 0.6 + 0.05,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      symbols.forEach((symbol) => {
        symbol.y += symbol.speed;
        symbol.rotation += symbol.rotationSpeed;
        
        if (symbol.y > canvas.height + 50) {
          symbol.y = -50;
          symbol.x = Math.random() * canvas.width;
        }

        ctx.save();
        ctx.translate(symbol.x, symbol.y);
        ctx.rotate(symbol.rotation);
        
        // Use colorful gradients for symbols
        const gradient = ctx.createLinearGradient(-symbol.size/2, -symbol.size/2, symbol.size/2, symbol.size/2);
        const colors = [
          'rgba(255, 110, 199,',
          'rgba(255, 235, 110,',
          'rgba(110, 255, 199,',
          'rgba(159, 110, 255,',
          'rgba(255, 159, 110,',
        ];
        const color = colors[Math.floor(symbol.x / canvas.width * colors.length) % colors.length];
        
        gradient.addColorStop(0, `${color}${symbol.opacity})`);
        gradient.addColorStop(1, `${color}${symbol.opacity * 0.5})`);
        
        ctx.font = `${symbol.size}px Arial`;
        ctx.fillStyle = gradient;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(symbol.symbol, 0, 0);
        
        ctx.restore();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.4 }}
    />
  );
}

