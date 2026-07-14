// src/types/invitation.ts

export interface BankAccount {
  bank: string;
  number: string;
  holder: string;
}

export interface SiteConfig {
  isJointWedding?: boolean;
  maintenanceMode?: boolean;
  couple: {
    groom: {
      fullName: string;
      nickname: string;
      fatherName: string;
      motherName: string;
      instagram?: string;
      childInfo?: string; // e.g. "Anak ke 1 dari 3 bersaudara"
    };
    bride: {
      fullName: string;
      nickname: string;
      fatherName: string;
      motherName: string;
      instagram?: string;
      childInfo?: string;
    };
  };
  couple2?: {
    groom: {
      fullName: string;
      nickname: string;
      fatherName: string;
      motherName: string;
      instagram?: string;
      childInfo?: string;
    };
    bride: {
      fullName: string;
      nickname: string;
      fatherName: string;
      motherName: string;
      instagram?: string;
      childInfo?: string;
    };
  };
  event: {
    date: string; // ISO string e.g. "2026-08-08T09:00:00+08:00"
    time: string; // e.g. "09:00 WITA - Selesai"
    locationName: string; // e.g. "Griya Agung Sanur"
    address: string; // e.g. "Jl. Danau Buyan No. 12, Sanur, Denpasar, Bali"
    mapsEmbedUrl: string;
    mapsExternalUrl: string;
  };
  event2?: {
    date: string;
    time: string;
    locationName: string;
    address: string;
    mapsEmbedUrl: string;
    mapsExternalUrl: string;
  };
  reception?: {
    date: string;
    time: string;
    locationName: string;
    address: string;
    mapsEmbedUrl: string;
    mapsExternalUrl: string;
  };
  reception2?: {
    date: string;
    time: string;
    locationName: string;
    address: string;
    mapsEmbedUrl: string;
    mapsExternalUrl: string;
  };
  quotes: {
    text: string;
    source: string; // e.g. "Om Swastyastu... Agama Hindu" or "Sloka"
  };
  quotes2?: {
    text: string;
    source: string;
  };
  musicUrl: string;
  coverImageUrl: string; // prewedding image
  gapuraImageUrl1: string; // left gate
  gapuraImageUrl2: string; // right gate
  qrisImageUrl: string;
  groomPhotoUrl?: string;
  bridePhotoUrl?: string;
  groom2PhotoUrl?: string;
  bride2PhotoUrl?: string;
  bankAccounts: BankAccount[];
  whatsappTextFormat: string; // custom share text
  forceNotifAndroid?: boolean; // default true — force notif for Android users
  forceNotifIos?: boolean; // default false — force notif for iOS users (Safari may not support)
  scheduledNotifs?: {
    akadEnabled: boolean;       // kirim notif H-24 sebelum Akad
    akadHoursBefore: number;    // berapa jam sebelum Akad (default 24)
    resepsiEnabled: boolean;    // kirim notif H-24 sebelum Resepsi
    resepsiHoursBefore: number; // berapa jam sebelum Resepsi (default 24)
    terimaKasihEnabled: boolean; // kirim notif terima kasih setelah acara
    terimaKasihHoursAfter: number; // berapa jam setelah akad terakhir (default 2)
  };
}

export interface Photo {
  id: string;
  url: string;
  order: number;
  orientation?: 'left' | 'right' | 'row3' | 'row4' | 'row5';
  createdAt?: any;
}

export interface GuestbookMessage {
  id: string;
  name: string;
  message: string;
  attendance: 'hadir' | 'tidak' | 'ragu';
  signature?: string;
  likesCount?: number;
  createdAt: any;
}

export interface Rsvp {
  id: string;
  guestName: string;
  attendance: 'hadir' | 'tidak' | 'ragu';
  totalGuest: number;
  createdAt: any;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  createdAt: any;
  active: boolean;
}

export interface Guest {
  id: string;
  site_id: string;
  name: string;
  slug: string;
  phone?: string;
  invited_count: number;
  created_at?: string;
}
