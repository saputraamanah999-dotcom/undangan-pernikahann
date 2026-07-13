// src/components/sections/AnnouncementsModal.tsx
'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, Calendar, Info } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, SITE_ID } from '../../lib/firebase/client';
import { SenderBadge } from '../ui/SenderBadge';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  senderType: 'mempelai' | 'keluarga' | 'developer';
  createdAt?: any;
}

interface AnnouncementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcements: Announcement[];
}

export function AnnouncementsModal({ isOpen, onClose, announcements }: AnnouncementsModalProps) {
  const formatDate = (createdAt: any) => {
    if (!createdAt) return 'Baru saja';
    try {
      const date = createdAt.seconds ? new Date(createdAt.seconds * 1000) : new Date(createdAt);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Baru saja';
    }
  };


  // Rainbow names for effect
  const [rainbowNames, setRainbowNames] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    const qRainbow = collection(db, `sites/${SITE_ID}/rainbowNames`);
    const unsub = onSnapshot(qRainbow, (snap) => {
      const names = new Set<string>();
      snap.forEach((doc) => {
        const data = doc.data();
        if (data.name) names.add(data.name);
      });
      setRainbowNames(names);
    }, () => {});
    return () => unsub();
  }, []);
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-6 sm:items-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative z-10 w-full max-w-md rounded-3xl border-2 border-white/10 bg-[#0d0309] p-6 shadow-2xl text-left overflow-hidden flex flex-col max-h-[85vh] md:max-h-[75vh]"
          >
            {/* Elegant Balinese Gold Line Accent at Top */}
            <div className="absolute top-0 inset-x-0 h-[3px] bg-[#C9A24B]" />

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#C9A24B]/10 border border-[#C9A24B]/30 flex items-center justify-center text-[#C9A24B]">
                  <Bell className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-black text-white uppercase tracking-tight">
                    Pengumuman & Kabar
                  </h3>
                  <p className="text-[10px] text-[#FDF6E9]/60 font-sans font-medium uppercase tracking-wider">
                    Informasi penting dari Mempelai
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#FDF6E9]/70 hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 custom-scrollbar">
              {announcements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-[#FDF6E9]/30 mb-3">
                    <Info className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-[#FDF6E9]/50 font-sans font-medium">
                    Belum ada pengumuman terbaru saat ini.
                  </p>
                </div>
              ) : (
                announcements.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#C9A24B]/30 transition-colors flex flex-col gap-2.5 overflow-hidden group"
                  >
                    {/* Corner Sender Badge */}
                    <div className="flex items-center justify-between">
                      <SenderBadge senderType={item.senderType} />
                      <span className="text-[9px] text-[#FDF6E9]/40 font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(item.createdAt)}
                      </span>
                    </div>

                    <div>
                      <h4
                        className="font-sans font-black text-sm leading-tight uppercase tracking-wide"
                        style={item.senderType === 'developer' || rainbowNames.has(item.title) ? {
                          background: 'linear-gradient(90deg, #ff0000, #ff7700, #ffff00, #00ff00, #0000ff, #8b00ff, #ff0000)',
                          backgroundSize: '200% 100%',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                          animation: 'rainbow-shift 3s linear infinite',
                        } : { color: '#ffffff' }}
                      >
                        {item.title}
                      </h4>
                      <p className="font-sans text-xs text-[#FDF6E9]/80 leading-relaxed font-medium mt-1.5 whitespace-pre-line">
                        {item.content}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
