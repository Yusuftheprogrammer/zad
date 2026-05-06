import { FormEvent, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Grade, Parent, SchoolClass, Student } from "../types";
import { AdminSection } from "./admin-section";

type Props = {
  grades: Grade[];
  classes: SchoolClass[];
  parents: Parent[];
  students: Student[];
  saving: boolean;
  onCreate: (
    data: {
      name?: string;
      email: string;
      password: string;
      gradeId: string;
      classId: string;
      parentId: string | null;
    },
    reset: () => void
  ) => void;
  onDelete: (id: string) => void;
};

export function StudentsSection({ grades, classes, parents, students, saving, onCreate, onDelete }: Props) {
  const [gradeFilter, setGradeFilter] = useState("");

  const filteredClasses = useMemo(() => {
    if (!gradeFilter) return classes;
    return classes.filter((c) => c.gradeId === gradeFilter);
  }, [classes, gradeFilter]);

  return (
    <AdminSection title="الطلاب">
      <form
        className="mb-3 grid gap-2 md:grid-cols-3"
        onSubmit={(e: FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          const form = e.currentTarget;
          const name = (form.elements.namedItem("name") as HTMLInputElement).value.trim();
          const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
          const password = (form.elements.namedItem("password") as HTMLInputElement).value;
          const gradeId = (form.elements.namedItem("gradeId") as HTMLSelectElement).value;
          const classId = (form.elements.namedItem("classId") as HTMLSelectElement).value;
          const parentId = (form.elements.namedItem("parentId") as HTMLSelectElement).value;
          if (!email || !password || !gradeId || !classId) return;
          onCreate(
            {
              name: name || undefined,
              email,
              password,
              gradeId,
              classId,
              parentId: parentId || null,
            },
            () => {
              form.reset();
              setGradeFilter("");
            }
          );
        }}
      >
        <input name="name" placeholder="الاسم" className="rounded border px-3 py-2 text-sm" />
        <input name="email" type="email" placeholder="البريد الإلكتروني" className="rounded border px-3 py-2 text-sm" />
        <input name="password" type="password" placeholder="كلمة المرور" className="rounded border px-3 py-2 text-sm" />
        <select
          name="gradeId"
          className="rounded border px-3 py-2 text-sm"
          onChange={(e) => setGradeFilter(e.target.value)}
          value={gradeFilter}
        >
          <option value="">اختر المرحلة</option>
          {grades.map((grade) => (
            <option key={grade.id} value={grade.id}>
              {grade.name}
            </option>
          ))}
        </select>
        <select name="classId" className="rounded border px-3 py-2 text-sm">
          <option value="">اختر الفصل</option>
          {filteredClasses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select name="parentId" className="rounded border px-3 py-2 text-sm">
          <option value="">بدون ولي أمر</option>
          {parents.map((parent) => (
            <option key={parent.id} value={parent.id}>
              {parent.user.name ?? parent.user.email}
            </option>
          ))}
        </select>
        <button disabled={saving} className="inline-flex items-center justify-center gap-1 rounded bg-primary px-3 py-2 text-sm text-primary-foreground md:col-span-3">
          <Plus className="h-4 w-4" />
          إضافة طالب
        </button>
      </form>
      <ul className="space-y-2">
        {students.map((student) => (
          <li key={student.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
            <span>
              {student.user.name ?? "بدون اسم"} ({student.user.email}) - {student.grade.name}/{student.class.name}
              {student.parent ? ` - ولي الأمر: ${student.parent.user.name ?? student.parent.user.email}` : ""}
            </span>
            <button disabled={saving} className="inline-flex items-center gap-1 text-destructive" onClick={() => onDelete(student.id)}>
              <Trash2 className="h-4 w-4" />
              حذف
            </button>
          </li>
        ))}
      </ul>
    </AdminSection>
  );
}
