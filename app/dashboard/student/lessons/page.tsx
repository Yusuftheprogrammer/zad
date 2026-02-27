/**
 * Student Lessons page: list lessons from API.
 */
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { LessonList } from "./lesson-list";

export default async function StudentLessonsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "STUDENT") redirect("/dashboard");

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Lessons</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        Browse lessons by subject.
      </p>
      <LessonList />
    </div>
  );
}
