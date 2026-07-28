import { BaseRepository } from "@/lib/repository/base.repository";
import { Tender, VendorRegistration } from "../models/tender";

export class TenderRepository extends BaseRepository<Tender> {
  constructor() {
    super("tenders");
  }
}

export class VendorRegistrationRepository extends BaseRepository<VendorRegistration> {
  constructor() {
    super("vendorRegistrations");
  }
}

export const tenderRepo = new TenderRepository();
export const vendorRegistrationRepo = new VendorRegistrationRepository();
