import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

interface Particle {
  id: number;
  x: number;
  y: number;
  char: string;
  life: number;
}

export const MouseTrail: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const { theme } = useTheme();
  const chars = ['+', '×', '✧', '•', '▫'];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (Math.random() > 0.3) {
        const newParticle: Particle = {
          id: Date.now() + Math.random(),
          x: e.clientX,
          y: e.clientY,
          char: chars[Math.floor(Math.random() * chars.length)],
          life: 1,
        };
        setParticles(prev => [...prev.slice(-15), newParticle]);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => 
        prev
          .map(p => ({ ...p, life: p.life - 0.05 }))
          .filter(p => p.life > 0)
      );
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {particles.map(p => (
        <span
          key={p.id}
          className="absolute font-mono text-sm transition-transform duration-75"
          style={{
            left: p.x,
            top: p.y,
            color: theme.primary,
            opacity: p.life,
            transform: `translate(-50%, -50%) scale(${p.life * 1.5})`,
            textShadow: `0 0 5px ${theme.primary}`,
          }}
        >
          {p.char}
        </span>
      ))}
    </div>
  );
};
