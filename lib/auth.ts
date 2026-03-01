/**
 * Auth utilities: get session and enforce role on API routes.
 * Used by dashboard API routes to protect CRUD endpoints.
 */
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Role } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

/** Session user type (no password in session) */
export type SessionUser = {
  id: string;
  role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";
  name?: string | null;
  email?: string | null;
};

/**
 * Get current session. Returns null if not authenticated.
 */
export async function getSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, name: true, email: true },
  });
  if (!dbUser) return null;

  session.user.id = dbUser.id;
  session.user.role = dbUser.role as SessionUser["role"];
  session.user.name = dbUser.name;
  session.user.email = dbUser.email;
  return session;
}

/**
 * Require auth: returns session or null. Used in API routes to check auth.
 */
export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) return null;
  return session;
}

/**
 * Require a specific role. Returns 403 response if role doesn't match.
 * Usage: const err = await requireRole("TEACHER"); if (err) return err;
 */
export async function requireRole(
  role: SessionUser["role"]
): Promise<Response | null> {
  const session = await requireAuth();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== role)
    return Response.json({ error: "Forbidden" }, { status: 403 });
  return null;
}

/**
 * Require one of the given roles.
 */

// i will comment it until we actually use it
// export async function requireRoles(
//   roles: SessionUser["role"][]
// ): Promise<Response | null> {
//   const session = await requireAuth();
//   if (!session)
//     return Response.json({ error: "Unauthorized" }, { status: 401 });
//   if (!roles.includes(session.user.role as SessionUser["role"]))
//     return Response.json({ error: "Forbidden" }, { status: 403 });
//   return null;
// }



export async function quickAuth(role: Role) {
  const forbidden = await requireRole(role);
  if (forbidden) return forbidden;
  const session = await requireAuth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
}
