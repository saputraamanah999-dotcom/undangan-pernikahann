// api/send-notification.ts — Vercel Serverless Function
// Sends FCM push notification to ALL registered devices via Firebase Admin SDK
import { defineConfig } from "@vercel/node";

// We need to use require-style import for firebase-admin in Vercel Node environment
const admin = require("firebase-admin");

// Initialize Firebase Admin with service account from env var
let initialized = false;
function getAdmin() {
  if (!initialized) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || "{}");
    if (!serviceAccount.project_id) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT environment variable is not set in Vercel.");
    }
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    initialized = true;
  }
  return admin;
}

export const config = defineConfig({
  api: true,
});

module.exports = async (req: any, res: any) => {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { title, body } = req.body || {};
    if (!title || !body) {
      return res.status(400).json({ error: "title and body are required." });
    }

    const adminApp = getAdmin();
    const db = adminApp.firestore();

    // Get all FCM tokens
    const tokensSnapshot = await db
      .collection("sites")
      .doc("site-1")
      .collection("fcmTokens")
      .get();

    const tokens: string[] = [];
    tokensSnapshot.forEach((doc: any) => {
      // Document ID is the FCM token itself
      tokens.push(doc.id);
    });

    if (tokens.length === 0) {
      return res.status(200).json({
        message: "Tidak ada perangkat terdaftar. Pengunjung harus izinkan notifikasi terlebih dahulu.",
        sent: 0,
      });
    }

    // Send multicast message
    const message = {
      notification: { title, body },
      webpush: {
        notification: {
          icon: "/BALI-ICON.webp",
          badge: "/BALI-ICON.webp",
          vibrate: [200, 100, 200],
        },
        fcm_options: {
          link: "/",
        },
      },
      tokens,
    };

    const response = await adminApp.messaging().sendEachForMulticast(message);
    const successCount = response.successCount;
    const failureCount = response.failureCount;

    return res.status(200).json({
      message: `Terkirim ke ${successCount}/${tokens.length} perangkat${failureCount > 0 ? ` (${failureCount} gagal)` : ""}`,
      sent: successCount,
      failed: failureCount,
      total: tokens.length,
    });
  } catch (err: any) {
    console.error("Send notification error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
};
