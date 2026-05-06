import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { AdminPanel } from "./panel";
import { SchoolPieChart } from "@/components/SchoolPieChart";
import { getAdminStats } from "@/lib/data-cache";

export default async function AdminDashboardPage() {
  const session = await requireAuth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const [
    usersByRole,
    gradesCount,
    classesCount,
    subjectsCount,
    teachersCount,
    studentsCount,
    parentsCount,
    lessonsCount,
    homeworksCount,
    examsCount,
    submissionsCount,
  ] = await getAdminStats();

  const usersData = usersByRole.map((entry) => ({
    label: entry.role,
    value: entry._count._all,
  }));

  const structureData = [
    { label: "Grades", value: gradesCount },
    { label: "Classes", value: classesCount },
    { label: "Subjects", value: subjectsCount },
    { label: "Teachers", value: teachersCount },
    { label: "Students", value: studentsCount },
  ];

  const activityData = [
    { label: "Lessons", value: lessonsCount },
    { label: "Homeworks", value: homeworksCount },
    { label: "Exams", value: examsCount },
    { label: "Submissions", value: submissionsCount },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-card p-6">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage grades, classes, subjects, parents, students, and teachers.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Students</p>
          <p className="mt-1 text-2xl font-semibold">{studentsCount}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Teachers</p>
          <p className="mt-1 text-2xl font-semibold">{teachersCount}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Parents</p>
          <p className="mt-1 text-2xl font-semibold">{parentsCount}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Classes</p>
          <p className="mt-1 text-2xl font-semibold">{classesCount}</p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <SchoolPieChart
          cardTitle="Users by Role"
          cardDescription="Platform account distribution"
          valueLabel="Users"
          data={usersData}
        />
        <SchoolPieChart
          cardTitle="School Structure"
          cardDescription="Core entities in the platform"
          valueLabel="Entities"
          data={structureData}
        />
        <SchoolPieChart
          cardTitle="Learning Activity"
          cardDescription="Total educational content and work"
          valueLabel="Items"
          data={activityData}
        />
      </section>

      <AdminPanel />
    </div>
  );
}
