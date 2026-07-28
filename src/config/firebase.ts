import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim() || "AIzaSyBmRo8zWY1BA8P84OKmGNjP5bRtSuKpyI8",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() || "printco-c34e4.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() || "printco-c34e4",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() || "printco-c34e4.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() || "556935303171",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim() || "1:556935303171:web:2ef2bb709f0989858bbe36",
};

let app: ReturnType<typeof getApp> | undefined;
let auth: ReturnType<typeof getAuth> | undefined;
let db: ReturnType<typeof getFirestore> | undefined;
let storage: ReturnType<typeof getStorage> | undefined;

// Initialize Firebase only on the client side to avoid Next.js SSR build errors
// when environment variables might not be populated during static generation.
if (typeof window !== "undefined") {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

const fireAuth = auth as ReturnType<typeof getAuth>;
const fireDb = db as ReturnType<typeof getFirestore>;
const fireStorage = storage as ReturnType<typeof getStorage>;

export { app, fireAuth as auth, fireDb as db, fireStorage as storage };
