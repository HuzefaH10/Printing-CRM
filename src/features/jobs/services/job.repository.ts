import { BaseRepository } from "@/lib/repository/base.repository";
import { Job } from "../models/job";

class JobRepository extends BaseRepository<Job> {
  constructor() {
    super("jobs");
  }
}

export const jobRepo = new JobRepository();
