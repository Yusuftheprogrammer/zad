"use client";

import { useEffect, useState } from "react";
import { StatusMessage } from "@/components/ui/status-message";

type Exam = {
  id: string;
  title: string;
  description: string | null;
  durationMinutes: number;
  dueDate: string;
  subject: { id: string; name: string };
};

export function ExamList() {
  const [list, setList] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/student/exams")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("فشل التحميل"))))
      .then(setList)
      .catch(() => setError("فشل تحميل الاختبارات"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <StatusMessage variant="loading" message="جاري تحميل الاختبارات..." />;
  if (error) return <StatusMessage variant="error" message={error} />;
  if (list.length === 0) return <StatusMessage variant="empty" message="لا توجد اختبارات." />;

  return (
    <ul className="space-y-3">
      {list.map((e) => (
        <li key={e.id} className="rounded-lg border bg-card p-4">
          <h2 className="font-medium">{e.title}</h2>
          <p className="text-sm text-muted-foreground">
            {e.subject.name} - {e.durationMinutes} دقيقة - آخر موعد {new Date(e.dueDate).toLocaleDateString()}
          </p>
          {e.description && <p className="mt-2 text-sm">{e.description}</p>}
          <a
            href={`/dashboard/student/exams/${e.id}`}
            className="mt-2 inline-block text-sm text-primary underline"
          >
            عرض / تسليم
          </a>
        </li>
      ))}
    </ul>
  );
}
