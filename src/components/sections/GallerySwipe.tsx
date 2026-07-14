// src/components/sections/GallerySwipe.tsx
'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Photo } from '../../types/invitation';
import { Sparkles, X, ChevronLeft, ChevronRight, Grid3X3, Rows3 } from 'lucide-react';
import { triggerFireworks } from '../ui/FireworksEffect';

interface GallerySwipeProps {
  photos: Photo[];
}

function MarqueeRow({ photos, direction, onSelect, duration = 25 }: {
  photos: Photo[];
  direction: 'left' | 'right';
  onSelect: (photoUrl: string) => void;
  duration?: number;
}) {
  if (!photos || photos.length === 0) return null;
  
  // Quadruple the array to ensure seamless marquee loops regardless of screen size
  const loop = [...photos, ...photos, ...photos, ...photos];

  return (
    <div className="overflow-hidden py-3 select-none">
      <motion.div
        className="flex gap-4 w-max"
        animate={{ x: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%'] }}
        transition={{
          duration: duration,
          repeat: Infinity,
          ease: 'linear',
          disableHardwareAcceleration: false
        }}
      >
        {loop.map((p, i) => (
          <motion.button
            key={`${p.id}-${i}`}
            onClick={() => onSelect(p.url)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl border-4 border-[#C9A24B]/30 hover:border-[#C9A24B] shadow-lg relative cursor-pointer group"
          >
            <img
              src={p.url}
              className="h-full w-full object-cover filter brightness-90 group-hover:brightness-100 transition-all duration-300"
              alt="Gallery item"
              referrerPolicy="no-referrer"
              loading="lazy"
              draggable={false}
            />
            {/* Soft gold internal border shine */}
            <div className="absolute inset-1.5 rounded-xl border border-[#C9A24B]/10 pointer-events-none group-hover:border-[#C9A24B]/35 transition-all duration-300" />
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}

export function GallerySwipe({ photos }: GallerySwipeProps) {
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isAlbumView, setIsAlbumView] = useState(false);

  if (!photos || photos.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500 text-xs">
        Memuat Galeri Foto...
      </div>
    );
  }

  // Categorize photos into 5 rows based on orientation or distribute them if not specified
  const row1: Photo[] = [];
  const row2: Photo[] = [];
  const row3: Photo[] = [];
  const row4: Photo[] = [];
  const row5: Photo[] = [];

  photos.forEach((p, idx) => {
    if (p.orientation === 'left') {
      row1.push(p);
    } else if (p.orientation === 'right') {
      row2.push(p);
    } else if (p.orientation === 'row3') {
      row3.push(p);
    } else if (p.orientation === 'row4') {
      row4.push(p);
    } else if (p.orientation === 'row5') {
      row5.push(p);
    } else {
      const mod = idx % 5;
      if (mod === 0) row1.push(p);
      else if (mod === 1) row2.push(p);
      else if (mod === 2) row3.push(p);
      else if (mod === 3) row4.push(p);
      else row5.push(p);
    }
  });

  // Ensure no row is empty if we have at least one photo overall
  if (photos.length > 0) {
    if (row1.length === 0) row1.push(photos[0]);
    if (row2.length === 0) row2.push(photos[1 % photos.length]);
    if (row3.length === 0) row3.push(photos[2 % photos.length]);
    if (row4.length === 0) row4.push(photos[3 % photos.length]);
    if (row5.length === 0) row5.push(photos[4 % photos.length]);
  }

  // Uniform visual speed: duration proportional to photo count so all rows move at same pixels/sec
  const SECONDS_PER_PHOTO = 7;
  const getDuration = (count: number) => Math.max(6, SECONDS_PER_PHOTO * count);

  const handleSelect = (url: string) => {
    setSelectedUrl(url);
    const index = photos.findIndex(p => p.url === url);
    setCurrentIndex(index);
    if (index === photos.length - 1) {
      triggerFireworks({ x: 50, y: 35 });
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newIndex = currentIndex === 0 ? photos.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    setSelectedUrl(photos[newIndex].url);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newIndex = currentIndex === photos.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
    setSelectedUrl(photos[newIndex].url);
    
    if (newIndex === photos.length - 1) {
      triggerFireworks({ x: 50, y: 35 });
      setTimeout(() => triggerFireworks({ x: 35, y: 40 }), 250);
      setTimeout(() => triggerFireworks({ x: 65, y: 30 }), 500);
    }
  };

  const handleClose = () => {
    setSelectedUrl(null);
    triggerFireworks({ x: 50, y: 30 });
    setTimeout(() => triggerFireworks({ x: 30, y: 25 }), 200);
    setTimeout(() => triggerFireworks({ x: 70, y: 35 }), 400);
  };

  return (
    <section id="section-gallery" className="relative py-20 bg-gradient-to-b from-[#0d0309] via-[#1a0b16] to-[#0d0309] overflow-hidden">
      
      {/* Decorative Golden Stars / Header */}
      <div className="max-w-md mx-auto text-center px-6 mb-10 relative z-10">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#C9A24B]/10 border border-[#C9A24B]/30 text-[#C9A24B] mx-auto mb-4">
          <Sparkles className="w-5 h-5 text-[#C9A24B]" />
        </div>
        <h2 className="font-serif text-3xl font-black text-white tracking-tight uppercase">
          Galeri Kebahagiaan
        </h2>
        <div className="h-[2px] w-12 bg-[#C9A24B] mx-auto mt-3.5 mb-3" />
        <p className="text-xs text-[#FDF6E9]/75 font-sans font-medium max-w-xs mx-auto leading-relaxed">
          Setiap momen adalah goresan cinta yang abadi. Geser baris foto, tap untuk memperbesar.
        </p>
      </div>

      {/* Content: Marquee or Album Grid */}
      <div className="relative z-10 max-w-lg mx-auto px-4">
        {!isAlbumView ? (
          /* Sliding marquee rows */
          <div className="flex flex-col gap-1 w-full">
            <MarqueeRow photos={row1} direction="left" onSelect={handleSelect} duration={getDuration(row1.length)} />
            <MarqueeRow photos={row2} direction="right" onSelect={handleSelect} duration={getDuration(row2.length)} />
            <MarqueeRow photos={row3} direction="left" onSelect={handleSelect} duration={getDuration(row3.length)} />
            <MarqueeRow photos={row4} direction="right" onSelect={handleSelect} duration={getDuration(row4.length)} />
            <MarqueeRow photos={row5} direction="left" onSelect={handleSelect} duration={getDuration(row5.length)} />
          </div>
        ) : (
          /* Static Album Grid */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-3"
          >
            {photos.map((p, idx) => (
              <motion.button
                key={p.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                onClick={() => handleSelect(p.url)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="aspect-square overflow-hidden rounded-2xl border-2 border-[#C9A24B]/25 hover:border-[#C9A24B] shadow-lg relative cursor-pointer group"
              >
                <img
                  src={p.url}
                  className="h-full w-full object-cover filter brightness-90 group-hover:brightness-100 transition-all duration-300"
                  alt={`Foto ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  draggable={false}
                />
                <div className="absolute inset-2 rounded-xl border border-[#C9A24B]/10 pointer-events-none group-hover:border-[#C9A24B]/30 transition-all duration-300" />
                {/* Photo number badge */}
                <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-0.5 text-[9px] font-mono font-bold text-[#C9A24B]">
                  {idx + 1}
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>

      {/* View toggle & hint text */}
      <div className="max-w-md mx-auto text-center mt-6 mb-2 px-6 relative z-10">
        <p className="text-[10px] text-[#FDF6E9]/45 font-sans font-medium tracking-wide">
          Ketuk foto untuk memperbesar
        </p>
        <button
          onClick={() => setIsAlbumView(!isAlbumView)}
          className="inline-flex items-center gap-1.5 text-[10px] text-[#C9A24B]/70 font-sans font-bold uppercase tracking-wider cursor-pointer hover:text-[#C9A24B] transition-colors mt-1.5"
        >
          {isAlbumView ? (
            <>
              <Rows3 className="w-3.5 h-3.5" />
              <span>Lihat sebagai Geser</span>
            </>
          ) : (
            <>
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>Lihat sebagai Galeri</span>
            </>
          )}
        </button>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 cursor-zoom-out"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/20 text-white cursor-pointer active:scale-95 transition-transform"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Navigation buttons */}
            <button
              onClick={handlePrev}
              className="absolute left-4 w-11 h-11 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/20 text-white cursor-pointer active:scale-95 transition-transform"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-4 w-11 h-11 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/20 text-white cursor-pointer active:scale-95 transition-transform"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Image display */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 180 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[80vh] max-w-[90vw] rounded-2xl overflow-hidden border border-amber-400/30 shadow-2xl bg-black"
            >
              <img
                src={selectedUrl}
                alt="Selected full size prewedding"
                className="max-h-[80vh] max-w-[90vw] object-contain"
                referrerPolicy="no-referrer"
                draggable={false}
              />
              {/* Golden corner shines inside the frame */}
              <div className="absolute inset-4 border border-amber-400/10 pointer-events-none rounded-xl" />
            </motion.div>
            
            {/* Index Display indicator */}
            <p className="font-mono text-xs text-amber-300 mt-6 tracking-widest uppercase">
              Foto {currentIndex + 1} dari {photos.length}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}