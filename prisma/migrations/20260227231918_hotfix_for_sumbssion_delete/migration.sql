-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_studentId_fkey";

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
