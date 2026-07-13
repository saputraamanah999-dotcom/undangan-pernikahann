// src/components/ui/FireworksEffect.tsx
'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Particle {
  id: string;
  x: number;
  y: number;
  color: string;
  dx: number;
  dy: number;
  size: number;
}

interface FireworkBurst {
  id: string;
  x: number;
  y: number;
  particles: Particle[];
}

const COLORS = [
  '#C9A24B', // Gold
  '#FFE294', // Light gold
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#a855f7', // Purple
  '#f43f5e', // Rose
  '#06b6d4', // Cyan
];

export function FireworksEffect() {
  const [bursts, setBursts] = useState<FireworkBurst[]>([]);

  useEffect(() => {
    const handleTrigger = (e: Event) => {
      const customEvent = e as CustomEvent<{ x?: number; y?: number }>;
      const x = customEvent.detail?.x ?? Math.random() * 80 + 10; // percentage
      const y = customEvent.detail?.y ?? Math.random() * 50 + 20; // percentage

      const burstId = Math.random().toString(36).substr(2, 9);
      const particlesCount = 35;
      const particles: Particle[] = [];

      for (let i = 0; i < particlesCount; i++) {
        const angle = (i * 2 * Math.PI) / particlesCount + Math.random() * 0.4;
        const speed = Math.random() * 140 + 60; // radius distance
        const dx = Math.cos(angle) * speed;
        const dy = Math.sin(angle) * speed + 20; // adding gravity bias down
        const size = Math.random() * 5 + 3;
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];

        particles.push({
          id: `${burstId}-p-${i}`,
          x: 0,
          y: 0,
          color,
          dx,
          dy,
          size,
        });
      }

      const newBurst: FireworkBurst = {
        id: burstId,
        x,
        y,
        particles,
      };

      setBursts((prev) => [...prev, newBurst]);

      // Prune burst after animation completes (1.8s)
      setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== burstId));
      }, 1800);
    };

    window.addEventListener('trigger-fireworks', handleTrigger);
    return () => {
      window.removeEventListener('trigger-fireworks', handleTrigger);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
      <AnimatePresence>
        {bursts.map((burst) => (
          <div
            key={burst.id}
            className="absolute"
            style={{ left: `${burst.x}%`, top: `${burst.y}%` }}
          >
            {burst.particles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute rounded-full"
                style={{
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                  boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
                  x: 0,
                  y: 0,
                }}
                initial={{ scale: 1, opacity: 1, x: 0, y: 0 }}
                animate={{
                  x: p.dx,
                  y: p.dy,
                  scale: [1, 1.2, 0],
                  opacity: [1, 0.8, 0],
                }}
                transition={{
                  duration: 1.5,
                  ease: [0.1, 0.8, 0.25, 1],
                }}
              />
            ))}
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Utility function to dispatch the fireworks trigger from anywhere
export function triggerFireworks(detail?: { x?: number; y?: number }) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('trigger-fireworks', { detail }));
  }
}
