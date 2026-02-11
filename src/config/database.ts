import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "dien_tu_nam_tong",
  synchronize: process.env.NODE_ENV === "development", // Auto-sync in dev, use migrations in prod
  logging: process.env.NODE_ENV === "development",
  entities: ["src/entities/**/*.ts"],
  migrations: ["src/migrations/**/*.ts"],
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

