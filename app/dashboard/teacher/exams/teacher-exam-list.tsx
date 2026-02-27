"use client";

import { useEffect, useState } from "react";

type Subject = { id: string; name: string };
type Exam = {
  id: string;
  title: string;
  description: string | null;
  durationMinutes: number;
  dueDate: string;
  subject: { id: string; name: string };
  _count: { attempts: number };
};

export function TeacherExamList() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  function load() {
    Promise.all([
      fetch("/api/dashboard/teacher/exams").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/dashboard/teacher/subjects").then((r) => (r.ok ? r.json() : [])),
    ]).then(([ex, sub]) => {
      setExams(ex);
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
    const description = (form.elements.namedItem("description") as HTMLTextAreaElement).value;
    const durationMinutes = parseInt((form.elements.namedItem("durationMinutes") as HTMLInputElement).value, 10) || 60;
    const dueDate = (form.elements.namedItem("dueDate") as HTMLInputElement).value;
    const subjectId = (form.elements.namedItem("subjectId") as HTMLSelectElement).value;
    const res = await fetch("/api/dashboard/teacher/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description: description || undefined,
        durationMinutes,
        dueDate: dueDate || new Date().toISOString().slice(0, 10),
        subjectId,
      }),
    });
    setCreating(false);
    if (res.ok) {
      form.reset();
      load();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this exam?")) return;
    const res = await fetch(`/api/dashboard/teacher/exams/${id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  if (loading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-4">
        <h2 className="mb-3 font-medium">Create exam</h2>
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
              name="description"
              placeholder="Description"
              rows={2}
              className="rounded border border-input bg-background px-3 py-2 text-sm"
            />
            <div className="flex gap-2 flex-wrap">
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
              <input
                name="durationMinutes"
                type="number"
                defaultValue={60}
                min={1}
                className="w-24 rounded border border-input bg-background px-3 py-2 text-sm"
              />
              <span className="flex items-center text-sm text-muted-foreground">min</span>
              <input
                name="dueDate"
                type="date"
                className="rounded border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
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
        {exams.map((e) => (
          <li key={e.id} className="flex items-center justify-between rounded-lg border bg-card p-4">
            <div>
              <h3 className="font-medium">{e.title}</h3>
              <p className="text-sm text-muted-foreground">
                {e.subject.name} · {e.durationMinutes} min · Due {new Date(e.dueDate).toLocaleDateString()} · {e._count.attempts} attempts
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(e.id)}
              className="text-sm text-destructive hover:underline"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      {exams.length === 0 && <p className="text-muted-foreground">No exams yet.</p>}
    </div>
  );
}
