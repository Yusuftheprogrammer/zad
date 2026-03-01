/**
 * Login page: email + password form, redirects to dashboard on success.
 */
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";
import { requireAuth } from "@/lib/auth";

export default async function LoginPage() {
  const session = await requireAuth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30">
      <div className="w-full max-w-sm rounded-lg border bg-card p-6 shadow-sm">
        <h1 className="mb-4 text-xl font-semibold">Sign in</h1>
        <LoginForm />
        <p className="mt-4 text-sm text-muted-foreground">
          No account? <a href="/signup" className="text-primary underline">Sign up</a>
        </p>
      </div>
    </div>
  );
}
