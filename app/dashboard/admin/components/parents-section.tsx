import { FormEvent } from "react";
import { Parent } from "../types";
import { AdminSection } from "./admin-section";

type Props = {
  parents: Parent[];
  saving: boolean;
  onCreate: (data: { name?: string; email: string; password: string }, reset: () => void) => void;
  onDelete: (id: string) => void;
};

export function ParentsSection({ parents, saving, onCreate, onDelete }: Props) {
  return (
    <AdminSection title="Parents">
      <form
        className="mb-3 grid gap-2 md:grid-cols-4"
        onSubmit={(e: FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          const form = e.currentTarget;
          const name = (form.elements.namedItem("name") as HTMLInputElement).value.trim();
          const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
          const password = (form.elements.namedItem("password") as HTMLInputElement).value;
          if (!email || !password) return;
          onCreate({ name: name || undefined, email, password }, () => form.reset());
        }}
      >
        <input name="name" placeholder="Name" className="rounded border px-3 py-2 text-sm" />
        <input name="email" placeholder="Email" type="email" className="rounded border px-3 py-2 text-sm" />
        <input name="password" placeholder="Password" type="password" className="rounded border px-3 py-2 text-sm" />
        <button disabled={saving} className="rounded bg-primary px-3 py-2 text-sm text-primary-foreground">
          Add Parent
        </button>
      </form>
      <ul className="space-y-2">
        {parents.map((parent) => (
          <li key={parent.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
            <span>
              {parent.user.name ?? "Unnamed"} ({parent.user.email})
            </span>
            <button disabled={saving} className="text-destructive" onClick={() => onDelete(parent.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </AdminSection>
  );
}
