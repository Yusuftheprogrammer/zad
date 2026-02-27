"use client";

import { useEffect, useState } from "react";

type Subject = { id: string; name: string };

export function TeacherSubjectList() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  function load() {
    fetch("/api/dashboard/teacher/subjects")
      .then((r) => (r.ok ? r.json() : []))
      .then(setSubjects)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value.trim();
    const res = await fetch("/api/dashboard/teacher/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setCreating(false);
    if (res.ok) {
      form.reset();
      load();
    }
  }

  if (loading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-4">
        <h2 className="mb-3 font-medium">Create subject</h2>
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            name="name"
            placeholder="Subject name (e.g. Math, Physics)"
            required
            className="flex-1 rounded border border-input bg-background px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={creating}
            className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
          >
            {creating ? "Creating…" : "Create"}
          </button>
        </form>
      </div>

      <ul className="space-y-2">
        {subjects.map((s) => (
          <li key={s.id} className="rounded-lg border bg-card p-3">
            {s.name}
          </li>
        ))}
      </ul>
      {subjects.length === 0 && <p className="text-muted-foreground">No subjects yet. Create one above.</p>}
    </div>
  );
}
