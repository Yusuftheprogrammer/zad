/**
 * Student Lesson detail: fetch and display one lesson.
 */
import { redirect } from "next/navigation";
import Link from "next/link";
import { LessonDetail } from "./lesson-detail";
import { requireAuth } from "@/lib/auth";

export default async function StudentLessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAuth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/dashboard");

  const { id } = await params;
  return (
    <div>
      <Link href="/dashboard/student/lessons" className="text-sm text-muted-foreground hover:underline">
        Back to lessons
      </Link>
      <LessonDetail lessonId={id} />
    </div>
  );
}
