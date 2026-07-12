// src/hooks/useNotificationPermission.ts
'use client';
import { useEffect, useState, useCallback } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db, SITE_ID, app } from '../lib/firebase/client';

export function useNotificationPermission() {
  const [status, setStatus] = useState<NotificationPermission | 'unsupported'>('default');

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setStatus('unsupported');
      return;
    }
    setStatus(Notification.permission);

    // Auto-get token only if permission already granted
    if (Notification.permission === 'granted') {
      tryGetToken();
    }
  }, []);

  const tryGetToken = async () => {
    try {
      // Check service worker file exists before importing messaging
      if (!('serviceWorker' in navigator)) return;
      const swCheck = await fetch('/firebase-messaging-sw.js', { method: 'HEAD' }).catch(() => null);
      if (!swCheck || !swCheck.ok) return;

      const vapidKey = (import.meta as any).env.VITE_FIREBASE_VAPID_KEY;
      if (!vapidKey) return;

      // Dynamic import so messaging SDK is only loaded when needed
      const { getMessaging, getToken } = await import('firebase/messaging');
      const messaging = getMessaging(app);
      const token = await getToken(messaging, { vapidKey });
      if (token) {
        await setDoc(doc(db, `sites/${SITE_ID}/fcmTokens/${token}`), {
          updatedAt: new Date().toISOString(),
        });
      }
    } catch {
      // FCM not critical — silently ignore all errors
    }
  };

  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    try {
      const permission = await Notification.requestPermission();
      setStatus(permission);

      if (permission === 'granted') {
        await tryGetToken();
      }
      return permission;
    } catch {
      return 'default';
    }
  }, []);

  return { status, requestPermission };
}