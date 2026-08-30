-- CreateTable
CREATE TABLE "InterviewPreparation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "preparationTips" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewPreparation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InterviewPreparation_userId_idx" ON "InterviewPreparation"("userId");

-- CreateIndex
CREATE INDEX "InterviewPreparation_jobId_idx" ON "InterviewPreparation"("jobId");

-- AddForeignKey
ALTER TABLE "InterviewPreparation" ADD CONSTRAINT "InterviewPreparation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewPreparation" ADD CONSTRAINT "InterviewPreparation_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
