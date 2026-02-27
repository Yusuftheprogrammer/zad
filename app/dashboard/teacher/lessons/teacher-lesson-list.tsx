"use client";

import { useEffect, useState } from "react";

type Subject = { id: string; name: string };
type Lesson = {
  id: string;
  title: string;
  content: string;
  orderIndex: number;
  subject: { id: string; name: string };
};

export function TeacherLessonList() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  function load() {
    Promise.all([
      fetch("/api/dashboard/teacher/lessons").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/dashboard/teacher/subjects").then((r) => (r.ok ? r.json() : [])),
    ]).then(([less, sub]) => {
      setLessons(less);
      setSubjects(sub);
    }).finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);
    const form = e.currentTarget;
    const title = (form.elements.namedItem("title") as HTMLInputElement).value;
    const content = (form.elements.namedItem("content") as HTMLTextAreaElement).value;
    const subjectId = (form.elements.namedItem("subjectId") as HTMLSelectElement).value;
    const res = await fetch("/api/dashboard/teacher/lessons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content: content || "", subjectId }),
    });
    setCreating(false);
    if (res.ok) {
      form.reset();
      load();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this lesson?")) return;
    const res = await fetch(`/api/dashboard/teacher/lessons/${id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  if (loading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-4">
        <h2 className="mb-3 font-medium">Create lesson</h2>
        {subjects.length === 0 ? (
          <p className="text-sm text-muted-foreground">Create a subject first.</p>
        ) : (
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <input
              name="title"
              placeholder="Title"
              required
              className="rounded border border-input bg-background px-3 py-2 text-sm"
            />
            <textarea
              name="content"
              placeholder="Content"
              rows={4}
              className="rounded border border-input bg-background px-3 py-2 text-sm"
            />
            <select
              name="subjectId"
              required
              className="rounded border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={creating}
              className="w-fit rounded bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
            >
              {creating ? "Creating…" : "Create"}
            </button>
          </form>
        )}
      </div>

      <ul className="space-y-3">
        {lessons.map((l) => (
          <li key={l.id} className="flex items-center justify-between rounded-lg border bg-card p-4">
            <div>
              <h3 className="font-medium">{l.title}</h3>
              <p className="text-sm text-muted-foreground">{l.subject.name}</p>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(l.id)}
              className="text-sm text-destructive hover:underline"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      {lessons.length === 0 && <p className="text-muted-foreground">No lessons yet.</p>}
    </div>
  );
}
