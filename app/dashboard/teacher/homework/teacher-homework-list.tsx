"use client";

/**
 * Teacher homework: fetch list, create form, delete.
 */
import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { StatusMessage } from "@/components/ui/status-message";
import { ToastMessage, type ToastType } from "@/components/ui/toast-message";

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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);

  function load() {
    setError(null);
    Promise.all([
      fetch("/api/dashboard/teacher/homework").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/dashboard/teacher/subjects").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([hw, sub]) => {
        setHomework(hw);
        setSubjects(sub);
      })
      .catch(() => setError("Failed to load homework data"))
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
      setToast({ type: "error", message: "Please select subject and class" });
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
      setToast({ type: "success", message: "Homework created successfully" });
      load();
    } else {
      setToast({ type: "error", message: "Failed to create homework" });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this homework?")) return;
    setDeletingId(id);
    const res = await fetch(`/api/dashboard/teacher/homework/${id}`, { method: "DELETE" });
    setDeletingId(null);
    if (res.ok) {
      setToast({ type: "success", message: "Homework deleted successfully" });
      load();
    } else {
      setToast({ type: "error", message: "Failed to delete homework" });
    }
  }

  if (loading) return <StatusMessage variant="loading" message="Loading homework..." />;
  if (error) return <StatusMessage variant="error" message={error} />;

  return (
    <div className="space-y-6">
      {toast && <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
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
              className="inline-flex w-fit items-center gap-2 rounded bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
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
              disabled={deletingId === h.id || creating}
              className="inline-flex items-center gap-1 text-sm text-destructive hover:underline"
            >
              <Trash2 className="h-4 w-4" />
              {deletingId === h.id ? "Deleting..." : "Delete"}
            </button>
          </li>
        ))}
      </ul>
      {homework.length === 0 && <StatusMessage variant="empty" message="No homework yet." />}
    </div>
  );
}
