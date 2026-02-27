/**
 * Student Lesson detail: fetch and display one lesson.
 */
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { LessonDetail } from "./lesson-detail";

export default async function StudentLessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "STUDENT") redirect("/dashboard");

  const { id } = await params;
  return (
    <div>
      <a href="/dashboard/student/lessons" className="text-sm text-muted-foreground hover:underline">
        ← Back to lessons
      </a>
      <LessonDetail lessonId={id} />
    </div>
  );
}
