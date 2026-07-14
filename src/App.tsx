// src/App.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { db, SITE_ID } from './lib/firebase/client';
import { getSiteConfig, DEFAULT_PHOTOS, DEFAULT_SITE_CONFIG } from './lib/site-config';
import { SiteConfig, Photo } from './types/invitation';

// Hooks
import { useGuestFromUrl } from './hooks/useGuestFromUrl';

// Components
import { OpeningScreen } from './components/cover/OpeningScreen';
import { GapuraReveal } from './components/cover/GapuraReveal';
import { MusicPlayer } from './components/audio/MusicPlayer';
import { ShareButton } from './components/ui/ShareButton';
import { NotificationBanner } from './components/ui/NotificationBanner';

// Sections
import { HeroCouple } from './components/sections/HeroCouple';
import { CountdownSection } from './components/sections/CountdownSection';
import { LiveVisitorBadge } from './components/sections/LiveVisitorBadge';
import { EventDetailSection } from './components/sections/EventDetailSection';
import { GallerySwipe } from './components/sections/GallerySwipe';
import { MapsSection } from './components/sections/MapsSection';
import { GiftEnvelopeSection } from './components/sections/GiftEnvelopeSection';
import { RsvpForm } from './components/sections/RsvpForm';
import { GuestbookSection } from './components/sections/GuestbookSection';
import { FooterCredit } from './components/sections/FooterCredit';
import { AnnouncementsModal, Announcement } from './components/sections/AnnouncementsModal';
import { useNotificationPermission } from './hooks/useNotificationPermission';
import { useVisitorTracker } from './hooks/useVisitorTracker';
import { FireworksEffect } from './components/ui/FireworksEffect';
import { AnnouncementPopup } from './components/ui/AnnouncementPopup';
import { WhatsappOrderButton } from './components/ui/WhatsappOrderButton';

// Admin Panel
import { AdminPanel } from './components/admin/AdminPanel';

import { Flower, ShieldAlert } from 'lucide-react';

export default function App() {
  const { guestName, loading: guestLoading } = useGuestFromUrl();
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [configLoading, setConfigLoading] = useState(true);

  // Invitation Open States
  const [isOpen, setIsOpen] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [forcePlay, setForcePlay] = useState(false);

  // Announcements and Notification States
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isAnnouncementsOpen, setIsAnnouncementsOpen] = useState(false);
  const { status } = useNotificationPermission();
  useVisitorTracker(guestName);

  // Admin Panel state
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // 1. Listen real-time to SiteConfig, Gallery, and Announcements from Firestore
  useEffect(() => {
    let active = true;

    // Listen real-time to configuration changes
    const configRef = doc(db, `sites/${SITE_ID}/config/main`);
    const unsubConfig = onSnapshot(
      configRef,
      (snap) => {
        if (!active) return;
        if (snap.exists()) {
          setConfig(snap.data() as SiteConfig);
          setConfigLoading(false);
        } else {
          // Auto seed if doesn't exist
          getSiteConfig().then((liveConfig) => {
            if (active) {
              setConfig(liveConfig);
              setConfigLoading(false);
            }
          });
        }
      },
      (error) => {
        console.warn("Config snapshot listen failed, using default:", error);
        if (active) {
          setConfig(DEFAULT_SITE_CONFIG);
          setConfigLoading(false);
        }
      }
    );

    // Listen real-time to gallery updates
    const q = query(collection(db, `sites/${SITE_ID}/gallery`), orderBy('order', 'asc'));
    const unsubGallery = onSnapshot(
      q,
      (snap) => {
        if (!active) return;
        const pts: Photo[] = [];
        snap.forEach((doc) => {
          pts.push({ id: doc.id, ...doc.data() } as Photo);
        });
        setPhotos(pts.length > 0 ? pts : DEFAULT_PHOTOS);
      },
      (error) => {
        console.warn("Gallery snapshot listen failed, using default:", error);
        if (active) setPhotos(DEFAULT_PHOTOS);
      }
    );

    // Listen real-time to announcements
    const announcementsQuery = query(
      collection(db, `sites/${SITE_ID}/announcements`),
      orderBy('createdAt', 'desc')
    );
    const unsubAnnouncements = onSnapshot(
      announcementsQuery,
      (snap) => {
        if (!active) return;
        const list: Announcement[] = [];
        snap.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Announcement);
        });
        setAnnouncements(list);
      },
      (error) => {
        console.warn("Announcements snapshot listen failed:", error);
      }
    );

    return () => {
      active = false;
      unsubConfig();
      unsubGallery();
      unsubAnnouncements();
    };
  }, []);

  const handleOpenInvitation = () => {
    // Start split gate reveal and trigger soundtrack
    setIsRevealing(true);
    setForcePlay(true);
    
    // Mount the dashboard behind the slide-open gate panels
    setTimeout(() => {
      setIsOpen(true);
    }, 400);
  };

  // 2. High-fidelity Balinese Shimmer Skeleton Loader
  if (configLoading || guestLoading || !config) {
    return (
      <div className="h-dvh w-full flex flex-col items-center justify-center bg-[#13030f] text-amber-200">
        <div className="flex flex-col items-center gap-5">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 rounded-full border-2 border-dashed border-amber-400/40 flex items-center justify-center"
          >
            <Flower className="w-8 h-8 text-amber-400" />
          </motion.div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-4 w-32 bg-amber-400/10 rounded animate-pulse" />
            <div className="h-3 w-48 bg-amber-400/5 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // 3. Maintenance mode screen gate (with secret admin entry trigger)
  if (config.maintenanceMode) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0d0309] text-center p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,162,75,0.06),transparent_70%)] pointer-events-none" />
        <div className="max-w-md mx-auto relative z-10 flex flex-col items-center gap-6 border-2 border-white/10 rounded-3xl p-8 bg-white/[0.02] backdrop-blur-md">
          <div className="w-14 h-14 rounded-full bg-[#C9A24B]/10 border border-[#C9A24B]/30 flex items-center justify-center text-[#C9A24B] mb-2 animate-bounce">
            <ShieldAlert className="w-7 h-7 text-[#C9A24B]" />
          </div>
          <h1 className="font-serif text-2xl font-black text-[#C9A24B] uppercase tracking-wide">Undangan Pemeliharaan</h1>
          <p className="text-xs text-[#FDF6E9]/80 leading-relaxed font-sans font-medium">
            Mohon maaf, halaman undangan ini sedang dalam penyesuaian teknis (Maintenance Mode) oleh Saputra Developer untuk memperbarui detail acara demi kenyamanan para tamu undangan.
          </p>
          <div className="h-[1px] w-20 bg-[#C9A24B]/30" />
          <button 
            onClick={() => setIsAdminOpen(true)}
            className="text-[10px] uppercase tracking-widest text-[#C9A24B]/50 hover:text-[#C9A24B] font-extrabold font-sans transition-colors cursor-pointer"
          >
            Dipersembahkan oleh Saputra Developer
          </button>
        </div>

        {/* Hidden Admin dashboard panel overlay */}
        <AdminPanel 
          isOpen={isAdminOpen} 
          onClose={() => setIsAdminOpen(false)} 
          config={config} 
        />
      </div>
    );
  }

  const couple1Names = `${config.couple.groom.nickname} & ${config.couple.bride.nickname}`;
  const couple2Names = config.isJointWedding && config.couple2
    ? `${config.couple2.groom.nickname} & ${config.couple2.bride.nickname}`
    : '';

  return (
    <div className="min-h-screen w-full bg-[#050005] flex items-start justify-center">
      
      {/* Visual background wrapper for desktop - blurs and centers the elegant card */}
      <div className="fixed inset-0 hidden lg:block bg-cover bg-center filter blur-xl brightness-50 contrast-125 z-0"
           style={{ backgroundImage: `url(${config.coverImageUrl})` }} />
      <div className="fixed inset-0 hidden lg:block bg-black/60 z-0" />

      {/* Main Single-Screen Responsive Layout Container */}
      <main className="relative w-full max-w-[480px] min-h-screen bg-[#0d0309] shadow-2xl z-10 overflow-hidden flex flex-col">
        
        {/* Absolute header visual accent line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500 via-amber-400 to-purple-600 opacity-80 z-20" />

        <AnimatePresence mode="wait">
          {!isOpen ? (
            <motion.div
              key="opening"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full h-full"
            >
              <OpeningScreen
                guestName={guestName}
                preweddingUrl={config.coverImageUrl}
                couple1Names={couple1Names}
                couple2Names={couple2Names}
                isJointWedding={config.isJointWedding}
                onOpen={handleOpenInvitation}
                forceNotifAndroid={config.forceNotifAndroid !== false}
                forceNotifIos={config.forceNotifIos || false}
              />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full flex-1 flex flex-col"
            >
              {/* Cover Banner section at top of page after opening */}
              <div className="relative h-72 w-full overflow-hidden">
                <img
                  src={config.coverImageUrl}
                  alt="Wedding Banner"
                  className="w-full h-full object-cover filter brightness-[0.75] contrast-[1.05]"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0309] via-[#0d0309]/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-6 text-center">
                  <span className="text-[9px] tracking-[0.3em] uppercase text-amber-400 font-semibold block mb-1">
                    Atas Karunia Sang Hyang Widhi Wasa
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-amber-200 tracking-wide drop-shadow-md">
                    Pawiwahan Suci
                  </h2>
                </div>
              </div>

              {/* Notification Banner (Firebase realtime) */}
              <NotificationBanner />

              {/* Core Page sections sequential list */}
              <HeroCouple config={config} />
              
              <CountdownSection config={config} />
              
              <EventDetailSection config={config} />
              
              <GallerySwipe photos={photos} />
              
              <MapsSection config={config} />
              
              <GiftEnvelopeSection config={config} />
              
              <RsvpForm initialGuestName={guestName} />
              
              <GuestbookSection />
              
              {/* Denied notification banner */}
              {status === 'denied' && (
                <div className="mx-6 my-4 p-4 rounded-2xl bg-red-950/40 border-2 border-red-500/20 text-[#FDF6E9]/90 text-xs font-semibold font-sans leading-relaxed text-center shadow-lg">
                  🚨 Notifikasi diblokir — aktifkan lewat pengaturan browser kalau ingin dapat kabar terbaru.
                </div>
              )}

              <FooterCredit onAdminClick={() => setIsAdminOpen(true)} />

              {/* Celebration fireworks particle layer */}
              <FireworksEffect />

              {/* Floating controls */}
              <MusicPlayer url={config.musicUrl} forcePlay={forcePlay} />
              
              <ShareButton
                guestName={guestName}
                whatsappFormat={config.whatsappTextFormat}
              />

              <WhatsappOrderButton />

              {/* Floating Announcement Badge & Modal */}
              <button 
                className="fx-misc-badge"
                onClick={() => setIsAnnouncementsOpen(true)}
                title="Pengumuman & Kabar"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
                {announcements.length > 0 && (
                  <span className="fx-misc-badge-dot">{announcements.length}</span>
                )}
              </button>

              <AnnouncementsModal
                isOpen={isAnnouncementsOpen}
                onClose={() => setIsAnnouncementsOpen(false)}
                announcements={announcements}
              />
            </motion.div>
          )}
        </AnimatePresence>

      {/* Auto Popup for new announcements (real-time via Firestore) */}
      <AnnouncementPopup />

      {/* Fixed Live Visitor Badge (top-left, always visible) */}
      <LiveVisitorBadge />

      {/* Traditional slide-open Split Candi Bentar Gateway Transition Layer */}
      <GapuraReveal
          isRevealing={isRevealing}
          gapuraLeftUrl={config.gapuraImageUrl1}
          gapuraRightUrl={config.gapuraImageUrl2}
          onComplete={() => setIsRevealing(false)}
        />

        {/* Floating Admin Dashboard Overlay */}
        <AdminPanel 
          isOpen={isAdminOpen} 
          onClose={() => setIsAdminOpen(false)} 
          config={config} 
        />

      </main>
    </div>
  );
}
