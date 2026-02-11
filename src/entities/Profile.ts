import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from "typeorm";
import bcrypt from "bcrypt";

export enum UserRole {
  ADMIN = "admin",
  MANAGER = "manager",
  STAFF = "staff",
}

@Entity("profile")
export class Profile {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  company_name?: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  phone?: string;

  @Column({ type: "text", nullable: true })
  address?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  email?: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  logo?: string;

  // Authentication fields
  @Column({ type: "varchar", length: 100, unique: true })
  username!: string;

  @Column({ type: "varchar", length: 255, select: false })
  password!: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.ADMIN,
  })
  role!: UserRole;

  @Column({ type: "boolean", default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Hash password before insert
  @BeforeInsert()
  async hashPasswordBeforeInsert() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  // Hash password before update (only if password changed)
  @BeforeUpdate()
  async hashPasswordBeforeUpdate() {
    // Only hash if password was modified
    // TypeORM doesn't track changes, so we need to handle this in service layer
  }

  // Method to compare passwords
  async comparePassword(candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
  }
}

