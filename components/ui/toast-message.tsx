"use client";

import { useEffect } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

export type ToastType = "success" | "error";

type ToastMessageProps = {
  type: ToastType;
  message: string;
  onClose: () => void;
  durationMs?: number;
};

export function ToastMessage({ type, message, onClose, durationMs = 2500 }: ToastMessageProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, durationMs);
    return () => clearTimeout(timer);
  }, [durationMs, onClose]);

  const style =
    type === "error"
      ? "border-destructive/30 bg-destructive/10 text-destructive"
      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm shadow-md ${style}`}>
        {type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
        <span>{message}</span>
        <button type="button" onClick={onClose} className="ml-1 opacity-70 hover:opacity-100" aria-label="Close toast">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
