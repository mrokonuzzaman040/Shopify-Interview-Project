import { ActionFunction, json, redirect } from "@remix-run/node";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { sessionStorage } from "~/session";

const prisma = new PrismaClient();

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    // Validate input
    if (!email || !password) {
        return json({ error: "Email and password are required." }, { status: 400 });
    }

    try {
        // Fetch user from the database
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return json({ error: "Invalid email or password." }, { status: 401 });
        }

        // Compare the provided password with the hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return json({ error: "Invalid email or password." }, { status: 401 });
        }

        // Set user ID in session
        const session = await sessionStorage.getSession();
        session.set("userId", user.id);

        // Redirect to dashboard upon successful login
        return redirect("/dashboard", {
            headers: {
                "Set-Cookie": await sessionStorage.commitSession(session),
            },
        });
    } catch (error) {
        console.error("Error during login:", error);
        return json({ error: "Internal server error." }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
};
