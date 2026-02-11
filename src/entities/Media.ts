import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Category } from "./Category";
import { Product } from "./Product";

export enum MediaType {
  IMAGE = "image",
  VIDEO = "video",
  AUDIO = "audio",
  DOCUMENT = "document",
  OTHER = "other",
}

@Entity("media")
export class Media {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  file_name!: string;

  @Column({ type: "varchar", length: 500 })
  file_url!: string;

  @Column({
    type: "enum",
    enum: MediaType,
    default: MediaType.IMAGE,
  })
  media_type!: MediaType;

  @Column({ type: "varchar", length: 100, nullable: true })
  mime_type?: string;

  @Column({ type: "bigint", nullable: true })
  file_size?: number;

  @Column({ type: "integer", nullable: true })
  width?: number;

  @Column({ type: "integer", nullable: true })
  height?: number;

  @Column({ type: "varchar", length: 255, nullable: true })
  alt_text?: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "integer", default: 0 })
  sort_order!: number;

  @Column({ type: "uuid", nullable: true })
  product_id?: string;

  @Column({ type: "boolean", default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @ManyToOne(() => Product, (product) => product.media, {
    onDelete: "CASCADE",
    nullable: true,
  })
  @JoinColumn({ name: "product_id" })
  product?: Product;

  @OneToMany(() => Category, (category) => category.media)
  categories?: Category[];
}

