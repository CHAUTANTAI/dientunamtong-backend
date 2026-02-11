import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { ProductImage } from "./ProductImage";
import { Category } from "./Category";

@Entity("product")
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  price?: number;

  @Column({ type: "text", nullable: true })
  short_description?: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "boolean", default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @OneToMany(() => ProductImage, (image) => image.product, {
    cascade: true,
    eager: false,
  })
  images?: ProductImage[];

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

