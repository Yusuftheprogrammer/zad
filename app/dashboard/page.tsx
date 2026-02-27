/**
 * Dashboard home: redirect student/teacher to their section, show welcome.
 */
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const role = session.user.role;
  if (role === "STUDENT") redirect("/dashboard/student/homework");
  if (role === "TEACHER") redirect("/dashboard/teacher/homework");

  return (
    <div>
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <p className="text-muted-foreground">Welcome, {session.user.name ?? session.user.email}.</p>
    </div>
  );
}
