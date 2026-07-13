// src/components/ui/WhatsappOrderButton.tsx
'use client';
import { motion } from 'motion/react';

export function WhatsappOrderButton() {
  const waNumber = "6285858922037";
  const message = "Halo, saya sangat tertarik untuk membeli website undangan mewah ini. Bagaimana cara pemesanannya?";
  const encodedMsg = encodeURIComponent(message);
  const waUrl = `https://wa.me/${waNumber}?text=${encodedMsg}`;

  return (
    <div className="fixed bottom-20 left-6 z-40">
      <motion.a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        id="btn-whatsapp-order"
        className="relative flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-xl border border-emerald-400/30 cursor-pointer active:scale-95 transition-transform"
        whileHover={{ scale: 1.05 }}
        title="Pesan Undangan Mewah"
      >
        {/* WhatsApp SVG Icon */}
        <svg 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className="w-5.5 h-5.5 text-white"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.967C16.588 2.023 14.11 1 11.993 1 6.558 1 2.13 5.371 2.127 10.8c-.001 1.721.463 3.4 1.345 4.867l-.415 1.517 1.56-.407.03-.018zM17.486 14.14c-.29-.145-1.716-.847-1.982-.944-.267-.097-.461-.145-.655.145-.194.29-.752.944-.922 1.138-.17.194-.34.218-.63.073-.29-.145-1.226-.452-2.335-1.443-.863-.77-1.446-1.72-1.616-2.011-.17-.29-.018-.447.127-.591.13-.13.29-.34.436-.51.145-.17.194-.291.291-.485.097-.194.048-.364-.024-.51-.073-.145-.655-1.577-.898-2.158-.236-.569-.477-.492-.655-.501-.17-.008-.364-.01-.558-.01-.194 0-.51.073-.776.364-.267.29-1.018.994-1.018 2.423 0 1.43 1.042 2.809 1.188 3.003.145.194 2.051 3.132 4.969 4.387.694.299 1.236.478 1.659.613.698.222 1.334.19 1.836.115.56-.083 1.716-.702 1.959-1.38.242-.68.242-1.26.17-1.38-.073-.121-.267-.194-.558-.34z" />
        </svg>

        {/* Outer green glowing animation */}
        <span className="absolute inset-0 rounded-full border border-emerald-400 animate-ping opacity-25 pointer-events-none" />
      </motion.a>
    </div>
  );
}
