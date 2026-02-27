/**
 * Teacher Subjects page: list and create subjects (required before creating homework/exams/lessons).
 */
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { TeacherSubjectList } from "./teacher-subject-list";

export default async function TeacherSubjectsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "TEACHER") redirect("/dashboard");

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Subjects</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        Create subjects first, then add homework, exams, and lessons to them.
      </p>
      <TeacherSubjectList />
    </div>
  );
}
