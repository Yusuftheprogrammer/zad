/**
 * Home page: links to login and dashboard.
 */
export default async function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-8">
      <h1 className="text-2xl font-semibold">Zad</h1>
      <p className="text-muted-foreground">نظام إدارة المدرسة - خطوة نحو الإدارة الرقمية</p>
      <div className="flex gap-4">
        <a
          href="/login"
          className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          تسجيل الدخول
        </a>
      </div>
    </div>
  );
}
