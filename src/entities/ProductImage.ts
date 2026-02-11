import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Product } from "./Product";

@Entity("product_image")
export class ProductImage {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  product_id!: string;

  @Column({ type: "varchar", length: 500 })
  image_url!: string;

  @Column({ type: "integer", default: 0 })
  sort_order!: number;

  @CreateDateColumn()
  created_at!: Date;

  // Relations
  @ManyToOne(() => Product, (product) => product.images, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "product_id" })
  product!: Product;
}

