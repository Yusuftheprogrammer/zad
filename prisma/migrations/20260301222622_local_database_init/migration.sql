-- CreateTable
CREATE TABLE "mcqQuestions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "numberOfOptions" INTEGER NOT NULL DEFAULT 4,

    CONSTRAINT "mcqQuestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Options" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "questionId" TEXT NOT NULL,

    CONSTRAINT "Options_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Options" ADD CONSTRAINT "Options_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "mcqQuestions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
