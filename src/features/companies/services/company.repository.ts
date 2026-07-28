import { BaseRepository } from "@/lib/repository/base.repository";
import { Company } from "../models/company";

class CompanyRepository extends BaseRepository<Company> {
  constructor() {
    super("organizations");
  }

  // Custom repository methods can go here
  // For example, finding by tax number or legal name
}

export const companyRepo = new CompanyRepository();
