/*
  Warnings:

  - Added the required column `isLatest` to the `Metadata` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Metadata" ADD COLUMN     "isLatest" BOOLEAN NOT NULL;
