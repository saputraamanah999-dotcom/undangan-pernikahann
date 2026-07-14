// api/send-scheduled.js — Vercel Serverless Function (ESM)
// Checks scheduled notification config and sends countdown-based push notifications.
// Call this endpoint via cron (e.g. cron-job.org) every 5 minutes.
// Uses Firestore to track which notifications have been sent to avoid duplicates.
import admin from "firebase-admin";

// Initialize Firebase Admin with service account from env var
let initialized = false;
function getAdmin() {
  if (!initialized) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!raw) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT env var belum diisi di Vercel.");
    }
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(raw);
    } catch {
      throw new Error("FIREBASE_SERVICE_ACCOUNT bukan JSON valid.");
    }
    if (!serviceAccount.project_id) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT tidak valid.");
    }
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    initialized = true;
  }
  return admin;
}

const SITE_ID = "site-1";

// Send a push notification to all FCM tokens
async function sendPush(adminApp, title, body) {
  const db = adminApp.firestore();
  const tokensSnapshot = await db
    .collection("sites")
    .doc(SITE_ID)
    .collection("fcmTokens")
    .get();

  const tokens = [];
  tokensSnapshot.forEach((docSnap) => {
    tokens.push(docSnap.id);
  });

  if (tokens.length === 0) {
    return { sent: 0, total: 0, message: "Tidak ada perangkat terdaftar." };
  }

  const uniqueTag = "notif-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
  const message = {
    notification: { title, body, icon: "/BALI-ICON.webp", tag: uniqueTag },
    data: { tag: uniqueTag, renotify: "true", requireInteraction: "true", link: "/" },
    webpush: {
      notification: {
        icon: "/BALI-ICON.webp",
        badge: "/BALI-ICON.webp",
        vibrate: [200, 100, 200],
        tag: uniqueTag,
        renotify: true,
        requireInteraction: true,
      },
      fcm_options: {
        link: "/",
      },
    },
    android: {
      priority: "high",
      notification: {
        sound: "default",
        icon: "/BALI-ICON.webp",
      },
    },
    apns: {
      payload: {
        aps: {
          sound: "default",
          "content-available": 1,
        },
      },
    },
    tokens,
  };

  const response = await adminApp.messaging().sendEachForMulticast(message);
  return {
    sent: response.successCount,
    failed: response.failureCount,
    total: tokens.length,
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const adminApp = getAdmin();
    const db = adminApp.firestore();

    // 1. Read site config
    const configSnap = await db.doc(`sites/${SITE_ID}/config/main`).get();
    if (!configSnap.exists) {
      return res.status(200).json({ message: "Config belum ada.", sent: [] });
    }

    const config = configSnap.data();
    const scheduledNotifs = config.scheduledNotifs || {};
    const groomName = config.couple?.groom?.nickname || "Mempelai Pria";
    const brideName = config.couple?.bride?.nickname || "Mempelai Wanita";
    const coupleStr = `${groomName} & ${brideName}`;

    // Couple 2 names (if joint wedding)
    let groom2Name = "", bride2Name = "", couple2Str = "";
    if (config.isJointWedding && config.couple2) {
      groom2Name = config.couple2.groom?.nickname || "Mempelai Pria 2";
      bride2Name = config.couple2.bride?.nickname || "Mempelai Wanita 2";
      couple2Str = `${groom2Name} & ${bride2Name}`;
    }

    // 2. Read sent log to avoid duplicates
    const sentLogSnap = await db.doc(`sites/${SITE_ID}/scheduledNotifLog/status`).get();
    const sentLog = sentLogSnap.exists ? sentLogSnap.data() : {};

    const now = Date.now();
    const results = [];
    const updates = {};

    // 3. Check Akad notification
    if (scheduledNotifs.akadEnabled && config.event?.date) {
      const akadTime = new Date(config.event.date).getTime();
      const hoursBefore = scheduledNotifs.akadHoursBefore || 24;
      const triggerTime = akadTime - (hoursBefore * 60 * 60 * 1000);
      // Window: triggerTime to triggerTime + 5 minutes (to account for cron interval)
      const windowEnd = triggerTime + (5 * 60 * 1000);

      if (now >= triggerTime && now <= windowEnd && !sentLog.akadSent) {
        const defaultTitle = `H-${hoursBefore}! Pawiwahan ${coupleStr}${couple2Str ? ` & ${couple2Str}` : ''}`;
        const title = scheduledNotifs.akadTitle && scheduledNotifs.akadTitle.trim() ? scheduledNotifs.akadTitle : defaultTitle;
        const defaultBody = `Dimulai dalam ${hoursBefore} jam. Jangan lupa hadir ya!`;
        const body = scheduledNotifs.akadText && scheduledNotifs.akadText.trim() ? scheduledNotifs.akadText : defaultBody;
        const result = await sendPush(adminApp, title, body);
        results.push({ type: "akad", ...result });
        updates.akadSent = true;
        updates.akadSentAt = new Date().toISOString();
      }
    }

    // 4. Check Resepsi notification
    if (scheduledNotifs.resepsiEnabled && config.reception?.date) {
      const resepsiTime = new Date(config.reception.date).getTime();
      const hoursBefore = scheduledNotifs.resepsiHoursBefore || 24;
      const triggerTime = resepsiTime - (hoursBefore * 60 * 60 * 1000);
      const windowEnd = triggerTime + (5 * 60 * 1000);

      if (now >= triggerTime && now <= windowEnd && !sentLog.resepsiSent) {
        const defaultTitle = `H-${hoursBefore}! Resepsi ${coupleStr}${couple2Str ? ` & ${couple2Str}` : ''}`;
        const title = scheduledNotifs.resepsiTitle && scheduledNotifs.resepsiTitle.trim() ? scheduledNotifs.resepsiTitle : defaultTitle;
        const defaultBody = `Dimulai dalam ${hoursBefore} jam. Kami menanti kehadiran Anda!`;
        const body = scheduledNotifs.resepsiText && scheduledNotifs.resepsiText.trim() ? scheduledNotifs.resepsiText : defaultBody;
        const result = await sendPush(adminApp, title, body);
        results.push({ type: "resepsi", ...result });
        updates.resepsiSent = true;
        updates.resepsiSentAt = new Date().toISOString();
      }
    }

    // 4b. Check Akad 2 notification (couple2)
    if (scheduledNotifs.akad2Enabled && config.event2?.date) {
      const akad2Time = new Date(config.event2.date).getTime();
      const hoursBefore2 = scheduledNotifs.akad2HoursBefore || 24;
      const triggerTime2 = akad2Time - (hoursBefore2 * 60 * 60 * 1000);
      const windowEnd2 = triggerTime2 + (5 * 60 * 1000);

      if (now >= triggerTime2 && now <= windowEnd2 && !sentLog.akad2Sent) {
        const defaultTitle = `H-${hoursBefore2}! Pawiwahan ${couple2Str}`;
        const title = scheduledNotifs.akad2Title && scheduledNotifs.akad2Title.trim() ? scheduledNotifs.akad2Title : defaultTitle;
        const defaultBody = `Dimulai dalam ${hoursBefore2} jam. Jangan lupa hadir ya!`;
        const body = scheduledNotifs.akad2Text && scheduledNotifs.akad2Text.trim() ? scheduledNotifs.akad2Text : defaultBody;
        const result = await sendPush(adminApp, title, body);
        results.push({ type: "akad2", ...result });
        updates.akad2Sent = true;
        updates.akad2SentAt = new Date().toISOString();
      }
    }

    // 4c. Check Resepsi 2 notification (couple2)
    if (scheduledNotifs.resepsi2Enabled && config.reception2?.date) {
      const resepsi2Time = new Date(config.reception2.date).getTime();
      const hoursBefore2 = scheduledNotifs.resepsi2HoursBefore || 24;
      const triggerTime2 = resepsi2Time - (hoursBefore2 * 60 * 60 * 1000);
      const windowEnd2 = triggerTime2 + (5 * 60 * 1000);

      if (now >= triggerTime2 && now <= windowEnd2 && !sentLog.resepsi2Sent) {
        const defaultTitle = `H-${hoursBefore2}! Resepsi ${couple2Str}`;
        const title = scheduledNotifs.resepsi2Title && scheduledNotifs.resepsi2Title.trim() ? scheduledNotifs.resepsi2Title : defaultTitle;
        const defaultBody = `Dimulai dalam ${hoursBefore2} jam. Kami menanti kehadiran Anda!`;
        const body = scheduledNotifs.resepsi2Text && scheduledNotifs.resepsi2Text.trim() ? scheduledNotifs.resepsi2Text : defaultBody;
        const result = await sendPush(adminApp, title, body);
        results.push({ type: "resepsi2", ...result });
        updates.resepsi2Sent = true;
        updates.resepsi2SentAt = new Date().toISOString();
      }
    }

    // 5. Check Terima Kasih notification
    if (scheduledNotifs.terimaKasihEnabled) {
      // Determine the last event time (Akad or Resepsi, whichever is later)
      const eventTimes = [];
      if (config.event?.date) eventTimes.push(new Date(config.event.date).getTime());
      if (config.reception?.date) eventTimes.push(new Date(config.reception.date).getTime());
      if (config.event2?.date) eventTimes.push(new Date(config.event2.date).getTime());
      if (config.reception2?.date) eventTimes.push(new Date(config.reception2.date).getTime());

      if (eventTimes.length > 0) {
        const lastEventTime = Math.max(...eventTimes);
        const hoursAfter = scheduledNotifs.terimaKasihHoursAfter || 2;
        const triggerTime = lastEventTime + (hoursAfter * 60 * 60 * 1000);
        const windowEnd = triggerTime + (5 * 60 * 1000);

        if (now >= triggerTime && now <= windowEnd && !sentLog.terimaKasihSent) {
          const defaultTitle = `Terima Kasih! ${coupleStr}${couple2Str ? ` & ${couple2Str}` : ''}`;
          const title = scheduledNotifs.terimaKasihTitle && scheduledNotifs.terimaKasihTitle.trim() ? scheduledNotifs.terimaKasihTitle : defaultTitle;
          const defaultBody = `Terima kasih sudah hadir${couple2Str ? ` di Pawiwahan ${coupleStr} & ${couple2Str}` : ` di Pawiwahan ${coupleStr}`}! Semoga berkah selalu menyertai keluarga.`;
          const body = scheduledNotifs.terimaKasihText && scheduledNotifs.terimaKasihText.trim() ? scheduledNotifs.terimaKasihText : defaultBody;
          const result = await sendPush(adminApp, title, body);
          results.push({ type: "terimaKasih", ...result });
          updates.terimaKasihSent = true;
          updates.terimaKasihSentAt = new Date().toISOString();
        }
      }
    }

    // 6. Update sent log in Firestore
    if (Object.keys(updates).length > 0) {
      await db.doc(`sites/${SITE_ID}/scheduledNotifLog/status`).set({
        ...sentLog,
        ...updates,
      }, { merge: true });
    }

    // 7. Build response
    if (results.length === 0) {
      // Check if there are upcoming scheduled notifs
      const upcoming = [];
      if (scheduledNotifs.akadEnabled && config.event?.date) {
        const t = new Date(config.event.date).getTime() - ((scheduledNotifs.akadHoursBefore || 24) * 3600000);
        if (t > now) upcoming.push(`Akad H-${scheduledNotifs.akadHoursBefore || 24} (${coupleStr}): ${new Date(t).toLocaleString('id-ID', { timeZone: 'Asia/Makassar' })}`);
      }
      if (scheduledNotifs.resepsiEnabled && config.reception?.date) {
        const t = new Date(config.reception.date).getTime() - ((scheduledNotifs.resepsiHoursBefore || 24) * 3600000);
        if (t > now) upcoming.push(`Resepsi H-${scheduledNotifs.resepsiHoursBefore || 24} (${coupleStr}): ${new Date(t).toLocaleString('id-ID', { timeZone: 'Asia/Makassar' })}`);
      }
      if (scheduledNotifs.akad2Enabled && config.event2?.date) {
        const t = new Date(config.event2.date).getTime() - ((scheduledNotifs.akad2HoursBefore || 24) * 3600000);
        if (t > now) upcoming.push(`Akad H-${scheduledNotifs.akad2HoursBefore || 24} (${couple2Str}): ${new Date(t).toLocaleString('id-ID', { timeZone: 'Asia/Makassar' })}`);
      }
      if (scheduledNotifs.resepsi2Enabled && config.reception2?.date) {
        const t = new Date(config.reception2.date).getTime() - ((scheduledNotifs.resepsi2HoursBefore || 24) * 3600000);
        if (t > now) upcoming.push(`Resepsi H-${scheduledNotifs.resepsi2HoursBefore || 24} (${couple2Str}): ${new Date(t).toLocaleString('id-ID', { timeZone: 'Asia/Makassar' })}`);
      }
      if (scheduledNotifs.terimaKasihEnabled) {
        const eventTimes = [];
        if (config.event?.date) eventTimes.push(new Date(config.event.date).getTime());
        if (config.reception?.date) eventTimes.push(new Date(config.reception.date).getTime());
        if (eventTimes.length > 0) {
          const lastT = Math.max(...eventTimes) + ((scheduledNotifs.terimaKasihHoursAfter || 2) * 3600000);
          if (lastT > now) upcoming.push(`Terima Kasih: ${new Date(lastT).toLocaleString('id-ID', { timeZone: 'Asia/Makassar' })}`);
        }
      }

      const alreadySent = [];
      if (sentLog.akadSent) alreadySent.push(`Akad (${coupleStr})`);
      if (sentLog.resepsiSent) alreadySent.push(`Resepsi (${coupleStr})`);
      if (sentLog.akad2Sent) alreadySent.push(`Akad (${couple2Str})`);
      if (sentLog.resepsi2Sent) alreadySent.push(`Resepsi (${couple2Str})`);
      if (sentLog.terimaKasihSent) alreadySent.push("Terima Kasih");

      let msg = "Tidak ada notifikasi yang perlu dikirim saat ini.";
      if (upcoming.length > 0) msg += ` Jadwal berikutnya: ${upcoming.join(", ")}.`;
      if (alreadySent.length > 0) msg += ` Sudah terkirim: ${alreadySent.join(", ")}.`;

      return res.status(200).json({ message: msg, sent: results });
    }

    const totalSent = results.reduce((sum, r) => sum + (r.sent || 0), 0);
    const totalFailed = results.reduce((sum, r) => sum + (r.failed || 0), 0);
    return res.status(200).json({
      message: `${results.length} notifikasi terjadwal dikirim! Total: ${totalSent} terkirim, ${totalFailed} gagal.`,
      details: results,
      sent: results,
    });
  } catch (err) {
    console.error("Scheduled notification error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
