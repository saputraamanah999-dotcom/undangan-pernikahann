// src/components/sections/LiveVisitorBadge.tsx
'use client';
import { motion } from 'motion/react';
import { useLiveVisitors } from '../../hooks/useLiveVisitors';
import { Users } from 'lucide-react';

export function LiveVisitorBadge() {
  const visitorsCount = useLiveVisitors();

  return (
    <div className="fixed top-3 left-3 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, x: -20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 border border-[#C9A24B]/30 shadow-lg text-white backdrop-blur-sm"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="font-mono text-xs font-bold text-emerald-400">
          {visitorsCount}
        </span>
        <span className="text-[9px] uppercase tracking-wider text-[#C9A24B] font-sans font-black">
          Online
        </span>
      </motion.div>
    </div>
  );
}