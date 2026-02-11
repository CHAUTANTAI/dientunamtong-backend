import { ContactRepository } from "@repositories/ContactRepository";
import { Contact, ContactStatus } from "@entities/Contact";
import { CreateContactDto, UpdateContactDto } from "@/types/dtos";
import { NotFoundError } from "@/types/responses";

export class ContactService {
  private contactRepository: ContactRepository;

  constructor() {
    this.contactRepository = new ContactRepository();
  }

  async getAllContacts(): Promise<Contact[]> {
    return await this.contactRepository.findAll({
      order: { created_at: "DESC" },
    });
  }

  async getContactById(id: string): Promise<Contact> {
    const contact = await this.contactRepository.findById(id);
    
    if (!contact) {
      throw new NotFoundError(`Contact with id ${id} not found`);
    }

    return contact;
  }

  async getContactsByStatus(status: ContactStatus): Promise<Contact[]> {
    return await this.contactRepository.findByStatus(status);
  }

  async createContact(createDto: CreateContactDto): Promise<Contact> {
    const contact = await this.contactRepository.create({
      ...createDto,
      status: ContactStatus.NEW,
    });
    return contact;
  }

  async updateContactStatus(
    id: string,
    updateDto: UpdateContactDto
  ): Promise<Contact> {
    const contact = await this.contactRepository.findById(id);
    
    if (!contact) {
      throw new NotFoundError(`Contact with id ${id} not found`);
    }

    if (updateDto.status) {
      const updatedContact = await this.contactRepository.updateStatus(
        id,
        updateDto.status
      );
      
      if (!updatedContact) {
        throw new Error("Failed to update contact status");
      }

      return updatedContact;
    }

    return contact;
  }

  async deleteContact(id: string): Promise<void> {
    const contact = await this.contactRepository.findById(id);
    
    if (!contact) {
      throw new NotFoundError(`Contact with id ${id} not found`);
    }

    await this.contactRepository.delete(id);
  }
}

