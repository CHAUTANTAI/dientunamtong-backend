import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

// Determine if running from compiled code by checking if __dirname contains 'dist'
const isCompiledCode = __dirname.includes("dist");

// Calculate entity and migration paths
let entityPath: string;
let migrationPath: string;

if (isCompiledCode) {
  // Running from dist/config/database.js - go up to project root, then into dist/entities
  const projectRoot = path.resolve(__dirname, "..", "..");
  entityPath = path.join(projectRoot, "dist", "entities", "**", "*.js");
  migrationPath = path.join(projectRoot, "dist", "migrations", "**", "*.js");
  
  // Debug logging for production
  console.log("🔍 Database Config Debug:");
  console.log("  __dirname:", __dirname);
  console.log("  projectRoot:", projectRoot);
  console.log("  entityPath:", entityPath);
  console.log("  migrationPath:", migrationPath);
} else {
  // Running from src/config/database.ts in development
  entityPath = path.join(__dirname, "..", "entities", "**", "*.ts");
  migrationPath = path.join(__dirname, "..", "migrations", "**", "*.ts");
}

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "dien_tu_nam_tong",
  synchronize: process.env.NODE_ENV === "development", // Auto-sync in dev, use migrations in prod
  logging: process.env.NODE_ENV === "development",
  entities: [entityPath],
  migrations: [migrationPath],
  subscribers: [],
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log("✅ Database connected successfully");
    
    // Run migrations in production
    if (process.env.NODE_ENV === "production") {
      await AppDataSource.runMigrations();
      console.log("✅ Migrations executed successfully");
    }
  } catch (error) {
    console.error("❌ Error connecting to database:", error);
    throw error;
  }
};

