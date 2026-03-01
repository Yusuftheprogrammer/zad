/**
 * Student Exams page: list exams and link to submit attempt.
 */
import { redirect } from "next/navigation";
import { ExamList } from "./exam-list";
import { requireAuth } from "@/lib/auth";

export default async function StudentExamsPage() {
  const session = await requireAuth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/dashboard");

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Exams</h1>
      <p className="mb-4 text-sm text-muted-foreground">View and submit exams.</p>
      <ExamList />
    </div>
  );
}
