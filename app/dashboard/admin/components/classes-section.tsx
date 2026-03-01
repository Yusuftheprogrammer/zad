import { FormEvent } from "react";
import { Grade, SchoolClass } from "../types";
import { AdminSection } from "./admin-section";

type Props = {
  classes: SchoolClass[];
  grades: Grade[];
  saving: boolean;
  gradeName: (gradeId: string) => string;
  onCreate: (data: { name: string; gradeId: string }, reset: () => void) => void;
  onDelete: (id: string) => void;
};

export function ClassesSection({ classes, grades, saving, gradeName, onCreate, onDelete }: Props) {
  return (
    <AdminSection title="Classes">
      <form
        className="mb-3 flex flex-wrap gap-2"
        onSubmit={(e: FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          const form = e.currentTarget;
          const name = (form.elements.namedItem("name") as HTMLInputElement).value.trim();
          const gradeId = (form.elements.namedItem("gradeId") as HTMLSelectElement).value;
          if (!name || !gradeId) return;
          onCreate({ name, gradeId }, () => form.reset());
        }}
      >
        <input name="name" placeholder="Class name" className="rounded border px-3 py-2 text-sm" />
        <select name="gradeId" className="rounded border px-3 py-2 text-sm">
          <option value="">Select grade</option>
          {grades.map((grade) => (
            <option key={grade.id} value={grade.id}>
              {grade.name}
            </option>
          ))}
        </select>
        <button disabled={saving} className="rounded bg-primary px-3 py-2 text-sm text-primary-foreground">
          Add Class
        </button>
      </form>
      <ul className="space-y-2">
        {classes.map((c) => (
          <li key={c.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
            <span>
              {c.name} ({gradeName(c.gradeId)})
            </span>
            <button disabled={saving} className="text-destructive" onClick={() => onDelete(c.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </AdminSection>
  );
}
