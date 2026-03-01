import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";



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
        classId: string; // The class that the admin has selected
        subjectId: string; // The subject that the admin has selected
    };

    try {
        body = await request.json();
    } catch {
        return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }

    try {
        // using transaction to prevent partial creation
        const newTeacherUser = await prisma.$transaction(async (tx) => {
            // 1. create user with role teacher
            const user = await tx.user.create({
                data: {
                    name: body.name,
                    email: body.email,
                    password: body.password, // it's better to hash the password before saving
                    role: "TEACHER",
                    // 2. create record in teacher table and link it to the user
                    teacher: { create: {} }
                },
                include: {
                    teacher: true // to retrive teacher data in the response
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
