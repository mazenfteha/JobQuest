/*
  Warnings:

  - The values [LEETCODE,SYSTEM_DESIGN,BACKEND_PRACTICE,READING,SIDE_PROJECT] on the enum `ActivityType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `xpReward` on the `Quest` table. All the data in the column will be lost.
  - Changed the type of `category` on the `Quest` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ActivityType_new" AS ENUM ('JOB_SAVED', 'JOB_APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED', 'NETWORKING', 'CV_TAILORED', 'COVER_LETTER', 'SIDE_QUEST');
ALTER TABLE "Activity" ALTER COLUMN "type" TYPE "ActivityType_new" USING ("type"::text::"ActivityType_new");
ALTER TYPE "ActivityType" RENAME TO "ActivityType_old";
ALTER TYPE "ActivityType_new" RENAME TO "ActivityType";
DROP TYPE "public"."ActivityType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Quest" DROP COLUMN "xpReward",
DROP COLUMN "category",
ADD COLUMN     "category" TEXT NOT NULL;

-- DropEnum
DROP TYPE "QuestCategory";
