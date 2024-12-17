import { LoaderFunction, redirect, json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { PrismaClient } from "@prisma/client";
import { sessionStorage } from "~/session";
import { checkRole } from "~/utils/roleChecker"; // Utility to check user roles

const prisma = new PrismaClient();

// Loader to check authentication and role
export const loader: LoaderFunction = async ({ request }) => {
  try {
    // Check if the user has the "admin" role
    await checkRole(request, ["admin"]);

    // Fetch all users (example of admin-specific data)
    const users = await prisma.user.findMany({
      select: { id: true, username: true, email: true, role: true, createdAt: true },
    });

    return json({ users });
  } catch (error: any) {
    console.error("Access Denied:", error);
    return redirect("/login?message=unauthorized");
  }
};

// Admin Component
export default function AdminDashboard() {
  const { users } = useLoaderData<{ users: { id: string; username: string; email: string; role: string; createdAt: string }[] }>();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4 text-center">
          Admin Dashboard
        </h1>

        {/* User Table */}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700">
              <th className="p-3">Username</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Created At</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="p-3">{user.username}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.role}</td>
                <td className="p-3">{new Date(user.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Back to Dashboard */}
        <div className="text-center mt-6">
          <Link
            to="/dashboard"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
