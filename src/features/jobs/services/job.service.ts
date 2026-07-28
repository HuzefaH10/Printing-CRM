import { jobRepo } from "./job.repository";
import { opportunityRepo } from "@/features/opportunities/services/opportunity.repository";
import { Job, ArtworkStatus } from "../models/job";
import { Opportunity } from "@/features/opportunities/models/opportunity";
import { collection, doc, serverTimestamp, writeBatch, getDocs, query, orderBy, limit, where } from "firebase/firestore";
import { db } from "@/config/firebase";

export class JobService {
  
  static async generateJobNumber(): Promise<string> {
    const currentYear = new Date().getFullYear().toString();
    const prefix = `JOB-${currentYear}-`;
    
    // Find the highest job number for the current year
    const q = query(
      collection(db, "jobs"),
      where("jobNumber", ">=", prefix),
      where("jobNumber", "<", prefix + "\uf8ff"),
      orderBy("jobNumber", "desc"),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return `${prefix}0001`;
    }
    
    const lastJobNumber = snapshot.docs[0].data().jobNumber as string;
    const sequencePart = lastJobNumber.split("-")[2];
    const nextSequence = parseInt(sequencePart || "0", 10) + 1;
    
    return `${prefix}${nextSequence.toString().padStart(4, "0")}`;
  }

  static async createJobFromOpportunity(
    opportunityId: string, 
    userId: string,
    deliveryDeadline: Date | string,
    artworkStatus: ArtworkStatus = "Pending"
  ): Promise<string> {
    
    // 1. Fetch the Opportunity
    const opp = await opportunityRepo.get(opportunityId);
    if (!opp) throw new Error("Opportunity not found");
    if (opp.status === "Won") throw new Error("Opportunity is already Won");
    
    // 2. Generate Job Number
    const jobNumber = await this.generateJobNumber();
    
    // 3. Prepare Batch Write
    const batch = writeBatch(db);
    
    // -- Create Job --
    const newJobRef = doc(collection(db, "jobs"));
    const jobData: Omit<Job, "id"> & { id: string } = {
      id: newJobRef.id,
      opportunityId: opp.id,
      organizationId: opp.organizationId,
      jobNumber,
      status: "Prepress",
      specifications: opp.specs || {},
      artworkStatus,
      deliveryDeadline,
      createdAt: serverTimestamp() as any,
      updatedAt: serverTimestamp() as any,
      createdBy: userId,
      updatedBy: userId,
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
    };
    batch.set(newJobRef, jobData);
    
    // -- Update Opportunity --
    const oppRef = doc(db, "opportunities", opp.id);
    batch.update(oppRef, {
      status: "Won",
      updatedAt: serverTimestamp(),
      updatedBy: userId
    });
    
    // 4. Commit
    await batch.commit();
    
    return newJobRef.id;
  }
}
