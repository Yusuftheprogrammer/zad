-- CreateIndex
CREATE UNIQUE INDEX "Submission_homeworkId_studentId_key" ON "Submission"("homeworkId", "studentId");
