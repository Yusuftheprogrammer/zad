"use client";

/**
 * Teacher homework: fetch list, create form, delete.
 */
import { useEffect, useState } from "react";

type TeacherSubjectAssignment = {
  assignmentId: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  label: string;
};

type Homework = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  subject: { id: string; name: string };
  class: { id: string; name: string };
  _count: { submissions: number };
};

export function TeacherHomeworkList() {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [subjects, setSubjects] = useState<TeacherSubjectAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  function load() {
    Promise.all([
      fetch("/api/dashboard/teacher/homework").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/dashboard/teacher/subjects").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([hw, sub]) => {
        setHomework(hw);
        setSubjects(sub);
      })
      .finally(() => setLoading(false));
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
    const dueDate = (form.elements.namedItem("dueDate") as HTMLInputElement).value;
    const assignmentId = (form.elements.namedItem("assignmentId") as HTMLSelectElement).value;
    const assignment = subjects.find((s) => s.assignmentId === assignmentId);

    if (!assignment) {
      setCreating(false);
      return;
    }

    const res = await fetch("/api/dashboard/teacher/homework", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        dueDate: dueDate || new Date().toISOString().slice(0, 10),
        subjectId: assignment.subjectId,
        classId: assignment.classId,
      }),
    });
    setCreating(false);
    if (res.ok) {
      form.reset();
      load();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this homework?")) return;
    const res = await fetch(`/api/dashboard/teacher/homework/${id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-4">
        <h2 className="mb-3 font-medium">Create homework</h2>
        {subjects.length === 0 ? (
          <p className="text-sm text-muted-foreground">No assigned subjects found for this teacher.</p>
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
            <div className="flex gap-2">
              <select
                name="assignmentId"
                required
                className="rounded border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select subject and class</option>
                {subjects.map((s) => (
                  <option key={s.assignmentId} value={s.assignmentId}>
                    {s.label}
                  </option>
                ))}
              </select>
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
              {creating ? "Creating..." : "Create"}
            </button>
          </form>
        )}
      </div>

      <ul className="space-y-3">
        {homework.map((h) => (
          <li key={h.id} className="flex items-center justify-between rounded-lg border bg-card p-4">
            <div>
              <h3 className="font-medium">{h.title}</h3>
              <p className="text-sm text-muted-foreground">
                {h.subject.name} - {h.class.name} - Due {new Date(h.dueDate).toLocaleDateString()} - {h._count.submissions} submissions
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(h.id)}
              className="text-sm text-destructive hover:underline"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      {homework.length === 0 && <p className="text-muted-foreground">No homework yet.</p>}
    </div>
  );
}
