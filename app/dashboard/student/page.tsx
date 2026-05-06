import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SchoolPieChart } from "@/components/SchoolPieChart";

export default async function StudentDashboardPage() {
  const session = await requireAuth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/dashboard");

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    include: {
      class: { select: { id: true, name: true } },
      grade: { select: { id: true, name: true } },
    },
  });

  if (!student) {
    return (
      <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        لم يتم العثور على ملف الطالب.
      </div>
    );
  }

  const [totalHomeworks, submittedHomeworks, totalExams, attemptedExams, lessonsBySubject] =
    await Promise.all([
      prisma.homework.count({ where: { classId: student.classId } }),
      prisma.submission.count({
        where: {
          studentId: student.id,
          homework: { classId: student.classId },
        },
      }),
      prisma.exam.count({ where: { classId: student.classId } }),
      prisma.examAttempt.count({
        where: {
          studentId: student.id,
          exam: { classId: student.classId },
        },
      }),
      prisma.lesson.groupBy({
        by: ["subjectId"],
        where: { classId: student.classId },
        _count: { _all: true },
      }),
    ]);

  const lessonSubjectIds = lessonsBySubject.map((entry) => entry.subjectId);
  const lessonSubjects = lessonSubjectIds.length
    ? await prisma.subject.findMany({
        where: { id: { in: lessonSubjectIds } },
        select: { id: true, name: true },
      })
    : [];
  const subjectNameById = new Map(lessonSubjects.map((subject) => [subject.id, subject.name]));

  const homeworkData = [
    { label: "تم التسليم", value: submittedHomeworks },
    { label: "متبقي", value: Math.max(totalHomeworks - submittedHomeworks, 0) },
  ];

  const examsData = [
    { label: "تمت المحاولة", value: attemptedExams },
    { label: "متبقي", value: Math.max(totalExams - attemptedExams, 0) },
  ];

  const lessonsData = lessonsBySubject.map((entry) => ({
    label: subjectNameById.get(entry.subjectId) ?? "مادة غير معروفة",
    value: entry._count._all,
  }));

  const totalLessons = lessonsData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-card p-6">
        <h1 className="text-2xl font-semibold">لوحة تحكم الطالب</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {student.grade.name} - {student.class.name}
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">الواجبات</p>
          <p className="mt-1 text-2xl font-semibold">{totalHomeworks}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">الاختبارات</p>
          <p className="mt-1 text-2xl font-semibold">{totalExams}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">الدروس</p>
          <p className="mt-1 text-2xl font-semibold">{totalLessons}</p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <SchoolPieChart
          cardTitle="حالة الواجبات"
          cardDescription="تسليماتك في الفصل الحالي"
          valueLabel="واجب"
          data={homeworkData}
        />
        <SchoolPieChart
          cardTitle="حالة الاختبارات"
          cardDescription="محاولاتك في الفصل الحالي"
          valueLabel="اختبار"
          data={examsData}
        />
        <SchoolPieChart
          cardTitle="الدروس حسب المادة"
          cardDescription="توزيع الدروس في فصلك"
          valueLabel="درس"
          data={lessonsData}
        />
      </section>
    </div>
  );
}
