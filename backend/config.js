import 'dotenv/config';
import admin from "firebase-admin";

// Decode the Base64 Firebase credentials
const credentials = JSON.parse(
  Buffer.from(process.env.FIREBASE, "base64").toString("utf8")
);

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(credentials),
  databaseURL: "https://discuss-ai-default-rtdb.asia-southeast1.firebasedatabase.app/", // Replace with your Firebase DB URL
});

const db = admin.database();

// // Quick connection test
// async function testConnection() {
//   try {
//     await db.ref("/test").set({ message: "Firebase connection successful!" });
//     console.log("✅ Firebase is connected and test data is written!");
//   } catch (error) {
//     console.error("❌ Firebase connection failed:", error);
//   }
// }

// // Run the test
// testConnection();

export default db;
