import { FormEvent } from "react";
import { Grade } from "../types";
import { AdminSection } from "./admin-section";

type Props = {
  grades: Grade[];
  saving: boolean;
  onCreate: (name: string, reset: () => void) => void;
  onDelete: (id: string) => void;
};

export function GradesSection({ grades, saving, onCreate, onDelete }: Props) {
  return (
    <AdminSection title="Grades">
      <form
        className="mb-3 flex gap-2"
        onSubmit={(e: FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          const form = e.currentTarget;
          const name = (form.elements.namedItem("name") as HTMLInputElement).value.trim();
          if (!name) return;
          onCreate(name, () => form.reset());
        }}
      >
        <input name="name" placeholder="Grade name" className="rounded border px-3 py-2 text-sm" />
        <button disabled={saving} className="rounded bg-primary px-3 py-2 text-sm text-primary-foreground">
          Add Grade
        </button>
      </form>
      <ul className="space-y-2">
        {grades.map((grade) => (
          <li key={grade.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
            <span>{grade.name}</span>
            <button disabled={saving} className="text-destructive" onClick={() => onDelete(grade.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </AdminSection>
  );
}
