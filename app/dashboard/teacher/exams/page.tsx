/**
 * Teacher Exams page: list and create exams.
 */
import { redirect } from "next/navigation";
import { TeacherExamList } from "./teacher-exam-list";
import { requireAuth } from "@/lib/auth";

export default async function TeacherExamsPage() {
  const session = await requireAuth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "TEACHER") redirect("/dashboard");

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">الاختبارات</h1>
      <p className="mb-4 text-sm text-muted-foreground">إنشاء الاختبارات وإدارتها.</p>
      <TeacherExamList />
    </div>
  );
}
