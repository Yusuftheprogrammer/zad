import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { AdminPanel } from "./panel";

export default async function AdminDashboardPage() {
  const session = await requireAuth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Manage grades, classes, subjects, parents, students, and teachers.
        </p>
      </div>
      <AdminPanel />
    </div>
  );
}

