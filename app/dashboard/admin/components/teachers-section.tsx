import { FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { SchoolClass, Subject, Teacher } from "../types";
import { AdminSection } from "./admin-section";

type Props = {
  teachers: Teacher[];
  classes: SchoolClass[];
  subjects: Subject[];
  saving: boolean;
  gradeName: (gradeId: string) => string;
  onCreate: (
    data: { name?: string; email: string; password: string; classId: string; subjectId: string },
    reset: () => void
  ) => void;
  onDelete: (id: string) => void;
};

export function TeachersSection({ teachers, classes, subjects, saving, gradeName, onCreate, onDelete }: Props) {
  return (
    <AdminSection title="المعلمون">
      <form
        className="mb-3 grid gap-2 md:grid-cols-3"
        onSubmit={(e: FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          const form = e.currentTarget;
          const name = (form.elements.namedItem("name") as HTMLInputElement).value.trim();
          const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
          const password = (form.elements.namedItem("password") as HTMLInputElement).value;
          const classId = (form.elements.namedItem("classId") as HTMLSelectElement).value;
          const subjectId = (form.elements.namedItem("subjectId") as HTMLSelectElement).value;
          if (!email || !password || !classId || !subjectId) return;
          onCreate({ name: name || undefined, email, password, classId, subjectId }, () => form.reset());
        }}
      >
        <input name="name" placeholder="الاسم" className="rounded border px-3 py-2 text-sm" />
        <input name="email" type="email" placeholder="البريد الإلكتروني" className="rounded border px-3 py-2 text-sm" />
        <input name="password" type="password" placeholder="كلمة المرور" className="rounded border px-3 py-2 text-sm" />
        <select name="classId" className="rounded border px-3 py-2 text-sm">
          <option value="">اختر الفصل</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({gradeName(c.gradeId)})
            </option>
          ))}
        </select>
        <select name="subjectId" className="rounded border px-3 py-2 text-sm">
          <option value="">اختر المادة</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
        <button disabled={saving} className="inline-flex items-center gap-1 rounded bg-primary px-3 py-2 text-sm text-primary-foreground">
          <Plus className="h-4 w-4" />
          إضافة معلم
        </button>
      </form>
      <ul className="space-y-2">
        {teachers.map((teacher) => (
          <li key={teacher.id} className="rounded border px-3 py-2 text-sm">
            <div className="mb-1 flex items-center justify-between">
              <span>
                {teacher.user.name ?? "بدون اسم"} ({teacher.user.email})
              </span>
              <button disabled={saving} className="inline-flex items-center gap-1 text-destructive" onClick={() => onDelete(teacher.id)}>
                <Trash2 className="h-4 w-4" />
                حذف
              </button>
            </div>
            <div className="text-xs text-muted-foreground">
              {teacher.assignments.length > 0
                ? teacher.assignments.map((a) => `${a.subject.name} - ${a.class.name}`).join(", ")
                : "لا توجد إسنادات تدريس"}
            </div>
          </li>
        ))}
      </ul>
    </AdminSection>
  );
}
