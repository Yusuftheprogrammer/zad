"use client";

import { useEffect, useState } from "react";

type Lesson = {
  id: string;
  title: string;
  content: string;
  subject: { name: string };
};

export function LessonDetail({ lessonId }: { lessonId: string }) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/dashboard/student/lessons/${lessonId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("فشل التحميل"))))
      .then(setLesson)
      .catch(() => setLesson(null))
      .finally(() => setLoading(false));
  }, [lessonId]);

  if (loading) return <p className="text-muted-foreground">جاري التحميل...</p>;
  if (!lesson) return <p className="text-destructive">لم يتم العثور على الدرس.</p>;

  return (
    <article className="mt-4 max-w-2xl">
      <h1 className="text-xl font-semibold">{lesson.title}</h1>
      <p className="text-sm text-muted-foreground">{lesson.subject.name}</p>
      <div className="mt-4 whitespace-pre-wrap text-sm">{lesson.content}</div>
    </article>
  );
}
