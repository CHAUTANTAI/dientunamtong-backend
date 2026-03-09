import { Request, Response } from "express";
import { PageSectionService } from "../services/PageSectionService";

export class PageSectionController {
  private pageSectionService: PageSectionService;

  constructor() {
    this.pageSectionService = new PageSectionService();
  }

  /**
   * GET /api/admin/page-sections/:pageIdentifier
   * Get all sections for a page (admin)
   */
  getPageSections = async (req: Request, res: Response): Promise<void> => {
    try {
      const { pageIdentifier } = req.params;
      const sections = await this.pageSectionService.getPageSections(
        pageIdentifier
      );
      res.json({ data: sections });
    } catch (error) {
      console.error("Error fetching page sections:", error);
      res.status(500).json({ error: "Failed to fetch page sections" });
    }
  };

  /**
   * GET /api/public/page-sections/:pageIdentifier
   * Get active sections for public display
   */
  getActivePageSections = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { pageIdentifier } = req.params;
      const sections = await this.pageSectionService.getActivePageSections(
        pageIdentifier
      );
      res.json({ data: sections });
    } catch (error) {
      console.error("Error fetching active page sections:", error);
      res.status(500).json({ error: "Failed to fetch page sections" });
    }
  };

  /**
   * PUT /api/admin/page-sections/:pageIdentifier
   * Update multiple sections for a page
   */
  updatePageSections = async (req: Request, res: Response): Promise<void> => {
    try {
      const { pageIdentifier } = req.params;
      const { sections } = req.body;

      if (!Array.isArray(sections)) {
        res.status(400).json({ error: "Sections must be an array" });
        return;
      }

      const results = await this.pageSectionService.updateSections(
        pageIdentifier,
        sections
      );

      res.json({
        message: "Page sections updated successfully",
        data: results,
      });
    } catch (error) {
      console.error("Error updating page sections:", error);
      res.status(500).json({ error: "Failed to update page sections" });
    }
  };

  /**
   * DELETE /api/admin/page-sections/:id
   * Delete a section
   */
  deleteSection = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.pageSectionService.deleteSection(id);
      res.json({ message: "Section deleted successfully" });
    } catch (error) {
      console.error("Error deleting section:", error);
      res.status(500).json({ error: "Failed to delete section" });
    }
  };
}
