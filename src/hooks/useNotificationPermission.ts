// src/hooks/useNotificationPermission.ts
'use client';
import { useEffect, useState, useCallback } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db, SITE_ID, app } from '../lib/firebase/client';

// Parse device info from userAgent
function getDeviceInfo() {
  const ua = navigator.userAgent || '';
  let device = 'Unknown Device';
  let os = 'Unknown OS';
  let browser = 'Unknown Browser';
  let platform = 'unknown';

  // Detect OS
  if (/iPhone|iPad|iPod/.test(ua)) {
    os = 'iOS';
    platform = 'ios';
    const match = ua.match(/(iPhone|iPad|iPod)[\s]*(\w+)?/);
    if (match) device = match[1] || 'iPhone';
  } else if (/android/i.test(ua)) {
    os = 'Android';
    platform = 'android';
    // Try to get device brand
    if (/Samsung/i.test(ua)) device = 'Samsung';
    else if (/Xiaomi/i.test(ua)) device = 'Xiaomi';
    else if (/OPPO/i.test(ua)) device = 'OPPO';
    else if (/vivo/i.test(ua)) device = 'vivo';
    else if (/Realme/i.test(ua)) device = 'Realme';
    else if (/Huawei/i.test(ua)) device = 'Huawei';
    else if (/Asus/i.test(ua)) device = 'Asus';
    else if (/Sony/i.test(ua)) device = 'Sony';
    else if (/Nokia/i.test(ua)) device = 'Nokia';
    else if (/Motorola/i.test(ua)) device = 'Motorola';
    else if (/OnePlus/i.test(ua)) device = 'OnePlus';
    else if (/Poco/i.test(ua)) device = 'POCO';
    else if (/Redmi/i.test(ua)) device = 'Redmi';
    else device = 'Android Device';

    // Try to get model
    const modelMatch = ua.match(/\(([^)]+)\)/);
    if (modelMatch) {
      const buildInfo = modelMatch[1];
      const modelParts = buildInfo.split(';').map(s => s.trim());
      if (modelParts.length > 1) {
        const rawModel = modelParts[modelParts.length - 2] || modelParts[1];
        if (rawModel && rawModel.length > 2 && rawModel.length < 40 && !/Build|Mobile|Safari|Chrome/i.test(rawModel)) {
          device = rawModel.replace(/^[A-Z]+\s+/, ''); // Remove brand prefix if model also has it
          if (device.length < 3) device = rawModel;
        }
      }
    }
  } else if (/Windows/i.test(ua)) {
    os = 'Windows';
    platform = 'desktop';
    device = 'PC / Laptop';
  } else if (/Macintosh|Mac OS/i.test(ua)) {
    os = 'macOS';
    platform = 'desktop';
    device = 'Mac';
  } else if (/Linux/i.test(ua)) {
    os = 'Linux';
    platform = 'desktop';
    device = 'PC / Laptop';
  }

  // Detect browser
  if (/Chrome/i.test(ua) && !/Edge|OPR|Brave/i.test(ua)) browser = 'Chrome';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Edge/i.test(ua)) browser = 'Edge';
  else if (/OPR|Opera/i.test(ua)) browser = 'Opera';
  else if (/Brave/i.test(ua)) browser = 'Brave';

  return { device, os, browser, platform, userAgent: ua.substring(0, 200) };
}

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

      const vapidKey = (import.meta as any).env.VITE_FIREBASE_VAPID_KEY || 'BPdeKiJqs1aSLP490HHgiFSSUjMzWsBMOsCUw0xmZqVMS8XePlSafy047H3cimNWH8jBAz4jnc3zA05DG-hHU7U';

      // Dynamic import so messaging SDK is only loaded when needed
      const { getMessaging, getToken } = await import('firebase/messaging');
      const messaging = getMessaging(app);
      const token = await getToken(messaging, { vapidKey });
      if (token) {
        const deviceInfo = getDeviceInfo();
        await setDoc(doc(db, `sites/${SITE_ID}/fcmTokens/${token}`), {
          updatedAt: new Date().toISOString(),
          registeredAt: new Date().toISOString(),
          ...deviceInfo,
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