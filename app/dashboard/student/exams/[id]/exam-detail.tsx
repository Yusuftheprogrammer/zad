"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ExamData = {
  exam: {
    id: string;
    title: string;
    description: string | null;
    durationMinutes: number;
    dueDate: string;
    subject: { name: string };
  };
  myAttempt: { id: string; answers: string | null; score: number | null; status: string } | null;
};

export function ExamDetail({ examId }: { examId: string }) {
  const router = useRouter();
  const [data, setData] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/dashboard/student/exams/${examId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed"))))
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [examId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const form = e.currentTarget;
    const answers = (form.elements.namedItem("answers") as HTMLTextAreaElement).value;
    const res = await fetch("/api/dashboard/student/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examId, answers }),
    });
    setSubmitting(false);
    if (res.ok) router.refresh();
  }

  if (loading) return <p className="text-muted-foreground">Loading…</p>;
  if (!data) return <p className="text-destructive">Exam not found.</p>;

  const { exam, myAttempt } = data;

  return (
    <div className="mt-4 space-y-4">
      <h1 className="text-xl font-semibold">{exam.title}</h1>
      <p className="text-muted-foreground">
        {exam.subject.name} · {exam.durationMinutes} min · Due {new Date(exam.dueDate).toLocaleDateString()}
      </p>
      {exam.description && <p>{exam.description}</p>}

      {myAttempt && (
        <div className="rounded border bg-muted/50 p-3 text-sm">
          <strong>Your attempt:</strong> {myAttempt.status}
          {myAttempt.score != null && ` · Score: ${myAttempt.score}`}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2">
        <label className="block text-sm font-medium">Your answers</label>
        <textarea
          name="answers"
          defaultValue={myAttempt?.answers ?? ""}
          rows={6}
          className="w-full rounded border border-input bg-background px-3 py-2 text-sm"
          placeholder="Enter your answers..."
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Submit attempt"}
        </button>
      </form>
    </div>
  );
}
