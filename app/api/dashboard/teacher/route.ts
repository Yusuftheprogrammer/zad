import { requireRole } from "@/lib/auth";

export async function GET() {
  const forbidden = await requireRole("TEACHER");
  if (forbidden) return forbidden;

  return Response.json({ ok: true });
}
