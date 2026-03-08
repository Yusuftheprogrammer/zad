import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";
import bcrypt from "bcrypt";



export async function GET() {
    const forbidden = await requireRole("ADMIN");
    if (forbidden) return forbidden;

    const session = await requireAuth();
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const teachers = await prisma.teacher.findMany({
        orderBy: { id: "asc" },
        include: {
            user: { select: { id: true, name: true, email: true, role: true } },
            assignments: {
                include: {
                    subject: { select: { id: true, name: true } },
                    class: { select: { id: true, name: true } },
                },
            },
        },
    });
    return Response.json(teachers);

}


export async function POST(request: NextRequest) {
    const forbidden = await requireRole("ADMIN");
    if (forbidden) return forbidden;

    const session = await requireAuth();
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    let body: { 
        name: string; 
        email: string; 
        password: string; 
        classId: string;
        subjectId: string;
    };

    try {
        body = await request.json();
        body.password = await bcrypt.hash(body.password, 10);
    } catch {
        return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }

    try {
        const newTeacherUser = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    name: body.name,
                    email: body.email,
                    password: body.password,
                    role: "TEACHER",
                    teacher: { create: {} }
                },
                include: {
                    teacher: true
                }
            });
            if (!user.teacher) throw new Error("Teacher not created");
            await tx.teachingAssignment.create({
                data: {
                    teacherId: user.teacher.id,
                    classId: body.classId,
                    subjectId: body.subjectId,
                },
            });
            return user;
        });

        return Response.json({ message: "Teacher created successfully", data: newTeacherUser }, { status: 201 });

    } catch (error: unknown) {
        console.error("Creation Error:", error);
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "P2002"
        ) {
            return Response.json({ error: "Email already exists" }, { status: 400 });
        }
        return Response.json({ error: "Something went wrong" }, { status: 500 });
    }
}
