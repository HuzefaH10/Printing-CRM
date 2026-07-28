import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  QueryConstraint,
  Query,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { BaseModel, CreatePayload, UpdatePayload, QueryOptions, FilterCondition } from "@/types/repository";

export class BaseRepository<T extends BaseModel> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  protected getCollection() {
    if (!db) throw new Error("Firestore is not initialized");
    return collection(db, this.collectionName);
  }

  protected getDocRef(id: string) {
    if (!db) throw new Error("Firestore is not initialized");
    return doc(db, this.collectionName, id);
  }

  /**
   * Create a new document. If id is provided, it uses that id, otherwise generates one.
   */
  async create(data: CreatePayload<T>, id?: string, userId?: string): Promise<T> {
    const colRef = this.getCollection();
    const docRef = id ? this.getDocRef(id) : doc(colRef);
    
    const now = serverTimestamp();
    const payload = {
      ...data,
      id: docRef.id,
      createdAt: now,
      updatedAt: now,
      createdBy: userId || null,
      updatedBy: userId || null,
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
    };

    await setDoc(docRef, payload);
    return payload as unknown as T;
  }

  /**
   * Get a document by ID
   */
  async get(id: string): Promise<T | null> {
    const docRef = this.getDocRef(id);
    const snapshot = await getDoc(docRef);
    
    if (!snapshot.exists()) return null;
    
    const data = snapshot.data() as T;
    if (data.isDeleted) return null; // Default to not returning soft-deleted items
    
    return data;
  }

  /**
   * Update a document by ID
   */
  async update(id: string, data: UpdatePayload<T>, userId?: string): Promise<void> {
    const docRef = this.getDocRef(id);
    const payload = {
      ...data,
      updatedAt: serverTimestamp(),
      ...(userId && { updatedBy: userId }),
    };
    
    await updateDoc(docRef, payload);
  }

  /**
   * Soft delete a document
   */
  async softDelete(id: string, userId?: string): Promise<void> {
    const docRef = this.getDocRef(id);
    await updateDoc(docRef, {
      isDeleted: true,
      deletedAt: serverTimestamp(),
      deletedBy: userId || null,
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Restore a soft-deleted document
   */
  async restore(id: string, userId?: string): Promise<void> {
    const docRef = this.getDocRef(id);
    await updateDoc(docRef, {
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
      updatedAt: serverTimestamp(),
      ...(userId && { updatedBy: userId }),
    });
  }

  /**
   * Hard delete a document permanently
   */
  async hardDelete(id: string): Promise<void> {
    const docRef = this.getDocRef(id);
    await deleteDoc(docRef);
  }

  /**
   * Query documents with filters, sorting, and pagination
   */
  async list(filters: FilterCondition[] = [], options: QueryOptions = {}): Promise<{ data: T[], lastDoc: QueryDocumentSnapshot<DocumentData> | null }> {
    let q: Query<DocumentData> = this.getCollection();
    const constraints: QueryConstraint[] = [];

    // Apply default soft-delete filter unless explicitly overridden
    if (!options.includeDeleted) {
      constraints.push(where("isDeleted", "==", false));
    }

    // Apply custom filters
    filters.forEach(f => {
      constraints.push(where(f.field, f.operator, f.value));
    });

    // Apply sorting
    if (options.orderBy) {
      constraints.push(orderBy(options.orderBy, options.orderDirection || "asc"));
    }

    // Apply pagination
    if (options.startAfter) {
      constraints.push(startAfter(options.startAfter));
    }
    
    if (options.limit) {
      constraints.push(limit(options.limit));
    }

    q = query(q, ...constraints);
    const snapshot = await getDocs(q);
    
    const data = snapshot.docs.map(doc => doc.data() as T);
    const lastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;

    return { data, lastDoc };
  }

  /**
   * Subscribe to real-time updates for a specific query
   */
  subscribe(
    filters: FilterCondition[] = [], 
    options: QueryOptions = {}, 
    onUpdate: (data: T[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    let q: Query<DocumentData> = this.getCollection();
    const constraints: QueryConstraint[] = [];

    if (!options.includeDeleted) {
      constraints.push(where("isDeleted", "==", false));
    }

    filters.forEach(f => {
      constraints.push(where(f.field, f.operator, f.value));
    });

    if (options.orderBy) {
      constraints.push(orderBy(options.orderBy, options.orderDirection || "asc"));
    }

    if (options.limit) {
      constraints.push(limit(options.limit));
    }

    q = query(q, ...constraints);

    return onSnapshot(
      q, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => doc.data() as T);
        onUpdate(data);
      },
      (error) => {
        if (onError) onError(error);
      }
    );
  }

  /**
   * Perform batch writes
   */
  async batchWrite(
    creations: { data: CreatePayload<T>, id?: string }[],
    updates: { id: string, data: UpdatePayload<T> }[],
    deletions: string[],
    userId?: string
  ): Promise<void> {
    if (!db) throw new Error("Firestore is not initialized");
    const batch = writeBatch(db);
    const colRef = this.getCollection();

    creations.forEach(item => {
      const docRef = item.id ? this.getDocRef(item.id) : doc(colRef);
      batch.set(docRef, {
        ...item.data,
        id: docRef.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: userId || null,
        updatedBy: userId || null,
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
      });
    });

    updates.forEach(item => {
      const docRef = this.getDocRef(item.id);
      batch.update(docRef, {
        ...item.data,
        updatedAt: serverTimestamp(),
        ...(userId && { updatedBy: userId }),
      });
    });

    deletions.forEach(id => {
      const docRef = this.getDocRef(id);
      // Default to soft delete for batch
      batch.update(docRef, {
        isDeleted: true,
        deletedAt: serverTimestamp(),
        deletedBy: userId || null,
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
  }
}
