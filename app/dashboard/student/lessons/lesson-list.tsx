"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Lesson = {
  id: string;
  title: string;
  content: string;
  orderIndex: number;
  subject: { id: string; name: string };
};

export function LessonList() {
  const [list, setList] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/student/lessons")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to load"))))
      .then(setList)
      .catch(() => setError("Failed to load lessons"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-muted-foreground">Loading…</p>;
  if (error) return <p className="text-destructive">{error}</p>;
  if (list.length === 0) return <p className="text-muted-foreground">No lessons.</p>;

  return (
    <ul className="space-y-3">
      {list.map((l) => (
        <li key={l.id} className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="font-medium">{l.title}</h2>
              <p className="text-sm text-muted-foreground">{l.subject.name}</p>
            </div>
            <Link
              href={`/dashboard/student/lessons/${l.id}`}
              className="text-sm text-primary underline"
            >
              Read
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
