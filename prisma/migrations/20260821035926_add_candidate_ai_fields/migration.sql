/*
  Warnings:

  - The `skillsMatched` column on the `AIAnalysis` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `missingSkills` column on the `AIAnalysis` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "AIAnalysis" DROP COLUMN "skillsMatched",
ADD COLUMN     "skillsMatched" TEXT[] DEFAULT ARRAY[]::TEXT[],
DROP COLUMN "missingSkills",
ADD COLUMN     "missingSkills" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "resumeText" TEXT,
ADD COLUMN     "skills" TEXT[] DEFAULT ARRAY[]::TEXT[];
