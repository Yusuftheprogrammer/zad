/**
 * Student Homework page: list homework from API, link to submit (simple form on same page for MVP).
 */
import { redirect } from "next/navigation";
import { HomeworkList } from "./homework-list";
import { requireAuth } from "@/lib/auth";

export default async function StudentHomeworkPage() {
  const session = await requireAuth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/dashboard");

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Homework</h1>
      <p className="mb-4 text-sm text-muted-foreground">View assignments and submit your work.</p>
      <HomeworkList />
    </div>
  );
}
