/**
 * Student Exam detail: show exam and form to submit attempt (answers as text for MVP).
 */
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { ExamDetail } from "./exam-detail";

export default async function StudentExamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "STUDENT") redirect("/dashboard");

  const { id } = await params;
  return (
    <div>
      <a href="/dashboard/student/exams" className="text-sm text-muted-foreground hover:underline">
        ← Back to exams
      </a>
      <ExamDetail examId={id} />
    </div>
  );
}
