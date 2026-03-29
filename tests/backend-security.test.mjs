import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("admin routes hash passwords before writing", async () => {
  const files = [
    "app/api/dashboard/admin/teacher/route.ts",
    "app/api/dashboard/admin/student/route.ts",
    "app/api/dashboard/admin/parent/route.ts",
    "app/api/dashboard/admin/teacher/[id]/route.ts",
    "app/api/dashboard/admin/student/[id]/route.ts",
    "app/api/dashboard/admin/parent/[id]/route.ts",
  ];

  for (const file of files) {
    const content = await read(file);
    assert.match(
      content,
      /bcrypt\.hash\(/,
      `${file} must hash password before persistence`
    );
  }
});

test("student endpoints scope data to student class and lock teacher self-signup", async () => {
  const lessonsList = await read("app/api/dashboard/student/lessons/route.ts");
  const lessonById = await read("app/api/dashboard/student/lessons/[id]/route.ts");
  const homework = await read("app/api/dashboard/student/homework/route.ts");
  const exams = await read("app/api/dashboard/student/exams/route.ts");
  const examById = await read("app/api/dashboard/student/exams/[id]/route.ts");
  const signup = await read("app/api/auth/signup/route.ts");

  assert.match(lessonsList, /classId:\s*student\.classId/);
  assert.match(lessonById, /where:\s*\{\s*id,\s*classId:\s*student\.classId\s*\}/s);
  assert.match(homework, /where:\s*\{\s*id:\s*homeworkId,\s*classId:\s*student\.classId\s*\}/s);
  assert.match(exams, /where:\s*\{\s*classId:\s*student\.classId\s*\}/s);
  assert.match(examById, /where:\s*\{\s*id,\s*classId:\s*student\.classId\s*\}/s);
  assert.match(signup, /Only student self-signup is allowed/);
});

// ensure mcq question APIs are scoped properly

test("mcq question routes enforce teacher role and ownership", async () => {
  const examQuestions = await read("app/api/dashboard/teacher/questions/exam/route.ts");
  const hwQuestions = await read("app/api/dashboard/teacher/questions/homework/route.ts");

  assert.match(examQuestions, /requireRole\("TEACHER"\)/);
  assert.match(hwQuestions, /requireRole\("TEACHER"\)/);
  assert.match(examQuestions, /verifyTeacherExam/);
  assert.match(hwQuestions, /verifyTeacherHomework/);
});
