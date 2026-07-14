// src/components/sections/HeroCouple.tsx
'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Instagram, Star, Heart } from 'lucide-react';
import { SiteConfig } from '../../types/invitation';

interface HeroCoupleProps {
  config: SiteConfig;
}

export function HeroCouple({ config }: HeroCoupleProps) {
  const { groom, bride } = config.couple;
  const { quotes, couple2, isJointWedding, quotes2 } = config;

  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  // Background elements translate at different ratios to produce deep parallax multi-layers
  const slowBgY = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  const fastBgY = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  const ornamentRotate = useTransform(scrollYProgress, [0, 1], [-10, 10]);

  // Render a single couple block
  const renderCoupleBlock = (
    c1: typeof config.couple.groom,
    c2: typeof config.couple.bride,
    idx: number,
    groomImg: string,
    brideImg: string
  ) => {
    return (
      <div key={idx} className="flex flex-col gap-10">
        {idx > 0 && (
          <div className="flex flex-col items-center justify-center py-10 relative">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#C9A24B]/40 to-transparent" />
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="relative z-10 w-12 h-12 rounded-full bg-[#2a1324] border-2 border-[#C9A24B] flex items-center justify-center text-[#C9A24B]"
            >
              <Heart className="w-5 h-5 fill-[#C9A24B]/20" />
            </motion.div>
          </div>
        )}

        <div className="text-center mb-4">
          <span className="text-[10px] tracking-[0.25em] uppercase text-[#C9A24B] font-extrabold font-sans">
            Pasangan Pernikahan Ke-{idx + 1}
          </span>
          <h2 className="font-serif text-2xl font-black text-amber-200 uppercase mt-1">
            {c1.nickname} & {c2.nickname}
          </h2>
        </div>

        {/* Groom Section */}
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
        >
          {/* Avatar frame */}
          <div className="relative w-36 h-52 rounded-full p-1 bg-[#C9A24B] shadow-2xl mb-6">
            <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#2a1324] bg-[#2a1324] flex items-center justify-center">
              <img
                src={groomImg}
                alt={`${c1.nickname} Avatar`}
                className="w-full h-full object-cover filter sepia-[0.1] hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Corner ornament stars */}
            <div className="absolute -top-1 -right-1 text-[#C9A24B] animate-pulse"><Star className="w-4 h-4 fill-[#C9A24B]" /></div>
          </div>

          <h3 className="font-serif text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            {c1.fullName}
          </h3>
          <p className="text-xs text-[#C9A24B] font-extrabold tracking-widest uppercase mt-1">
            ({c1.nickname})
          </p>
          
          <div className="h-[2px] w-16 bg-[#C9A24B]/40 my-3.5" />
          
          <p className="text-xs text-[#FDF6E9]/80 leading-relaxed font-sans font-medium text-center">
            {c1.childInfo || "Putra pertama"} dari pasangan:<br />
            <span className="font-bold text-white">{c1.fatherName}</span><br />
            & <span className="font-bold text-white">{c1.motherName}</span>
          </p>

          {c1.instagram && c1.instagram !== 'privat' && (
            <a
              href={`https://instagram.com/${c1.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-[#C9A24B]/40 text-xs font-sans font-bold text-[#C9A24B] tracking-wide transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Instagram className="w-3.5 h-3.5 text-[#C9A24B]" />
              <span>@{c1.instagram}</span>
            </a>
          )}
        </motion.div>

        {/* Dynamic elegant connector */}
        <div className="flex items-center justify-center gap-4 py-2">
          <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-[#C9A24B]" />
          <span className="font-serif text-3xl italic text-[#C9A24B] font-black">&</span>
          <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-[#C9A24B]" />
        </div>

        {/* Bride Section */}
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
        >
          {/* Avatar frame */}
          <div className="relative w-36 h-52 rounded-full p-1 bg-[#C9A24B] shadow-2xl mb-6">
            <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#2a1324] bg-[#2a1324] flex items-center justify-center">
              <img
                src={brideImg}
                alt={`${c2.nickname} Avatar`}
                className="w-full h-full object-cover filter sepia-[0.1] hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Corner ornament stars */}
            <div className="absolute -bottom-1 -left-1 text-[#C9A24B] animate-pulse"><Star className="w-4 h-4 fill-[#C9A24B]" /></div>
          </div>

          <h3 className="font-serif text-2xl sm:text-3xl font-black text-white tracking-tight uppercase text-center">
            {c2.fullName}
          </h3>
          <p className="text-xs text-[#C9A24B] font-extrabold tracking-widest uppercase mt-1">
            ({c2.nickname})
          </p>
          
          <div className="h-[2px] w-16 bg-[#C9A24B]/40 my-3.5" />
          
          <p className="text-xs text-[#FDF6E9]/80 leading-relaxed font-sans font-medium text-center">
            {c2.childInfo || "Putri kedua"} dari pasangan:<br />
            <span className="font-bold text-white">{c2.fatherName}</span><br />
            & <span className="font-bold text-white">{c2.motherName}</span>
          </p>

          {c2.instagram && c2.instagram !== 'privat' && (
            <a
              href={`https://instagram.com/${c2.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-[#C9A24B]/40 text-xs font-sans font-bold text-[#C9A24B] tracking-wide transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Instagram className="w-3.5 h-3.5 text-[#C9A24B]" />
              <span>@{c2.instagram}</span>
            </a>
          )}
        </motion.div>
      </div>
    );
  };

  return (
    <section 
      ref={sectionRef}
      id="section-couple" 
      className="relative py-20 px-6 text-center overflow-hidden bg-gradient-to-b from-[#1a0b16] via-[#2a1324] to-[#1a0b16]"
    >
      {/* Decorative Traditional Border lines */}
      <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-[#C9A24B] to-transparent opacity-60 z-10" />
      
      {/* Bali mandala or background blur (parallax slow) */}
      <motion.div 
        style={{ y: fastBgY }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#C9A24B]/5 blur-3xl pointer-events-none" 
      />

      {/* Layered concentric golden geometric mandala background (parallax rotate & slow scroll) */}
      <motion.div 
        style={{ y: slowBgY, rotate: ornamentRotate }}
        className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full border border-[#C9A24B]/10 flex items-center justify-center pointer-events-none z-0 opacity-40"
      >
        <div className="w-[420px] h-[420px] rounded-full border-2 border-dashed border-[#C9A24B]/5 flex items-center justify-center">
          <div className="w-[300px] h-[300px] rounded-full border border-[#C9A24B]/10 flex items-center justify-center">
            <div className="w-[180px] h-[180px] rounded-full border border-[#C9A24B]/15" />
          </div>
        </div>
      </motion.div>

      {/* Traditional sloka / quote */}
      <motion.div
        className="max-w-md mx-auto mb-16 px-4 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1 }}
      >
        <span className="inline-block text-[#C9A24B] text-lg mb-2 font-serif font-black tracking-widest">ꦎꦀꦱꦮꦱꦠꦪꦱꦠꦸ</span> {/* Sanskrit Om Swastyastu script */}
        <p className="font-serif text-sm italic leading-relaxed text-[#FDF6E9] mb-4 font-light">
          "{quotes.text}"
        </p>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#C9A24B] font-extrabold font-sans">
          — {quotes.source}
        </p>

        {isJointWedding && quotes2 && (
          <div className="mt-6 pt-6 border-t border-white/5">
            <p className="font-serif text-sm italic leading-relaxed text-[#FDF6E9] mb-4 font-light">
              "{quotes2.text}"
            </p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#C9A24B] font-extrabold font-sans">
              — {quotes2.source}
            </p>
          </div>
        )}
      </motion.div>

      {/* Main Couple Introductions */}
      <div className="max-w-md mx-auto flex flex-col gap-16 relative z-10">
        {renderCoupleBlock(
          groom,
          bride,
          0,
          config.groomPhotoUrl || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
          config.bridePhotoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
        )}

        {isJointWedding && couple2 && renderCoupleBlock(
          couple2.groom,
          couple2.bride,
          1,
          config.groom2PhotoUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
          config.bride2PhotoUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80"
        )}
      </div>
    </section>
  );
}
