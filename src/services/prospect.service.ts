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
  static async convertToCompany(prospectId: string): Promise<string> {
    const prospectRef = doc(db, COLLECTION_NAME, prospectId);
    const companyRef = doc(collection(db, 'companies'));

    try {
      await runTransaction(db, async (transaction) => {
        const prospectDoc = await transaction.get(prospectRef);
        if (!prospectDoc.exists()) {
          throw new Error("Prospect does not exist!");
        }

        const pData = prospectDoc.data() as Prospect;
        const now = new Date().toISOString();

        // 1. Create the company record mapping from Prospect
        const newCompany = {
          name: pData.organizationName || 'Unknown Company',
          legalName: pData.organizationName || 'Unknown Company',
          industry: pData.industry || 'Other',
          category: 'Uncategorized',
          description: pData.description || '',
          website: pData.website || '',
          phone: pData.decisionMakerPhone || '',
          email: pData.decisionMakerEmail || '',
          
          location: {
            address: pData.location || '',
            city: '',
            state: '',
            country: '',
            postalCode: '',
            area: ''
          },
          
          intelligence: {
            relationshipScore: pData.relationshipScore || 0,
            potentialScore: 0,
            opportunityScore: 0,
            urgencyScore: 0,
            engagementScore: 0,
            overallScore: 0
          },
          
          relationshipTracker: {
            responseTimeDays: 0,
            averageFollowUpDays: 0,
            communicationFrequency: 'Ad-hoc',
            health: 'FAIR'
          },

          isCustomer: false,
          isSupplier: false,
          isPartner: false,
          
          currency: 'KWD',
          language: 'EN',
          priority: pData.priority === 'Critical' ? 'URGENT' : (pData.priority?.toUpperCase() || 'MEDIUM'),
          status: 'PROSPECT',
          
          tags: pData.tags || [],
          source: pData.source || 'Prospect Conversion',
          customFields: pData.customFields || {},
          
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
