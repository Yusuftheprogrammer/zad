"use client";

import { AlertCircle, Inbox, Loader2 } from "lucide-react";

type StatusVariant = "loading" | "empty" | "error";

export function StatusMessage({ variant, message }: { variant: StatusVariant; message: string }) {
  const styles =
    variant === "error"
      ? "border-destructive/30 bg-destructive/10 text-destructive"
      : "border-border bg-card text-muted-foreground";

  return (
    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${styles}`}>
      {variant === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
      {variant === "empty" && <Inbox className="h-4 w-4" />}
      {variant === "error" && <AlertCircle className="h-4 w-4" />}
      <span>{message}</span>
    </div>
  );
}
