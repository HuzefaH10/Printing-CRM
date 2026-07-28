import { BaseRepository } from "@/lib/repository/base.repository";
import { Activity } from "../models/activity";

class ActivityRepository extends BaseRepository<Activity> {
  constructor() {
    super("activities");
  }
}

export const activityRepo = new ActivityRepository();
