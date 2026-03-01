/**
 * Student Lessons page: list lessons from API.
 */
import { redirect } from "next/navigation";
import { LessonList } from "./lesson-list";
import { requireAuth } from "@/lib/auth";

export default async function StudentLessonsPage() {
  const session = await requireAuth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/dashboard");

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Lessons</h1>
      <p className="mb-4 text-sm text-muted-foreground">Browse lessons by subject.</p>
      <LessonList />
    </div>
  );
}
