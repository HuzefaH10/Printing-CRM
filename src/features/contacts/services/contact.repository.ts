import { BaseRepository } from "@/lib/repository/base.repository";
import { Contact } from "../models/contact";

class ContactRepository extends BaseRepository<Contact> {
  constructor() {
    super("people");
  }
}

export const contactRepo = new ContactRepository();
