/**
 * Student Exams page: list exams and link to submit attempt.
 */
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { ExamList } from "./exam-list";

export default async function StudentExamsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "STUDENT") redirect("/dashboard");

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Exams</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        View and submit exams.
      </p>
      <ExamList />
    </div>
  );
}
