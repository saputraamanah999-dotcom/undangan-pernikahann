// src/components/ui/AnnouncementPopup.tsx
'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, SITE_ID } from '../../lib/firebase/client';
import { Bell, X } from 'lucide-react';

interface PopupAnnouncement {
  id: string;
  title: string;
  content: string;
  createdAt: any;
  senderType?: string;
}

export function AnnouncementPopup() {
  const [visiblePopup, setVisiblePopup] = useState<PopupAnnouncement | null>(null);
  const [queue, setQueue] = useState<PopupAnnouncement[]>([]);
  const shownIdsRef = useRef<Set<string>>(new Set());
  const isInitialLoad = useRef(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const showNextPopup = useCallback(() => {
    setQueue(prev => {
      if (prev.length === 0) return prev;
      const [next, ...rest] = prev;
      setVisiblePopup(next);

      // Auto-dismiss setelah 6 detik
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setVisiblePopup(null);
      }, 6000);

      return rest;
    });
  }, []);

  // Proses queue ketika tidak ada popup aktif
  useEffect(() => {
    if (!visiblePopup && queue.length > 0) {
      // Delay sedikit antar popup biar gak numpuk
      const delay = setTimeout(showNextPopup, 300);
      return () => clearTimeout(delay);
    }
  }, [queue, visiblePopup, showNextPopup]);

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    // Ambil timestamp pengumuman terakhir yang sudah dilihat dari localStorage
    let lastSeenTime = 0;
    try {
      const stored = localStorage.getItem('last_seen_announcement_ts');
      if (stored) lastSeenTime = parseInt(stored, 10);
    } catch { /* ignore */ }

    const q = query(
      collection(db, `sites/${SITE_ID}/announcements`),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const list: PopupAnnouncement[] = [];
      snap.forEach((doc) => {
        const data = doc.data();
        list.push({
          id: doc.id,
          title: data.title || '',
          content: data.content || '',
          createdAt: data.createdAt,
          senderType: data.senderType,
        });
      });

      if (isInitialLoad.current) {
        // Saat pertama kali load, JANGAN tampilkan popup untuk yang sudah ada
        // Cukup update lastSeenTime ke pengumuman paling baru
        isInitialLoad.current = false;
        if (list.length > 0 && list[0].createdAt) {
          try {
            const ts = list[0].createdAt.seconds
              ? list[0].createdAt.seconds * 1000
              : new Date(list[0].createdAt).getTime();
            if (ts > lastSeenTime) {
              localStorage.setItem('last_seen_announcement_ts', String(ts));
              lastSeenTime = ts;
            }
          } catch { /* ignore */ }
        }
        return;
      }

      // Setelah initial load, cek pengumuman BARU yang lebih baru dari lastSeenTime
      const newOnes = list.filter(ann => {
        if (shownIdsRef.current.has(ann.id)) return false;
        if (!ann.createdAt) return false;
        try {
          const ts = ann.createdAt.seconds
            ? ann.createdAt.seconds * 1000
            : new Date(ann.createdAt).getTime();
          return ts > lastSeenTime;
        } catch {
          return false;
        }
      });

      if (newOnes.length > 0) {
        // Update lastSeenTime ke yang paling baru
        try {
          const latestTs = newOnes[0].createdAt.seconds
            ? newOnes[0].createdAt.seconds * 1000
            : new Date(newOnes[0].createdAt).getTime();
          localStorage.setItem('last_seen_announcement_ts', String(latestTs));
          lastSeenTime = latestTs;
        } catch { /* ignore */ }

        // Masukkan ke queue popup
        newOnes.forEach(ann => {
          shownIdsRef.current.add(ann.id);
          setQueue(prev => [...prev, ann]);

          // Jika tab browser tidak aktif, kirim notifikasi sistem (browser notification)
          if ('Notification' in window && Notification.permission === 'granted') {
            try {
              const notif = new Notification(ann.title, {
                body: ann.content,
                icon: '/BALI-ICON.webp',
                tag: ann.id, // mencegah duplikat
              });
              notif.onclick = () => {
                window.focus();
                notif.close();
              };
            } catch { /* Service worker might handle this */ }
          }
        });
      }
    }, () => { /* ignore snapshot errors */ });

    return () => unsub();
  }, []);

  const handleClose = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisiblePopup(null);
  };

  return (
    <AnimatePresence>
      {visiblePopup && (
        <motion.div
          initial={{ opacity: 0, y: -100, x: '-50%', scale: 0.9 }}
          animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
          exit={{ opacity: 0, y: -100, x: '-50%', scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-14 left-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm"
        >
          <div className="relative bg-[#0d0309]/95 backdrop-blur-xl border-2 border-[#C9A24B]/50 rounded-2xl p-4 shadow-2xl shadow-[#C9A24B]/10 overflow-hidden">
            {/* Gold accent line */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A24B] to-transparent" />

            {/* Animated pulse ring */}
            <div className="absolute -top-2 -left-2 w-6 h-6">
              <span className="absolute inset-0 rounded-full bg-[#C9A24B]/30 animate-ping" />
              <span className="absolute inset-1 rounded-full bg-[#C9A24B]" />
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-[#C9A24B]/15 border border-[#C9A24B]/30 flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="w-4 h-4 text-[#C9A24B] animate-pulse" />
              </div>
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-[9px] font-sans font-black text-[#C9A24B] uppercase tracking-widest leading-tight">
                  Pengumuman Baru
                </p>
                <h4 className="text-sm font-sans font-bold text-white mt-1 leading-snug">
                  {visiblePopup.title}
                </h4>
                <p className="text-[11px] text-[#FDF6E9]/75 font-sans font-medium mt-1.5 leading-relaxed line-clamp-3">
                  {visiblePopup.content}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all cursor-pointer shrink-0 mt-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}