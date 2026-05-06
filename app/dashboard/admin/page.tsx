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
    label:
      entry.role === "ADMIN" ? "مشرف" : entry.role === "TEACHER" ? "معلم" : entry.role === "STUDENT" ? "طالب" : "ولي أمر",
    value: entry._count._all,
  }));

  const structureData = [
    { label: "المراحل", value: gradesCount },
    { label: "الفصول", value: classesCount },
    { label: "المواد", value: subjectsCount },
    { label: "المعلمون", value: teachersCount },
    { label: "الطلاب", value: studentsCount },
  ];

  const activityData = [
    { label: "الدروس", value: lessonsCount },
    { label: "الواجبات", value: homeworksCount },
    { label: "الاختبارات", value: examsCount },
    { label: "التسليمات", value: submissionsCount },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-card p-6">
        <h1 className="text-2xl font-semibold">لوحة تحكم المشرف</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          إدارة المراحل والفصول والمواد وأولياء الأمور والطلاب والمعلمين.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">الطلاب</p>
          <p className="mt-1 text-2xl font-semibold">{studentsCount}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">المعلمون</p>
          <p className="mt-1 text-2xl font-semibold">{teachersCount}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">أولياء الأمور</p>
          <p className="mt-1 text-2xl font-semibold">{parentsCount}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">الفصول</p>
          <p className="mt-1 text-2xl font-semibold">{classesCount}</p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <SchoolPieChart
          cardTitle="المستخدمون حسب الدور"
          cardDescription="توزيع حسابات المنصة"
          valueLabel="مستخدم"
          data={usersData}
        />
        <SchoolPieChart
          cardTitle="هيكل المدرسة"
          cardDescription="العناصر الأساسية في المنصة"
          valueLabel="عنصر"
          data={structureData}
        />
        <SchoolPieChart
          cardTitle="النشاط التعليمي"
          cardDescription="إجمالي المحتوى والأعمال التعليمية"
          valueLabel="عنصر"
          data={activityData}
        />
      </section>

      <AdminPanel />
    </div>
  );
}
