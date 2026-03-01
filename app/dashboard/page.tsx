/**
 * Dashboard home: redirect student/teacher to their section, show welcome.
 */
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await requireAuth();
  if (!session?.user) redirect("/login");

  const role = session.user.role;
  if (role === "STUDENT") redirect("/dashboard/student/homework");
  if (role === "TEACHER") redirect("/dashboard/teacher/homework");
  if (role === "ADMIN") redirect("/dashboard/admin");

  return (
    <div>
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <p className="text-muted-foreground">Welcome, {session.user.name ?? session.user.email}.</p>
    </div>
  );
}
