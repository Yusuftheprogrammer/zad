"use client";

/**
 * Client signup form: POST to /api/auth/signup, then redirect to login.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const role = (form.elements.namedItem("role") as HTMLSelectElement).value;

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name || undefined, email, password, role }),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Sign up failed");
      return;
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <label className="text-sm font-medium">Name (optional)</label>
      <input
        name="name"
        type="text"
        className="rounded border border-input bg-background px-3 py-2 text-sm"
        placeholder="Your name"
      />
      <label className="text-sm font-medium">Email</label>
      <input
        name="email"
        type="email"
        required
        className="rounded border border-input bg-background px-3 py-2 text-sm"
        placeholder="you@example.com"
      />
      <label className="text-sm font-medium">Password</label>
      <input
        name="password"
        type="password"
        required
        minLength={6}
        className="rounded border border-input bg-background px-3 py-2 text-sm"
      />
      <label className="text-sm font-medium">I am a</label>
      <select
        name="role"
        className="rounded border border-input bg-background px-3 py-2 text-sm"
      >
        <option value="STUDENT">Student</option>
        <option value="TEACHER">Teacher</option>
      </select>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-2 rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Creating..." : "Sign up"}
      </button>
    </form>
  );
}
