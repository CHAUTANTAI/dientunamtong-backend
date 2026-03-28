import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Profile } from "./Profile";

@Entity("refresh_tokens")
export class RefreshToken {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Profile, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: Profile;

  @Column({ type: "char", length: 64 })
  token_hash!: string;

  @Column({ type: "text", nullable: true })
  device_info?: string;

  @Column({ type: "varchar", length: 45, nullable: true })
  ip?: string;

  @Column({ type: "text", nullable: true })
  user_agent?: string;

  @Column({ type: "timestamptz" })
  expires_at!: Date;

  @Column({ type: "boolean", default: false })
  revoked!: boolean;

  @Column({ type: "uuid", nullable: true })
  replaced_by?: string | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
