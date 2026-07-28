import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/config/firebase";
import type { UserProfile, Role } from "@/types/user";
import type { User as FirebaseUser } from "firebase/auth";

export class UserService {
  private static collection = "users";

  static async getProfile(uid: string): Promise<UserProfile | null> {
    const docRef = doc(db, this.collection, uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  }

  static async createProfile(firebaseUser: FirebaseUser, role: Role = "Viewer"): Promise<UserProfile> {
    const docRef = doc(db, this.collection, firebaseUser.uid);
    
    const newProfile: UserProfile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || "",
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      role,
      status: "active",
      createdAt: Date.now(),
      lastLogin: Date.now(),
      preferences: {
        theme: "system",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: "en",
        keyboardShortcutsEnabled: true,
        commandPaletteEnabled: true,
        defaultDashboard: "/dashboard",
      },
      notificationPreferences: {
        emailAlerts: true,
        pushAlerts: true,
        dailyDigest: false,
      },
      favoritePages: [],
      pinnedCompanies: [],
      recentSearches: [],
    };

    await setDoc(docRef, newProfile);
    return newProfile;
  }

  static async updateProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    const docRef = doc(db, this.collection, uid);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
  }

  static async updateLastLogin(uid: string): Promise<void> {
    const docRef = doc(db, this.collection, uid);
    await updateDoc(docRef, { lastLogin: Date.now() });
  }
}
