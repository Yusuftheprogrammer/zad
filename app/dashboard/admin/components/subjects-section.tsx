import { FormEvent } from "react";
import { Subject } from "../types";
import { AdminSection } from "./admin-section";

type Props = {
  subjects: Subject[];
  saving: boolean;
  onCreate: (name: string, reset: () => void) => void;
  onDelete: (id: string) => void;
};

export function SubjectsSection({ subjects, saving, onCreate, onDelete }: Props) {
  return (
    <AdminSection title="Subjects">
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
        <input name="name" placeholder="Subject name" className="rounded border px-3 py-2 text-sm" />
        <button disabled={saving} className="rounded bg-primary px-3 py-2 text-sm text-primary-foreground">
          Add Subject
        </button>
      </form>
      <ul className="space-y-2">
        {subjects.map((subject) => (
          <li key={subject.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
            <span>{subject.name}</span>
            <button disabled={saving} className="text-destructive" onClick={() => onDelete(subject.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </AdminSection>
  );
}
