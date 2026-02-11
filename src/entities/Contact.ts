import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export enum ContactStatus {
  NEW = "new",
  PROCESSING = "processing",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

@Entity("contact")
export class Contact {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "varchar", length: 50 })
  phone!: string;

  @Column({ type: "text", nullable: true })
  address?: string;

  @Column({ type: "text", nullable: true })
  message?: string;

  @Column({
    type: "enum",
    enum: ContactStatus,
    default: ContactStatus.NEW,
  })
  status!: ContactStatus;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}

