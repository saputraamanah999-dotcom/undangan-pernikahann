// src/components/sections/GuestbookSection.tsx
'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc, increment } from 'firebase/firestore';
import { db, SITE_ID } from '../../lib/firebase/client';
import { GuestbookMessage } from '../../types/invitation';
import { MessageSquare, Heart, CheckCircle2, HelpCircle, XCircle } from 'lucide-react';
import { VerifiedBadge } from '../ui/VerifiedBadge';

export function GuestbookSection() {
  const [messages, setMessages] = useState<GuestbookMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [localLikes, setLocalLikes] = useState<Record<string, boolean>>({});
  const [verifiedNames, setVerifiedNames] = useState<Set<string>>(new Set());
  const [rainbowNames, setRainbowNames] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load existing liked messages from local storage
    const likes: Record<string, boolean> = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('liked_msg_')) {
          likes[key.replace('liked_msg_', '')] = true;
        }
      }
    } catch (e) {
      console.warn("Local storage access denied:", e);
    }
    setLocalLikes(likes);

    const q = query(
      collection(db, `sites/${SITE_ID}/guestbook`),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const msgs: GuestbookMessage[] = [];
        snap.forEach((doc) => {
          const data = doc.data();
          msgs.push({
            id: doc.id,
            name: data.name || 'Hamba Allah',
            message: data.message || '',
            attendance: data.attendance || 'hadir',
            signature: data.signature || undefined,
            likesCount: data.likesCount || 0,
            createdAt: data.createdAt,
          });
        });
        setMessages(msgs);
        setLoading(false);
      },
      (error) => {
        console.warn("Guestbook snapshot listen failed:", error);
        setLoading(false);
      }
    );

    // Listen to verified users
    const qVerified = collection(db, `sites/${SITE_ID}/verifiedUsers`);
    const unsubVerified = onSnapshot(qVerified, (snap) => {
      const names = new Set<string>();
      snap.forEach((doc) => {
        const data = doc.data();
        if (data.name) names.add(data.name);
      });
      setVerifiedNames(names);
    }, () => {});

    
    // Listen to rainbow names
    const qRainbow = collection(db, `sites/${SITE_ID}/rainbowNames`);
    const unsubRainbow = onSnapshot(qRainbow, (snap) => {
      const names = new Set<string>();
      snap.forEach((doc) => {
        const data = doc.data();
        if (data.name) names.add(data.name);
      });
      setRainbowNames(names);
    }, () => {});

    return () => { unsub(); unsubVerified(); unsubRainbow(); };
  }, []);

  const handleLike = async (msgId: string) => {
    const key = `liked_msg_${msgId}`;
    if (localLikes[msgId]) return; // Already liked

    try {
      const docRef = doc(db, `sites/${SITE_ID}/guestbook`, msgId);
      await updateDoc(docRef, {
        likesCount: increment(1)
      });
      
      try {
        localStorage.setItem(key, 'true');
      } catch (e) {
        console.warn("Local storage write failed:", e);
      }

      setLocalLikes(prev => ({ ...prev, [msgId]: true }));
    } catch (error) {
      console.error("Error liking message:", error);
    }
  };

  const getAttendanceBadge = (status: 'hadir' | 'tidak' | 'ragu') => {
    switch (status) {
      case 'hadir':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-sans font-semibold text-emerald-400 capitalize">
            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
            <span>Hadir</span>
          </span>
        );
      case 'tidak':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-[9px] font-sans font-semibold text-red-400 capitalize">
            <XCircle className="w-2.5 h-2.5 text-red-400" />
            <span>Tidak Hadir</span>
          </span>
        );
      case 'ragu':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[9px] font-sans font-semibold text-amber-400 capitalize">
            <HelpCircle className="w-2.5 h-2.5 text-amber-400" />
            <span>Ragu-ragu</span>
          </span>
        );
    }
  };

  return (
    <section id="section-guestbook" className="relative py-16 px-6 bg-[#0a0209] text-center overflow-hidden">
      
      {/* Structural divider */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A24B]/20 to-transparent" />

      <div className="max-w-md mx-auto relative z-10 flex flex-col items-center gap-8">
        
        {/* Title segment */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col items-center"
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#C9A24B]/10 border border-[#C9A24B]/30 text-[#C9A24B] mb-4 animate-pulse">
            <MessageSquare className="w-5 h-5 text-[#C9A24B]" />
          </div>
          <h2 className="font-serif text-3xl font-black text-white tracking-tight uppercase">
            Buku Tamu & Doa Restu
          </h2>
          <div className="h-[2px] w-12 bg-[#C9A24B] mx-auto mt-3.5" />
        </motion.div>



        {/* Wishes List Scroller Container */}
        <div className="w-full max-h-[460px] overflow-y-auto pr-1 flex flex-col gap-4 text-left custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 text-xs">
              <span className="animate-pulse">Menghubungkan Buku Tamu...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-[#FDF6E9]/60 text-xs font-medium font-sans">
              Belum ada ucapan tertulis. Jadilah yang pertama memberikan doa restu Anda!
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => {
                const isLiked = !!localLikes[msg.id];
                return (
                  <motion.div
                    key={msg.id || idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className="p-5 rounded-2xl bg-white/[0.03] border-2 border-white/10 shadow-sm flex flex-col gap-2.5 hover:border-[#C9A24B]/30 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <p
                          className="font-sans font-black text-xs tracking-wider uppercase"
                          style={rainbowNames.has(msg.name) ? {
                            background: 'linear-gradient(90deg, #ff0000, #ff7700, #ffff00, #00ff00, #0000ff, #8b00ff, #ff0000)',
                            backgroundSize: '200% 100%',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            animation: 'rainbow-shift 3s linear infinite',
                          } : { color: '#C9A24B' }}
                        >
                          {msg.name}
                        </p>
                        {(verifiedNames.has(msg.name) || msg.name.toLowerCase() === 'developer saputra') && <VerifiedBadge size={12} />}
                      </div>
                      {getAttendanceBadge(msg.attendance)}
                    </div>
                    
                    <p className="text-xs text-[#FDF6E9]/80 leading-relaxed font-sans font-medium break-words">
                      {msg.message}
                    </p>

                    {msg.signature && (
                      <div className="mt-2.5 pt-2 border-t border-white/5 flex flex-col items-start gap-1">
                        <span className="text-[8px] text-[#C9A24B]/60 font-mono uppercase tracking-wider font-bold">
                          Prasasti Tanda Tangan:
                        </span>
                        <div className="bg-[#030003]/60 border border-white/5 rounded-xl px-3 py-1.5 flex items-center justify-center max-w-[140px] h-12 overflow-hidden shadow-inner">
                          <img 
                            src={msg.signature} 
                            alt={`Tanda tangan ${msg.name}`}
                            className="max-h-10 object-contain drop-shadow-[0_0_3px_rgba(255,226,148,0.3)]" 
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-white/5">
                      <div className="flex items-center gap-1.5 text-[9px] text-[#C9A24B]/50 font-sans">
                        <Heart className="w-2.5 h-2.5 fill-[#C9A24B]/15 text-[#C9A24B]/60" />
                        <span>Mengirimkan doa kebahagiaan</span>
                      </div>

                      {/* Interactive Like/Love Button */}
                      <button
                        onClick={() => handleLike(msg.id)}
                        disabled={isLiked}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[9px] font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                          isLiked
                            ? 'bg-[#C9A24B]/10 border-[#C9A24B]/40 text-[#C9A24B]'
                            : 'bg-white/5 border-white/10 text-white/70 hover:border-[#C9A24B]/30 hover:text-white active:scale-90'
                        }`}
                      >
                        <Heart className={`w-3 h-3 ${isLiked ? 'fill-[#C9A24B] text-[#C9A24B]' : 'text-current'}`} />
                        <span>Suka ({msg.likesCount || 0})</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

      </div>
    </section>
  );
}
