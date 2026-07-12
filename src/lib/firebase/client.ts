// src/lib/firebase/client.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY || "AIzaSyAonRasC2MVqzfpAblL4TvTAQ3O0bw5y0g",
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN || "undanganadmin.firebaseapp.com",
  databaseURL: (import.meta as any).env.VITE_FIREBASE_DATABASE_URL || "https://undanganadmin-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID || "undanganadmin",
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET || "undanganadmin.firebasestorage.app",
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID || "11785976446",
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID || "1:11785976446:web:179f73e317b8e0970c362f",
  measurementId: (import.meta as any).env.VITE_FIREBASE_MEASUREMENT_ID || "G-BVDV4F7648"
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Sesuai prompt: site_id = "site-1" yang sudah ditetapkan (fixed)
export const SITE_ID = (import.meta as any).env.VITE_SITE_ID || "site-1";

export async function initAnalytics() {
  if (typeof window === 'undefined') return;
  if (await isSupported()) getAnalytics(app);
}
