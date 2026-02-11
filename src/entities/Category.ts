import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Tree,
  TreeParent,
  TreeChildren,
} from "typeorm";
import { Product } from "./Product";
import { Media } from "./Media";

@Entity("category")
@Tree("closure-table")
export class Category {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  slug!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "uuid", nullable: true })
  parent_id?: string;

  @Column({ type: "uuid", nullable: true })
  media_id?: string;

  @Column({ type: "integer", default: 0 })
  sort_order!: number;

  @Column({ type: "integer", default: 0 })
  level!: number;

  @Column({ type: "boolean", default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Tree Relations
  @TreeParent()
  @JoinColumn({ name: "parent_id" })
  parent?: Category;

  @TreeChildren()
  children?: Category[];

  // Media Relation
  @ManyToOne(() => Media, (media) => media.categories, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "media_id" })
  media?: Media;

  // Product Relations
  @ManyToMany(() => Product, (product) => product.categories)
  products?: Product[];
}

