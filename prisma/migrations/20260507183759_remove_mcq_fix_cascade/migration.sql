/*
  Warnings:

  - You are about to drop the `Options` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `mcqQuestions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Homework" DROP CONSTRAINT "Homework_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "Homework" DROP CONSTRAINT "Homework_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "Options" DROP CONSTRAINT "Options_questionId_fkey";

-- DropTable
DROP TABLE "Options";

-- DropTable
DROP TABLE "mcqQuestions";

-- AddForeignKey
ALTER TABLE "Homework" ADD CONSTRAINT "Homework_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Homework" ADD CONSTRAINT "Homework_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;
