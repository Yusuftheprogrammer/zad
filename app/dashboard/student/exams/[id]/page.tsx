/**
 * Student Exam detail: show exam and form to submit attempt (answers as text for MVP).
 */
import { redirect } from "next/navigation";
import Link from "next/link";
import { ExamDetail } from "./exam-detail";
import { requireAuth } from "@/lib/auth";

export default async function StudentExamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAuth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/dashboard");

  const { id } = await params;
  return (
    <div>
      <Link href="/dashboard/student/exams" className="text-sm text-muted-foreground hover:underline">
        Back to exams
      </Link>
      <ExamDetail examId={id} />
    </div>
  );
}
