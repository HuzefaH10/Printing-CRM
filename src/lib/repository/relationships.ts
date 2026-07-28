/**
 * Relationship Engine
 * 
 * Centralizes how entities are related to each other in Firestore.
 */

export type RelationType = 
  | "ONE_TO_ONE"
  | "ONE_TO_MANY"
  | "MANY_TO_MANY";

export interface EntityReference {
  id: string;
  name?: string;       // Denormalized name for quick display
  type: string;        // E.g., 'company', 'contact', 'user'
  avatarUrl?: string;  // Denormalized avatar
}

export interface RelationalDocument {
  /**
   * For ONE_TO_MANY relationships where this document belongs to a single parent.
   * e.g., A Quote belongs to a Company. companyId: "xyz"
   */
  parentId?: string;
  parentType?: string; // E.g., 'company'
  
  /**
   * Generic entity references for standard linking.
   */
  companyId?: string;
  contactId?: string;
  opportunityId?: string;
  
  /**
   * For MANY_TO_MANY relationships where we maintain an array of linked IDs.
   * Note: Firestore arrays have limits, so this is for moderate scales.
   */
  linkedEntities?: EntityReference[];
}

/**
 * Builds a query filter to find all children belonging to a specific parent.
 */
export function buildParentFilter(parentId: string, parentType?: string) {
  const filters: any[] = [{ field: "parentId", operator: "==", value: parentId }];
  if (parentType) {
    filters.push({ field: "parentType", operator: "==", value: parentType });
  }
  return filters;
}

/**
 * Helper to update denormalized data across linked entities.
 * (To be used within a batch or transaction)
 */
export function buildReference(id: string, type: string, name?: string, avatarUrl?: string): EntityReference {
  return { id, type, name, avatarUrl };
}
