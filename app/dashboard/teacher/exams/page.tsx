/**
 * Teacher Exams page: list and create exams.
 */
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { TeacherExamList } from "./teacher-exam-list";

export default async function TeacherExamsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "TEACHER") redirect("/dashboard");

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Exams</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        Create and manage exams.
      </p>
      <TeacherExamList />
    </div>
  );
}
