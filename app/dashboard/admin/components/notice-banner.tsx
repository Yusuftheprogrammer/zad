import { Notice } from "../types";

export function NoticeBanner({ notice }: { notice: Notice }) {
  if (!notice) return null;
  return (
    <div
      className={`rounded border px-3 py-2 text-sm ${
        notice.type === "error"
          ? "border-red-400/40 bg-red-50 text-red-700"
          : "border-emerald-400/40 bg-emerald-50 text-emerald-700"
      }`}
    >
      {notice.message}
    </div>
  );
}
