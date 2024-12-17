import { ActionFunction, json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { sessionStorage } from "~/session";

const prisma = new PrismaClient();

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return json({ error: "Email and password are required." }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
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
    return json({ error: "Internal server error. Please try again." }, { status: 500 });
  }
};

export default function Login() {
  const actionData = useActionData<{ error?: string }>();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-2xl font-semibold text-center text-gray-800 dark:text-gray-200">
          Login
        </h1>

        {actionData?.error && (
          <div className="p-3 text-sm text-red-600 bg-red-100 rounded-md">
            {actionData.error}
          </div>
        )}

        <Form method="post" className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input type="email" name="email" required className="w-full border rounded p-2" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              className="w-full border rounded p-2"
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
            Login
          </button>
        </Form>
      </div>
    </div>
  );
}
