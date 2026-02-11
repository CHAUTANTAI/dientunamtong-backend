import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  Index,
} from "typeorm";
import { Category } from "./Category";
import { Media } from "./Media";

@Entity("product")
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  @Index("IDX_PRODUCT_NAME")
  name!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  slug!: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  sku?: string;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  @Index("IDX_PRODUCT_PRICE")
  price?: number;

  @Column({ type: "text", nullable: true })
  short_description?: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "jsonb", nullable: true })
  specifications?: Record<string, any>;

  @Column({ type: "text", array: true, nullable: true })
  tags?: string[];

  @Column({ type: "integer", default: 0 })
  view_count!: number;

  @Column({ type: "boolean", default: true })
  @Index("IDX_PRODUCT_ACTIVE")
  is_active!: boolean;

  @Column({ type: "boolean", default: true })
  in_stock!: boolean;

  @CreateDateColumn()
  @Index("IDX_PRODUCT_CREATED")
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @OneToMany(() => Media, (media) => media.product, {
    cascade: true,
    eager: false,
  })
  media?: Media[];

  @ManyToMany(() => Category, (category) => category.products, {
    cascade: false,
  })
  @JoinTable({
    name: "product_category",
    joinColumn: { name: "product_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "category_id", referencedColumnName: "id" },
  })
  categories?: Category[];
}

