import { PageSection } from "../entities/PageSection";
import { PageSectionRepository } from "../repositories/PageSectionRepository";

export class PageSectionService {
  private pageSectionRepository: PageSectionRepository;

  constructor() {
    this.pageSectionRepository = new PageSectionRepository();
  }

  /**
   * Get all sections for a page
   */
  async getPageSections(pageIdentifier: string): Promise<PageSection[]> {
    return this.pageSectionRepository.findByPage(pageIdentifier);
  }

  /**
   * Get active sections for public display
   */
  async getActivePageSections(pageIdentifier: string): Promise<PageSection[]> {
    return this.pageSectionRepository.findActiveByPage(pageIdentifier);
  }

  /**
   * Get a specific section
   */
  async getSection(
    pageIdentifier: string,
    sectionIdentifier: string
  ): Promise<PageSection | null> {
    return this.pageSectionRepository.findByPageAndSection(
      pageIdentifier,
      sectionIdentifier
    );
  }

  /**
   * Update or create multiple sections at once
   */
  async updateSections(
    pageIdentifier: string,
    sections: Array<{
      sectionIdentifier: string;
      content: Record<string, any>;
      sortOrder?: number;
      isActive?: boolean;
    }>
  ): Promise<PageSection[]> {
    const results: PageSection[] = [];

    for (const section of sections) {
      const result = await this.pageSectionRepository.upsert(
        pageIdentifier,
        section.sectionIdentifier,
        section.content,
        section.sortOrder,
        section.isActive
      );
      results.push(result);
    }

    return results;
  }

  /**
   * Delete a section
   */
  async deleteSection(id: string): Promise<void> {
    await this.pageSectionRepository.delete(id);
  }
}
