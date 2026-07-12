// src/hooks/useGuestFromUrl.ts
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, SITE_ID } from '../lib/firebase/client';
import { Guest } from '../types/invitation';

export function useGuestFromUrl() {
  const [guestName, setGuestName] = useState<string>('');
  const [guestInfo, setGuestInfo] = useState<Guest | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const toParam = params.get('to') || '';

    if (!toParam) {
      setGuestName('Bapak/Ibu/Saudara/i');
      setLoading(false);
      return;
    }

    const cleanTo = toParam.trim();
    const isSlug = /^[a-z0-9-]+$/.test(cleanTo);

    const fetchGuest = async () => {
      try {
        if (isSlug) {
          // 1. Try Firestore guests collection first
          try {
            const guestRef = doc(db, `sites/${SITE_ID}/guests/${cleanTo}`);
            const guestSnap = await getDoc(guestRef);
            if (guestSnap.exists()) {
              const data = guestSnap.data();
              setGuestName(data.name || '');
              setGuestInfo(data as Guest);
              setLoading(false);
              return;
            }
          } catch (e) {
            console.warn("Firestore guest lookup failed, using fallback:", e);
          }

          // 2. Fallback: format slug to Title Case
          const formattedName = cleanTo
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          setGuestName(formattedName);
        } else {
          // Direct raw name (e.g. ?to=I+Wayan+Sudarsa)
          setGuestName(cleanTo);
        }
      } catch (err) {
        console.warn("Guest fetch error:", err);
        // Final fallback
        if (isSlug) {
          const formattedName = cleanTo
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          setGuestName(formattedName);
        } else {
          setGuestName(cleanTo);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGuest();
  }, []);

  return { guestName, guestInfo, loading };
}