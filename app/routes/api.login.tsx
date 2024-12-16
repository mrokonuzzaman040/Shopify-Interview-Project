import { ActionFunction, LoaderFunction, json, redirect } from "@remix-run/node";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { sessionStorage } from "~/session";

const prisma = new PrismaClient();

// Block GET requests explicitly
export const loader: LoaderFunction = async () => {
  return json({ error: "GET method is not allowed on this route" }, { status: 405 });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return json({ error: "Email and password are required." }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return json({ error: "Invalid email or password." }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return json({ error: "Invalid email or password." }, { status: 401 });
    }

    const session = await sessionStorage.getSession();
    session.set("userId", user.id);

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
