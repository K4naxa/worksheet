/*
  Warnings:

  - You are about to drop the column `mealLocationOther` on the `Workday` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Workday" DROP COLUMN "mealLocationOther",
ADD COLUMN     "isSickday" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "activities" DROP NOT NULL,
ALTER COLUMN "learnings" DROP NOT NULL;
