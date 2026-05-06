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

export type AdminDataResponse = {
  grades: Grade[];
  classes: SchoolClass[];
  subjects: Subject[];
  parents: Parent[];
  students: Student[];
  teachers: Teacher[];
  stats?: {
    usersByRole: Array<{ role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT"; _count: { _all: number } }>;
    counts: {
      grades: number;
      classes: number;
      subjects: number;
      teachers: number;
      students: number;
      parents: number;
      lessons: number;
      homeworks: number;
      exams: number;
      submissions: number;
    };
  };
};

export type Notice = { type: "success" | "error"; message: string } | null;
