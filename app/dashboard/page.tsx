import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import bcrypt from "bcrypt";


export default async function Dashboard() {
    const session: any = await getServerSession(authOptions);

    const pass = await bcrypt.hash("hellowrold", 10);

    console.log(pass);

    return (
        <div>{session}</div>
    )
};