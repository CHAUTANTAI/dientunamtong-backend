import { BaseRepository } from "./BaseRepository";
import { PageSection } from "../entities/PageSection";

export class PageSectionRepository extends BaseRepository<PageSection> {
  constructor() {
    super(PageSection);
  }

  /**
   * Find all sections for a specific page
   */
  async findByPage(pageIdentifier: string): Promise<PageSection[]> {
    return this.repository.find({
      where: { page_identifier: pageIdentifier },
      order: { sort_order: "ASC" },
    });
  }

  /**
   * Find a specific section by page and section identifier
   */
  async findByPageAndSection(
    pageIdentifier: string,
    sectionIdentifier: string
  ): Promise<PageSection | null> {
    return this.repository.findOne({
      where: {
        page_identifier: pageIdentifier,
        section_identifier: sectionIdentifier,
      },
    });
  }

  /**
   * Find all active sections for a page
   */
  async findActiveByPage(pageIdentifier: string): Promise<PageSection[]> {
    return this.repository.find({
      where: {
        page_identifier: pageIdentifier,
        is_active: true,
      },
      order: { sort_order: "ASC" },
    });
  }

  /**
   * Update or create a section
   */
  async upsert(
    pageIdentifier: string,
    sectionIdentifier: string,
    content: Record<string, any>,
    sortOrder?: number,
    isActive?: boolean
  ): Promise<PageSection> {
    const existing = await this.findByPageAndSection(
      pageIdentifier,
      sectionIdentifier
    );

    if (existing) {
      existing.content = content;
      if (sortOrder !== undefined) existing.sort_order = sortOrder;
      if (isActive !== undefined) existing.is_active = isActive;
      return this.repository.save(existing);
    }

    const section = this.repository.create({
      page_identifier: pageIdentifier,
      section_identifier: sectionIdentifier,
      content,
      sort_order: sortOrder ?? 0,
      is_active: isActive ?? true,
    });

    return this.repository.save(section);
  }
}
