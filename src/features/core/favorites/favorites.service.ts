import { BaseRepository } from "@/lib/repository/base.repository";
import { BaseModel } from "@/types/repository";

export interface Favorite extends BaseModel {
  userId: string;
  entityId: string;
  entityType: string;
  name: string; // Denormalized name for quick display in sidebar
}

class FavoriteRepository extends BaseRepository<Favorite> {
  constructor() {
    super("_favorites");
  }
}

export const favoritesRepo = new FavoriteRepository();

export class FavoritesService {
  static async addFavorite(userId: string, entityId: string, entityType: string, name: string) {
    // Check if already favorited
    const { data: existing } = await favoritesRepo.list([
      { field: "userId", operator: "==", value: userId },
      { field: "entityId", operator: "==", value: entityId }
    ]);
    
    if (existing.length > 0) return existing[0];
    
    return favoritesRepo.create({
      userId,
      entityId,
      entityType,
      name
    }, undefined, userId);
  }

  static async removeFavorite(userId: string, entityId: string) {
    const { data: existing } = await favoritesRepo.list([
      { field: "userId", operator: "==", value: userId },
      { field: "entityId", operator: "==", value: entityId }
    ]);
    
    if (existing.length > 0) {
      // Hard delete for favorites is fine as it's just a user preference
      await favoritesRepo.hardDelete(existing[0].id);
    }
  }

  static async getUserFavorites(userId: string, limitCount: number = 20) {
    return favoritesRepo.list(
      [{ field: "userId", operator: "==", value: userId }],
      { orderBy: "createdAt", orderDirection: "desc", limit: limitCount }
    );
  }
}
