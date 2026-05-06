"use client";

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

type Exam = {
  id: string;
  title: string;
  description: string | null;
  durationMinutes: number;
  dueDate: string;
  subject: { id: string; name: string };
  class: { id: string; name: string };
  _count: { attempts: number };
};

export function TeacherExamList() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<TeacherSubjectAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);

  function load() {
    setError(null);
    fetch("/api/dashboard/teacher/exams-data")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load exams data"))))
      .then((data: { exams: Exam[]; subjects: TeacherSubjectAssignment[] }) => {
        setExams(data.exams);
        setSubjects(data.subjects);
      })
      .catch(() => setError("Failed to load exams data"))
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
    const durationMinutes =
      parseInt((form.elements.namedItem("durationMinutes") as HTMLInputElement).value, 10) || 60;
    const dueDate = (form.elements.namedItem("dueDate") as HTMLInputElement).value;
    const assignmentId = (form.elements.namedItem("assignmentId") as HTMLSelectElement).value;
    const assignment = subjects.find((s) => s.assignmentId === assignmentId);

    if (!assignment) {
      setCreating(false);
      setToast({ type: "error", message: "Please select subject and class" });
      return;
    }

    const res = await fetch("/api/dashboard/teacher/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description: description || undefined,
        durationMinutes,
        dueDate: dueDate || new Date().toISOString().slice(0, 10),
        subjectId: assignment.subjectId,
        classId: assignment.classId,
      }),
    });
    setCreating(false);
    if (res.ok) {
      form.reset();
      setToast({ type: "success", message: "Exam created successfully" });
      load();
    } else {
      setToast({ type: "error", message: "Failed to create exam" });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this exam?")) return;
    setDeletingId(id);
    const res = await fetch(`/api/dashboard/teacher/exams/${id}`, { method: "DELETE" });
    setDeletingId(null);
    if (res.ok) {
      setToast({ type: "success", message: "Exam deleted successfully" });
      load();
    } else {
      setToast({ type: "error", message: "Failed to delete exam" });
    }
  }

  if (loading) return <StatusMessage variant="loading" message="Loading exams..." />;
  if (error) return <StatusMessage variant="error" message={error} />;

  return (
    <div className="space-y-6">
      {toast && <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      <div className="rounded-lg border bg-card p-4">
        <h2 className="mb-3 font-medium">Create exam</h2>
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
            <div className="flex flex-wrap gap-2">
              <select
                name="assignmentId"
                required
                className="rounded border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Subject and class</option>
                {subjects.map((s) => (
                  <option key={s.assignmentId} value={s.assignmentId}>
                    {s.label}
                  </option>
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
              className="inline-flex w-fit items-center gap-2 rounded bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {creating ? "Creating..." : "Create"}
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
                {e.subject.name} - {e.class.name} - {e.durationMinutes} min - Due {new Date(e.dueDate).toLocaleDateString()} - {e._count.attempts} attempts
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(e.id)}
              disabled={deletingId === e.id || creating}
              className="inline-flex items-center gap-1 text-sm text-destructive hover:underline"
            >
              <Trash2 className="h-4 w-4" />
              {deletingId === e.id ? "Deleting..." : "Delete"}
            </button>
          </li>
        ))}
      </ul>
      {exams.length === 0 && <StatusMessage variant="empty" message="No exams yet." />}
    </div>
  );
}
