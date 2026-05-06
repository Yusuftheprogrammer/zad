"use client";

import { useEffect, useState } from "react";
import { requestJson } from "./api";
import { AdminDataResponse, Notice, Grade, Parent, SchoolClass, Student, Subject, Teacher } from "./types";
import { NoticeBanner } from "./components/notice-banner";
import { StatusMessage } from "@/components/ui/status-message";
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

  async function loadAll(clearNotice = true) {
    setLoading(true);
    if (clearNotice) setNotice(null);
    try {
      const data = await requestJson<AdminDataResponse>("/api/dashboard/admin/data");
      setGrades(data.grades);
      setClasses(data.classes);
      setSubjects(data.subjects);
      setParents(data.parents);
      setStudents(data.students);
      setTeachers(data.teachers);
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "فشل تحميل البيانات" });
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
      await loadAll(false);
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "فشلت العملية" });
    } finally {
      setSaving(false);
    }
  }

  function gradeName(gradeId: string) {
    return grades.find((g) => g.id === gradeId)?.name ?? "مرحلة غير معروفة";
  }

  return (
    <div className="space-y-6">
      <NoticeBanner notice={notice} onClose={() => setNotice(null)} />

      {loading ? (
        <StatusMessage variant="loading" message="جاري تحميل بيانات الإدارة..." />
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
                "تمت إضافة المرحلة"
              )
            }
            onDelete={(id) =>
              void withSave(
                () => requestJson(`/api/dashboard/admin/grade/${id}`, { method: "DELETE" }).then(() => {}),
                "تم حذف المرحلة"
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
                "تمت إضافة الفصل"
              )
            }
            onDelete={(id) =>
              void withSave(
                () => requestJson(`/api/dashboard/admin/class/${id}`, { method: "DELETE" }).then(() => {}),
                "تم حذف الفصل"
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
                "تمت إضافة المادة"
              )
            }
            onDelete={(id) =>
              void withSave(
                () => requestJson(`/api/dashboard/admin/subject/${id}`, { method: "DELETE" }).then(() => {}),
                "تم حذف المادة"
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
                "تمت إضافة ولي الأمر"
              )
            }
            onDelete={(id) =>
              void withSave(
                () => requestJson(`/api/dashboard/admin/parent/${id}`, { method: "DELETE" }).then(() => {}),
                "تم حذف ولي الأمر"
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
                "تمت إضافة الطالب"
              )
            }
            onDelete={(id) =>
              void withSave(
                () => requestJson(`/api/dashboard/admin/student/${id}`, { method: "DELETE" }).then(() => {}),
                "تم حذف الطالب"
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
                "تمت إضافة المعلم"
              )
            }
            onDelete={(id) =>
              void withSave(
                () => requestJson(`/api/dashboard/admin/teacher/${id}`, { method: "DELETE" }).then(() => {}),
                "تم حذف المعلم"
              )
            }
          />
        </>
      )}
    </div>
  );
}
