"use client";

import { useEffect, useState } from "react";

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
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to load"))))
      .then(setList)
      .catch(() => setError("Failed to load exams"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-muted-foreground">Loading…</p>;
  if (error) return <p className="text-destructive">{error}</p>;
  if (list.length === 0) return <p className="text-muted-foreground">No exams.</p>;

  return (
    <ul className="space-y-3">
      {list.map((e) => (
        <li key={e.id} className="rounded-lg border bg-card p-4">
          <h2 className="font-medium">{e.title}</h2>
          <p className="text-sm text-muted-foreground">
            {e.subject.name} · {e.durationMinutes} min · Due {new Date(e.dueDate).toLocaleDateString()}
          </p>
          {e.description && <p className="mt-2 text-sm">{e.description}</p>}
          <a
            href={`/dashboard/student/exams/${e.id}`}
            className="mt-2 inline-block text-sm text-primary underline"
          >
            View / Submit
          </a>
        </li>
      ))}
    </ul>
  );
}
