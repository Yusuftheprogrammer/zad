import { getTeacherAssignmentOptions, requireTeacherContext } from "@/lib/teacher-api";

export async function GET() {
  const context = await requireTeacherContext();
  if (context instanceof Response) return context;

  const subjects = await getTeacherAssignmentOptions(context.teacherId);
  return Response.json(subjects);
}
