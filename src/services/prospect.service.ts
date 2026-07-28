import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  runTransaction
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Prospect } from '@/types/prospect';
// Ensure we have a Company type or at least an any type for the conversion to company
// The user has a companies module, we will assume standard company type exists, or use Partial<any> for now.

const COLLECTION_NAME = 'prospects';

export class ProspectService {
  /**
   * Fetch all prospects
   */
  static async getAllProspects(): Promise<Prospect[]> {
    const q = query(collection(db, COLLECTION_NAME), orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prospect));
  }

  /**
   * Get a single prospect by ID
   */
  static async getProspect(id: string): Promise<Prospect | null> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Prospect;
    }
    return null;
  }

  /**
   * Create a new prospect
   */
  static async createProspect(prospect: Omit<Prospect, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date().toISOString();
    const newProspect = {
      ...prospect,
      createdAt: now,
      updatedAt: now,
    };
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), newProspect);
    return docRef.id;
  }

  /**
   * Update an existing prospect
   */
  static async updateProspect(id: string, updates: Partial<Omit<Prospect, 'id' | 'createdAt'>>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  }

  /**
   * Delete a prospect
   */
  static async deleteProspect(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }

  /**
   * Convert a prospect to a company
   * This runs as a transaction to ensure both operations (create company, update prospect) succeed or fail together.
   */
  static async convertToCompany(prospectId: string, companyData: any): Promise<string> {
    const prospectRef = doc(db, COLLECTION_NAME, prospectId);
    const companyRef = doc(collection(db, 'companies')); // Auto-generate ID for new company

    try {
      await runTransaction(db, async (transaction) => {
        const prospectDoc = await transaction.get(prospectRef);
        if (!prospectDoc.exists()) {
          throw new Error("Prospect does not exist!");
        }

        // 1. Create the company record
        const now = new Date().toISOString();
        const newCompany = {
          ...companyData,
          isCustomer: false, // Or true, depending on the business logic, but it's a new company in the CRM.
          sourceProspectId: prospectId,
          createdAt: now,
          updatedAt: now,
        };
        transaction.set(companyRef, newCompany);

        // 2. Update the prospect record
        transaction.update(prospectRef, {
          status: 'Converted',
          convertedCompanyId: companyRef.id,
          updatedAt: now
        });
      });

      return companyRef.id;
    } catch (e) {
      console.error("Conversion failed: ", e);
      throw e;
    }
  }
}
