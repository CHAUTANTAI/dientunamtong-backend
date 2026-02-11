import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "4000"),
  
  // Database
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: parseInt(process.env.DB_PORT || "5432"),
  DB_USER: process.env.DB_USER || "postgres",
  DB_PASSWORD: process.env.DB_PASSWORD || "postgres",
  DB_NAME: process.env.DB_NAME || "dien_tu_nam_tong",
  DB_SSL: process.env.DB_SSL === "true",
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key-change-in-production",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  
  // Supabase
  SUPABASE_URL: process.env.SUPABASE_URL || "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  
  // Upload
  STORAGE_BUCKET: process.env.STORAGE_BUCKET || "content",
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || "5242880"), // 5MB default
} as const;

