"use client";

/**
 * Fetches homework from student API and renders list; inline submit form for MVP.
 */
import { useEffect, useState } from "react";

type Homework = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  subject: { id: string; name: string };
  teacher: { user: { name: string | null } };
};

export function HomeworkList() {
  const [list, setList] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/student/homework")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to load"))))
      .then(setList)
      .catch(() => setError("Failed to load homework"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>, homeworkId: string) {
    e.preventDefault();
    setSubmitting(homeworkId);
    const form = e.currentTarget;
    const content = (form.elements.namedItem("content") as HTMLTextAreaElement).value;
    const res = await fetch("/api/dashboard/student/homework", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ homeworkId, content }),
    });
    setSubmitting(null);
    if (res.ok) {
      form.reset();
      setError(null);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Submit failed");
    }
  }

  if (loading) return <p className="text-muted-foreground">Loading…</p>;
  if (error) return <p className="text-destructive">{error}</p>;
  if (list.length === 0) return <p className="text-muted-foreground">No homework assigned.</p>;

  return (
    <ul className="space-y-4">
      {list.map((h) => (
        <li key={h.id} className="rounded-lg border bg-card p-4">
          <div className="flex justify-between gap-2">
            <div>
              <h2 className="font-medium">{h.title}</h2>
              <p className="text-sm text-muted-foreground">
                {h.subject.name} · Due {new Date(h.dueDate).toLocaleDateString()}
              </p>
              {h.description && (
                <p className="mt-2 text-sm">{h.description}</p>
              )}
            </div>
          </div>
          <form onSubmit={(e) => handleSubmit(e, h.id)} className="mt-3">
            <textarea
              name="content"
              placeholder="Your submission..."
              rows={2}
              className="w-full rounded border border-input bg-background px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={!!submitting}
              className="mt-2 rounded bg-primary px-3 py-1 text-sm text-primary-foreground disabled:opacity-50"
            >
              {submitting === h.id ? "Submitting…" : "Submit"}
            </button>
          </form>
        </li>
      ))}
    </ul>
  );
}
