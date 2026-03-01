/**
 * Teacher Homework page: list homework, create new (requires at least one subject).
 */
import { redirect } from "next/navigation";
import { TeacherHomeworkList } from "./teacher-homework-list";
import { requireAuth } from "@/lib/auth";

export default async function TeacherHomeworkPage() {
  const session = await requireAuth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "TEACHER") redirect("/dashboard");

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Homework</h1>
      <p className="mb-4 text-sm text-muted-foreground">Create and manage homework assignments.</p>
      <TeacherHomeworkList />
    </div>
  );
}
