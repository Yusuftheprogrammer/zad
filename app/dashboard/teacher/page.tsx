import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { SchoolPieChart } from "@/components/SchoolPieChart";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await requireAuth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "TEACHER") redirect("/dashboard");

  const teacher = await prisma.teacher.findUnique({
    where: { userId: session.user.id },
    include: {
      assignments: {
        include: {
          class: { select: { id: true, name: true } },
          subject: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!teacher) {
    return (
      <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        لم يتم العثور على ملف المعلم.
      </div>
    );
  }

  const classIds = Array.from(
    new Set(teacher.assignments.map((assignment) => assignment.classId))
  );
  const [studentsByClass, homeworksBySubject, examsBySubject] = await Promise.all([
    classIds.length > 0
      ? prisma.student.groupBy({
          by: ["classId"],
          where: { classId: { in: classIds } },
          _count: { _all: true },
        })
      : Promise.resolve([]),
    prisma.homework.groupBy({
      by: ["subjectId"],
      where: { teacherId: teacher.id },
      _count: { _all: true },
    }),
    prisma.exam.groupBy({
      by: ["subjectId"],
      where: { teacherId: teacher.id },
      _count: { _all: true },
    }),
  ]);

  const classNameById = new Map(
    teacher.assignments.map((assignment) => [assignment.class.id, assignment.class.name])
  );
  const subjectNameById = new Map(
    teacher.assignments.map((assignment) => [assignment.subject.id, assignment.subject.name])
  );

  const studentsData = studentsByClass.map((entry) => ({
    label: classNameById.get(entry.classId) ?? "فصل غير معروف",
    value: entry._count._all,
  }));

  const homeworksData = homeworksBySubject.map((entry) => ({
    label: subjectNameById.get(entry.subjectId) ?? "مادة غير معروفة",
    value: entry._count._all,
  }));

  const examsData = examsBySubject.map((entry) => ({
    label: subjectNameById.get(entry.subjectId) ?? "مادة غير معروفة",
    value: entry._count._all,
  }));

  const totalStudents = studentsData.reduce((sum, item) => sum + item.value, 0);
  const totalHomeworks = homeworksData.reduce((sum, item) => sum + item.value, 0);
  const totalExams = examsData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-card p-6">
        <h1 className="text-2xl font-semibold">لوحة تحكم المعلم</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          أهلاً بك، {session.user.name ?? session.user.email}.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">الطلاب</p>
          <p className="mt-1 text-2xl font-semibold">{totalStudents}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">الواجبات</p>
          <p className="mt-1 text-2xl font-semibold">{totalHomeworks}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">الاختبارات</p>
          <p className="mt-1 text-2xl font-semibold">{totalExams}</p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <SchoolPieChart
          cardTitle="الطلاب حسب الفصل"
          cardDescription="توزيع الطلاب في الفصول المسندة لك"
          valueLabel="طالب"
          data={studentsData}
        />
        <SchoolPieChart
          cardTitle="الواجبات حسب المادة"
          cardDescription="الواجبات التي أنشأتها"
          valueLabel="واجب"
          data={homeworksData}
        />
        <SchoolPieChart
          cardTitle="الاختبارات حسب المادة"
          cardDescription="الاختبارات التي أنشأتها"
          valueLabel="اختبار"
          data={examsData}
        />
      </section>
    </div>
  );
}
