/**
 * Teacher Lessons page: list and create lessons.
 */
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { TeacherLessonList } from "./teacher-lesson-list";

export default async function TeacherLessonsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "TEACHER") redirect("/dashboard");

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Lessons</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        Create and manage lessons by subject.
      </p>
      <TeacherLessonList />
    </div>
  );
}
