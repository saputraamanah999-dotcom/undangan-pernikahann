// src/lib/site-config.ts
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, SITE_ID } from './firebase/client';
import { SiteConfig, Photo } from '../types/invitation';

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  isJointWedding: true,
  maintenanceMode: false,
  couple: {
    groom: {
      fullName: "I Wayan Putu Pastika, S.Kom.",
      nickname: "Putu",
      fatherName: "I Wayan Sayang",
      motherName: "Ni Kadek Sukerti",
      instagram: "putu_sma",
      childInfo: "Anak ke 1 dari 3 bersaudara"
    },
    bride: {
      fullName: "Ni Putu Widya Lestari, S.E.",
      nickname: "Widya",
      fatherName: "I Wayan Karda",
      motherName: "Ni Nyoman Sekar",
      instagram: "putu_sma",
      childInfo: "Anak ke 4 dari 5 bersaudara"
    }
  },
  couple2: {
    groom: {
      fullName: "I Gede Julianto, S.T.",
      nickname: "Julianto",
      fatherName: "I Wayan Sayang",
      motherName: "Ni Kadek Sukerti",
      instagram: "julianto_saputra",
      childInfo: "Anak ke 2 dari 3 bersaudara"
    },
    bride: {
      fullName: "Ni Made Elyana Mastra, S.Hum.",
      nickname: "Elyana",
      fatherName: "I Wayan Mastra",
      motherName: "Ni Ketut Sulastri",
      instagram: "elyana_mastra",
      childInfo: "Anak ke 2 dari 3 bersaudara"
    }
  },
  event: {
    date: "2026-07-24T10:00:00+08:00", // Bali WITA
    time: "10:00 WITA - Selesai",
    locationName: "Seraya Timur, Karangasem",
    address: "HMMM+99, Seraya Tim., Kec. Karangasem, Kabupaten Karangasem, Bali 80811",
    mapsEmbedUrl: "https://maps.google.com/maps?q=I%20GEDE%20JULIANTO,%20Seraya%20Tim.,%20Kec.%20Karangasem,%20Kabupaten%20Karangasem,%20Bali%2080811&output=embed",
    mapsExternalUrl: "https://maps.google.com/maps?q=I%20GEDE%20JULIANTO,%20Seraya%20Tim.,%20Kec.%20Karangasem,%20Kabupaten%20Karangasem,%20Bali%2080811"
  },
  event2: {
    date: "2026-07-25T10:00:00+08:00",
    time: "10:00 WITA - Selesai",
    locationName: "Seraya Timur, Karangasem",
    address: "HMMM+99, Seraya Tim., Kec. Karangasem, Kabupaten Karangasem, Bali 80811",
    mapsEmbedUrl: "https://maps.google.com/maps?q=I%20GEDE%20JULIANTO,%20Seraya%20Tim.,%20Kec.%20Karangasem,%20Kabupaten%20Karangasem,%20Bali%2080811&output=embed",
    mapsExternalUrl: "https://maps.google.com/maps?q=I%20GEDE%20JULIANTO,%20Seraya%20Tim.,%20Kec.%20Karangasem,%20Kabupaten%20Karangasem,%20Bali%2080811"
  },
  reception: {
    date: "2026-07-23T10:00:00+08:00",
    time: "10:00 AM WITA - Selesai",
    locationName: "Seraya Timur, Karangasem",
    address: "HMMM+99, Seraya Tim., Kec. Karangasem, Kabupaten Karangasem, Bali 80811",
    mapsEmbedUrl: "https://maps.google.com/maps?q=I%20GEDE%20JULIANTO,%20Seraya%20Tim.,%20Kec.%20Karangasem,%20Kabupaten%20Karangasem,%20Bali%2080811&output=embed",
    mapsExternalUrl: "https://maps.google.com/maps?q=I%20GEDE%20JULIANTO,%20Seraya%20Tim.,%20Kec.%20Karangasem,%20Kabupaten%20Karangasem,%20Bali%2080811"
  },
  quotes: {
    text: "Matur Suksma Sareng Sami",
    source: "Om Swastyastu. 'Pawiwahan' (pernikahan) adalah pengikatan suci lahir batin antara seorang pria dengan seorang wanita sebagai suami istri."
  },
  quotes2: {
    text: "Matur Suksma Sareng Sami",
    source: "Matur Suksma atas kehadiran dan doa restu Bapak/Ibu/Saudara/i sekalian."
  },
  musicUrl: "https://assets.mixkit.co/music/preview/mixkit-relaxing-ambient-116.mp3", // high-quality instrumental ambient
  coverImageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80", // beautiful Bali landscape
  gapuraImageUrl1: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=600&q=80", // gorgeous Bali temple gateway
  gapuraImageUrl2: "https://images.unsplash.com/photo-1505993597083-3bd19f7c839b?auto=format&fit=crop&w=600&q=80", 
  qrisImageUrl: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020101021126580016ID10202111234567801030004000051020860263653033605802ID5920Saputra%20Developer6008Denpasar61058022763045A3E", // real styled QR code placeholder
  bankAccounts: [
    {
      bank: "Bank Central Asia (BCA)",
      number: "6115405385",
      holder: "I WAYAN PUTU PASTIKA"
    },
    {
      bank: "Bank Mandiri",
      number: "1750001268811",
      holder: "i gede Julianto"
    }
  ],
  whatsappTextFormat: "Om Swastyastu! Kami mengundang Anda untuk menghadiri Upacara Pernikahan Bersama kami (Putu & Widya, Julianto & Elyana). Lihat detail selengkapnya di undangan online kami: {linkUndangan}"
};

export const DEFAULT_PHOTOS: Photo[] = [
  { id: '1', url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&q=80', order: 1, orientation: 'left' },
  { id: '2', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80', order: 2, orientation: 'right' },
  { id: '3', url: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=600&q=80', order: 3, orientation: 'left' },
  { id: '4', url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=600&q=80', order: 4, orientation: 'right' },
  { id: '5', url: 'https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&w=600&q=80', order: 5, orientation: 'left' },
  { id: '6', url: 'https://images.unsplash.com/photo-1507504038482-7621006b307a?auto=format&fit=crop&w=600&q=80', order: 6, orientation: 'right' }
];

export async function getSiteConfig(): Promise<SiteConfig> {
  try {
    const ref = doc(db, `sites/${SITE_ID}/config/main`);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as SiteConfig;
    } else {
      // Auto seed Firestore with default values on first access
      await setDoc(ref, DEFAULT_SITE_CONFIG);
      
      // Also seed gallery with some default photos
      for (const photo of DEFAULT_PHOTOS) {
        await setDoc(doc(db, `sites/${SITE_ID}/gallery/${photo.id}`), photo);
      }
      return DEFAULT_SITE_CONFIG;
    }
  } catch (error) {
    console.error("Error reading Firestore site config, using local defaults:", error);
    return DEFAULT_SITE_CONFIG;
  }
}
