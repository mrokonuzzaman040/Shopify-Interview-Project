import { LoaderFunction, ActionFunction, json, redirect } from "@remix-run/node";
import { useLoaderData, Link, Form, useNavigation, useActionData } from "@remix-run/react";
import { prisma } from "~/utils/prisma.server";
import { checkRole } from "~/utils/roleChecker";
import { useState } from "react";

// Loader to fetch user details
export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = params.id;

  if (!userId) {
    return redirect("/users");
  }

  await checkRole(request, ["admin"]);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, email: true, role: true, createdAt: true },
  });

  if (!user) {
    throw new Response("User not found", { status: 404 });
  }

  return json({ user });
};

// Action to handle user deletion and updates
export const action: ActionFunction = async ({ request, params }) => {
  const userId = params.id;

  if (!userId) {
    return redirect("/users");
  }

  const formData = await request.formData();
  const actionType = formData.get("action");

  await checkRole(request, ["admin"]);

  if (actionType === "delete") {
    try {
      await prisma.user.delete({ where: { id: userId } });
      return redirect("/users?message=user-deleted");
    } catch (error) {
      console.error("Error deleting user:", error);
      return json({ error: "Failed to delete the user." }, { status: 500 });
    }
  }

  if (actionType === "edit") {
    const username = formData.get("username")?.toString();
    const email = formData.get("email")?.toString();
    const role = formData.get("role")?.toString();

    if (!username || !email || !role) {
      return json({ error: "All fields are required for editing." }, { status: 400 });
    }

    try {
      await prisma.user.update({
        where: { id: userId },
        data: { username, email, role },
      });
      return redirect(`/users/${userId}?message=user-updated`);
    } catch (error) {
      console.error("Error updating user:", error);
      return json({ error: "Failed to update the user." }, { status: 500 });
    }
  }

  return null;
};

// Component to Display User Details
export default function UserDetails() {
  const { user } = useLoaderData<{ user: { id: string; username: string; email: string; role: string; createdAt: string } }>();
  const actionData = useActionData<{ error?: string }>();
  const navigation = useNavigation();
  const [isEditing, setIsEditing] = useState(false);

  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-200 mb-6">
          {isEditing ? "Edit User" : "User Details"}
        </h1>

        {actionData?.error && (
          <div className="text-sm text-red-600 bg-red-100 p-2 rounded-md mb-4">
            {actionData.error}
          </div>
        )}

        {!isEditing ? (
          <>
            {/* User Information */}
            <div className="space-y-4">
              <UserInfo label="Username" value={user.username} />
              <UserInfo label="Email" value={user.email} />
              <UserInfo
                label="Role"
                value={
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-sm ${
                      user.role === "admin" ? "bg-green-200 text-green-800" : "bg-blue-200 text-blue-800"
                    }`}
                  >
                    {user.role}
                  </span>
                }
              />
              <UserInfo label="Created At" value={new Date(user.createdAt).toLocaleString()} />
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-4">
              <Link
                to="/users"
                className="flex-1 px-4 py-2 text-center text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none"
              >
                Back to Users
              </Link>
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 px-4 py-2 text-center text-sm font-medium text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 focus:outline-none"
              >
                Edit User
              </button>
              <Form method="post" className="flex-1 text-center">
                <input type="hidden" name="action" value="delete" />
                <button
                  type="submit"
                  onClick={(e) => {
                    if (!confirm("Are you sure you want to delete this user?")) {
                      e.preventDefault();
                    }
                  }}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none"
                >
                  {isSubmitting ? "Deleting..." : "Delete User"}
                </button>
              </Form>
            </div>
          </>
        ) : (
          <Form method="post" className="space-y-4">
            <input type="hidden" name="action" value="edit" />
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                defaultValue={user.username}
                className="w-full px-4 py-2 mt-1 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                defaultValue={user.email}
                className="w-full px-4 py-2 mt-1 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Role
              </label>
              <select
                id="role"
                name="role"
                defaultValue={user.role}
                className="w-full px-4 py-2 mt-1 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
            <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none"
            >
                Cancel
            </button>
          </Form>
        )}
      </div>
    </div>
  );
}

// User Information Component
function UserInfo({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 py-2">
      <p className="text-gray-600 dark:text-gray-300 font-medium">{label}:</p>
      <p className="text-gray-800 dark:text-gray-100">{value}</p>
    </div>
  );
}
