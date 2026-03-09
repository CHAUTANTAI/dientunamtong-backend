import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

/**
 * PageSection Entity
 * Stores configurable content sections for different pages
 */
@Entity("page_sections")
@Index(["page_identifier", "section_identifier"], { unique: true })
export class PageSection {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 100 })
  page_identifier!: string; // 'homepage', 'about', etc.

  @Column({ type: "varchar", length: 100 })
  section_identifier!: string; // 'intro', 'banner', 'highlight_categories', etc.

  @Column({ type: "jsonb" })
  content!: Record<string, any>;

  @Column({ type: "int", default: 0 })
  sort_order!: number;

  @Column({ type: "boolean", default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
