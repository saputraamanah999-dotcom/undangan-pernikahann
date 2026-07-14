// src/hooks/useVisitorTracker.ts
// Tracks every page visit to Firestore in real-time.
// Records: device info, visit count, notification permission status, guest name.
'use client';
import { useEffect } from 'react';
import { doc, setDoc, increment, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db, SITE_ID } from '../lib/firebase/client';

function getDeviceInfo() {
  const ua = navigator.userAgent || '';
  let device = 'Unknown Device';
  let os = 'Unknown OS';
  let browser = 'Unknown Browser';
  let platform = 'unknown';

  if (/iPhone|iPad|iPod/.test(ua)) {
    os = 'iOS';
    platform = 'ios';
    if (/iPad/.test(ua)) device = 'iPad';
    else device = 'iPhone';
  } else if (/android/i.test(ua)) {
    os = 'Android';
    platform = 'android';
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
    else if (/Infinix/i.test(ua)) device = 'Infinix';
    else if (/Tecno/i.test(ua)) device = 'Tecno';
    else if (/Nothing/i.test(ua)) device = 'Nothing';
    else device = 'Android Device';

    // Try to extract model name from UA
    const buildMatch = ua.match(/\(([^)]+)\)/);
    if (buildMatch) {
      const parts = buildMatch[1].split(';').map(s => s.trim());
      for (let i = parts.length - 2; i >= 1; i--) {
        const part = parts[i].replace(/^[A-Z]+\s+/, '');
        if (part.length > 3 && part.length < 45 && !/Build|Mobile|Safari|Chrome|Mozilla/i.test(part)) {
          device = part;
          break;
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
    if (/iPhone/.test(ua)) { os = 'iOS'; platform = 'ios'; device = 'iPhone'; }
    else device = 'Mac';
  } else if (/Linux/i.test(ua)) {
    os = 'Linux';
    platform = 'desktop';
    device = 'PC / Laptop';
  }

  if (/Chrome/i.test(ua) && !/Edge|OPR|Brave/i.test(ua)) browser = 'Chrome';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Edge/i.test(ua)) browser = 'Edge';
  else if (/OPR|Opera/i.test(ua)) browser = 'Opera';
  else if (/Brave/i.test(ua)) browser = 'Brave';

  return { device, os, browser, platform };
}

function getDeviceId(): string {
  try {
    const ua = navigator.userAgent;
    const lang = navigator.language;
    const screen = `${screen.width}x${screen.height}`;
    const plat = navigator.platform || '';
    const raw = `${ua}|${lang}|${screen}|${plat}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      const char = raw.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return 'dev-' + Math.abs(hash).toString(36) + '-' + raw.length.toString(36);
  } catch {
    return 'dev-' + Date.now().toString(36);
  }
}

export function useVisitorTracker(guestName: string) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const deviceId = getDeviceId();
    const deviceInfo = getDeviceInfo();
    const notifStatus = typeof Notification !== 'undefined' ? Notification.permission : 'unsupported';
    const slug = new URLSearchParams(window.location.search).get('to') || '';
    const pageUrl = window.location.pathname + window.location.search;
    const now = new Date().toISOString();

    const visitorRef = doc(db, `sites/${SITE_ID}/visitors/${deviceId}`);

    // Set/merge device info + increment visitCount
    setDoc(visitorRef, {
      device: deviceInfo.device,
      os: deviceInfo.os,
      browser: deviceInfo.browser,
      platform: deviceInfo.platform,
      guestName: guestName || 'Bapak/Ibu/Saudara/i',
      slug: slug,
      notifStatus: notifStatus,
      lastVisitAt: now,
      firstVisitAt: now, // only set if new (merge won't overwrite existing)
    }, { merge: true }).then(() => {
      // Increment visit count atomically
      return updateDoc(visitorRef, {
        visitCount: increment(1),
        lastVisitAt: now,
        notifStatus: notifStatus, // always update latest notif status
      });
    }).catch(() => {
      // Visitor tracking is non-critical
    });

  }, [guestName]);
}

// Update notif status when it changes (called from OpeningScreen after permission request)
export function updateVisitorNotifStatus(guestName: string) {
  if (typeof window === 'undefined') return;
  const deviceId = getDeviceId();
  const notifStatus = typeof Notification !== 'undefined' ? Notification.permission : 'unsupported';
  const visitorRef = doc(db, `sites/${SITE_ID}/visitors/${deviceId}`);
  updateDoc(visitorRef, {
    notifStatus: notifStatus,
    lastVisitAt: new Date().toISOString(),
  }).catch(() => {});
}

export { getDeviceId, getDeviceInfo };