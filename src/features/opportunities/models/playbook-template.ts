import { BaseModel } from "@/types/repository";
import { PlaybookStep, PlaybookObjection } from "./playbook";

export interface PlaybookTemplate extends BaseModel {
  name: string; // e.g. "University Playbook", "Government Playbook"
  description: string;
  defaultSteps: Omit<PlaybookStep, "id" | "status" | "completedAt">[];
  defaultObjections: Omit<PlaybookObjection, "id">[];
}
