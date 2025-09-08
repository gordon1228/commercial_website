-- Migration: Add mobileImages column to vehicles table
-- Generated manually to fix schema drift

-- AlterTable
ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "mobileImages" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Update existing vehicles to have empty mobileImages array if NULL
UPDATE "vehicles" SET "mobileImages" = ARRAY[]::TEXT[] WHERE "mobileImages" IS NULL;