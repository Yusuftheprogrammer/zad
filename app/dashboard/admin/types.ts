export type Grade = { id: string; name: string };

export type SchoolClass = { id: string; name: string; gradeId: string };

export type Subject = { id: string; name: string };

export type Parent = {
  id: string;
  user: { id?: string; name: string | null; email: string | null };
};

export type Student = {
  id: string;
  user: { name: string | null; email: string | null };
  grade: { id: string; name: string };
  class: { id: string; name: string };
  parent?: { id: string; user: { name: string | null; email: string | null } } | null;
};

export type TeacherAssignment = {
  id: string;
  subject: { id: string; name: string };
  class: { id: string; name: string };
};

export type Teacher = {
  id: string;
  user: { name: string | null; email: string | null };
  assignments: TeacherAssignment[];
};

export type Notice = { type: "success" | "error"; message: string } | null;
