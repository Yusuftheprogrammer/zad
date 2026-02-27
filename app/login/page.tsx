/**
 * Login page: email + password form, redirects to dashboard on success.
 */
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

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
