import { prisma } from "@/lib/prisma";


export async function GET() {
    const homework = await prisma.homework.findMany();
    console.log(homework);
    return Response.json(homework);
}
