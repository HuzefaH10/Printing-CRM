import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/config/firebase";
import { WebAuthnCredential } from "../models/webauthn";

export class WebAuthnService {
  /**
   * Get all registered WebAuthn credentials for a user
   */
  static async getUserCredentials(uid: string): Promise<WebAuthnCredential[]> {
    if (!db || !uid) return [];
    try {
      const colRef = collection(db, "users", uid, "webauthnCredentials");
      const snapshot = await getDocs(colRef);
      return snapshot.docs.map((doc) => doc.data() as WebAuthnCredential);
    } catch (err) {
      console.warn("Failed to fetch WebAuthn credentials:", err);
      return [];
    }
  }

  /**
   * Save a newly registered WebAuthn credential for a user
   */
  static async saveCredential(uid: string, credential: WebAuthnCredential): Promise<void> {
    if (!db || !uid) throw new Error("Firestore is not initialized or user ID missing");
    const docRef = doc(db, "users", uid, "webauthnCredentials", credential.id);
    await setDoc(docRef, {
      ...credential,
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Update counter and lastUsedAt timestamp for a credential
   */
  static async updateCredentialCounter(uid: string, credentialId: string, counter: number): Promise<void> {
    if (!db || !uid) return;
    const docRef = doc(db, "users", uid, "webauthnCredentials", credentialId);
    await updateDoc(docRef, {
      counter,
      lastUsedAt: new Date().toISOString(),
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Delete a registered WebAuthn credential
   */
  static async deleteCredential(uid: string, credentialId: string): Promise<void> {
    if (!db || !uid) return;
    const docRef = doc(db, "users", uid, "webauthnCredentials", credentialId);
    await deleteDoc(docRef);
  }

  /**
   * Store temporary challenge in user's profile document for verification
   */
  static async saveChallenge(uid: string, challenge: string): Promise<void> {
    if (!db || !uid) return;
    const docRef = doc(db, "users", uid, "webauthnSession", "active");
    await setDoc(docRef, {
      challenge,
      createdAt: serverTimestamp(),
    });
  }

  /**
   * Retrieve active challenge for user
   */
  static async getChallenge(uid: string): Promise<string | null> {
    if (!db || !uid) return null;
    try {
      const docRef = doc(db, "users", uid, "webauthnSession", "active");
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return null;
      return snapshot.data()?.challenge || null;
    } catch (err) {
      return null;
    }
  }
}
