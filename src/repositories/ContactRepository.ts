import { BaseRepository } from "./BaseRepository";
import { Contact, ContactStatus } from "@entities/Contact";

export class ContactRepository extends BaseRepository<Contact> {
  constructor() {
    super(Contact);
  }

  async findByStatus(status: ContactStatus): Promise<Contact[]> {
    return await this.repository.find({
      where: { status },
      order: { created_at: "DESC" },
    });
  }

  async updateStatus(id: string, status: ContactStatus): Promise<Contact | null> {
    await this.repository.update(id, { status });
    return await this.findById(id);
  }
}

