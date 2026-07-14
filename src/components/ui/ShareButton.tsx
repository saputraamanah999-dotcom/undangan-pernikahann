// src/components/ui/ShareButton.tsx
'use client';
import { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ShareButtonProps {
  guestName: string;
  whatsappFormat: string;
}

export function ShareButton({ guestName, whatsappFormat }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const getShareText = () => {
    const currentLink = window.location.origin + window.location.pathname;
    const slug = guestName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const guestLink = `${currentLink}?to=${slug}`;
    
    // Replace placeholder with live customized guest invitation link
    const formattedMsg = whatsappFormat.replace('{linkUndangan}', guestLink);
    return formattedMsg;
  };

  const handleShare = async () => {
    const shareText = getShareText();
    const currentLink = window.location.origin + window.location.pathname;
    const slug = guestName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const guestLink = `${currentLink}?to=${slug}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Undangan Pernikahan Bali',
          text: shareText,
          url: guestLink,
        });
      } catch (e) {
        console.warn("Sharing aborted or failed:", e);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.warn("Clipboard write failed:", err);
      }
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-40">
      <motion.button
        onClick={handleShare}
        id="btn-share-invite"
        className="relative flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-r from-purple-700 to-purple-900 text-amber-200 shadow-xl border border-purple-500/30 cursor-pointer active:scale-95 transition-transform"
        whileHover={{ scale: 1.05 }}
        title="Bagikan Undangan"
      >
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.div
              key="copied"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
            >
              <Check className="w-5 h-5 text-emerald-400" />
            </motion.div>
          ) : (
            <motion.div
              key="share"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
            >
              <Share2 className="w-5 h-5 text-amber-200" />
            </motion.div>
          )}
        </AnimatePresence>

        {copied && (
          <span className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-black/90 border border-amber-400/20 text-[10px] text-amber-200 py-1.5 px-3 rounded-lg shadow-xl font-sans tracking-wide font-medium whitespace-nowrap">
            Teks tersalin!
          </span>
        )}
      </motion.button>
    </div>
  );
}
