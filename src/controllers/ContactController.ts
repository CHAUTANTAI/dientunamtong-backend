import { Request, Response, NextFunction } from "express";
import { ContactService } from "@services/ContactService";
import { CreateContactDto, UpdateContactDto } from "@/types/dtos";
import { ContactStatus } from "@entities/Contact";
import { ApiResponse } from "@/types/responses";

export class ContactController {
  private contactService: ContactService;

  constructor() {
    this.contactService = new ContactService();
  }

  getAllContacts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const status = req.query.status as ContactStatus | undefined;

      const contacts = status
        ? await this.contactService.getContactsByStatus(status)
        : await this.contactService.getAllContacts();

      const response: ApiResponse = {
        success: true,
        data: contacts,
        statusCode: 200,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getContactById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const contact = await this.contactService.getContactById(id);

      const response: ApiResponse = {
        success: true,
        data: contact,
        statusCode: 200,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  createContact = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const createDto: CreateContactDto = req.body;
      const contact = await this.contactService.createContact(createDto);

      const response: ApiResponse = {
        success: true,
        data: contact,
        message: "Contact created successfully",
        statusCode: 201,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  updateContactStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const updateDto: UpdateContactDto = req.body;
      const contact = await this.contactService.updateContactStatus(
        id,
        updateDto
      );

      const response: ApiResponse = {
        success: true,
        data: contact,
        message: "Contact status updated successfully",
        statusCode: 200,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  deleteContact = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      await this.contactService.deleteContact(id);

      const response: ApiResponse = {
        success: true,
        message: "Contact deleted successfully",
        statusCode: 200,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}

