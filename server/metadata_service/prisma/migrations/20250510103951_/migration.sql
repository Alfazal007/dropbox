/*
  Warnings:

  - Added the required column `machine_id` to the `Metadata` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Metadata" ADD COLUMN     "machine_id" INTEGER NOT NULL;
