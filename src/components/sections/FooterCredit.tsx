// src/components/sections/FooterCredit.tsx
'use client';
import { motion } from 'motion/react';
import { Star, ArrowUp } from 'lucide-react';

interface FooterCreditProps {
  onAdminClick?: () => void;
}

export function FooterCredit({ onAdminClick }: FooterCreditProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative py-16 px-6 text-center bg-gradient-to-t from-[#0e020a] to-[#0a0209] overflow-hidden">
      {/* Decorative divider top */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A24B]/30 to-transparent" />
      
      <div className="max-w-md mx-auto relative z-10 flex flex-col items-center gap-6">
        
        {/* Balinese closing sloka or greeting */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col items-center px-4"
        >
          <div className="text-[#C9A24B]/40 flex gap-1.5 mb-2">
            <Star className="w-3 h-3 fill-[#C9A24B]" />
            <Star className="w-4.5 h-4.5 fill-[#C9A24B]" />
            <Star className="w-3 h-3 fill-[#C9A24B]" />
          </div>
          
          <p className="font-serif text-sm italic text-[#FDF6E9]/90 leading-relaxed font-light">
            "Suku kerti pawiwahan puniki mamargi antar, ngiring sareng sami ngaturang parama suksma."
          </p>

        </motion.div>

        {/* Floating action: back to top */}
        <button
          onClick={scrollToTop}
          className="w-10 h-10 rounded-full bg-white/5 border-2 border-white/10 text-[#C9A24B] flex items-center justify-center hover:bg-[#C9A24B]/10 hover:border-[#C9A24B] transition-all active:scale-90 cursor-pointer"
          title="Kembali ke atas"
        >
          <ArrowUp className="w-4 h-4" />
        </button>

        {/* Designer Credits */}
        <div className="mt-6 flex flex-col items-center">
          <p className="text-[10px] text-[#FDF6E9]/45 font-sans tracking-wide">
            © 2026 All Rights Reserved.
          </p>
          
          <button
            onClick={onAdminClick}
            className="font-black font-sans text-xs tracking-wider uppercase mt-1.5 cursor-pointer active:scale-95 transition-transform border-none outline-none"
            style={{
              background: 'linear-gradient(90deg, #ff0000, #ff7700, #ffff00, #00ff00, #0000ff, #8b00ff, #ff0000)',
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'rainbow-shift 3s linear infinite',
            }}
            title="Sistem Administrator"
          >
            Dipersembahkan oleh Saputra Developer
          </button>
        </div>

      </div>
    </footer>
  );
}
