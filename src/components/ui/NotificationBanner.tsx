// src/components/ui/NotificationBanner.tsx
'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, SITE_ID } from '../../lib/firebase/client';
import { X, Info, AlertTriangle, CheckCircle, Bell } from 'lucide-react';

export interface Banner {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success';
  senderName: string;
  senderType: string;
  active: boolean;
  createdAt: any;
}

export function NotificationBanner() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem('dismissed_banners');
      if (stored) setDismissed(new Set(JSON.parse(stored)));
    } catch { /* ignore */ }

    const q = query(
      collection(db, `sites/${SITE_ID}/banners`),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      const list: Banner[] = [];
      snap.forEach((doc) => {
        const data = doc.data();
        if (data.active) list.push({ id: doc.id, ...data } as Banner);
      });
      setBanners(list);
    }, () => {});

    return () => unsub();
  }, []);

  const activeBanner = banners.find((b) => !dismissed.has(b.id));

  const handleDismiss = (id: string) => {
    const newDismissed = new Set(dismissed);
    newDismissed.add(id);
    setDismissed(newDismissed);
    try {
      localStorage.setItem('dismissed_banners', JSON.stringify([...newDismissed]));
    } catch { /* ignore */ }
  };

  if (!activeBanner) return null;

  const typeConfig: Record<string, { bg: string; border: string; icon: typeof Info; color: string }> = {
    info: { bg: 'bg-blue-950/70', border: 'border-blue-500/30', icon: Info, color: 'text-blue-300' },
    warning: { bg: 'bg-amber-950/70', border: 'border-amber-500/30', icon: AlertTriangle, color: 'text-amber-300' },
    success: { bg: 'bg-emerald-950/70', border: 'border-emerald-500/30', icon: CheckCircle, color: 'text-emerald-300' },
  };

  const cfg = typeConfig[activeBanner.type] || typeConfig.info;
  const Icon = cfg.icon;

  return (
    <AnimatePresence>
      {activeBanner && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`w-full ${cfg.bg} border-b ${cfg.border} px-4 py-2.5 flex items-center gap-3 relative z-30 overflow-hidden`}
        >
          <Bell className={`w-3.5 h-3.5 ${cfg.color} shrink-0 animate-pulse`} />
          <Icon className={`w-4 h-4 ${cfg.color} shrink-0`} />
          <div className="flex-1 min-w-0">
            <p className={`text-[10px] font-sans font-black ${cfg.color} uppercase tracking-wider leading-tight`}>
              {activeBanner.title}
            </p>
            <p className="text-[9px] text-[#FDF6E9]/75 font-sans font-medium truncate mt-0.5">
              {activeBanner.content}
            </p>
          </div>
          <span className="text-[8px] text-white/30 font-sans shrink-0 hidden sm:block">
            dari {activeBanner.senderName || 'Admin'}
          </span>
          <button
            onClick={() => handleDismiss(activeBanner.id)}
            className="p-1 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}