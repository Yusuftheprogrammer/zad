-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_gradeId_fkey";

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE CASCADE ON UPDATE CASCADE;
