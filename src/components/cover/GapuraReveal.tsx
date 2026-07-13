// src/components/cover/GapuraReveal.tsx
'use client';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface GapuraRevealProps {
  isRevealing: boolean;
  gapuraLeftUrl: string;
  gapuraRightUrl: string;
  onComplete: () => void;
}

export function GapuraReveal({ isRevealing, onComplete }: GapuraRevealProps) {
  const [shouldRender, setShouldRender] = useState(isRevealing);

  useEffect(() => {
    if (isRevealing) {
      setShouldRender(true);
      // Automatically complete the opening transition after 2.0 seconds
      const timer = setTimeout(() => {
        onComplete();
        setShouldRender(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isRevealing, onComplete]);

  if (!shouldRender) return null;

  return (
    <AnimatePresence>
      {isRevealing && (
        <motion.div
          className="fixed inset-0 z-50 flex overflow-hidden bg-[#0d0309] pointer-events-none"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          {/* Left Curtain Panel */}
          <motion.div
            className="relative w-1/2 h-full shadow-2xl overflow-hidden"
            style={{ originX: 0 }}
            initial={{ x: 0, scaleX: 1, skewY: 0 }}
            animate={{ 
              x: '-102%', 
              scaleX: 0.15, 
              skewY: -6,
              filter: 'brightness(0.3)'
            }}
            transition={{ duration: 1.8, ease: [0.77, 0, 0.175, 1], delay: 0.15 }}
          >
            {/* Rich Velvet Deep Red Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#44020a] via-[#850a18] to-[#5a050e]" />
            
            {/* Vertical drapery fold simulation */}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(0,0,0,0.35)_10%,rgba(255,255,255,0.08)_20%,transparent_30%,rgba(0,0,0,0.35)_40%,rgba(255,255,255,0.08)_50%,transparent_60%,rgba(0,0,0,0.35)_70%,rgba(255,255,255,0.08)_80%,transparent_90%,rgba(0,0,0,0.35)_100%)]" />
            
            {/* Warm dark bottom vignetting */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            
            {/* Gilded golden trim on opening edge */}
            <div className="absolute inset-y-0 right-0 w-[6px] bg-gradient-to-b from-[#C9A24B] via-[#FFE294] to-[#C9A24B] shadow-[0_0_15px_rgba(201,162,75,0.5)]" />
            
            {/* Traditional Balinese Golden Pattern Overlay Details */}
            <div className="absolute inset-y-0 right-3 w-16 bg-[radial-gradient(ellipse_at_right,rgba(201,162,75,0.15)_0%,transparent_70%)]" />
            
            {/* Golden tasselled rope visual */}
            <motion.div 
              className="absolute right-6 top-1/3 w-3 h-32 rounded-full border-r-2 border-[#C9A24B]/60 bg-gradient-to-b from-transparent to-[#C9A24B]/80"
              animate={{ rotate: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>

          {/* Right Curtain Panel */}
          <motion.div
            className="relative w-1/2 h-full shadow-2xl overflow-hidden"
            style={{ originX: 1 }}
            initial={{ x: 0, scaleX: 1, skewY: 0 }}
            animate={{ 
              x: '102%', 
              scaleX: 0.15, 
              skewY: 6,
              filter: 'brightness(0.3)'
            }}
            transition={{ duration: 1.8, ease: [0.77, 0, 0.175, 1], delay: 0.15 }}
          >
            {/* Rich Velvet Deep Red Gradient */}
            <div className="absolute inset-0 bg-gradient-to-l from-[#44020a] via-[#850a18] to-[#5a050e]" />
            
            {/* Vertical drapery fold simulation */}
            <div className="absolute inset-0 bg-[linear-gradient(270deg,transparent_0%,rgba(0,0,0,0.35)_10%,rgba(255,255,255,0.08)_20%,transparent_30%,rgba(0,0,0,0.35)_40%,rgba(255,255,255,0.08)_50%,transparent_60%,rgba(0,0,0,0.35)_70%,rgba(255,255,255,0.08)_80%,transparent_90%,rgba(0,0,0,0.35)_100%)]" />
            
            {/* Warm dark bottom vignetting */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            
            {/* Gilded golden trim on opening edge */}
            <div className="absolute inset-y-0 left-0 w-[6px] bg-gradient-to-b from-[#C9A24B] via-[#FFE294] to-[#C9A24B] shadow-[0_0_15px_rgba(201,162,75,0.5)]" />
            
            {/* Traditional Balinese Golden Pattern Overlay Details */}
            <div className="absolute inset-y-0 left-3 w-16 bg-[radial-gradient(ellipse_at_left,rgba(201,162,75,0.15)_0%,transparent_70%)]" />

            {/* Golden tasselled rope visual */}
            <motion.div 
              className="absolute left-6 top-1/3 w-3 h-32 rounded-full border-l-2 border-[#C9A24B]/60 bg-gradient-to-b from-transparent to-[#C9A24B]/80"
              animate={{ rotate: [0, 4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>

          {/* Elegant golden shimmer glow in the middle seam */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex flex-col items-center text-[#C9A24B]">
              <motion.div
                animate={{ scale: [1, 1.25, 1], opacity: [0.9, 1, 0.9] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                <Sparkles className="w-14 h-14 text-[#C9A24B] filter drop-shadow-[0_0_15px_rgba(201,162,75,0.9)]" />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
