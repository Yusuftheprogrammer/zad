/**
 * Dashboard layout: redirects by role (student/teacher), shows nav and sign out.
 */
import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();
  if (!session?.user) redirect("/login");

  const role = session.user.role;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <nav className="flex gap-4 text-sm font-medium">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
              Home
            </Link>
            {role === "STUDENT" && (
              <>
                <Link href="/dashboard/student/homework">Homework</Link>
                <Link href="/dashboard/student/exams">Exams</Link>
                <Link href="/dashboard/student/lessons">Lessons</Link>
              </>
            )}
            {role === "TEACHER" && (
              <>
                <Link href="/dashboard/teacher/homework">Homework</Link>
                <Link href="/dashboard/teacher/exams">Exams</Link>
                <Link href="/dashboard/teacher/lessons">Lessons</Link>
              </>
            )}
            {role === "ADMIN" && (
              <>
                <Link href="/dashboard/admin">Admin Panel</Link>
              </>
            )}
          </nav>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{session.user.email}</span>
            <span className="rounded bg-muted px-2 py-0.5 text-xs">{role}</span>
            <Link href="/api/auth/signout" className="text-sm text-muted-foreground hover:text-foreground">
              Sign out
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-4">{children}</main>
    </div>
  );
}
