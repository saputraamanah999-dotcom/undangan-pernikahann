// src/components/audio/MusicPlayer.tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import { Music, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'motion/react';

interface MusicPlayerProps {
  url: string;
  forcePlay: boolean;
}

export function MusicPlayer({ url, forcePlay }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5; // Soft ambient volume
    }
  }, []);

  useEffect(() => {
    if (forcePlay && audioRef.current) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn("Autoplay block bypass failed or interrupted:", err);
          setIsPlaying(false);
        });
    }
  }, [forcePlay]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn("Manual play failed:", err);
        });
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <audio ref={audioRef} src={url} loop preload="auto" />
      
      <motion.button
        onClick={togglePlay}
        id="btn-music-toggle"
        className="relative flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow-xl border border-amber-300/40 cursor-pointer active:scale-95 transition-transform"
        whileHover={{ scale: 1.05 }}
        animate={isPlaying ? { rotate: 360 } : {}}
        transition={isPlaying ? { duration: 6, repeat: Infinity, ease: "linear" } : { duration: 0.2 }}
      >
        {isPlaying ? (
          <Volume2 className="w-5 h-5 text-black" />
        ) : (
          <VolumeX className="w-5 h-5 text-black" />
        )}
        
        {/* Visual audio wave ripples when playing */}
        {isPlaying && (
          <span className="absolute -inset-1 rounded-full border border-amber-400/30 animate-ping pointer-events-none" />
        )}
      </motion.button>
    </div>
  );
}
