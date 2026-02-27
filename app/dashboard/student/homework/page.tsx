/**
 * Student Homework page: list homework from API, link to submit (simple form on same page for MVP).
 */
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { HomeworkList } from "./homework-list";

export default async function StudentHomeworkPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "STUDENT") redirect("/dashboard");

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Homework</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        View assignments and submit your work.
      </p>
      <HomeworkList />
    </div>
  );
}
