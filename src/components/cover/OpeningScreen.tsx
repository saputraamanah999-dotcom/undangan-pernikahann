// src/components/cover/OpeningScreen.tsx
'use client';
import { motion } from 'motion/react';
import { useState } from 'react';
import { Sparkles, Calendar } from 'lucide-react';
import { useNotificationPermission } from '../../hooks/useNotificationPermission';

interface OpeningScreenProps {
  guestName: string;
  preweddingUrl: string;
  coupleNames: string;
  familyLabel?: string;
  onOpen: () => void;
}

export function OpeningScreen({ guestName, preweddingUrl, coupleNames, familyLabel, onOpen }: OpeningScreenProps) {
  const [isOpening, setIsOpening] = useState(false);
  const { requestPermission } = useNotificationPermission();

  const handleOpenClick = async () => {
    setIsOpening(true);
    try {
      await requestPermission();
    } catch (e) {
      console.warn("Permission request failed in gesture:", e);
    }
    // Give a small delay for button active visual scale effect before triggering onOpen
    setTimeout(() => {
      onOpen();
    }, 400);
  };

  return (
    <div className="relative h-dvh w-full overflow-hidden flex items-center justify-center bg-[#1e0a17]">
      {/* Background prewedding image with Ken Burns looping animation */}
      <motion.div
        className="absolute inset-0 h-full w-full"
        initial={{ scale: 1.05 }}
        animate={{ scale: 1.15 }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
      >
        <img
          src={preweddingUrl}
          alt="Prewedding Background"
          className="h-full w-full object-cover opacity-70 filter brightness-[0.75] contrast-[1.05]"
          referrerPolicy="no-referrer"
        />
      </motion.div>

      {/* Elegant dark purple and gold vignette overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#1b0814] via-[#1b0814]/40 to-transparent" />
      <div className="absolute inset-0 bg-black/30" />

      {/* Floating Sparkles and Ornaments */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-[15%] left-[10%] text-amber-300/30"
          animate={{ y: [0, -10, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <Sparkles className="w-8 h-8" />
        </motion.div>
        <motion.div
          className="absolute bottom-[20%] right-[10%] text-amber-300/30"
          animate={{ y: [0, 10, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        >
          <Sparkles className="w-6 h-6" />
        </motion.div>
      </div>

      {/* Content card centered */}
      <div className="relative z-10 flex h-full w-full max-w-md flex-col items-center justify-between py-16 px-6 text-white text-center">
        {/* Top Ornament */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="flex flex-col items-center"
        >
          <span className="text-[10px] tracking-[0.3em] uppercase text-amber-400 font-medium">Om Swastyastu</span>
          <div className="h-[1px] w-12 bg-amber-400/40 mt-2" />
        </motion.div>

        {/* Middle Heading */}
        <div className="flex flex-col items-center my-auto">
          <motion.p
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 0.8, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-xs tracking-[0.4em] uppercase text-amber-300 font-semibold mb-3"
          >
            Pawiwahan Suci
          </motion.p>

          {familyLabel && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-[10px] tracking-[0.2em] uppercase text-[#FDF6E9]/60 font-medium mb-2"
            >
              Keluarga {familyLabel}
            </motion.p>
          )}
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4 }}
            className="font-serif text-5xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-100 mb-2 drop-shadow-lg uppercase leading-none"
          >
            {coupleNames}
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="h-[2px] w-32 bg-[#C9A24B] my-4"
          />

          {/* Invitation Target */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-4 px-6 py-5 rounded-3xl bg-[#FDF6E9] border-[6px] border-[#2a1324] max-w-[320px] shadow-2xl text-[#6B2C55] relative overflow-hidden"
          >
            <div className="absolute top-0 inset-x-0 h-1 bg-[#C9A24B]" />
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B2C55]/60 font-sans font-bold mb-1">Kepada Yth.</p>
            <h2 className="text-xl font-black text-[#6B2C55] font-sans tracking-wide truncate px-2">
              {guestName}
            </h2>
            <div className="h-[2px] w-12 bg-[#C9A24B] mx-auto my-3" />
            <p className="text-[10px] text-[#6B2C55]/80 font-sans font-medium px-1 leading-relaxed">
              Tanpa Mengurangi Rasa Hormat, Kami Mengundang Anda Hadir di Hari Bahagia Kami.
            </p>
          </motion.div>
        </div>

        {/* Bottom Button Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="w-full flex flex-col items-center mt-6"
        >
          <button
            onClick={handleOpenClick}
            disabled={isOpening}
            id="btn-buka-undangan"
            className="relative overflow-hidden group flex items-center gap-2.5 rounded-full bg-[#C9A24B] px-10 py-4 font-sans font-extrabold text-xs tracking-widest uppercase text-white shadow-xl shadow-[#C9A24B]/20 hover:shadow-[#C9A24B]/45 active:scale-95 transition-all duration-300 disabled:opacity-50 cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-white animate-pulse" />
            <span>{isOpening ? 'Membuka...' : 'Buka Undangan'}</span>
            <div className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:animate-shine pointer-events-none" />
          </button>
          
          <p className="text-[9px] text-[#C9A24B]/70 mt-4 tracking-wider uppercase font-sans font-bold">
            Created with heart by Saputra Developer
          </p>
        </motion.div>
      </div>
    </div>
  );
}
