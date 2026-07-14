// api/send-notification.js — Vercel Serverless Function (ESM)
// Sends FCM push notification to ALL registered devices via Firebase Admin SDK
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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { title, body } = req.body || {};
    if (!title || !body) {
      return res.status(400).json({ error: "title dan body wajib diisi." });
    }

    const adminApp = getAdmin();
    const db = adminApp.firestore();

    // Get all FCM tokens
    const tokensSnapshot = await db
      .collection("sites")
      .doc("site-1")
      .collection("fcmTokens")
      .get();

    const tokens = [];
    tokensSnapshot.forEach((docSnap) => {
      tokens.push(docSnap.id);
    });

    if (tokens.length === 0) {
      return res.status(200).json({
        message: "Belum ada perangkat terdaftar. Pengunjung harus izinkan notifikasi browser dulu.",
        sent: 0,
      });
    }

    // Send multicast message — unique tag per send so notifications don't collapse
    const uniqueTag = "notif-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
    const message = {
      notification: { title, body },
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
    const successCount = response.successCount;
    const failureCount = response.failureCount;

    return res.status(200).json({
      message: "Terkirim ke " + successCount + "/" + tokens.length + " perangkat" + (failureCount > 0 ? " (" + failureCount + " gagal)" : ""),
      sent: successCount,
      failed: failureCount,
      total: tokens.length,
    });
  } catch (err) {
    console.error("Send notification error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}