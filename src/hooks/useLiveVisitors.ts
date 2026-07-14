// src/hooks/useLiveVisitors.ts
import { useEffect, useState } from 'react';
import { doc, setDoc, deleteDoc, onSnapshot, collection, serverTimestamp } from 'firebase/firestore';
import { db, SITE_ID } from '../lib/firebase/client';

export function useLiveVisitors() {
  const [count, setCount] = useState<number>(1); // Default to at least 1 (the current user)

  useEffect(() => {
    let active = true;
    const sessionId = typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
        });
    const ref = doc(db, `sites/${SITE_ID}/liveVisitors/${sessionId}`);

    const updateHeartbeat = async () => {
      try {
        await setDoc(ref, { lastSeenAt: serverTimestamp() });
      } catch (e) {
        console.warn("Heartbeat write failed:", e);
      }
    };

    updateHeartbeat();
    const heartbeat = setInterval(updateHeartbeat, 15000);

    const unsub = onSnapshot(
      collection(db, `sites/${SITE_ID}/liveVisitors`),
      (snap) => {
        if (!active) return;
        
        // Count active sessions.
        // We can do client-side filtering or just rely on the collection size
        // since we clean up on tab close and expired sessions are pruned by TTL/Admin.
        // Let's count sessions active in the last 45s, falling back to snap.size if serverTimestamp is not fully updated
        const now = Date.now();
        let activeCount = 0;
        
        snap.forEach((d) => {
          const data = d.data();
          if (data.lastSeenAt) {
            const time = data.lastSeenAt.toMillis ? data.lastSeenAt.toMillis() : new Date(data.lastSeenAt).getTime();
            if (now - time < 45000) {
              activeCount++;
            }
          } else {
            // If serverTimestamp is pending, consider it active
            activeCount++;
          }
        });
        
        setCount(activeCount > 0 ? activeCount : snap.size || 1);
      },
      (error) => {
        console.warn("Live visitor listener error:", error);
      }
    );

    const cleanup = async () => {
      active = false;
      clearInterval(heartbeat);
      unsub();
      try {
        await deleteDoc(ref);
      } catch (e) {
        // Silent ignore on close
      }
    };

    window.addEventListener('beforeunload', cleanup);
    window.addEventListener('pagehide', cleanup);

    return () => {
      cleanup();
      window.removeEventListener('beforeunload', cleanup);
      window.removeEventListener('pagehide', cleanup);
    };
  }, []);

  return count;
}
