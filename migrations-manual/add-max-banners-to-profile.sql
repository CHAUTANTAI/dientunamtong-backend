-- Migration: Add max_banners column to profile table
-- Run this manually in your PostgreSQL database

-- Add max_banners column with default value of 6
ALTER TABLE profile 
ADD COLUMN IF NOT EXISTS max_banners INTEGER NOT NULL DEFAULT 6;

-- To rollback this migration, run:
-- ALTER TABLE profile DROP COLUMN IF EXISTS max_banners;
