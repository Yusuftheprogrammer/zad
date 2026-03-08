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
        Teacher profile was not found.
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
    label: classNameById.get(entry.classId) ?? "Unknown class",
    value: entry._count._all,
  }));

  const homeworksData = homeworksBySubject.map((entry) => ({
    label: subjectNameById.get(entry.subjectId) ?? "Unknown subject",
    value: entry._count._all,
  }));

  const examsData = examsBySubject.map((entry) => ({
    label: subjectNameById.get(entry.subjectId) ?? "Unknown subject",
    value: entry._count._all,
  }));

  const totalStudents = studentsData.reduce((sum, item) => sum + item.value, 0);
  const totalHomeworks = homeworksData.reduce((sum, item) => sum + item.value, 0);
  const totalExams = examsData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-card p-6">
        <h1 className="text-2xl font-semibold">Teacher Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome, {session.user.name ?? session.user.email}.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Students</p>
          <p className="mt-1 text-2xl font-semibold">{totalStudents}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Homeworks</p>
          <p className="mt-1 text-2xl font-semibold">{totalHomeworks}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Exams</p>
          <p className="mt-1 text-2xl font-semibold">{totalExams}</p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <SchoolPieChart
          cardTitle="Students by Class"
          cardDescription="Distribution in your assigned classes"
          valueLabel="Students"
          data={studentsData}
        />
        <SchoolPieChart
          cardTitle="Homeworks by Subject"
          cardDescription="Assignments you created"
          valueLabel="Homeworks"
          data={homeworksData}
        />
        <SchoolPieChart
          cardTitle="Exams by Subject"
          cardDescription="Exams you created"
          valueLabel="Exams"
          data={examsData}
        />
      </section>
    </div>
  );
}
