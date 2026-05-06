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

type Lesson = {
  id: string;
  title: string;
  content: string;
  orderIndex: number;
  subject: { id: string; name: string };
  class: { id: string; name: string };
};

export function TeacherLessonList() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [subjects, setSubjects] = useState<TeacherSubjectAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);

  function load() {
    setError(null);
    fetch("/api/dashboard/teacher/lessons-data")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load lessons data"))))
      .then((data: { lessons: Lesson[]; subjects: TeacherSubjectAssignment[] }) => {
        setLessons(data.lessons);
        setSubjects(data.subjects);
      })
      .catch(() => setError("Failed to load lessons data"))
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
    const content = (form.elements.namedItem("content") as HTMLTextAreaElement).value;
    const assignmentId = (form.elements.namedItem("assignmentId") as HTMLSelectElement).value;
    const assignment = subjects.find((s) => s.assignmentId === assignmentId);

    if (!assignment) {
      setCreating(false);
      setToast({ type: "error", message: "Please select subject and class" });
      return;
    }

    const res = await fetch("/api/dashboard/teacher/lessons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        content: content || "",
        subjectId: assignment.subjectId,
        classId: assignment.classId,
      }),
    });
    setCreating(false);
    if (res.ok) {
      form.reset();
      setToast({ type: "success", message: "Lesson created successfully" });
      load();
    } else {
      setToast({ type: "error", message: "Failed to create lesson" });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this lesson?")) return;
    setDeletingId(id);
    const res = await fetch(`/api/dashboard/teacher/lessons/${id}`, { method: "DELETE" });
    setDeletingId(null);
    if (res.ok) {
      setToast({ type: "success", message: "Lesson deleted successfully" });
      load();
    } else {
      setToast({ type: "error", message: "Failed to delete lesson" });
    }
  }

  if (loading) return <StatusMessage variant="loading" message="Loading lessons..." />;
  if (error) return <StatusMessage variant="error" message={error} />;

  return (
    <div className="space-y-6">
      {toast && <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      <div className="rounded-lg border bg-card p-4">
        <h2 className="mb-3 font-medium">Create lesson</h2>
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
              name="content"
              placeholder="Content"
              rows={4}
              className="rounded border border-input bg-background px-3 py-2 text-sm"
            />
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
        {lessons.map((l) => (
          <li key={l.id} className="flex items-center justify-between rounded-lg border bg-card p-4">
            <div>
              <h3 className="font-medium">{l.title}</h3>
              <p className="text-sm text-muted-foreground">
                {l.subject.name} - {l.class.name}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(l.id)}
              disabled={deletingId === l.id || creating}
              className="inline-flex items-center gap-1 text-sm text-destructive hover:underline"
            >
              <Trash2 className="h-4 w-4" />
              {deletingId === l.id ? "Deleting..." : "Delete"}
            </button>
          </li>
        ))}
      </ul>
      {lessons.length === 0 && <StatusMessage variant="empty" message="No lessons yet." />}
    </div>
  );
}
