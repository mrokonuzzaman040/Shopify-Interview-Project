import { LoaderFunction, redirect } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { PrismaClient } from "@prisma/client";
import { sessionStorage } from "~/session";

const prisma = new PrismaClient();

export const loader: LoaderFunction = async ({ request }) => {
  const session = await sessionStorage.getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");

  if (!userId) {
    return redirect("/login");
  }

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center py-12">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-gray-200 mb-4">
          Welcome, {user.username}!
        </h1>
        <p className="text-center text-lg text-gray-600 dark:text-gray-400 mb-6">
          Role: <span className="font-medium text-gray-800 dark:text-gray-200">{user.role}</span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {user.role === "admin" && (
            <Link
              to="/admin"
              className="block px-6 py-4 text-center bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Admin Panel
            </Link>
          )}
          <Link
            to="/profile"
            className="block px-6 py-4 text-center bg-green-600 text-white font-medium rounded-lg shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:bg-green-500 dark:hover:bg-green-600"
          >
            Manage Profile
          </Link>
          <Link
            to="/logout"
            className="block px-6 py-4 text-center bg-red-600 text-white font-medium rounded-lg shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-500 dark:hover:bg-red-600"
          >
            Logout
          </Link>
        </div>
      </div>
    </div>
  );
}
