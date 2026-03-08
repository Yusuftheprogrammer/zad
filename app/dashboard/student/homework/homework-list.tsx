"use client";

/**
 * Fetches homework from student API and renders list; inline submit form for MVP.
 */
import { useEffect, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { StatusMessage } from "@/components/ui/status-message";
import { ToastMessage, type ToastType } from "@/components/ui/toast-message";

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
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);

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
      setToast({ type: "success", message: "Homework submitted successfully" });
    } else {
      const data = await res.json().catch(() => ({}));
      const message = data.error ?? "Submit failed";
      setError(message);
      setToast({ type: "error", message });
    }
  }

  if (loading) return <StatusMessage variant="loading" message="Loading homework..." />;
  if (error) return <StatusMessage variant="error" message={error} />;
  if (list.length === 0) return <StatusMessage variant="empty" message="No homework assigned." />;

  return (
    <div className="space-y-4">
      {toast && <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      <ul className="space-y-4">
      {list.map((h) => (
        <li key={h.id} className="rounded-lg border bg-card p-4">
          <div className="flex justify-between gap-2">
            <div>
              <h2 className="font-medium">{h.title}</h2>
              <p className="text-sm text-muted-foreground">
                {h.subject.name} - Due {new Date(h.dueDate).toLocaleDateString()}
              </p>
              {h.description && <p className="mt-2 text-sm">{h.description}</p>}
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
              disabled={submitting === h.id}
              className="mt-2 inline-flex items-center gap-2 rounded bg-primary px-3 py-1 text-sm text-primary-foreground disabled:opacity-50"
            >
              {submitting === h.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {submitting === h.id ? "Submitting..." : "Submit"}
            </button>
          </form>
        </li>
      ))}
      </ul>
    </div>
  );
}
