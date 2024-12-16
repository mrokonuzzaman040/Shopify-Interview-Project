import { LoaderFunction, redirect, json } from "@remix-run/node";
import { useLoaderData, Form, useNavigation, useActionData, Link } from "@remix-run/react";
import { PrismaClient } from "@prisma/client";
import { sessionStorage } from "~/session";

const prisma = new PrismaClient();

// Loader to fetch the user's current details
export const loader: LoaderFunction = async ({ request }) => {
  const session = await sessionStorage.getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");

  if (!userId) {
    return redirect("/login?message=session-expired");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, email: true },
  });

  if (!user) {
    return redirect("/login?message=not-found");
  }

  const url = new URL(request.url);
  const message = url.searchParams.get("message"); // Capture optional message query

  return json({ user, message });
};

export default function Profile() {
  const { user, message } = useLoaderData<{ user: { id: string; username: string; email: string }; message?: string }>();
  const actionData = useActionData<{ error?: string; warning?: string; message?: string }>();
  const navigation = useNavigation();

  // Determine the type of message and styles
  const getMessageStyle = (type: "error" | "warning" | "success") => {
    const baseStyles = "text-sm p-2 rounded-md mb-4 ";
    if (type === "error") return baseStyles + "text-red-600 bg-red-100 dark:bg-red-800 dark:text-red-200";
    if (type === "warning") return baseStyles + "text-yellow-600 bg-yellow-100 dark:bg-yellow-800 dark:text-yellow-200";
    if (type === "success") return baseStyles + "text-green-600 bg-green-100 dark:bg-green-800 dark:text-green-200";
    return "";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-200 mb-6">
          Manage Profile
        </h1>

        {/* Message Section */}
        {message && <div className={getMessageStyle("success")}>{message}</div>}
        {actionData?.error && <div className={getMessageStyle("error")}>{actionData.error}</div>}
        {actionData?.warning && <div className={getMessageStyle("warning")}>{actionData.warning}</div>}
        {actionData?.message && <div className={getMessageStyle("success")}>{actionData.message}</div>}

        <Form method="post" action="/api/profile" className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              defaultValue={user.username}
              required
              autoFocus
              className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              defaultValue={user.email}
              required
              className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              New Password (optional)
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={navigation.state === "submitting"}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {navigation.state === "submitting" ? "Saving..." : "Save Changes"}
          </button>
        </Form>

        {/* Link to return to dashboard */}
        <div className="mt-6 text-center">
          <Link
            to="/dashboard"
            className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
