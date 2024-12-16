import { LoaderFunction, redirect } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { PrismaClient } from "@prisma/client";
import { sessionStorage } from "~/session"; // Import your session management logic

const prisma = new PrismaClient();

// Loader function to check authentication and fetch user details
export const loader: LoaderFunction = async ({ request }) => {
  const session = await sessionStorage.getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");

  if (!userId) {
    // Redirect to login if not authenticated
    return redirect("/login");
  }

  // Fetch user details from the database
  const userDetails = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!userDetails) {
    return redirect("/login");
  }

  return {
    user: {
      id: userDetails.id,
      username: userDetails.username,
      role: userDetails.role,
    },
  };
};

export default function Dashboard() {
  const { user } = useLoaderData<{ user: { id: string; username: string; role: string } }>();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-4xl p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold text-center text-gray-800 dark:text-gray-200">
          Welcome, {user.username}!
        </h1>
        <p className="text-lg text-center text-gray-600 dark:text-gray-400">
          Your role: <span className="font-semibold">{user.role}</span>
        </p>
        <div className="flex justify-center space-x-4">
          {user.role === "admin" && (
            <Link
              to="/admin"
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Go to Admin Panel
            </Link>
          )}
          <Link
            to="/logout"
            className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 dark:bg-red-500 dark:hover:bg-red-600"
          >
            Logout
          </Link>
        </div>
      </div>
    </div>
  );
}
