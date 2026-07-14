// src/components/admin/AdminPanel.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Lock, Shield, Save, Settings, Calendar, CreditCard, 
  Bell, Image as ImageIcon, Plus, Trash2, LogOut, Check, Info, AlertTriangle,
  Users, MessageSquare, Heart, Cloud, Thermometer, ShieldCheck, Send, UserPlus, Music, Link, Copy, Star, Timer, PenLine, Smartphone, Eye, Activity
} from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, collection, addDoc, deleteDoc, getDocs, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth, SITE_ID } from '../../lib/firebase/client';
import { SiteConfig, Photo, GuestbookMessage } from '../../types/invitation';
import { Announcement } from '../sections/AnnouncementsModal';
import { Banner } from '../ui/NotificationBanner';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  config: SiteConfig;
}

const ALLOWED_ADMINS = [
  'saputraamanah999@gmail.com',
  'iwayanpastika147@gmail.com',
  'saputra.developer@gmail.com',
];

export function AdminPanel({ isOpen, onClose, config }: AdminPanelProps) {
  const [user, setUser] = useState<User | null>(null);
  const [passcode, setPasscode] = useState('');
  const [isPasscodeAuthed, setIsPasscodeAuthed] = useState(false);
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<'general' | 'events' | 'finance' | 'announcements' | 'gallery' | 'rsvp' | 'guestbook' | 'weather' | 'notifications' | 'verified' | 'rainbow' | 'guests' | 'countdown' | 'visitors'>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Local editable state loaded from config
  const [formData, setFormData] = useState<SiteConfig>({ ...config });
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [wishes, setWishes] = useState<GuestbookMessage[]>([]);

  // Announcement Form State
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [newAnnSender, setNewAnnSender] = useState<'mempelai' | 'keluarga' | 'developer'>('mempelai');

  // Photo Form State
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoOrientation, setNewPhotoOrientation] = useState<'left' | 'right' | 'row3' | 'row4' | 'row5'>('left');

  // Weather Form State
  const [weatherForm, setWeatherForm] = useState({
    date: '', condition: 'Cerah Berawan', temp: 28, humidity: 62, wind: '12 km/h',
    hourlyForecasts: [
      { time: '09:00 WITA', temp: 27, condition: 'Cerah Berawan' },
      { time: '13:00 WITA', temp: 31, condition: 'Cerah Hangat' },
      { time: '17:00 WITA', temp: 28, condition: 'Cerah Berawan' },
      { time: '21:00 WITA', temp: 25, condition: 'Malam Sejuk' },
    ]
  });

  // Banner / Notification State
  const [banners, setBanners] = useState<Banner[]>([]);
  const [newBannerTitle, setNewBannerTitle] = useState('');
  const [newBannerContent, setNewBannerContent] = useState('');
  const [newBannerType, setNewBannerType] = useState<'info' | 'warning' | 'success'>('info');

  // Verified Users State
  const [verifiedUsers, setVerifiedUsers] = useState<any[]>([]);

  // Guest Management State
  const [guests, setGuests] = useState<any[]>([]);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestPhone, setNewGuestPhone] = useState('');
  const [adminWishName, setAdminWishName] = useState('');
  const [adminWishMsg, setAdminWishMsg] = useState('');
  const [adminWishAttendance, setAdminWishAttendance] = useState<'hadir' | 'tidak' | 'ragu'>('hadir');

  // Push Notification State
  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');
  const [pushSending, setPushSending] = useState(false);
  const [pushResult, setPushResult] = useState('');

  // Registered Devices State (fcmTokens with device info)
  const [registeredDevices, setRegisteredDevices] = useState<any[]>([]);

  // Visitors State (realtime visitor tracking)
  const [visitors, setVisitors] = useState<any[]>([]);

  // Weather auto-fetch state
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);

  // Rainbow Names state
  const [rainbowNames, setRainbowNames] = useState<string[]>([]);
  const [newRainbowName, setNewRainbowName] = useState('');

  // Listen to Auth State
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && !ALLOWED_ADMINS.includes(currentUser.email || '')) {
        setAuthError(`Akses Ditolak: Email ${currentUser.email} tidak terdaftar sebagai Administrator.`);
      } else {
        setAuthError('');
      }
    });
    return () => unsub();
  }, []);

  // Listen to announcements and gallery when open and authorized
  const isAuthorized = (user && ALLOWED_ADMINS.includes(user.email || '')) || isPasscodeAuthed;

  useEffect(() => {
    if (!isOpen || !isAuthorized) return;

    // Load Announcements
    const qAnn = query(collection(db, `sites/${SITE_ID}/announcements`), orderBy('createdAt', 'desc'));
    const unsubAnn = onSnapshot(qAnn, (snap) => {
      const list: Announcement[] = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Announcement);
      });
      setAnnouncements(list);
    });

    // Load Gallery Photos
    const qGal = query(collection(db, `sites/${SITE_ID}/gallery`), orderBy('order', 'asc'));
    const unsubGal = onSnapshot(qGal, (snap) => {
      const list: Photo[] = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Photo);
      });
      setPhotos(list);
    });

    // Load RSVPs
    const qRsvp = query(collection(db, `sites/${SITE_ID}/rsvp`), orderBy('createdAt', 'desc'));
    const unsubRsvp = onSnapshot(qRsvp, (snap) => {
      const list: any[] = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setRsvps(list);
    });

    // Load Wishes
    const qWish = query(collection(db, `sites/${SITE_ID}/guestbook`), orderBy('createdAt', 'desc'));
    const unsubWish = onSnapshot(qWish, (snap) => {
      const list: GuestbookMessage[] = [];
      snap.forEach((doc) => {
        const data = doc.data();
        list.push({
          id: doc.id,
          name: data.name || 'Anonim',
          message: data.message || '',
          attendance: data.attendance || 'hadir',
          signature: data.signature,
          likesCount: data.likesCount || 0,
          createdAt: data.createdAt,
        });
      });
      setWishes(list);
    });

    // Load Weather
    const weatherRef = doc(db, `sites/${SITE_ID}/weather/main`);
    const unsubWeather = onSnapshot(weatherRef, (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setWeatherForm({
          date: d.date || '',
          condition: d.condition || 'Cerah Berawan',
          temp: d.temp ?? 28,
          humidity: d.humidity ?? 62,
          wind: d.wind || '12 km/h',
          hourlyForecasts: d.hourlyForecasts || weatherForm.hourlyForecasts,
        });
      }
    }, () => {});

    // Load Banners
    const qBanners = query(collection(db, `sites/${SITE_ID}/banners`), orderBy('createdAt', 'desc'));
    const unsubBanners = onSnapshot(qBanners, (snap) => {
      const list: Banner[] = [];
      snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as Banner));
      setBanners(list);
    }, () => {});

    // Load Verified Users
    const qVerified = collection(db, `sites/${SITE_ID}/verifiedUsers`);
    const unsubVerified = onSnapshot(qVerified, (snap) => {
      const list: any[] = [];
      snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      setVerifiedUsers(list);
    }, () => {});

    // Load Guests
    const qGuests = query(collection(db, `sites/${SITE_ID}/guests`), orderBy('createdAt', 'desc'));
    const unsubGuests = onSnapshot(qGuests, (snap) => {
      const list: any[] = [];
      snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      setGuests(list);
    }, () => {});


    // Load Rainbow Names
    const qRainbow = collection(db, `sites/${SITE_ID}/rainbowNames`);
    const unsubRainbow = onSnapshot(qRainbow, (snap) => {
      const names: string[] = [];
      snap.forEach((doc) => {
        const data = doc.data();
        if (data.name) names.push(data.name);
      });
      setRainbowNames(names);
    }, () => {});

    // Load Registered Devices (fcmTokens)
    const qDevices = collection(db, `sites/${SITE_ID}/fcmTokens`);
    const unsubDevices = onSnapshot(qDevices, (snap) => {
      const list: any[] = [];
      snap.forEach((doc) => {
        const data = doc.data();
        list.push({
          id: doc.id,
          device: data.device || 'Unknown Device',
          os: data.os || 'Unknown OS',
          browser: data.browser || 'Unknown Browser',
          platform: data.platform || 'unknown',
          registeredAt: data.registeredAt || data.updatedAt || '',
          updatedAt: data.updatedAt || '',
        });
      });
      // Sort: newest first
      list.sort((a, b) => (b.updatedAt || b.registeredAt || '').localeCompare(a.updatedAt || a.registeredAt || ''));
      setRegisteredDevices(list);
    }, () => {});

    // Load Visitors (realtime)
    const qVisitors = query(collection(db, `sites/${SITE_ID}/visitors`), orderBy('lastVisitAt', 'desc'));
    const unsubVisitors = onSnapshot(qVisitors, (snap) => {
      const list: any[] = [];
      snap.forEach((doc) => {
        const data = doc.data();
        list.push({
          id: doc.id,
          device: data.device || 'Unknown Device',
          os: data.os || 'Unknown OS',
          browser: data.browser || 'Unknown Browser',
          platform: data.platform || 'unknown',
          guestName: data.guestName || 'Tamu',
          slug: data.slug || '',
          notifStatus: data.notifStatus || 'default',
          visitCount: data.visitCount || 1,
          firstVisitAt: data.firstVisitAt || '',
          lastVisitAt: data.lastVisitAt || '',
        });
      });
      setVisitors(list);
    }, () => {});

    return () => {
      unsubAnn();
      unsubGal();
      unsubRsvp();
      unsubWish();
      unsubWeather();
      unsubBanners();
      unsubVerified();
      unsubGuests();
      unsubRainbow();
      unsubDevices();
      unsubVisitors();
    };
  }, [isOpen, isAuthorized]);

  // Keep state updated if original config props change
  useEffect(() => {
    if (config) {
      setFormData({ ...config });
    }
  }, [config]);

  const handleGoogleSignIn = async () => {
    setAuthError('');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Google auth failed:", err);
      setAuthError("Google Sign-In diblokir atau gagal di browser/iframe Anda. Silakan gunakan Kode PIN Administrator di bawah.");
    }
  };

  const handlePasscodeSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === '147258') {
      setIsPasscodeAuthed(true);
      setAuthError('');
    } else {
      setAuthError('Kode PIN salah. Silakan coba lagi atau gunakan akun Google.');
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setIsPasscodeAuthed(false);
    setUser(null);
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    setSaveMessage('');
    try {
      await setDoc(doc(db, `sites/${SITE_ID}/config/main`), formData);
      setSaveMessage('Konfigurasi utama berhasil disimpan!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error: any) {
      console.error("Error saving config:", error);
      setSaveMessage(`Gagal menyimpan: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Announcements CRUD
  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle || !newAnnContent) return;

    try {
      await addDoc(collection(db, `sites/${SITE_ID}/announcements`), {
        title: newAnnTitle,
        content: newAnnContent,
        senderType: newAnnSender,
        createdAt: new Date()
      });
      setNewAnnTitle('');
      setNewAnnContent('');
      setSaveMessage('Pengumuman berhasil ditambahkan!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error: any) {
      alert(`Gagal menambah pengumuman: ${error.message}`);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Hapus pengumuman ini?')) return;
    try {
      await deleteDoc(doc(db, `sites/${SITE_ID}/announcements`, id));
    } catch (error: any) {
      alert(`Gagal menghapus: ${error.message}`);
    }
  };

  // Gallery CRUD
  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl) return;

    const maxOrder = photos.length > 0 ? Math.max(...photos.map(p => p.order)) : 0;
    const newId = `photo_${Date.now()}`;

    try {
      await setDoc(doc(db, `sites/${SITE_ID}/gallery/${newId}`), {
        id: newId,
        url: newPhotoUrl,
        order: maxOrder + 1,
        orientation: newPhotoOrientation
      });
      setNewPhotoUrl('');
      setSaveMessage('Foto berhasil ditambahkan ke galeri!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error: any) {
      alert(`Gagal menambah foto: ${error.message}`);
    }
  };

  const handleDeletePhoto = async (id: string) => {
    if (!confirm('Hapus foto ini dari galeri?')) return;
    try {
      await deleteDoc(doc(db, `sites/${SITE_ID}/gallery`, id));
    } catch (error: any) {
      alert(`Gagal menghapus foto: ${error.message}`);
    }
  };

  const handleSendPushNotification = async () => {
    if (!pushTitle.trim() || !pushBody.trim()) {
      setPushResult('Judul dan isi pesan wajib diisi.');
      return;
    }
    setPushSending(true);
    setPushResult('');
    try {
      const res = await fetch('/api/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: pushTitle.trim(), body: pushBody.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setPushResult(`✅ ${data.message || 'Notifikasi terkirim!'}`);
        setPushTitle('');
        setPushBody('');
      } else {
        setPushResult(`❌ Gagal: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setPushResult(`❌ Error: ${err.message}`);
    } finally {
      setPushSending(false);
    }
  };

  const handleDeleteRsvp = async (id: string) => {
    if (!confirm('Hapus data RSVP ini secara permanen?')) return;
    try {
      await deleteDoc(doc(db, `sites/${SITE_ID}/rsvp`, id));
    } catch (error: any) {
      alert(`Gagal menghapus RSVP: ${error.message}`);
    }
  };

  const handleDeleteWish = async (id: string) => {
    if (!confirm('Hapus ucapan/doa restu ini dari publik?')) return;
    try {
      await deleteDoc(doc(db, `sites/${SITE_ID}/guestbook`, id));
    } catch (error: any) {
      alert(`Gagal menghapus ucapan: ${error.message}`);
    }
  };

  // Weather CRUD
  const handleSaveWeather = async () => {
    setIsSaving(true);
    setSaveMessage('');
    try {
      await setDoc(doc(db, `sites/${SITE_ID}/weather/main`), {
        ...weatherForm,
        updatedAt: new Date()
      });
      setSaveMessage('Data cuaca berhasil disimpan! Semua pengunjung akan melihat pembaruan.');
      setTimeout(() => setSaveMessage(''), 4000);
    } catch (error: any) {
      setSaveMessage(`Gagal menyimpan cuaca: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const updateHourly = (idx: number, field: string, value: string | number) => {
    const updated = [...weatherForm.hourlyForecasts];
    (updated as any)[idx][field] = value;
    setWeatherForm({ ...weatherForm, hourlyForecasts: updated });
  };


  // Auto-fetch weather from Open-Meteo API
  const handleAutoFetchWeather = async () => {
    if (!weatherForm.date) {
      setSaveMessage('Pilih tanggal terlebih dahulu!');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }
    setIsFetchingWeather(true);
    setSaveMessage('');
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=-8.3405&longitude=115.0920&hourly=temperature_2m,relative_humidity_2m,weathercode,windspeed_10m&timezone=Asia/Makassar&start_date=${weatherForm.date}&end_date=${weatherForm.date}`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (!data.hourly) throw new Error('No hourly data');
      
      const conditionMap: Record<number, string> = {
        0: 'Cerah Berawan', 1: 'Cerah Berawan', 2: 'Berawan Tebal',
        3: 'Berawan Tebal', 45: 'Berawan Tebal', 48: 'Berawan Tebal',
        51: 'Hujan Ringan', 53: 'Hujan Ringan', 55: 'Hujan Ringan',
        61: 'Hujan Ringan', 63: 'Hujan Ringan', 80: 'Hujan Ringan',
        95: 'Hujan Ringan',
      };
      
      const getCondition = (code: number) => conditionMap[code] || 'Cerah Berawan';
      const getTemp = (hourIdx: number) => Math.round(data.hourly.temperature_2m[hourIdx] || 28);
      const getHumidity = (hourIdx: number) => Math.round(data.hourly.relative_humidity_2m[hourIdx] || 62);
      const getWind = (hourIdx: number) => `${Math.round(data.hourly.windspeed_10m[hourIdx] || 12)} km/h`;
      
      const hours = data.hourly.time.map((t: string) => parseInt(t.split('T')[1]));
      const idx9 = hours.indexOf(9) !== -1 ? hours.indexOf(9) : 0;
      const idx13 = hours.indexOf(13) !== -1 ? hours.indexOf(13) : 4;
      const idx17 = hours.indexOf(17) !== -1 ? hours.indexOf(17) : 8;
      const idx21 = hours.indexOf(21) !== -1 ? hours.indexOf(21) : 12;
      
      const midIdx = Math.floor(hours.length / 2);
      const mainCode = data.hourly.weathercode[midIdx] || 0;
      
      setWeatherForm({
        date: weatherForm.date,
        condition: getCondition(mainCode),
        temp: getTemp(midIdx),
        humidity: getHumidity(midIdx),
        wind: getWind(midIdx),
        hourlyForecasts: [
          { time: '09:00 WITA', temp: getTemp(idx9), condition: getCondition(data.hourly.weathercode[idx9] || 0) },
          { time: '13:00 WITA', temp: getTemp(idx13), condition: getCondition(data.hourly.weathercode[idx13] || 0) },
          { time: '17:00 WITA', temp: getTemp(idx17), condition: getCondition(data.hourly.weathercode[idx17] || 0) },
          { time: '21:00 WITA', temp: getTemp(idx21), condition: getCondition(data.hourly.weathercode[idx21] || 0) },
        ]
      });
      setSaveMessage('Data cuaca berhasil diambil dari Open-Meteo API!');
      setTimeout(() => setSaveMessage(''), 4000);
    } catch (err: any) {
      setSaveMessage(`Gagal mengambil cuaca: ${err.message}`);
      setTimeout(() => setSaveMessage(''), 4000);
    } finally {
      setIsFetchingWeather(false);
    }
  };

  // Banner CRUD
  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBannerTitle || !newBannerContent) return;
    try {
      await addDoc(collection(db, `sites/${SITE_ID}/banners`), {
        title: newBannerTitle,
        content: newBannerContent,
        type: newBannerType,
        senderName: user?.email || 'Developer',
        senderType: 'developer',
        active: true,
        createdAt: new Date()
      });
      setNewBannerTitle('');
      setNewBannerContent('');
      setSaveMessage('Banner notifikasi berhasil ditambahkan!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error: any) {
      alert(`Gagal menambah banner: ${error.message}`);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Hapus banner notifikasi ini?')) return;
    try {
      await deleteDoc(doc(db, `sites/${SITE_ID}/banners`, id));
    } catch (error: any) {
      alert(`Gagal menghapus: ${error.message}`);
    }
  };

  const handleToggleBannerActive = async (id: string, currentActive: boolean) => {
    try {
      await setDoc(doc(db, `sites/${SITE_ID}/banners`, id), { active: !currentActive }, { merge: true });
    } catch (error: any) {
      alert(`Gagal mengubah: ${error.message}`);
    }
  };

  // Guest CRUD
  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName.trim()) return;
    const name = newGuestName.trim();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    try {
      await setDoc(doc(db, `sites/${SITE_ID}/guests/${slug}`), {
        name,
        slug,
        phone: newGuestPhone.trim() || '',
        createdAt: new Date()
      });
      setNewGuestName('');
      setNewGuestPhone('');
      setSaveMessage(`Tamu "${name}" ditambahkan! Link: ?to=${slug}`);
      setTimeout(() => setSaveMessage(''), 4000);
    } catch (error: any) {
      alert(`Gagal menambah tamu: ${error.message}`);
    }
  };

  const handleDeleteGuest = async (slug: string) => {
    if (!confirm('Hapus tamu ini dari daftar undangan?')) return;
    try {
      await deleteDoc(doc(db, `sites/${SITE_ID}/guests`, slug));
    } catch (error: any) {
      alert(`Gagal menghapus tamu: ${error.message}`);
    }
  };

  const handleAdminPostWish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminWishName.trim() || !adminWishMsg.trim()) return;
    try {
      await addDoc(collection(db, `sites/${SITE_ID}/guestbook`), {
        name: adminWishName.trim(),
        message: adminWishMsg.trim(),
        attendance: adminWishAttendance,
        isAdmin: true,
        adminEmail: user?.email || 'developer',
        likesCount: 0,
        createdAt: new Date()
      });
      setAdminWishName('');
      setAdminWishMsg('');
      setSaveMessage('Doa restu admin berhasil dikirim!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error: any) {
      alert(`Gagal mengirim doa restu: ${error.message}`);
    }
  };

  const handleToggleRainbow = async (name: string) => {
    const isRainbow = rainbowNames.some(r => r.toLowerCase() === name.toLowerCase());
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    if (isRainbow) {
      if (confirm(`Hapus efek rainbow untuk "${name}"?`)) {
        await deleteDoc(doc(db, `sites/${SITE_ID}/rainbowNames/${slug}`));
      }
    } else {
      await setDoc(doc(db, `sites/${SITE_ID}/rainbowNames/${slug}`), {
        name,
        slug,
        addedBy: user?.email || 'admin',
        createdAt: new Date()
      });
      setSaveMessage(`"${name}" mendapat efek rainbow!`);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const getGuestLink = (slug: string) => {
    return `${window.location.origin}${window.location.pathname}?to=${slug}`;
  };

  const copyGuestLink = (slug: string) => {
    const link = getGuestLink(slug);
    navigator.clipboard.writeText(link).then(() => {
      setSaveMessage(`Link disalin: ${link}`);
      setTimeout(() => setSaveMessage(''), 3000);
    }).catch(() => {});
  };

  // Verified Users CRUD
  const handleToggleVerified = async (name: string, isCurrentlyVerified: boolean) => {
    try {
      if (isCurrentlyVerified) {
        const existing = verifiedUsers.find(v => v.name === name);
        if (existing) await deleteDoc(doc(db, `sites/${SITE_ID}/verifiedUsers`, existing.id));
      } else {
        await setDoc(doc(db, `sites/${SITE_ID}/verifiedUsers/${name.replace(/[^a-zA-Z0-9]/g, '_')}`), {
          name,
          approvedBy: user?.email || 'admin',
          approvedAt: new Date()
        });
      }
    } catch (error: any) {
      alert(`Gagal: ${error.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0d0309] border-2 border-[#C9A24B]/30 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh] text-white">
        
        {/* Balinese Top Accent */}
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-[#C9A24B] to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#C9A24B]" />
            <h2 className="font-serif text-lg font-black uppercase tracking-tight">Admin Control Panel</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Auth Barrier Screen */}
        {!isAuthorized ? (
          <div className="flex-1 flex flex-col items-center justify-center py-10 px-4 text-center">
            <Lock className="w-12 h-12 text-[#C9A24B]/70 mb-4 animate-pulse" />
            <h3 className="font-serif text-lg font-bold uppercase tracking-tight text-white mb-2">Autentikasi Diperlukan</h3>
            <p className="text-xs text-[#FDF6E9]/75 mb-6 leading-relaxed max-w-sm">
              Untuk melakukan perubahan data undangan pernikahan (Full-Stack), silakan masuk menggunakan akun Administrator terdaftar atau PIN Developer.
            </p>

            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-white text-black font-sans font-black text-xs uppercase tracking-wider hover:bg-gray-100 transition-all cursor-pointer mb-6 active:scale-95 shadow-lg"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.96 5.96 0 0 1 8 12.57c0-3.3 2.67-5.97 5.991-5.97 1.44 0 2.76.513 3.801 1.5l2.97-2.97C18.91 3.321 16.59 2.2 13.991 2.2a9.78 9.78 0 0 0-9.75 9.8 9.78 9.78 0 0 0 9.75 9.8c5.441 0 9.741-3.9 9.741-9.8a8.3 8.3 0 0 0-.153-1.714H12.24z"/>
              </svg>
              <span>Masuk Dengan Google</span>
            </button>

            <div className="w-full flex items-center gap-3 my-4">
              <div className="h-[1px] flex-1 bg-white/10" />
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Atau PIN Developer</span>
              <div className="h-[1px] flex-1 bg-white/10" />
            </div>

            <form onSubmit={handlePasscodeSignIn} className="w-full flex gap-2">
              <input 
                type="password"
                placeholder="Masukkan 6 Digit PIN Admin..."
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 focus:border-[#C9A24B] outline-none text-center font-sans tracking-widest text-sm text-white"
              />
              <button 
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#C9A24B] font-sans font-black text-xs tracking-wider uppercase text-white cursor-pointer active:scale-95"
              >
                Masuk
              </button>
            </form>

            {authError && (
              <div className="mt-5 p-3 rounded-xl bg-red-950/40 border border-red-500/20 text-[10px] font-sans font-bold text-red-300 flex items-start gap-2 max-w-sm text-left">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}
          </div>
        ) : (
          /* Logged In Dashboard */
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
            {/* Admin user bar */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-sans font-bold uppercase text-[#C9A24B] tracking-wider">
                  Admin: {user ? user.email : 'Developer Mode'}
                </span>
              </div>
              <button 
                onClick={handleSignOut}
                className="flex items-center gap-1 text-[9px] font-sans font-black text-red-400 uppercase tracking-wider hover:text-red-300 transition-colors cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
                <span>Keluar</span>
              </button>
            </div>

            {/* Quick action save notifications */}
            {saveMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-xs font-sans font-bold text-emerald-300 flex items-center gap-2"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{saveMessage}</span>
              </motion.div>
            )}

            {/* Dashboard Tabs bar */}
            <div className="flex flex-wrap gap-1.5 pb-2 border-b border-white/5 mb-4">
              {[
                { id: 'general', label: 'Umum', icon: Settings },
                { id: 'events', label: 'Acara', icon: Calendar },
                { id: 'finance', label: 'Kado', icon: CreditCard },
                { id: 'announcements', label: 'Kabar', icon: Bell },
                { id: 'gallery', label: 'Galeri', icon: ImageIcon },
                { id: 'rsvp', label: 'RSVP', icon: Users },
                { id: 'guestbook', label: 'Doa Restu', icon: MessageSquare },
                { id: 'weather', label: 'Cuaca', icon: Cloud },
                { id: 'notifications', label: 'Notifikasi', icon: Send },
                { id: 'verified', label: 'Terverifikasi', icon: ShieldCheck },
    { id: 'rainbow', label: 'Rainbow', icon: Star },
    { id: 'guests', label: 'Tamu', icon: UserPlus },
    { id: 'countdown', label: 'Hitung', icon: Timer },
    { id: 'visitors', label: 'Pengunjung', icon: Smartphone },
              ].map((tab) => {
                const IconComp = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-[10px] font-sans font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
                      activeTab === tab.id 
                        ? 'bg-[#C9A24B]/15 border-[#C9A24B] text-[#C9A24B]' 
                        : 'bg-white/5 border-white/10 text-white/70 hover:border-white/20'
                    }`}
                  >
                    <IconComp className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT: GENERAL CONFIG */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-1">
              {activeTab === 'general' && (
                <div className="flex flex-col gap-5 text-left pb-4">
                  {/* Toggles */}
                  <div className="grid grid-cols-1 gap-3.5">
                    <div className="grid grid-cols-2 gap-3.5">
                    <label className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/15 cursor-pointer">
                      <div>
                        <p className="text-xs font-bold uppercase text-white leading-tight">Nikah Massal</p>
                        <p className="text-[9px] text-[#FDF6E9]/50 mt-0.5">Aktifkan 2 pasang mempelai</p>
                      </div>
                      <input 
                        type="checkbox"
                        checked={formData.isJointWedding || false}
                        onChange={(e) => setFormData({ ...formData, isJointWedding: e.target.checked })}
                        className="w-4.5 h-4.5 accent-[#C9A24B]"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/15 cursor-pointer">
                      <div>
                        <p className="text-xs font-bold uppercase text-red-300 leading-tight">Maintenance</p>
                        <p className="text-[9px] text-[#FDF6E9]/50 mt-0.5">Kunci akses seluruh tamu</p>
                      </div>
                      <input 
                        type="checkbox"
                        checked={formData.maintenanceMode || false}
                        onChange={(e) => setFormData({ ...formData, maintenanceMode: e.target.checked })}
                        className="w-4.5 h-4.5 accent-red-500"
                      />
                    </label>
                    </div>

                    {/* Notification Force Toggles */}
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-amber-500/20 flex flex-col gap-3">
                      <h4 className="text-[11px] font-sans font-black uppercase text-amber-200 tracking-wider flex items-center gap-2">
                        <Bell className="w-3.5 h-3.5" />Paksa Notifikasi di Opening
                      </h4>
                      <p className="text-[9px] text-white/40 leading-relaxed">Atur apakah tamu harus izinkan notifikasi sebelum bisa membuka undangan. iOS/Safari mungkin tidak mendukung notifikasi.</p>
                      <div className="grid grid-cols-2 gap-3">
                        <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/10 cursor-pointer">
                          <div>
                            <p className="text-[10px] font-bold uppercase text-emerald-300 leading-tight">Android</p>
                            <p className="text-[8px] text-white/40 mt-0.5">{formData.forceNotifAndroid !== false ? 'Aktif' : 'Nonaktif'}</p>
                          </div>
                          <input 
                            type="checkbox"
                            checked={formData.forceNotifAndroid !== false}
                            onChange={(e) => setFormData({ ...formData, forceNotifAndroid: e.target.checked })}
                            className="w-4 h-4 accent-emerald-500"
                          />
                        </label>
                        <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/10 cursor-pointer">
                          <div>
                            <p className="text-[10px] font-bold uppercase text-blue-300 leading-tight">iPhone / iOS</p>
                            <p className="text-[8px] text-white/40 mt-0.5">{formData.forceNotifIos ? 'Aktif' : 'Nonaktif'}</p>
                          </div>
                          <input 
                            type="checkbox"
                            checked={formData.forceNotifIos || false}
                            onChange={(e) => setFormData({ ...formData, forceNotifIos: e.target.checked })}
                            className="w-4 h-4 accent-blue-500"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Prewedding background link */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#C9A24B] font-sans">URL Gambar Sampul (Prewedding)</span>
                    <input 
                      type="text"
                      value={formData.coverImageUrl || ''}
                      onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                      className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs focus:border-[#C9A24B] outline-none"
                    />
                  </div>

                  {/* Couple 1: Putu & Widya */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-3.5">
                    <h4 className="text-[11px] font-sans font-black uppercase text-amber-200 tracking-wider">Data Mempelai 1</h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-white/60">Nama Lengkap Pria</span>
                        <input 
                          type="text"
                          value={formData.couple.groom.fullName}
                          onChange={(e) => setFormData({
                            ...formData,
                            couple: { ...formData.couple, groom: { ...formData.couple.groom, fullName: e.target.value } }
                          })}
                          className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-white/60">Panggilan Pria</span>
                        <input 
                          type="text"
                          value={formData.couple.groom.nickname}
                          onChange={(e) => setFormData({
                            ...formData,
                            couple: { ...formData.couple, groom: { ...formData.couple.groom, nickname: e.target.value } }
                          })}
                          className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-white/60">Anak Ke- (Pria)</span>
                        <input 
                          type="text"
                          value={formData.couple.groom.childInfo || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            couple: { ...formData.couple, groom: { ...formData.couple.groom, childInfo: e.target.value } }
                          })}
                          className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-white/60">Instagram Pria</span>
                        <input 
                          type="text"
                          value={formData.couple.groom.instagram || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            couple: { ...formData.couple, groom: { ...formData.couple.groom, instagram: e.target.value } }
                          })}
                          className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-white/60">Nama Ayah (Pria)</span>
                        <input 
                          type="text"
                          value={formData.couple.groom.fatherName}
                          onChange={(e) => setFormData({
                            ...formData,
                            couple: { ...formData.couple, groom: { ...formData.couple.groom, fatherName: e.target.value } }
                          })}
                          className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-white/60">Nama Ibu (Pria)</span>
                        <input 
                          type="text"
                          value={formData.couple.groom.motherName}
                          onChange={(e) => setFormData({
                            ...formData,
                            couple: { ...formData.couple, groom: { ...formData.couple.groom, motherName: e.target.value } }
                          })}
                          className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs outline-none"
                        />
                      </div>
                    </div>

                    <div className="h-[1px] bg-white/5 my-1" />

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-white/60">Nama Lengkap Wanita</span>
                        <input 
                          type="text"
                          value={formData.couple.bride.fullName}
                          onChange={(e) => setFormData({
                            ...formData,
                            couple: { ...formData.couple, bride: { ...formData.couple.bride, fullName: e.target.value } }
                          })}
                          className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-white/60">Panggilan Wanita</span>
                        <input 
                          type="text"
                          value={formData.couple.bride.nickname}
                          onChange={(e) => setFormData({
                            ...formData,
                            couple: { ...formData.couple, bride: { ...formData.couple.bride, nickname: e.target.value } }
                          })}
                          className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-white/60">Anak Ke- (Wanita)</span>
                        <input 
                          type="text"
                          value={formData.couple.bride.childInfo || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            couple: { ...formData.couple, bride: { ...formData.couple.bride, childInfo: e.target.value } }
                          })}
                          className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-white/60">Instagram Wanita</span>
                        <input 
                          type="text"
                          value={formData.couple.bride.instagram || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            couple: { ...formData.couple, bride: { ...formData.couple.bride, instagram: e.target.value } }
                          })}
                          className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-white/60">Nama Ayah (Wanita)</span>
                        <input 
                          type="text"
                          value={formData.couple.bride.fatherName}
                          onChange={(e) => setFormData({
                            ...formData,
                            couple: { ...formData.couple, bride: { ...formData.couple.bride, fatherName: e.target.value } }
                          })}
                          className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-white/60">Nama Ibu (Wanita)</span>
                        <input 
                          type="text"
                          value={formData.couple.bride.motherName}
                          onChange={(e) => setFormData({
                            ...formData,
                            couple: { ...formData.couple, bride: { ...formData.couple.bride, motherName: e.target.value } }
                          })}
                          className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Couple 2: Gede Julianto & Elyana */}
                  {formData.isJointWedding && formData.couple2 && (
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-3.5">
                      <h4 className="text-[11px] font-sans font-black uppercase text-amber-200 tracking-wider">Data Mempelai 2</h4>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] text-white/60">Nama Lengkap Pria</span>
                          <input 
                            type="text"
                            value={formData.couple2.groom.fullName}
                            onChange={(e) => setFormData({
                              ...formData,
                              couple2: {
                                ...formData.couple2!,
                                groom: { ...formData.couple2!.groom, fullName: e.target.value }
                              }
                            })}
                            className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] text-white/60">Panggilan Pria</span>
                          <input 
                            type="text"
                            value={formData.couple2.groom.nickname}
                            onChange={(e) => setFormData({
                              ...formData,
                              couple2: {
                                ...formData.couple2!,
                                groom: { ...formData.couple2!.groom, nickname: e.target.value }
                              }
                            })}
                            className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] text-white/60">Anak Ke- (Pria)</span>
                          <input 
                            type="text"
                            value={formData.couple2.groom.childInfo || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              couple2: {
                                ...formData.couple2!,
                                groom: { ...formData.couple2!.groom, childInfo: e.target.value }
                              }
                            })}
                            className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] text-white/60">Instagram Pria</span>
                          <input 
                            type="text"
                            value={formData.couple2.groom.instagram || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              couple2: {
                                ...formData.couple2!,
                                groom: { ...formData.couple2!.groom, instagram: e.target.value }
                              }
                            })}
                            className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] text-white/60">Nama Ayah (Pria)</span>
                          <input 
                            type="text"
                            value={formData.couple2.groom.fatherName}
                            onChange={(e) => setFormData({
                              ...formData,
                              couple2: {
                                ...formData.couple2!,
                                groom: { ...formData.couple2!.groom, fatherName: e.target.value }
                              }
                            })}
                            className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] text-white/60">Nama Ibu (Pria)</span>
                          <input 
                            type="text"
                            value={formData.couple2.groom.motherName}
                            onChange={(e) => setFormData({
                              ...formData,
                              couple2: {
                                ...formData.couple2!,
                                groom: { ...formData.couple2!.groom, motherName: e.target.value }
                              }
                            })}
                            className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs outline-none"
                          />
                        </div>
                      </div>

                      <div className="h-[1px] bg-white/5 my-1" />

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] text-white/60">Nama Lengkap Wanita</span>
                          <input 
                            type="text"
                            value={formData.couple2.bride.fullName}
                            onChange={(e) => setFormData({
                              ...formData,
                              couple2: {
                                ...formData.couple2!,
                                bride: { ...formData.couple2!.bride, fullName: e.target.value }
                              }
                            })}
                            className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] text-white/60">Panggilan Wanita</span>
                          <input 
                            type="text"
                            value={formData.couple2.bride.nickname}
                            onChange={(e) => setFormData({
                              ...formData,
                              couple2: {
                                ...formData.couple2!,
                                bride: { ...formData.couple2!.bride, nickname: e.target.value }
                              }
                            })}
                            className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] text-white/60">Anak Ke- (Wanita)</span>
                          <input 
                            type="text"
                            value={formData.couple2.bride.childInfo || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              couple2: {
                                ...formData.couple2!,
                                bride: { ...formData.couple2!.bride, childInfo: e.target.value }
                              }
                            })}
                            className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] text-white/60">Instagram Wanita</span>
                          <input 
                            type="text"
                            value={formData.couple2.bride.instagram || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              couple2: {
                                ...formData.couple2!,
                                bride: { ...formData.couple2!.bride, instagram: e.target.value }
                              }
                            })}
                            className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] text-white/60">Nama Ayah (Wanita)</span>
                          <input 
                            type="text"
                            value={formData.couple2.bride.fatherName}
                            onChange={(e) => setFormData({
                              ...formData,
                              couple2: {
                                ...formData.couple2!,
                                bride: { ...formData.couple2!.bride, fatherName: e.target.value }
                              }
                            })}
                            className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] text-white/60">Nama Ibu (Wanita)</span>
                          <input 
                            type="text"
                            value={formData.couple2.bride.motherName || ''}
                            onChange={(e) => {
                              const mother = e.target.value;
                              setFormData(prev => ({
                                ...prev,
                                couple2: {
                                  ...prev.couple2!,
                                  bride: { ...prev.couple2!.bride, motherName: mother }
                                }
                              }));
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Music URL */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#C9A24B] font-sans flex items-center gap-1.5">
                      <Music className="w-3.5 h-3.5" /> URL Lagu / Musik Latar
                    </span>
                    <input 
                      type="text"
                      value={formData.musicUrl || ''}
                      onChange={(e) => setFormData({ ...formData, musicUrl: e.target.value })}
                      placeholder="https://example.com/music.mp3"
                      className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs focus:border-[#C9A24B] outline-none"
                    />
                    <p className="text-[8px] text-white/30">Format: .mp3 / .wav / URL streaming. Kosongkan untuk tanpa musik.</p>
                  </div>

                  {/* WhatsApp Share Text */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#C9A24B] font-sans flex items-center gap-1.5">
                      <Link className="w-3.5 h-3.5" /> Teks Bagikan / Share (WhatsApp)
                    </span>
                    <textarea 
                      rows={3}
                      value={formData.whatsappTextFormat || ''}
                      onChange={(e) => setFormData({ ...formData, whatsappTextFormat: e.target.value })}
                      placeholder="Om Swastyastu! Kami mengundang..."
                      className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs focus:border-[#C9A24B] outline-none resize-none"
                    />
                    <p className="text-[8px] text-white/30">Gunakan {'{linkUndangan}'} sebagai placeholder link tamu.</p>
                  </div>

                  {/* Gapura Images */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#C9A24B] font-sans">URL Gambar Gapura (Kiri & Kanan)</span>
                    <input 
                      type="text"
                      value={formData.gapuraImageUrl1 || ''}
                      onChange={(e) => setFormData({ ...formData, gapuraImageUrl1: e.target.value })}
                      placeholder="URL gapura kiri"
                      className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs focus:border-[#C9A24B] outline-none"
                    />
                    <input 
                      type="text"
                      value={formData.gapuraImageUrl2 || ''}
                      onChange={(e) => setFormData({ ...formData, gapuraImageUrl2: e.target.value })}
                      placeholder="URL gapura kanan"
                      className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs focus:border-[#C9A24B] outline-none"
                    />
                  </div>

                  {/* Mempelai Photos */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#C9A24B] font-sans flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" /> Foto Mempelai
                    </span>
                    <p className="text-[8px] text-white/30">URL foto profil mempelai yang tampil di halaman utama.</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-white/60">Mempelai Pria (Cowok)</span>
                        <input 
                          type="text"
                          value={formData.groomPhotoUrl || ''}
                          onChange={(e) => setFormData({ ...formData, groomPhotoUrl: e.target.value })}
                          placeholder="https://example.com/groom.jpg"
                          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs focus:border-[#C9A24B] outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-white/60">Mempelai Wanita (Cewek)</span>
                        <input 
                          type="text"
                          value={formData.bridePhotoUrl || ''}
                          onChange={(e) => setFormData({ ...formData, bridePhotoUrl: e.target.value })}
                          placeholder="https://example.com/bride.jpg"
                          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs focus:border-[#C9A24B] outline-none"
                        />
                      </div>
                    </div>
                    {formData.isJointWedding && (
                      <div className="grid grid-cols-2 gap-3 mt-1">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] text-white/60">Mempelai Pria 2</span>
                          <input 
                            type="text"
                            value={formData.groom2PhotoUrl || ''}
                            onChange={(e) => setFormData({ ...formData, groom2PhotoUrl: e.target.value })}
                            placeholder="https://example.com/groom2.jpg"
                            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs focus:border-[#C9A24B] outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] text-white/60">Mempelai Wanita 2</span>
                          <input 
                            type="text"
                            value={formData.bride2PhotoUrl || ''}
                            onChange={(e) => setFormData({ ...formData, bride2PhotoUrl: e.target.value })}
                            placeholder="https://example.com/bride2.jpg"
                            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs focus:border-[#C9A24B] outline-none"
                          />
                        </div>
                      </div>
                    )}
                    {formData.groomPhotoUrl && (
                      <div className="flex gap-3 mt-1">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#C9A24B]/40">
                          <img src={formData.groomPhotoUrl} alt="Groom" className="w-full h-full object-cover" onError={(e: any) => e.target.style.display='none'} />
                        </div>
                        {formData.bridePhotoUrl && (
                          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#C9A24B]/40">
                            <img src={formData.bridePhotoUrl} alt="Bride" className="w-full h-full object-cover" onError={(e: any) => e.target.style.display='none'} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleSaveConfig}
                    disabled={isSaving}
                    className="w-full flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-[#C9A24B] hover:bg-[#A37E33] font-sans font-black text-xs uppercase tracking-wider text-white shadow-lg active:scale-95 transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                  </button>
                </div>
              )}

              {/* TAB CONTENT: EVENTS SCHEDULE */}
              {activeTab === 'events' && (
                <div className="flex flex-col gap-5 text-left pb-4">
                  {/* Event 1 details */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-3.5">
                    <h4 className="text-[11px] font-sans font-black uppercase text-amber-200 tracking-wider">
                      {formData.isJointWedding ? "Acara Pawiwahan I" : "Upacara Pawiwahan"}
                    </h4>
                    
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-white/60">Waktu Mulai (Format ISO)</span>
                      <input 
                        type="text"
                        value={formData.event.date}
                        onChange={(e) => setFormData({
                          ...formData,
                          event: { ...formData.event, date: e.target.value }
                        })}
                        placeholder="YYYY-MM-DDTHH:MM:SS+08:00"
                        className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs outline-none focus:border-[#C9A24B]"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-white/60">Teks Waktu (Tampil di Undangan)</span>
                      <input 
                        type="text"
                        value={formData.event.time}
                        onChange={(e) => setFormData({
                          ...formData,
                          event: { ...formData.event, time: e.target.value }
                        })}
                        className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs outline-none focus:border-[#C9A24B]"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-white/60">Nama Tempat</span>
                      <input 
                        type="text"
                        value={formData.event.locationName}
                        onChange={(e) => setFormData({
                          ...formData,
                          event: { ...formData.event, locationName: e.target.value }
                        })}
                        className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-white/60">Alamat Lengkap</span>
                      <textarea 
                        rows={2}
                        value={formData.event.address}
                        onChange={(e) => setFormData({
                          ...formData,
                          event: { ...formData.event, address: e.target.value }
                        })}
                        className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs outline-none resize-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-white/60">Tautan Google Maps</span>
                      <input 
                        type="text"
                        value={formData.event.mapsExternalUrl}
                        onChange={(e) => setFormData({
                          ...formData,
                          event: { ...formData.event, mapsExternalUrl: e.target.value }
                        })}
                        className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs outline-none"
                      />
                    </div>
                  </div>

                  {/* Event 2 details (Joint wedding only) */}
                  {formData.isJointWedding && formData.event2 && (
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-3.5">
                      <h4 className="text-[11px] font-sans font-black uppercase text-amber-200 tracking-wider">Acara Pawiwahan II</h4>
                      
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-white/60">Waktu Mulai (Format ISO)</span>
                        <input 
                          type="text"
                          value={formData.event2.date}
                          onChange={(e) => setFormData({
                            ...formData,
                            event2: { ...formData.event2!, date: e.target.value }
                          })}
                          placeholder="YYYY-MM-DDTHH:MM:SS+08:00"
                          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-white/60">Teks Waktu (Tampil di Undangan)</span>
                        <input 
                          type="text"
                          value={formData.event2.time}
                          onChange={(e) => setFormData({
                            ...formData,
                            event2: { ...formData.event2!, time: e.target.value }
                          })}
                          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-white/60">Nama Tempat</span>
                        <input 
                          type="text"
                          value={formData.event2.locationName}
                          onChange={(e) => setFormData({
                            ...formData,
                            event2: { ...formData.event2!, locationName: e.target.value }
                          })}
                          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-white/60">Alamat Lengkap</span>
                        <textarea 
                          rows={2}
                          value={formData.event2.address}
                          onChange={(e) => setFormData({
                            ...formData,
                            event2: { ...formData.event2!, address: e.target.value }
                          })}
                          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs outline-none resize-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-white/60">Tautan Google Maps</span>
                        <input 
                          type="text"
                          value={formData.event2.mapsExternalUrl}
                          onChange={(e) => setFormData({
                            ...formData,
                            event2: { ...formData.event2!, mapsExternalUrl: e.target.value }
                          })}
                          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Resepsi Toggle */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[11px] font-sans font-black uppercase text-amber-200 tracking-wider">Acara Resepsi Pernikahan</h4>
                      {formData.reception ? (
                        <button
                          onClick={() => setFormData({ ...formData, reception: undefined })}
                          className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 text-[10px] font-bold uppercase cursor-pointer active:scale-95 transition-all"
                        >
                          <Trash2 className="w-3 h-3 inline mr-1" />Hapus Resepsi
                        </button>
                      ) : (
                        <button
                          onClick={() => setFormData({
                            ...formData,
                            reception: {
                              date: '',
                              time: '19:00 WITA - Selesai',
                              locationName: formData.event.locationName || '',
                              address: formData.event.address || '',
                              mapsEmbedUrl: formData.event.mapsEmbedUrl || '',
                              mapsExternalUrl: formData.event.mapsExternalUrl || '',
                            }
                          })}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase cursor-pointer active:scale-95 transition-all"
                        >
                          <Plus className="w-3 h-3 inline mr-1" />Tambah Resepsi
                        </button>
                      )}
                    </div>
                    {!formData.reception && (
                      <p className="text-[9px] text-white/40">Belum ada acara Resepsi. Klik "Tambah Resepsi" untuk menambahkan.</p>
                    )}
                  </div>

                  {/* Reception shared details */}
                  {formData.reception && (
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-3.5">
                      <h4 className="text-[11px] font-sans font-black uppercase text-amber-200 tracking-wider">Acara Resepsi Pernikahan</h4>
                      
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-white/60">Waktu Mulai (Format ISO)</span>
                        <input 
                          type="text"
                          value={formData.reception.date}
                          onChange={(e) => setFormData({
                            ...formData,
                            reception: { ...formData.reception!, date: e.target.value }
                          })}
                          placeholder="YYYY-MM-DDTHH:MM:SS+08:00"
                          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-white/60">Teks Waktu (Tampil di Undangan)</span>
                        <input 
                          type="text"
                          value={formData.reception.time}
                          onChange={(e) => setFormData({
                            ...formData,
                            reception: { ...formData.reception!, time: e.target.value }
                          })}
                          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-white/60">Nama Tempat</span>
                        <input 
                          type="text"
                          value={formData.reception.locationName}
                          onChange={(e) => setFormData({
                            ...formData,
                            reception: { ...formData.reception!, locationName: e.target.value }
                          })}
                          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-white/60">Alamat Lengkap</span>
                        <textarea 
                          rows={2}
                          value={formData.reception.address}
                          onChange={(e) => setFormData({
                            ...formData,
                            reception: { ...formData.reception!, address: e.target.value }
                          })}
                          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs outline-none resize-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-white/60">Tautan Google Maps</span>
                        <input 
                          type="text"
                          value={formData.reception.mapsExternalUrl}
                          onChange={(e) => setFormData({
                            ...formData,
                            reception: { ...formData.reception!, mapsExternalUrl: e.target.value }
                          })}
                          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleSaveConfig}
                    disabled={isSaving}
                    className="w-full flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-[#C9A24B] hover:bg-[#A37E33] font-sans font-black text-xs uppercase tracking-wider text-white shadow-lg active:scale-95 transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Menyimpan...' : 'Simpan Waktu & Lokasi'}</span>
                  </button>
                </div>
              )}

              {/* TAB CONTENT: FINANCIALS & GIFT CARDS */}
              {activeTab === 'finance' && (
                <div className="flex flex-col gap-5 text-left pb-4">
                  {/* QRIS Link */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#C9A24B] font-sans">URL Gambar QRIS</span>
                    <input 
                      type="text"
                      value={formData.qrisImageUrl || ''}
                      onChange={(e) => setFormData({ ...formData, qrisImageUrl: e.target.value })}
                      className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs focus:border-[#C9A24B] outline-none"
                    />
                  </div>

                  {/* Bank Accounts */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-4">
                    <h4 className="text-[11px] font-sans font-black uppercase text-amber-200 tracking-wider">Rekening Bank Transfer</h4>
                    
                    {formData.bankAccounts.map((card, index) => (
                      <div key={index} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-3">
                        <div className="flex items-center justify-between text-[10px] font-sans font-bold text-[#C9A24B] tracking-wider uppercase">
                          <span>Rekening #{index + 1}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] text-white/50">Nama Bank</span>
                            <input 
                              type="text"
                              value={card.bank}
                              onChange={(e) => {
                                const newAccounts = [...formData.bankAccounts];
                                newAccounts[index].bank = e.target.value;
                                setFormData({ ...formData, bankAccounts: newAccounts });
                              }}
                              className="px-2 py-1.5 rounded bg-white/5 border border-white/10 text-xs outline-none"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] text-white/50">Nomor Rekening</span>
                            <input 
                              type="text"
                              value={card.number}
                              onChange={(e) => {
                                const newAccounts = [...formData.bankAccounts];
                                newAccounts[index].number = e.target.value;
                                setFormData({ ...formData, bankAccounts: newAccounts });
                              }}
                              className="px-2 py-1.5 rounded bg-white/5 border border-white/10 text-xs outline-none"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] text-white/50">Pemilik Rekening</span>
                          <input 
                            type="text"
                            value={card.holder}
                            onChange={(e) => {
                              const newAccounts = [...formData.bankAccounts];
                              newAccounts[index].holder = e.target.value;
                              setFormData({ ...formData, bankAccounts: newAccounts });
                            }}
                            className="px-2 py-1.5 rounded bg-white/5 border border-white/10 text-xs outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleSaveConfig}
                    disabled={isSaving}
                    className="w-full flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-[#C9A24B] hover:bg-[#A37E33] font-sans font-black text-xs uppercase tracking-wider text-white shadow-lg active:scale-95 transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Menyimpan...' : 'Simpan Rekening & QRIS'}</span>
                  </button>
                </div>
              )}

              {/* TAB CONTENT: ANNOUNCEMENTS MANAGER */}
              {activeTab === 'announcements' && (
                <div className="flex flex-col gap-5 text-left pb-4">
                  
                  {/* Add Announcement Form */}
                  <form onSubmit={handleAddAnnouncement} className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col gap-3">
                    <h4 className="text-[11px] font-sans font-black uppercase text-amber-200 tracking-wider">Tambah Kabar/Pengumuman</h4>
                    
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-white/60">Judul Kabar</span>
                      <input 
                        type="text"
                        placeholder="Contoh: Info Lokasi Parkir Tambahan"
                        value={newAnnTitle}
                        onChange={(e) => setNewAnnTitle(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-white/60">Isi Pengumuman</span>
                      <textarea 
                        rows={3}
                        placeholder="Tulis pengumuman penting di sini..."
                        value={newAnnContent}
                        onChange={(e) => setNewAnnContent(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs outline-none resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 items-end">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-white/60">Kategori Pengirim</span>
                        <select 
                          value={newAnnSender}
                          onChange={(e) => setNewAnnSender(e.target.value as any)}
                          className="px-2.5 py-2 rounded-lg bg-[#14020f] border border-white/10 text-xs outline-none text-white cursor-pointer"
                        >
                          <option value="mempelai">Dari Mempelai</option>
                          <option value="keluarga">Dari Keluarga</option>
                          <option value="developer">Saputra Developer (Verified)</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#C9A24B] hover:bg-[#A37E33] font-sans font-black text-[10px] uppercase tracking-wider text-white cursor-pointer active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Kirim Kabar</span>
                      </button>
                    </div>
                  </form>

                  {/* List of announcements */}
                  <div className="flex flex-col gap-2.5">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#C9A24B] font-sans">Kabar Terkirim ({announcements.length})</span>
                    
                    {announcements.length === 0 ? (
                      <p className="text-xs text-white/50 py-4 text-center">Belum ada pengumuman.</p>
                    ) : (
                      announcements.map((ann) => (
                        <div key={ann.id} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                ann.senderType === 'developer' ? 'bg-blue-500/20 text-blue-300' : 'bg-amber-500/20 text-[#C9A24B]'
                              }`}>
                                {ann.senderType}
                              </span>
                              <h5 className="font-sans font-bold text-xs text-white truncate uppercase">{ann.title}</h5>
                            </div>
                            <p className="text-[10px] text-white/70 line-clamp-2 leading-relaxed">{ann.content}</p>
                          </div>
                          <button 
                            onClick={() => handleDeleteAnnouncement(ann.id)}
                            className="p-1 text-red-400 hover:bg-red-500/10 rounded cursor-pointer self-center"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB CONTENT: GALLERY PHOTOS */}
              {activeTab === 'gallery' && (
                <div className="flex flex-col gap-5 text-left pb-4">
                  {/* Add Photo URL */}
                  <form onSubmit={handleAddPhoto} className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col gap-3">
                    <h4 className="text-[11px] font-sans font-black uppercase text-amber-200 tracking-wider">Tambah Foto Galeri</h4>
                    
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-white/60">Tautan Gambar (URL)</span>
                      <input 
                        type="text"
                        placeholder="https://images.unsplash.com/..."
                        value={newPhotoUrl}
                        onChange={(e) => setNewPhotoUrl(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs outline-none"
                      />
                    </div>

                    {/* Live Photo Preview */}
                    {newPhotoUrl && (
                      <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/40">
                        <img
                          src={newPhotoUrl}
                          alt="Preview"
                          className="w-full h-40 object-contain bg-black/60"
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          onError={(e: any) => {
                            e.target.style.display = 'none';
                            const parent = e.target.parentElement;
                            if (parent && !parent.querySelector('.preview-err')) {
                              const errDiv = document.createElement('div');
                              errDiv.className = 'preview-err absolute inset-0 flex flex-col items-center justify-center gap-1 p-3';
                              errDiv.innerHTML = '<span class="text-[10px] text-red-400 font-bold">Gambar gagal dimuat</span><span class="text-[8px] text-white/40 text-center">Pastikan URL gambar benar & mendukung embed (bukan hotlink-protected).<br/>Coba: imgbb.com, imgur.com, postimages.org, atau unsplash.</span>';
                              parent.appendChild(errDiv);
                            }
                          }}
                          onLoad={(e: any) => {
                            e.target.style.display = '';
                            const errEl = e.target.parentElement?.querySelector('.preview-err');
                            if (errEl) errEl.remove();
                          }}
                        />
                        <span className="absolute top-1.5 left-1.5 text-[7px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Preview</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 items-end">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-white/60">Orientasi Tampilan</span>
                        <select 
                          value={newPhotoOrientation}
                          onChange={(e) => setNewPhotoOrientation(e.target.value as any)}
                          className="px-2.5 py-2 rounded-lg bg-[#14020f] border border-white/10 text-xs outline-none text-white cursor-pointer"
                        >
                          <option value="left">Baris 1 (Miring Kiri)</option>
                          <option value="right">Baris 2 (Miring Kanan)</option>
                          <option value="row3">Baris 3 (Miring Kiri)</option>
                          <option value="row4">Baris 4 (Miring Kanan)</option>
                          <option value="row5">Baris 5 (Miring Kiri)</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#C9A24B] hover:bg-[#A37E33] font-sans font-black text-[10px] uppercase tracking-wider text-white cursor-pointer active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Sematkan Foto</span>
                      </button>
                    </div>
                  </form>

                  {/* List of photos */}
                  <div className="flex flex-col gap-2.5">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#C9A24B] font-sans">Koleksi Foto ({photos.length})</span>
                    
                    <div className="grid grid-cols-3 gap-3">
                      {photos.map((ph) => (
                        <div key={ph.id} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group bg-black">
                          <img 
                            src={ph.url} 
                            alt="Gallery item" 
                            className="w-full h-full object-cover filter brightness-90 group-hover:brightness-100 transition-all"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            onClick={() => handleDeletePhoto(ph.id)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-black/60 hover:bg-red-500/80 text-white cursor-pointer transition-all active:scale-90"
                            title="Hapus foto"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                          <div className="absolute bottom-1 left-1 bg-black/75 px-1.5 py-0.5 rounded text-[8px] font-mono text-[#C9A24B] font-bold uppercase">
                            Baris {ph.orientation === 'left' ? '1' : ph.orientation === 'right' ? '2' : ph.orientation === 'row3' ? '3' : ph.orientation === 'row4' ? '4' : '5'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: RSVP MANAGER */}
              {activeTab === 'rsvp' && (
                <div className="flex flex-col gap-5 text-left pb-4">
                  {/* Summary card */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col gap-2.5">
                    <h4 className="text-[11px] font-sans font-black uppercase text-amber-200 tracking-wider">Ringkasan Konfirmasi RSVP</h4>
                    <div className="grid grid-cols-2 gap-3.5 mt-1">
                      <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                        <span className="text-[9px] text-white/50 uppercase tracking-wider font-semibold">Total Pengirim</span>
                        <p className="text-xl font-serif font-black text-white mt-1">{rsvps.length}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-[#C9A24B]/10 border border-[#C9A24B]/15">
                        <span className="text-[9px] text-[#C9A24B]/70 uppercase tracking-wider font-semibold">Total Tamu Datang</span>
                        <p className="text-xl font-serif font-black text-[#C9A24B] mt-1">
                          {rsvps.filter(r => r.attendance === 'hadir').reduce((acc, r) => acc + (Number(r.totalGuest) || 1), 0)}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center mt-1 text-[10px]">
                      <div className="py-2.5 px-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl font-bold uppercase">
                        Hadir: {rsvps.filter(r => r.attendance === 'hadir').length}
                      </div>
                      <div className="py-2.5 px-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl font-bold uppercase">
                        Tidak: {rsvps.filter(r => r.attendance === 'tidak').length}
                      </div>
                      <div className="py-2.5 px-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl font-bold uppercase">
                        Ragu: {rsvps.filter(r => r.attendance === 'ragu').length}
                      </div>
                    </div>
                  </div>

                  {/* List of RSVPs */}
                  <div className="flex flex-col gap-2.5">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#C9A24B] font-sans">Daftar Tamu RSVP ({rsvps.length})</span>
                    
                    <div className="flex flex-col gap-2.5 max-h-[350px] overflow-y-auto pr-1">
                      {rsvps.length === 0 ? (
                        <div className="text-center py-8 text-white/45 text-xs font-medium font-sans">Belum ada RSVP masuk.</div>
                      ) : (
                        rsvps.map((r, idx) => (
                          <div key={r.id || idx} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-3">
                            <div className="flex flex-col gap-1 min-w-0">
                              <span className="text-xs font-black text-white truncate max-w-[180px] uppercase tracking-wide">{r.guestName}</span>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-[9px] font-sans font-black uppercase px-2 py-0.5 rounded-full ${
                                  r.attendance === 'hadir' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                                  r.attendance === 'tidak' ? 'bg-red-500/15 text-red-400 border border-red-500/30' :
                                  'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                }`}>
                                  {r.attendance === 'hadir' ? `Hadir (${r.totalGuest || 1} Tamu)` : r.attendance === 'tidak' ? 'Absen' : 'Ragu-ragu'}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteRsvp(r.id)}
                              className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-red-500/20 hover:text-red-400 text-white/70 cursor-pointer active:scale-95 transition-all"
                              title="Hapus RSVP"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: GUESTBOOK WISHES MANAGER */}
              {activeTab === 'guestbook' && (
                <div className="flex flex-col gap-5 text-left pb-4">
                  {/* Admin Post Wish Form */}
                  <form onSubmit={handleAdminPostWish} className="p-4 rounded-2xl bg-white/[0.02] border border-[#C9A24B]/20 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <PenLine className="w-4 h-4 text-[#C9A24B]" />
                      <h4 className="text-[11px] font-sans font-black uppercase text-amber-200 tracking-wider">Tulis Doa Restu (Admin)</h4>
                    </div>
                    <p className="text-[9px] text-white/50 leading-relaxed">Kirim doa restu sebagai Admin. Akan tampil dengan lencana khusus.</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-white/60">Nama</span>
                        <input type="text" value={adminWishName} onChange={(e) => setAdminWishName(e.target.value)} placeholder="Admin Saputra" required
                          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs outline-none focus:border-[#C9A24B]" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-white/60">Kehadiran</span>
                        <select value={adminWishAttendance} onChange={(e) => setAdminWishAttendance(e.target.value as any)}
                          className="px-3 py-2 rounded-lg bg-[#14020f] border border-white/10 text-xs outline-none text-white cursor-pointer">
                          <option value="hadir">Hadir</option>
                          <option value="tidak">Tidak Hadir</option>
                          <option value="ragu">Ragu-ragu</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-white/60">Pesan / Doa Restu</span>
                      <textarea rows={3} value={adminWishMsg} onChange={(e) => setAdminWishMsg(e.target.value)} placeholder="Semoga pernikahan ini menjadi awal kebahagiaan..." required
                        className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs outline-none resize-none focus:border-[#C9A24B]" />
                    </div>
                    <button type="submit"
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#C9A24B] hover:bg-[#A37E33] font-sans font-black text-[10px] uppercase tracking-wider text-white cursor-pointer active:scale-95 transition-all">
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim Doa Restu Admin</span>
                    </button>
                  </form>

                  {/* List of Wishes */}
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#C9A24B] font-sans">Daftar Doa Restu ({wishes.length})</span>
                      <span className="text-[9px] font-sans font-bold text-white/50 uppercase">Total Suka: {wishes.reduce((acc, w) => acc + (w.likesCount || 0), 0)} ❤️</span>
                    </div>
                    
                    <div className="flex flex-col gap-2.5 max-h-[450px] overflow-y-auto pr-1">
                      {wishes.length === 0 ? (
                        <div className="text-center py-8 text-white/45 text-xs font-medium font-sans">Belum ada ucapan tertulis.</div>
                      ) : (
                        wishes.map((w, idx) => {
                          const isWishRainbow = rainbowNames.some(r => r.toLowerCase() === w.name.toLowerCase());
                          return (
                          <div key={w.id || idx} className={`p-3.5 rounded-xl border flex flex-col gap-2 relative ${isWishRainbow ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-white/[0.02] border-white/10'}`}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-xs font-black uppercase tracking-wide ${isWishRainbow ? '' : 'text-amber-200'}`}
                                    style={isWishRainbow ? {
                                      background: 'linear-gradient(90deg, #ff0000, #ff7700, #ffff00, #00ff00, #0000ff, #8b00ff, #ff0000)',
                                      backgroundSize: '200% 100%',
                                      WebkitBackgroundClip: 'text',
                                      WebkitTextFillColor: 'transparent',
                                      backgroundClip: 'text',
                                      animation: 'rainbow-shift 3s linear infinite',
                                    } : undefined}
                                  >{w.name}</span>
                                  {(w as any).isAdmin && (
                                    <span className="text-[7px] font-bold uppercase px-1 py-0.5 rounded bg-[#C9A24B]/20 text-[#C9A24B] border border-[#C9A24B]/30">Admin</span>
                                  )}
                                </div>
                                <span className="text-[8px] font-sans text-white/40 uppercase">Kehadiran: {w.attendance === 'hadir' ? 'Hadir' : w.attendance === 'tidak' ? 'Absen' : 'Ragu'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleToggleRainbow(w.name)}
                                  className={`p-2 rounded-lg border cursor-pointer active:scale-95 transition-all ${isWishRainbow ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' : 'bg-white/5 border-white/10 text-white/40 hover:text-yellow-400 hover:border-yellow-500/30'}`}
                                  title={isWishRainbow ? 'Hapus rainbow' : 'Beri efek rainbow'}
                                >
                                  <Star className={`w-3.5 h-3.5 ${isWishRainbow ? 'fill-yellow-400' : ''}`} />
                                </button>
                                <button
                                  onClick={() => handleDeleteWish(w.id)}
                                  className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-red-500/20 hover:text-red-400 text-white/70 cursor-pointer active:scale-95 transition-all"
                                  title="Hapus ucapan"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            
                            <p className="text-xs text-white/80 leading-relaxed font-sans line-clamp-3">{w.message}</p>
                            
                            {w.signature && (
                              <div className="bg-[#030003]/60 border border-white/5 rounded-lg p-1.5 flex items-center justify-center max-w-[80px] h-8 mt-1 overflow-hidden">
                                <img src={w.signature} alt="Sign" className="max-h-6 object-contain invert" />
                              </div>
                            )}

                            <div className="flex items-center gap-1 text-[8px] text-white/40 font-semibold font-sans mt-1">
                              <Heart className="w-2.5 h-2.5 text-[#C9A24B] fill-[#C9A24B]/20" />
                              <span>{w.likesCount || 0} orang menyukai doa ini</span>
                            </div>
                          </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}
              {/* TAB CONTENT: WEATHER MANAGEMENT */}
              {activeTab === 'weather' && (
                <div className="flex flex-col gap-5 text-left pb-4">
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col gap-3.5">
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-amber-400" />
                      <h4 className="text-[11px] font-sans font-black uppercase text-amber-200 tracking-wider">Atur Prakiraan Cuaca</h4>
                    </div>
                    <p className="text-[9px] text-white/50 leading-relaxed">Data cuaca akan ditampilkan secara realtime ke semua pengunjung website melalui Firebase.</p>

                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-white/60">Tanggal</span>
                        <div className="flex gap-2">
                          <input type="date" value={weatherForm.date} onChange={(e) => setWeatherForm({ ...weatherForm, date: e.target.value })}
                            className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs outline-none text-white" />
                          <button
                            type="button"
                            onClick={handleAutoFetchWeather}
                            disabled={isFetchingWeather || !weatherForm.date}
                            className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-blue-600/80 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer active:scale-95 transition-all shrink-0"
                          >
                            {isFetchingWeather ? (
                              <span className="animate-pulse">...</span>
                            ) : (
                              <Cloud className="w-3.5 h-3.5" />
                            )}
                            <span>{isFetchingWeather ? 'Mengambil...' : 'Auto Fetch'}</span>
                          </button>
                        </div>
                        <p className="text-[8px] text-white/30">Klik Auto Fetch untuk mengambil data cuaca otomatis dari Open-Meteo API.</p>
                      </div>

                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-white/60">Kondisi Utama</span>
                        <select value={weatherForm.condition} onChange={(e) => setWeatherForm({ ...weatherForm, condition: e.target.value })}
                          className="px-3 py-2 rounded-lg bg-[#14020f] border border-white/10 text-xs outline-none text-white cursor-pointer">
                          <option value="Cerah Berawan">Cerah Berawan</option>
                          <option value="Cerah Hangat">Cerah Hangat</option>
                          <option value="Malam Sejuk">Malam Sejuk</option>
                          <option value="Hujan Ringan">Hujan Ringan</option>
                          <option value="Berawan Tebal">Berawan Tebal</option>
                        </select>
                      </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-white/60">Suhu (°C)</span>
                        <input type="number" value={weatherForm.temp} onChange={(e) => setWeatherForm({ ...weatherForm, temp: Number(e.target.value) })}
                          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs outline-none text-white" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-white/60">Kelembaban (%)</span>
                        <input type="number" value={weatherForm.humidity} onChange={(e) => setWeatherForm({ ...weatherForm, humidity: Number(e.target.value) })}
                          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs outline-none text-white" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-white/60">Angin</span>
                        <input type="text" value={weatherForm.wind} onChange={(e) => setWeatherForm({ ...weatherForm, wind: e.target.value })}
                          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs outline-none text-white" />
                      </div>
                    </div>

                    <div className="h-[1px] bg-white/5 my-1" />
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#C9A24B] font-sans">Prakiraan Per Jam</span>

                    {weatherForm.hourlyForecasts.map((h, idx) => (
                      <div key={idx} className="grid grid-cols-3 gap-3 items-end p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] text-white/40 uppercase">Waktu</span>
                          <input type="text" value={h.time} onChange={(e) => updateHourly(idx, 'time', e.target.value)}
                            className="px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] outline-none text-white" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] text-white/40 uppercase">Suhu</span>
                          <input type="number" value={h.temp} onChange={(e) => updateHourly(idx, 'temp', Number(e.target.value))}
                            className="px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] outline-none text-white" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] text-white/40 uppercase">Kondisi</span>
                          <input type="text" value={h.condition} onChange={(e) => updateHourly(idx, 'condition', e.target.value)}
                            className="px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] outline-none text-white" />
                        </div>
                      </div>
                    ))}

                  <button onClick={handleSaveWeather} disabled={isSaving}
                    className="w-full flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-[#C9A24B] hover:bg-[#A37E33] font-sans font-black text-xs uppercase tracking-wider text-white shadow-lg active:scale-95 transition-all cursor-pointer">
                    <Cloud className="w-4 h-4" />
                    <span>{isSaving ? 'Menyimpan...' : 'Simpan & Terapkan Cuaca'}</span>
                  </button>
                </div>
              </div>
              )}

              {/* TAB CONTENT: NOTIFICATION BANNERS */}
              {activeTab === 'notifications' && (
                <div className="flex flex-col gap-5 text-left pb-4">
                  <form onSubmit={handleAddBanner} className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4 text-amber-400" />
                      <h4 className="text-[11px] font-sans font-black uppercase text-amber-200 tracking-wider">Kirim Banner Notifikasi</h4>
                    </div>
                    <p className="text-[9px] text-white/50 leading-relaxed">Banner akan muncul di bagian atas website semua pengunjung secara realtime via Firebase.</p>

                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-white/60">Judul Notifikasi</span>
                      <input type="text" placeholder="Contoh: Informasi Parkir Tambahan" value={newBannerTitle} onChange={(e) => setNewBannerTitle(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs outline-none" />
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-white/60">Isi Pesan</span>
                      <textarea rows={2} placeholder="Tulis isi notifikasi..." value={newBannerContent} onChange={(e) => setNewBannerContent(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs outline-none resize-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-3 items-end">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-white/60">Tipe Banner</span>
                        <select value={newBannerType} onChange={(e) => setNewBannerType(e.target.value as any)}
                          className="px-2.5 py-2 rounded-lg bg-[#14020f] border border-white/10 text-xs outline-none text-white cursor-pointer">
                          <option value="info">Info (Biru)</option>
                          <option value="warning">Peringatan (Kuning)</option>
                          <option value="success">Berhasil (Hijau)</option>
                        </select>
                      </div>
                      <button type="submit"
                        className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#C9A24B] hover:bg-[#A37E33] font-sans font-black text-[10px] uppercase tracking-wider text-white cursor-pointer active:scale-95">
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim Banner</span>
                      </button>
                    </div>
                  </form>

                  <div className="flex flex-col gap-2.5">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#C9A24B] font-sans">Banner Aktif ({banners.filter(b => b.active).length})</span>
                    <div className="flex flex-col gap-2.5 max-h-[350px] overflow-y-auto pr-1">
                      {banners.length === 0 ? (
                        <p className="text-xs text-white/50 py-4 text-center">Belum ada banner notifikasi.</p>
                      ) : (
                        banners.map((b) => (
                          <div key={b.id} className={`p-3.5 rounded-xl border flex justify-between items-start gap-3 ${b.active ? 'bg-white/[0.02] border-white/10' : 'bg-white/[0.01] border-white/5 opacity-50'}`}>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                  b.type === 'warning' ? 'bg-amber-500/20 text-amber-300' :
                                  b.type === 'success' ? 'bg-emerald-500/20 text-emerald-300' :
                                  'bg-blue-500/20 text-blue-300'
                                }`}>{b.type}</span>
                                <h5 className="font-sans font-bold text-xs text-white truncate uppercase">{b.title}</h5>
                                {!b.active && <span className="text-[8px] text-red-400 font-bold">NONAKTIF</span>}
                              </div>
                              <p className="text-[10px] text-white/70 line-clamp-2 leading-relaxed">{b.content}</p>
                              <p className="text-[8px] text-white/30 mt-1">dari {b.senderName || 'Admin'}</p>
                            </div>
                            <div className="flex flex-col gap-1 shrink-0">
                              <button onClick={() => handleToggleBannerActive(b.id, b.active)}
                                className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 hover:text-white cursor-pointer transition-all text-[8px] font-bold uppercase"
                                title={b.active ? 'Nonaktifkan' : 'Aktifkan'}>
                                {b.active ? 'On' : 'Off'}
                              </button>
                              <button onClick={() => handleDeleteBanner(b.id)}
                                className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-red-500/20 hover:text-red-400 text-white/60 cursor-pointer transition-all"
                                title="Hapus">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* PWA Push Notification to all devices */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-amber-500/20 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-400" />
                      <h4 className="text-[11px] font-sans font-black uppercase text-amber-200 tracking-wider">Push Notification (PWA)</h4>
                    </div>
                    <p className="text-[9px] text-white/50 leading-relaxed">Kirim notifikasi push ke semua perangkat yang sudah izinkan notifikasi, bahkan saat website tidak dibuka.</p>

                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-white/60">Judul Push</span>
                      <input type="text" placeholder="Contoh: Pengumuman Penting!" value={pushTitle} onChange={(e) => setPushTitle(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs outline-none" />
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-white/60">Isi Pesan Push</span>
                      <textarea rows={2} placeholder="Tulis pesan notifikasi yang akan muncul di HP tamu..." value={pushBody} onChange={(e) => setPushBody(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs outline-none resize-none" />
                    </div>

                    <button
                      onClick={handleSendPushNotification}
                      disabled={pushSending}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-amber-600/80 hover:bg-amber-600 font-sans font-black text-[10px] uppercase tracking-wider text-white cursor-pointer active:scale-95 transition-all disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{pushSending ? 'Mengirim...' : 'Kirim ke Semua Perangkat'}</span>
                    </button>

                    {pushResult && (
                      <p className="text-[10px] text-center py-1 px-2 rounded-lg bg-white/5 border border-white/10">{pushResult}</p>
                    )}
                  </div>

                  {/* Registered Devices List */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-blue-500/20 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-blue-400" />
                        <h4 className="text-[11px] font-sans font-black uppercase text-amber-200 tracking-wider">Perangkat Terdaftar</h4>
                      </div>
                      <span className="text-[9px] font-bold text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                        {registeredDevices.length} perangkat
                      </span>
                    </div>
                    <p className="text-[9px] text-white/50 leading-relaxed">
                      Daftar HP/user yang sudah izinkan notifikasi. Data perangkat otomatis terekam saat tamu membuka undangan.
                    </p>

                    {registeredDevices.length === 0 ? (
                      <p className="text-xs text-white/40 py-4 text-center">Belum ada perangkat yang izinkan notifikasi.</p>
                    ) : (
                      <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                        {registeredDevices.map((dev) => (
                          <div key={dev.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
                            {/* Device Icon */}
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              dev.platform === 'ios' ? 'bg-blue-500/10 text-blue-400' :
                              dev.platform === 'android' ? 'bg-emerald-500/10 text-emerald-400' :
                              'bg-white/5 text-white/40'
                            }`}>
                              {dev.platform === 'ios' ? (
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                              ) : dev.platform === 'android' ? (
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.523 15.341a.996.996 0 0 0 0-1.993.996.996 0 0 0 0 1.993m-11.046 0a.996.996 0 0 0 0-1.993.996.996 0 0 0 0 1.993m11.405-6.02l1.997-3.46a.416.416 0 0 0-.152-.567.416.416 0 0 0-.568.152L17.129 8.95c-1.467-.644-3.085-1-4.8-1s-3.333.356-4.8 1L5.69 5.446a.416.416 0 0 0-.568-.152.416.416 0 0 0-.152.567l1.997 3.46C2.688 11.186.344 14.558 0 18.5h20.8c-.344-3.942-2.688-7.314-5.918-9.179"/></svg>
                              ) : (
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/></svg>
                              )}
                            </div>

                            {/* Device Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-black text-white uppercase tracking-wider truncate">
                                  {dev.device}
                                </span>
                                <span className={`text-[7px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                  dev.os === 'Android' ? 'bg-emerald-500/15 text-emerald-300' :
                                  dev.os === 'iOS' ? 'bg-blue-500/15 text-blue-300' :
                                  'bg-white/5 text-white/40'
                                }`}>{dev.os}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[8px] text-white/40">{dev.browser}</span>
                                <span className="text-[8px] text-white/20">•</span>
                                <span className="text-[8px] text-white/30">
                                  {dev.updatedAt ? new Date(dev.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                                </span>
                              </div>
                            </div>

                            {/* Delete button */}
                            <button
                              onClick={async () => {
                                if (!confirm(`Hapus perangkat ${dev.device}? Notifikasi tidak akan dikirim ke perangkat ini lagi.`)) return;
                                try {
                                  await deleteDoc(doc(db, `sites/${SITE_ID}/fcmTokens/${dev.id}`));
                                } catch (err: any) {
                                  alert(`Gagal menghapus: ${err.message}`);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-red-500/20 hover:text-red-400 text-white/40 cursor-pointer transition-all shrink-0"
                              title="Hapus perangkat"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Summary stats */}
                    {registeredDevices.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-center">
                          <span className="text-sm font-black text-emerald-300 block">{registeredDevices.filter(d => d.platform === 'android').length}</span>
                          <span className="text-[7px] text-white/40 uppercase font-bold">Android</span>
                        </div>
                        <div className="p-2 rounded-lg bg-blue-500/5 border border-blue-500/10 text-center">
                          <span className="text-sm font-black text-blue-300 block">{registeredDevices.filter(d => d.platform === 'ios').length}</span>
                          <span className="text-[7px] text-white/40 uppercase font-bold">iOS</span>
                        </div>
                        <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5 text-center">
                          <span className="text-sm font-black text-white/60 block">{registeredDevices.filter(d => d.platform === 'desktop').length}</span>
                          <span className="text-[7px] text-white/40 uppercase font-bold">Desktop</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Scheduled PWA Push Notifications (Countdown-based) */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-purple-500/20 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4 text-purple-400" />
                      <h4 className="text-[11px] font-sans font-black uppercase text-amber-200 tracking-wider">Notifikasi Terjadwal PWA</h4>
                    </div>
                    <p className="text-[9px] text-white/50 leading-relaxed">
                      Kirim notifikasi push otomatis mengikuti countdown acara. Notifikasi dikirim ke semua perangkat Android yang sudah izinkan notifikasi, bahkan saat website tidak dibuka.
                    </p>

                    {/* Preview: Nama Mempelai */}
                    <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                      <span className="text-[8px] text-white/40 uppercase tracking-widest block mb-1">Preview Nama Mempelai di Notifikasi</span>
                      <span className="text-xs font-black text-[#C9A24B] uppercase tracking-wider block">
                        {formData.couple?.groom?.nickname || 'Mempelai Pria'} & {formData.couple?.bride?.nickname || 'Mempelai Wanita'}
                      </span>
                      {formData.isJointWedding && formData.couple2 && (
                        <span className="text-xs font-black text-emerald-300 uppercase tracking-wider block mt-1">
                          {formData.couple2?.groom?.nickname || 'Mempelai Pria 2'} & {formData.couple2?.bride?.nickname || 'Mempelai Wanita 2'}
                        </span>
                      )}
                    </div>

                    {/* Notif 1: Akad */}
                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold uppercase text-amber-200 leading-tight flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" /> Notif Pengingat Akad
                          </p>
                          <p className="text-[8px] text-white/40 mt-0.5">
                            Tanggal Akad: {formData.event?.date ? new Date(formData.event.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Belum diatur'}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.scheduledNotifs?.akadEnabled || false}
                          onChange={(e) => setFormData({
                            ...formData,
                            scheduledNotifs: {
                              ...formData.scheduledNotifs,
                              akadEnabled: e.target.checked,
                              akadHoursBefore: formData.scheduledNotifs?.akadHoursBefore || 24,
                              resepsiEnabled: formData.scheduledNotifs?.resepsiEnabled || false,
                              resepsiHoursBefore: formData.scheduledNotifs?.resepsiHoursBefore || 24,
                              terimaKasihEnabled: formData.scheduledNotifs?.terimaKasihEnabled || false,
                              terimaKasihHoursAfter: formData.scheduledNotifs?.terimaKasihHoursAfter || 2,
                            }
                          })}
                          className="w-4 h-4 accent-amber-500"
                        />
                      </div>
                      {formData.scheduledNotifs?.akadEnabled && (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] text-white/60 shrink-0">Kirim</span>
                            <input
                              type="number"
                              min="1" max="168"
                              value={formData.scheduledNotifs?.akadHoursBefore || 24}
                              onChange={(e) => setFormData({
                                ...formData,
                                scheduledNotifs: {
                                  ...formData.scheduledNotifs!,
                                  akadHoursBefore: parseInt(e.target.value) || 24,
                                }
                              })}
                              className="w-16 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-center outline-none focus:border-[#C9A24B]"
                            />
                            <span className="text-[9px] text-white/60">jam sebelum Akad</span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10">
                            <span className="text-[7px] text-white/30 uppercase tracking-widest block mb-1">Preview Notifikasi</span>
                            <p className="text-[9px] text-amber-200/80 leading-relaxed">
                              <span className="font-bold text-amber-200">H-{formData.scheduledNotifs?.akadHoursBefore || 24}! Pawiwahan {formData.couple?.groom?.nickname || '...'} & {formData.couple?.bride?.nickname || '...'} dimulai dalam {formData.scheduledNotifs?.akadHoursBefore || 24} jam. Jangan lupa hadir ya!</span>
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Notif 2: Resepsi */}
                    {formData.reception && (
                      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col gap-2.5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-bold uppercase text-emerald-200 leading-tight flex items-center gap-1.5">
                              <Calendar className="w-3 h-3" /> Notif Pengingat Resepsi
                            </p>
                            <p className="text-[8px] text-white/40 mt-0.5">
                              Tanggal Resepsi: {formData.reception?.date ? new Date(formData.reception.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Belum diatur'}
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={formData.scheduledNotifs?.resepsiEnabled || false}
                            onChange={(e) => setFormData({
                              ...formData,
                              scheduledNotifs: {
                                ...formData.scheduledNotifs,
                                akadEnabled: formData.scheduledNotifs?.akadEnabled || false,
                                akadHoursBefore: formData.scheduledNotifs?.akadHoursBefore || 24,
                                resepsiEnabled: e.target.checked,
                                resepsiHoursBefore: formData.scheduledNotifs?.resepsiHoursBefore || 24,
                                terimaKasihEnabled: formData.scheduledNotifs?.terimaKasihEnabled || false,
                                terimaKasihHoursAfter: formData.scheduledNotifs?.terimaKasihHoursAfter || 2,
                              }
                            })}
                            className="w-4 h-4 accent-emerald-500"
                          />
                        </div>
                        {formData.scheduledNotifs?.resepsiEnabled && (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] text-white/60 shrink-0">Kirim</span>
                              <input
                                type="number"
                                min="1" max="168"
                                value={formData.scheduledNotifs?.resepsiHoursBefore || 24}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  scheduledNotifs: {
                                    ...formData.scheduledNotifs!,
                                    resepsiHoursBefore: parseInt(e.target.value) || 24,
                                  }
                                })}
                                className="w-16 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-center outline-none focus:border-[#C9A24B]"
                              />
                              <span className="text-[9px] text-white/60">jam sebelum Resepsi</span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                              <span className="text-[7px] text-white/30 uppercase tracking-widest block mb-1">Preview Notifikasi</span>
                              <p className="text-[9px] text-emerald-200/80 leading-relaxed">
                                <span className="font-bold text-emerald-200">H-{formData.scheduledNotifs?.resepsiHoursBefore || 24}! Resepsi {formData.couple?.groom?.nickname || '...'} & {formData.couple?.bride?.nickname || '...'} dimulai dalam {formData.scheduledNotifs?.resepsiHoursBefore || 24} jam. Kami menanti kehadiran Anda!</span>
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Notif 2b: Akad Couple 2 (Julianto & Peni) */}
                    {formData.isJointWedding && formData.couple2 && formData.event2 && (
                      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-cyan-500/20 flex flex-col gap-2.5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-bold uppercase text-cyan-200 leading-tight flex items-center gap-1.5">
                              <Calendar className="w-3 h-3" /> Notif Pengingat Akad — {formData.couple2?.groom?.nickname} & {formData.couple2?.bride?.nickname}
                            </p>
                            <p className="text-[8px] text-white/40 mt-0.5">
                              Tanggal Akad: {formData.event2?.date ? new Date(formData.event2.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Belum diatur'}
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={formData.scheduledNotifs?.akad2Enabled || false}
                            onChange={(e) => setFormData({
                              ...formData,
                              scheduledNotifs: {
                                ...formData.scheduledNotifs,
                                akad2Enabled: e.target.checked,
                                akad2HoursBefore: formData.scheduledNotifs?.akad2HoursBefore || 24,
                              }
                            })}
                            className="w-4 h-4 accent-cyan-500"
                          />
                        </div>
                        {formData.scheduledNotifs?.akad2Enabled && (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] text-white/60 shrink-0">Kirim</span>
                              <input
                                type="number"
                                min="1" max="168"
                                value={formData.scheduledNotifs?.akad2HoursBefore || 24}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  scheduledNotifs: {
                                    ...formData.scheduledNotifs!,
                                    akad2HoursBefore: parseInt(e.target.value) || 24,
                                  }
                                })}
                                className="w-16 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-center outline-none focus:border-[#C9A24B]"
                              />
                              <span className="text-[9px] text-white/60">jam sebelum Akad</span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-cyan-500/5 border border-cyan-500/10">
                              <span className="text-[7px] text-white/30 uppercase tracking-widest block mb-1">Preview Notifikasi</span>
                              <p className="text-[9px] text-cyan-200/80 leading-relaxed">
                                <span className="font-bold text-cyan-200">H-{formData.scheduledNotifs?.akad2HoursBefore || 24}! Pawiwahan {formData.couple2?.groom?.nickname || '...'} & {formData.couple2?.bride?.nickname || '...'} dimulai dalam {formData.scheduledNotifs?.akad2HoursBefore || 24} jam. Jangan lupa hadir ya!</span>
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Notif 2c: Resepsi Couple 2 (Julianto & Peni) */}
                    {formData.isJointWedding && formData.couple2 && formData.reception2 && (
                      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-teal-500/20 flex flex-col gap-2.5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-bold uppercase text-teal-200 leading-tight flex items-center gap-1.5">
                              <Calendar className="w-3 h-3" /> Notif Pengingat Resepsi — {formData.couple2?.groom?.nickname} & {formData.couple2?.bride?.nickname}
                            </p>
                            <p className="text-[8px] text-white/40 mt-0.5">
                              Tanggal Resepsi: {formData.reception2?.date ? new Date(formData.reception2.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Belum diatur'}
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={formData.scheduledNotifs?.resepsi2Enabled || false}
                            onChange={(e) => setFormData({
                              ...formData,
                              scheduledNotifs: {
                                ...formData.scheduledNotifs,
                                resepsi2Enabled: e.target.checked,
                                resepsi2HoursBefore: formData.scheduledNotifs?.resepsi2HoursBefore || 24,
                              }
                            })}
                            className="w-4 h-4 accent-teal-500"
                          />
                        </div>
                        {formData.scheduledNotifs?.resepsi2Enabled && (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] text-white/60 shrink-0">Kirim</span>
                              <input
                                type="number"
                                min="1" max="168"
                                value={formData.scheduledNotifs?.resepsi2HoursBefore || 24}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  scheduledNotifs: {
                                    ...formData.scheduledNotifs!,
                                    resepsi2HoursBefore: parseInt(e.target.value) || 24,
                                  }
                                })}
                                className="w-16 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-center outline-none focus:border-[#C9A24B]"
                              />
                              <span className="text-[9px] text-white/60">jam sebelum Resepsi</span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-teal-500/5 border border-teal-500/10">
                              <span className="text-[7px] text-white/30 uppercase tracking-widest block mb-1">Preview Notifikasi</span>
                              <p className="text-[9px] text-teal-200/80 leading-relaxed">
                                <span className="font-bold text-teal-200">H-{formData.scheduledNotifs?.resepsi2HoursBefore || 24}! Resepsi {formData.couple2?.groom?.nickname || '...'} & {formData.couple2?.bride?.nickname || '...'} dimulai dalam {formData.scheduledNotifs?.resepsi2HoursBefore || 24} jam. Kami menanti kehadiran Anda!</span>
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Notif 3: Terima Kasih */}
                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold uppercase text-pink-200 leading-tight flex items-center gap-1.5">
                            <Heart className="w-3 h-3" /> Notif Terima Kasih
                          </p>
                          <p className="text-[8px] text-white/40 mt-0.5">Kirim setelah acara selesai</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.scheduledNotifs?.terimaKasihEnabled || false}
                          onChange={(e) => setFormData({
                            ...formData,
                            scheduledNotifs: {
                              ...formData.scheduledNotifs,
                              akadEnabled: formData.scheduledNotifs?.akadEnabled || false,
                              akadHoursBefore: formData.scheduledNotifs?.akadHoursBefore || 24,
                              resepsiEnabled: formData.scheduledNotifs?.resepsiEnabled || false,
                              resepsiHoursBefore: formData.scheduledNotifs?.resepsiHoursBefore || 24,
                              terimaKasihEnabled: e.target.checked,
                              terimaKasihHoursAfter: formData.scheduledNotifs?.terimaKasihHoursAfter || 2,
                            }
                          })}
                          className="w-4 h-4 accent-pink-500"
                        />
                      </div>
                      {formData.scheduledNotifs?.terimaKasihEnabled && (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] text-white/60 shrink-0">Kirim</span>
                            <input
                              type="number"
                              min="1" max="72"
                              value={formData.scheduledNotifs?.terimaKasihHoursAfter || 2}
                              onChange={(e) => setFormData({
                                ...formData,
                                scheduledNotifs: {
                                  ...formData.scheduledNotifs!,
                                  terimaKasihHoursAfter: parseInt(e.target.value) || 2,
                                }
                              })}
                              className="w-16 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-center outline-none focus:border-[#C9A24B]"
                            />
                            <span className="text-[9px] text-white/60">jam setelah akad terakhir</span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-pink-500/5 border border-pink-500/10">
                            <span className="text-[7px] text-white/30 uppercase tracking-widest block mb-1">Preview Notifikasi</span>
                            <p className="text-[9px] text-pink-200/80 leading-relaxed">
                              <span className="font-bold text-pink-200">Terima kasih sudah hadir di Pawiwahan {formData.couple?.groom?.nickname || '...'} & {formData.couple?.bride?.nickname || '...'}{formData.isJointWedding && formData.couple2 ? ` & ${formData.couple2?.groom?.nickname} & ${formData.couple2?.bride?.nickname}` : ''}! Semoga berkah selalu menyertai keluarga.</span>
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Test send & info */}
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-2">
                      <p className="text-[8px] text-white/40 leading-relaxed">
                        <span className="text-amber-300 font-bold">Cara kerja:</span> Simpan pengaturan ini, lalu gunakan layanan cron (misal cron-job.org) untuk panggil endpoint <span className="text-[#C9A24B] font-mono text-[7px]">/api/send-scheduled</span> setiap 5 menit. Sistem akan otomatis cek jadwal dan kirim notifikasi yang sudah waktunya.
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={handleSaveConfig}
                          disabled={isSaving}
                          className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#C9A24B] hover:bg-[#A37E33] font-sans font-black text-[10px] uppercase tracking-wider text-white cursor-pointer active:scale-95 transition-all disabled:opacity-50"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{isSaving ? 'Menyimpan...' : 'Simpan Jadwal'}</span>
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm('Reset semua log notifikasi terjadwal yang sudah terkirim? (Untuk testing ulang)')) return;
                            try {
                              await setDoc(doc(db, `sites/${SITE_ID}/scheduledNotifLog/status`), {});
                              setPushResult('✅ Log terjadwal direset. Bisa test ulang.');
                            } catch (err: any) {
                              setPushResult(`❌ ${err.message}`);
                            }
                          }}
                          className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 font-sans font-black text-[10px] uppercase tracking-wider text-white/60 cursor-pointer active:scale-95 transition-all"
                        >
                          <Timer className="w-3.5 h-3.5" />
                          <span>Reset Log</span>
                        </button>
                      </div>
                      <button
                        onClick={async () => {
                          setPushSending(true);
                          setPushResult('');
                          try {
                            const res = await fetch('/api/send-scheduled', { method: 'POST' });
                            const data = await res.json();
                            if (res.ok) {
                              setPushResult(`✅ ${data.message || 'Cek selesai!'}`);
                            } else {
                              setPushResult(`❌ ${data.error || 'Gagal'}`);
                            }
                          } catch (err: any) {
                            setPushResult(`❌ ${err.message}`);
                          } finally {
                            setPushSending(false);
                          }
                        }}
                        disabled={pushSending}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-purple-600/80 hover:bg-purple-600 font-sans font-black text-[10px] uppercase tracking-wider text-white cursor-pointer active:scale-95 transition-all disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{pushSending ? 'Mengecek...' : 'Test Cek & Kirim Terjadwal'}</span>
                      </button>
                    </div>
                  </div>

                  {/* WhatsApp Promo */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-900/20 to-emerald-800/10 border border-emerald-500/20 flex flex-col items-center gap-3 text-center">
                    <p className="text-[10px] font-sans font-bold text-white/70 leading-relaxed">
                      Ingin punya website pernikahan seperti ini untuk acara Anda?
                    </p>
                    <p className="text-[9px] text-white/50 leading-relaxed">
                      Harga murah & terjangkau! Hubungi developer langsung via WhatsApp.
                    </p>
                    <a
                      href="https://wa.me/6285858922037?text=Halo%20Saputra%20Developer,%20saya%20tertarik%20untuk%20membuat%20website%20pernikahan.%20Bisa%20info%20harga%20dan%20paketnya?"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 font-sans font-black text-[10px] uppercase tracking-wider text-white shadow-lg active:scale-95 transition-all"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      <span>Hubungi via WhatsApp</span>
                    </a>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: VERIFIED USERS */}
              {activeTab === 'verified' && (
                <div className="flex flex-col gap-5 text-left pb-4">
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-400" />
                      <h4 className="text-[11px] font-sans font-black uppercase text-amber-200 tracking-wider">Kelola Pengguna Terverifikasi</h4>
                    </div>
                    <p className="text-[9px] text-white/50 leading-relaxed">
                      Pengunjung yang terverifikasi akan mendapatkan lencana centang biru di Buku Tamu. Developer Saputra otomatis terverifikasi.
                    </p>
                  </div>

                  {/* Currently verified users */}
                  <div className="flex flex-col gap-2.5">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-400 font-sans">
                      Terverifikasi ({verifiedUsers.length})
                    </span>
                    {verifiedUsers.length === 0 ? (
                      <p className="text-xs text-white/40 py-3 text-center">Belum ada pengguna terverifikasi.</p>
                    ) : (
                      <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-1">
                        {verifiedUsers.map((v) => (
                          <div key={v.id} className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <svg width="14" height="14" viewBox="0 0 40 40" fill="#0095F6" className="shrink-0">
                                <path fillRule="evenodd" d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z"/>
                              </svg>
                              <span className="text-xs font-black text-blue-300 uppercase tracking-wide">{v.name}</span>
                            </div>
                            <button onClick={() => handleToggleVerified(v.name, true)}
                              className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 cursor-pointer transition-all text-[9px] font-bold uppercase"
                              title="Cabut verifikasi">
                              Cabut
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Guestbook names available for verification */}
                  <div className="flex flex-col gap-2.5">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#C9A24B] font-sans">
                      Daftar Tamu dari Buku Tamu ({wishes.length})
                    </span>
                    <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                      {wishes.length === 0 ? (
                        <p className="text-xs text-white/40 py-3 text-center">Belum ada tamu.</p>
                      ) : (
                        wishes.map((w) => {
                          const isVerified = verifiedUsers.some(v => v.name === w.name);
                          return (
                            <div key={w.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-xs font-black text-white/80 uppercase tracking-wide truncate">{w.name}</span>
                                {isVerified && (
                                  <svg width="12" height="12" viewBox="0 0 40 40" fill="#0095F6" className="shrink-0">
                                    <path fillRule="evenodd" d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z"/>
                                  </svg>
                                )}
                              </div>
                              <button onClick={() => handleToggleVerified(w.name, isVerified)}
                                className={`p-1.5 rounded-lg border cursor-pointer transition-all text-[9px] font-bold uppercase shrink-0 ${
                                  isVerified
                                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-300'
                                    : 'bg-white/5 border-white/10 text-white/60 hover:border-[#C9A24B]/40 hover:text-[#C9A24B]'
                                }`}>
                                {isVerified ? 'Terverifikasi' : 'Verifikasi'}
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}


              {/* TAB CONTENT: RAINBOW NAMES MANAGEMENT */}
              {activeTab === 'rainbow' && (
                <div className="flex flex-col gap-5 text-left pb-4">
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <h4 className="text-[11px] font-sans font-black uppercase text-amber-200 tracking-wider">Kelola Efek Rainbow Nama</h4>
                    </div>
                    <p className="text-[9px] text-white/50 leading-relaxed">
                      Nama yang ditambahkan di sini akan tampil dengan efek warna pelangi di Buku Tamu, Pengumuman, dan Surat Undangan.
                    </p>
                  </div>

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!newRainbowName.trim()) return;
                    const name = newRainbowName.trim();
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
                    setDoc(doc(db, `sites/${SITE_ID}/rainbowNames/${slug}`), {
                      name,
                      slug,
                      addedBy: user?.email || 'admin',
                      createdAt: new Date()
                    }).then(() => {
                      setNewRainbowName('');
                      setSaveMessage(`Nama "${name}" mendapat efek rainbow!`);
                      setTimeout(() => setSaveMessage(''), 3000);
                    }).catch((err: any) => alert(`Gagal: ${err.message}`));
                  }} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-3">
                    <h4 className="text-[10px] font-sans font-black uppercase text-[#C9A24B] tracking-wider">Tambah Nama Rainbow</h4>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={newRainbowName}
                        onChange={(e) => setNewRainbowName(e.target.value)}
                        placeholder="Contoh: Developer Saputra"
                        required
                        className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs outline-none focus:border-[#C9A24B]"
                      />
                      <button 
                        type="submit"
                        className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#C9A24B] hover:bg-[#A37E33] font-sans font-black text-[10px] uppercase tracking-wider text-white active:scale-95 transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah</span>
                      </button>
                    </div>
                  </form>

                  <div className="flex flex-col gap-2.5">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#C9A24B] font-sans">
                      Daftar Nama Rainbow ({rainbowNames.length})
                    </span>
                    {rainbowNames.length === 0 ? (
                      <p className="text-xs text-white/40 py-4 text-center">Belum ada nama dengan efek rainbow.</p>
                    ) : (
                      <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                        {rainbowNames.map((name) => (
                          <div key={name} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3">
                            <span
                              className="text-xs font-black uppercase tracking-wider"
                              style={{
                                background: 'linear-gradient(90deg, #ff0000, #ff7700, #ffff00, #00ff00, #0000ff, #8b00ff, #ff0000)',
                                backgroundSize: '200% 100%',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                animation: 'rainbow-shift 3s linear infinite',
                              }}
                            >
                              {name}
                            </span>
                            <button 
                              onClick={() => {
                                const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
                                if (confirm(`Hapus efek rainbow untuk "${name}"?`)) {
                                  deleteDoc(doc(db, `sites/${SITE_ID}/rainbowNames/${slug}`))
                                    .catch((err: any) => alert(`Gagal: ${err.message}`));
                                }
                              }}
                              className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 cursor-pointer transition-all shrink-0"
                              title="Hapus"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* TAB CONTENT: GUEST MANAGEMENT */}
              {activeTab === 'guests' && (
                <div className="flex flex-col gap-5 text-left pb-4">
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-[#C9A24B]" />
                      <h4 className="text-[11px] font-sans font-black uppercase text-amber-200 tracking-wider">Kelola Daftar Tamu Undangan</h4>
                    </div>
                    <p className="text-[9px] text-white/50 leading-relaxed">
                      Buat nama tamu untuk mendapatkan link undangan unik. Tamu akan melihat namanya di halaman pembuka.
                    </p>
                  </div>

                  {/* Add Guest Form */}
                  <form onSubmit={handleAddGuest} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-3">
                    <h4 className="text-[10px] font-sans font-black uppercase text-[#C9A24B] tracking-wider">Tambah Tamu Baru</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1 col-span-2">
                        <span className="text-[9px] text-white/60">Nama Lengkap Tamu</span>
                        <input 
                          type="text"
                          value={newGuestName}
                          onChange={(e) => setNewGuestName(e.target.value)}
                          placeholder="I Wayan Sudarsa"
                          required
                          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs outline-none focus:border-[#C9A24B]"
                        />
                      </div>
                      <div className="flex flex-col gap-1 col-span-2">
                        <span className="text-[9px] text-white/60">Nomor HP (Opsional)</span>
                        <input 
                          type="text"
                          value={newGuestPhone}
                          onChange={(e) => setNewGuestPhone(e.target.value)}
                          placeholder="+62 812 3456 7890"
                          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs outline-none focus:border-[#C9A24B]"
                        />
                      </div>
                    </div>
                    <button 
                      type="submit"
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#C9A24B] hover:bg-[#A37E33] font-sans font-black text-[10px] uppercase tracking-wider text-white active:scale-95 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Tamu</span>
                    </button>
                  </form>

                  {/* Guest List */}
                  <div className="flex flex-col gap-2.5">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#C9A24B] font-sans">
                      Daftar Tamu ({guests.length})
                    </span>
                    {guests.length === 0 ? (
                      <p className="text-xs text-white/40 py-4 text-center">Belum ada tamu ditambahkan.</p>
                    ) : (
                      <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                        {guests.map((g) => (
                          <div key={g.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-2">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-xs font-black text-white/90 uppercase tracking-wide truncate">{g.name}</span>
                                {g.phone && (
                                  <span className="text-[8px] text-white/30 font-mono shrink-0">{g.phone}</span>
                                )}
                              </div>
                              <button onClick={() => handleDeleteGuest(g.slug || g.id)}
                                className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 cursor-pointer transition-all shrink-0"
                                title="Hapus tamu">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              <code className="flex-1 text-[8px] text-[#C9A24B]/60 font-mono truncate bg-black/30 rounded px-2 py-1">
                                {getGuestLink(g.slug || g.id)}
                              </code>
                              <button onClick={() => copyGuestLink(g.slug || g.id)}
                                className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#C9A24B]/40 text-white/60 hover:text-[#C9A24B] cursor-pointer transition-all shrink-0"
                                title="Salin link">
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB CONTENT: COUNTDOWN MANAGEMENT */}
              {activeTab === 'countdown' && (
                <div className="flex flex-col gap-5 text-left pb-4">
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col gap-3.5">
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4 text-amber-400" />
                      <h4 className="text-[11px] font-sans font-black uppercase text-amber-200 tracking-wider">Hitung Mundur (Countdown)</h4>
                    </div>
                    <p className="text-[9px] text-white/50 leading-relaxed">Atur tanggal & waktu acara untuk countdown. Ubah di tab <b>Acara</b> untuk mengatur detail lengkap lokasi dll.</p>
                  </div>

                  {/* Event 1 Date */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-3">
                    <h4 className="text-[10px] font-sans font-black uppercase text-[#C9A24B] tracking-wider">
                      {formData.isJointWedding ? 'Tanggal Pawiwahan I' : 'Tanggal Pawiwahan'}
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-white/60">Tanggal</span>
                        <input 
                          type="date"
                          value={formData.event.date ? formData.event.date.substring(0, 10) : ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            event: { ...formData.event, date: e.target.value + 'T09:00:00+08:00' }
                          })}
                          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs outline-none focus:border-[#C9A24B]"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-white/60">Jam</span>
                        <input 
                          type="time"
                          value={formData.event.date ? formData.event.date.substring(11, 16) : '09:00'}
                          onChange={(e) => {
                            const datePart = formData.event.date ? formData.event.date.substring(0, 10) : '';
                            setFormData({
                              ...formData,
                              event: { ...formData.event, date: `${datePart}T${e.target.value}:00+08:00` }
                            });
                          }}
                          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs outline-none focus:border-[#C9A24B]"
                        />
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                      <CountdownPreview date={formData.event.date} label={formData.isJointWedding ? 'Pawiwahan I' : 'Pawiwahan'} />
                    </div>
                  </div>

                  {/* Event 2 Date (if joint wedding) */}
                  {formData.isJointWedding && formData.event2 && (
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-3">
                      <h4 className="text-[10px] font-sans font-black uppercase text-[#C9A24B] tracking-wider">Tanggal Pawiwahan II</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] text-white/60">Tanggal</span>
                          <input 
                            type="date"
                            value={formData.event2.date ? formData.event2.date.substring(0, 10) : ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              event2: { ...formData.event2!, date: e.target.value + 'T09:00:00+08:00' }
                            })}
                            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs outline-none focus:border-[#C9A24B]"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] text-white/60">Jam</span>
                          <input 
                            type="time"
                            value={formData.event2.date ? formData.event2.date.substring(11, 16) : '09:00'}
                            onChange={(e) => {
                              const datePart = formData.event2!.date ? formData.event2!.date.substring(0, 10) : '';
                              setFormData({
                                ...formData,
                                event2: { ...formData.event2!, date: `${datePart}T${e.target.value}:00+08:00` }
                              });
                            }}
                            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs outline-none focus:border-[#C9A24B]"
                          />
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                        <CountdownPreview date={formData.event2.date} label="Pawiwahan II" />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleSaveConfig}
                    disabled={isSaving}
                    className="w-full flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-[#C9A24B] hover:bg-[#A37E33] font-sans font-black text-xs uppercase tracking-wider text-white shadow-lg active:scale-95 transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Menyimpan...' : 'Simpan Tanggal Countdown'}</span>
                  </button>
                </div>
              )}

              {/* TAB CONTENT: VISITORS / PENGUNJUNG */}
              {activeTab === 'visitors' && (
                <div className="flex flex-col gap-5 text-left pb-4">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-[9px] text-white/50 uppercase font-bold">Total Perangkat</span>
                      </div>
                      <span className="text-2xl font-black text-[#C9A24B] tabular-nums">{visitors.length}</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[9px] text-white/50 uppercase font-bold">Total Buka</span>
                      </div>
                      <span className="text-2xl font-black text-emerald-300 tabular-nums">
                        {visitors.reduce((sum, v) => sum + (v.visitCount || 1), 0)}
                      </span>
                    </div>
                  </div>

                  {/* Notif Status Breakdown */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 flex flex-col items-center gap-0.5">
                      <span className="text-lg font-black text-emerald-300 tabular-nums">{visitors.filter(v => v.notifStatus === 'granted').length}</span>
                      <span className="text-[7px] text-emerald-300/70 uppercase font-bold">Izinkan Notif</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-red-500/5 border border-red-500/15 flex flex-col items-center gap-0.5">
                      <span className="text-lg font-black text-red-300 tabular-nums">{visitors.filter(v => v.notifStatus === 'denied').length}</span>
                      <span className="text-[7px] text-red-300/70 uppercase font-bold">Tolak Notif</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/15 flex flex-col items-center gap-0.5">
                      <span className="text-lg font-black text-amber-300 tabular-nums">{visitors.filter(v => v.notifStatus === 'default' || v.notifStatus === 'unsupported').length}</span>
                      <span className="text-[7px] text-amber-300/70 uppercase font-bold">Belum Ditentukan</span>
                    </div>
                  </div>

                  {/* Live indicator */}
                  <div className="flex items-center gap-2 px-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] text-emerald-300/70 uppercase font-bold tracking-wider">Realtime — Data update otomatis</span>
                  </div>

                  {/* Visitor List */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[11px] font-sans font-black uppercase text-amber-200 tracking-wider flex items-center gap-2">
                        <Smartphone className="w-3.5 h-3.5" /> History Pengunjung
                      </h4>
                      <span className="text-[8px] text-white/40">{visitors.length} perangkat unik</span>
                    </div>

                    {visitors.length === 0 ? (
                      <p className="text-xs text-white/40 py-6 text-center">Belum ada pengunjung. Data muncul saat tamu membuka undangan.</p>
                    ) : (
                      <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-1">
                        {visitors.map((v) => {
                          const isOnline = v.lastVisitAt && (Date.now() - new Date(v.lastVisitAt).getTime()) < 60000;
                          return (
                            <div key={v.id} className={`p-3 rounded-xl border flex items-start gap-3 transition-all ${
                              isOnline ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/[0.01] border-white/5'
                            }`}>
                              {/* Device Icon */}
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                v.platform === 'ios' ? 'bg-blue-500/10 text-blue-400' :
                                v.platform === 'android' ? 'bg-emerald-500/10 text-emerald-400' :
                                'bg-white/5 text-white/40'
                              }`}>
                                {v.platform === 'ios' ? (
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                                ) : v.platform === 'android' ? (
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.523 15.341a.996.996 0 0 0 0-1.993.996.996 0 0 0 0 1.993m-11.046 0a.996.996 0 0 0 0-1.993.996.996 0 0 0 0 1.993m11.405-6.02l1.997-3.46a.416.416 0 0 0-.152-.567.416.416 0 0 0-.568.152L17.129 8.95c-1.467-.644-3.085-1-4.8-1s-3.333.356-4.8 1L5.69 5.446a.416.416 0 0 0-.568-.152.416.416 0 0 0-.152.567l1.997 3.46C2.688 11.186.344 14.558 0 18.5h20.8c-.344-3.942-2.688-7.314-5.918-9.179"/></svg>
                                ) : (
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/></svg>
                                )}
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                {/* Guest name + Online badge */}
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className="text-[11px] font-black text-white uppercase tracking-wider truncate">
                                    {v.guestName}
                                  </span>
                                  {isOnline && (
                                    <span className="flex items-center gap-1 text-[7px] font-bold text-emerald-300 bg-emerald-500/15 px-1.5 py-0.5 rounded-full shrink-0">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                      Online
                                    </span>
                                  )}
                                </div>

                                {/* Device + OS */}
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[10px] text-white/70 font-bold">{v.device}</span>
                                  <span className={`text-[7px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                    v.os === 'Android' ? 'bg-emerald-500/15 text-emerald-300' :
                                    v.os === 'iOS' ? 'bg-blue-500/15 text-blue-300' :
                                    'bg-white/5 text-white/40'
                                  }`}>{v.os}</span>
                                  <span className="text-[8px] text-white/30">{v.browser}</span>
                                </div>

                                {/* Bottom row: visit count + notif status + time */}
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[8px] text-white/40 flex items-center gap-0.5">
                                    <Eye className="w-2.5 h-2.5" />
                                    {v.visitCount || 1}x buka
                                  </span>
                                  <span className="text-[8px] text-white/20">•</span>
                                  {/* Notif status */}
                                  {v.notifStatus === 'granted' ? (
                                    <span className="text-[8px] text-emerald-300 font-bold flex items-center gap-0.5">
                                      <Bell className="w-2.5 h-2.5" /> Izinkan
                                    </span>
                                  ) : v.notifStatus === 'denied' ? (
                                    <span className="text-[8px] text-red-300 font-bold flex items-center gap-0.5">
                                      <Bell className="w-2.5 h-2.5" /> Ditolak
                                    </span>
                                  ) : v.notifStatus === 'unsupported' ? (
                                    <span className="text-[8px] text-white/30 font-bold flex items-center gap-0.5">
                                      <Bell className="w-2.5 h-2.5" /> Tidak didukung
                                    </span>
                                  ) : (
                                    <span className="text-[8px] text-amber-300/70 font-bold flex items-center gap-0.5">
                                      <Bell className="w-2.5 h-2.5" /> Belum
                                    </span>
                                  )}
                                  <span className="text-[8px] text-white/20">•</span>
                                  <span className="text-[8px] text-white/30">
                                    {v.lastVisitAt ? new Date(v.lastVisitAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}
                                  </span>
                                </div>
                              </div>

                              {/* Delete button */}
                              <button
                                onClick={async () => {
                                  if (!confirm(`Hapus data pengunjung ${v.guestName} (${v.device})?`)) return;
                                  try {
                                    await deleteDoc(doc(db, `sites/${SITE_ID}/visitors/${v.id}`));
                                  } catch (err: any) {
                                    alert(`Gagal: ${err.message}`);
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-red-500/20 hover:text-red-400 text-white/30 cursor-pointer transition-all shrink-0 mt-0.5"
                                title="Hapus data"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Platform breakdown */}
                  {visitors.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-center">
                        <span className="text-lg font-black text-emerald-300 block tabular-nums">{visitors.filter(v => v.platform === 'android').length}</span>
                        <span className="text-[7px] text-white/40 uppercase font-bold">Android</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-blue-500/5 border border-blue-500/10 text-center">
                        <span className="text-lg font-black text-blue-300 block tabular-nums">{visitors.filter(v => v.platform === 'ios').length}</span>
                        <span className="text-[7px] text-white/40 uppercase font-bold">iPhone / iOS</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                        <span className="text-lg font-black text-white/60 block tabular-nums">{visitors.filter(v => v.platform === 'desktop').length}</span>
                        <span className="text-[7px] text-white/40 uppercase font-bold">Desktop</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Countdown preview component inside AdminPanel
function CountdownPreview({ date, label }: { date: string; label: string }) {
  const [timeLeft, setTimeLeft] = React.useState({ d: 0, h: 0, m: 0, s: 0, isArrived: false });

  React.useEffect(() => {
    if (!date) return;
    const target = new Date(date).getTime();
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0, isArrived: true });
      } else {
        setTimeLeft({
          d: Math.floor(diff / 86400000),
          h: Math.floor((diff / 3600000) % 24),
          m: Math.floor((diff / 60000) % 60),
          s: Math.floor((diff / 1000) % 60),
          isArrived: false
        });
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [date]);

  if (!date) return <span className="text-[10px] text-white/40">Tanggal belum diatur</span>;

  if (timeLeft.isArrived) {
    return <span className="text-sm font-black text-[#C9A24B] uppercase tracking-wider text-center">{label}: Hari Bahagia Telah Tiba!</span>;
  }

  return (
    <div className="text-center">
      <span className="text-[8px] text-white/40 uppercase tracking-widest block mb-2">{label}</span>
      <div className="grid grid-cols-4 gap-2">
        {[
          { v: timeLeft.d, l: 'Hari' },
          { v: timeLeft.h, l: 'Jam' },
          { v: timeLeft.m, l: 'Menit' },
          { v: timeLeft.s, l: 'Detik' },
        ].map((item) => (
          <div key={item.l} className="flex flex-col items-center gap-1">
            <span className="text-2xl font-black text-[#C9A24B] tabular-nums leading-none">{String(item.v).padStart(2, '0')}</span>
            <span className="text-[7px] text-white/40 uppercase tracking-wider font-bold">{item.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
