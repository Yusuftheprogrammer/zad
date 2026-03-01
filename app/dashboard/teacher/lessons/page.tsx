/**
 * Teacher Lessons page: list and create lessons.
 */
import { redirect } from "next/navigation";
import { TeacherLessonList } from "./teacher-lesson-list";
import { requireAuth } from "@/lib/auth";

export default async function TeacherLessonsPage() {
  const session = await requireAuth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "TEACHER") redirect("/dashboard");

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Lessons</h1>
      <p className="mb-4 text-sm text-muted-foreground">Create and manage lessons by subject.</p>
      <TeacherLessonList />
    </div>
  );
}
