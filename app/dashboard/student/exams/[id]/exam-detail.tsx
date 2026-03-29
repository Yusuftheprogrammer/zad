"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { StatusMessage } from "@/components/ui/status-message";
import { ToastMessage, type ToastType } from "@/components/ui/toast-message";

type Question = {
  id: string;
  title: string;
  order: number;
  numberOfOptions: number;
  options: { id: string; title: string }[];
};

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
  questions: Question[];
};

export function ExamDetail({ examId }: { examId: string }) {
  const router = useRouter();
  const [data, setData] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);

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
    const formData = new FormData(form);
    const answersObject: Record<string, string> = {};

    for (const [key, value] of formData.entries()) {
      if (!key.startsWith("q_")) continue;
      const questionId = key.slice(2);
      if (typeof value === "string" && value) {
        answersObject[questionId] = value;
      }
    }

    const res = await fetch("/api/dashboard/student/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examId, answers: JSON.stringify(answersObject) }),
    });
    setSubmitting(false);
    if (res.ok) {
      setToast({ type: "success", message: "Exam submitted successfully" });
      router.refresh();
    } else {
      setToast({ type: "error", message: "Failed to submit exam" });
    }
  }

  if (loading) return <StatusMessage variant="loading" message="Loading exam..." />;
  if (!data) return <StatusMessage variant="error" message="Exam not found." />;

  const { exam, myAttempt, questions } = data;
  let previousAnswers: Record<string, string> = {};
  if (myAttempt?.answers) {
    try {
      const parsed = JSON.parse(myAttempt.answers) as Record<string, string>;
      if (parsed && typeof parsed === "object") previousAnswers = parsed;
    } catch {
      previousAnswers = {};
    }
  }

  return (
    <div className="mt-4 space-y-4">
      {toast && <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      <h1 className="text-xl font-semibold">{exam.title}</h1>
      <p className="text-muted-foreground">
        {exam.subject.name} - {exam.durationMinutes} min - Due {new Date(exam.dueDate).toLocaleDateString()}
      </p>
      {exam.description && <p>{exam.description}</p>}

      {myAttempt && (
        <div className="rounded border bg-muted/50 p-3 text-sm">
          <strong>Your attempt:</strong> {myAttempt.status}
          {myAttempt.score != null && ` - Score: ${myAttempt.score}`}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2">
        <label className="block text-sm font-medium">Questions</label>
        {questions.length === 0 && (
          <p className="rounded border bg-muted/50 p-3 text-sm text-muted-foreground">
            No MCQ questions available yet.
          </p>
        )}
        <div className="space-y-4">
          {questions.map((question) => (
            <fieldset key={question.id} className="rounded border p-3">
              <legend className="px-1 text-sm font-medium">
                {question.order}. {question.title}
              </legend>
              <div className="mt-2 space-y-2">
                {question.options.map((option) => (
                  <label key={option.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name={`q_${question.id}`}
                      value={option.id}
                      defaultChecked={previousAnswers[question.id] === option.id}
                    />
                    <span>{option.title}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {submitting ? "Submitting..." : "Submit attempt"}
        </button>
      </form>
    </div>
  );
}
