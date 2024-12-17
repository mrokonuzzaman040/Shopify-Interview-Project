import { ActionFunction, LoaderFunction, json, redirect } from "@remix-run/node";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { sessionStorage } from "~/session";

const prisma = new PrismaClient();

// Explicitly block GET requests
export const loader: LoaderFunction = async () => {
  return json({ error: "GET method is not allowed on this route." }, { status: 405 });
};

// Action for handling POST login requests
export const action: ActionFunction = async ({ request }) => {
  // Parse form data safely
  const formData = await request.formData();
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  // Validate user input
  if (!email || !password) {
    return json({ error: "Email and password are required." }, { status: 400 });
  }

  try {
    // Fetch user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return json({ error: "Invalid email or password." }, { status: 401 });
    }

    // Verify the password using bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return json({ error: "Invalid email or password." }, { status: 401 });
    }

    // Create a user session
    const session = await sessionStorage.getSession();
    session.set("userId", user.id);

    // Redirect user to the dashboard after successful login
    return redirect("/dashboard", {
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session, {
          maxAge: 60 * 60 * 24, // Set session expiration for 24 hours
          httpOnly: true, // Security: prevents client-side JS from accessing the cookie
          secure: process.env.NODE_ENV === "production", // Use secure cookies in production
          sameSite: "lax", // Protect against CSRF attacks
        }),
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    return json({ error: "An unexpected error occurred. Please try again later." }, { status: 500 });
  } finally {
    // Ensure the Prisma client disconnects properly
    await prisma.$disconnect();
  }
};
