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

  async countByStatus(status: ContactStatus): Promise<number> {
    return await this.repository.count({
      where: { status },
    });
  }

  async findAllWithProduct(): Promise<Contact[]> {
    return await this.repository.find({
      relations: ["product"],
      order: { created_at: "DESC" },
    });
  }
}

