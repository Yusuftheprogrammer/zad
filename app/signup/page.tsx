/**
 * Signup page: create account (Student or Teacher), then redirect to login.
 */
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { SignupForm } from "./signup-form";

export default async function SignupPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30">
      <div className="w-full max-w-sm rounded-lg border bg-card p-6 shadow-sm">
        <h1 className="mb-4 text-xl font-semibold">إنشاء حساب</h1>
        <SignupForm />
        <p className="mt-4 text-sm text-muted-foreground">
          لديك حساب بالفعل؟ <a href="/login" className="text-primary underline">تسجيل الدخول</a>
        </p>
      </div>
    </div>
  );
}
