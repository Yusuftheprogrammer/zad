/**
 * Teacher Homework page: list homework, create new (requires at least one subject).
 */
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { TeacherHomeworkList } from "./teacher-homework-list";

export default async function TeacherHomeworkPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "TEACHER") redirect("/dashboard");

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Homework</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        Create and manage homework assignments.
      </p>
      <TeacherHomeworkList />
    </div>
  );
}
