import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import { OutreachSettings, DEFAULT_OUTREACH_SETTINGS } from "../models/outreach-settings";

const SETTINGS_DOC_ID = "outreach";

export class OutreachSettingsService {
  static async getSettings(): Promise<OutreachSettings> {
    try {
      if (!db) return DEFAULT_OUTREACH_SETTINGS;
      const docRef = doc(db, "settings", SETTINGS_DOC_ID);
      const snapshot = await getDoc(docRef);
      
      if (!snapshot.exists()) {
        return DEFAULT_OUTREACH_SETTINGS;
      }
      
      const data = snapshot.data() as Partial<OutreachSettings>;
      return {
        ...DEFAULT_OUTREACH_SETTINGS,
        ...data,
      };
    } catch (error) {
      console.warn("Failed to fetch OutreachSettings from Firestore, using defaults:", error);
      return DEFAULT_OUTREACH_SETTINGS;
    }
  }

  static async updateSettings(settings: Partial<OutreachSettings>): Promise<OutreachSettings> {
    if (!db) throw new Error("Firestore is not initialized");
    const current = await this.getSettings();
    const updated = {
      ...current,
      ...settings,
    };
    
    const docRef = doc(db, "settings", SETTINGS_DOC_ID);
    await setDoc(docRef, updated, { merge: true });
    return updated;
  }
}
