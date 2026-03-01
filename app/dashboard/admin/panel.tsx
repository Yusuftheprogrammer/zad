"use client";

import { useEffect, useState } from "react";
import { requestJson } from "./api";
import { Notice, Grade, Parent, SchoolClass, Student, Subject, Teacher } from "./types";
import { NoticeBanner } from "./components/notice-banner";
import { GradesSection } from "./components/grades-section";
import { ClassesSection } from "./components/classes-section";
import { SubjectsSection } from "./components/subjects-section";
import { ParentsSection } from "./components/parents-section";
import { StudentsSection } from "./components/students-section";
import { TeachersSection } from "./components/teachers-section";

export function AdminPanel() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  async function loadAll() {
    setLoading(true);
    setNotice(null);
    try {
      const [g, c, s, p, st, t] = await Promise.all([
        requestJson<Grade[]>("/api/dashboard/admin/grade"),
        requestJson<SchoolClass[]>("/api/dashboard/admin/class"),
        requestJson<Subject[]>("/api/dashboard/admin/subject"),
        requestJson<Parent[]>("/api/dashboard/admin/parent"),
        requestJson<Student[]>("/api/dashboard/admin/student"),
        requestJson<Teacher[]>("/api/dashboard/admin/teacher"),
      ]);
      setGrades(g);
      setClasses(c);
      setSubjects(s);
      setParents(p);
      setStudents(st);
      setTeachers(t);
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "Failed to load data" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAll();
  }, []);

  async function withSave(task: () => Promise<void>, successMessage: string) {
    setSaving(true);
    setNotice(null);
    try {
      await task();
      setNotice({ type: "success", message: successMessage });
      await loadAll();
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "Operation failed" });
    } finally {
      setSaving(false);
    }
  }

  function gradeName(gradeId: string) {
    return grades.find((g) => g.id === gradeId)?.name ?? "Unknown grade";
  }

  return (
    <div className="space-y-6">
      <NoticeBanner notice={notice} />

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading admin data...</p>
      ) : (
        <>
          <GradesSection
            grades={grades}
            saving={saving}
            onCreate={(name, reset) =>
              void withSave(
                async () => {
                  await requestJson("/api/dashboard/admin/grade", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name }),
                  });
                  reset();
                },
                "Grade created"
              )
            }
            onDelete={(id) =>
              void withSave(
                () => requestJson(`/api/dashboard/admin/grade/${id}`, { method: "DELETE" }).then(() => {}),
                "Grade deleted"
              )
            }
          />

          <ClassesSection
            classes={classes}
            grades={grades}
            gradeName={gradeName}
            saving={saving}
            onCreate={(data, reset) =>
              void withSave(
                async () => {
                  await requestJson("/api/dashboard/admin/class", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                  });
                  reset();
                },
                "Class created"
              )
            }
            onDelete={(id) =>
              void withSave(
                () => requestJson(`/api/dashboard/admin/class/${id}`, { method: "DELETE" }).then(() => {}),
                "Class deleted"
              )
            }
          />

          <SubjectsSection
            subjects={subjects}
            saving={saving}
            onCreate={(name, reset) =>
              void withSave(
                async () => {
                  await requestJson("/api/dashboard/admin/subject", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name }),
                  });
                  reset();
                },
                "Subject created"
              )
            }
            onDelete={(id) =>
              void withSave(
                () => requestJson(`/api/dashboard/admin/subject/${id}`, { method: "DELETE" }).then(() => {}),
                "Subject deleted"
              )
            }
          />

          <ParentsSection
            parents={parents}
            saving={saving}
            onCreate={(data, reset) =>
              void withSave(
                async () => {
                  await requestJson("/api/dashboard/admin/parent", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                  });
                  reset();
                },
                "Parent created"
              )
            }
            onDelete={(id) =>
              void withSave(
                () => requestJson(`/api/dashboard/admin/parent/${id}`, { method: "DELETE" }).then(() => {}),
                "Parent deleted"
              )
            }
          />

          <StudentsSection
            grades={grades}
            classes={classes}
            parents={parents}
            students={students}
            saving={saving}
            onCreate={(data, reset) =>
              void withSave(
                async () => {
                  await requestJson("/api/dashboard/admin/student", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                  });
                  reset();
                },
                "Student created"
              )
            }
            onDelete={(id) =>
              void withSave(
                () => requestJson(`/api/dashboard/admin/student/${id}`, { method: "DELETE" }).then(() => {}),
                "Student deleted"
              )
            }
          />

          <TeachersSection
            teachers={teachers}
            classes={classes}
            subjects={subjects}
            gradeName={gradeName}
            saving={saving}
            onCreate={(data, reset) =>
              void withSave(
                async () => {
                  await requestJson("/api/dashboard/admin/teacher", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                  });
                  reset();
                },
                "Teacher created"
              )
            }
            onDelete={(id) =>
              void withSave(
                () => requestJson(`/api/dashboard/admin/teacher/${id}`, { method: "DELETE" }).then(() => {}),
                "Teacher deleted"
              )
            }
          />
        </>
      )}
    </div>
  );
}
