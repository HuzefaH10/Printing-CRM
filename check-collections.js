import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim() || "AIzaSyBmRo8zWY1BA8P84OKmGNjP5bRtSuKpyI8",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() || "printco-c34e4.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() || "printco-c34e4",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() || "printco-c34e4.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() || "556935303171",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim() || "1:556935303171:web:2ef2bb709f0989858bbe36",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

async function checkCollections() {
  try {
    const orgsSnap = await getDocs(collection(db, 'organizations'));
    const peopleSnap = await getDocs(collection(db, 'people'));
    const companiesSnap = await getDocs(collection(db, 'companies'));
    const contactsSnap = await getDocs(collection(db, 'contacts'));

    console.log(`organizations: ${orgsSnap.size}`);
    console.log(`people: ${peopleSnap.size}`);
    console.log(`companies: ${companiesSnap.size}`);
    console.log(`contacts: ${contactsSnap.size}`);
  } catch (err) {
    console.error('Error fetching collections:', err.message);
  }
}

checkCollections();
