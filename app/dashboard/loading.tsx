export default function DashboardLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex items-center gap-3 rounded-lg border bg-card px-5 py-4 text-sm text-muted-foreground">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        Compiling dashboard...
      </div>
    </div>
  );
}
