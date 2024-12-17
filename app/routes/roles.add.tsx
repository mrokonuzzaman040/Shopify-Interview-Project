import { ActionFunction, json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation, Link } from "@remix-run/react";
import { PrismaClient } from "@prisma/client";
import { checkRole } from "~/utils/roleChecker";

const prisma = new PrismaClient();

// Action to add a new role
export const action: ActionFunction = async ({ request }) => {
    try {
        await checkRole(request, ["admin"]);

        const formData = await request.formData();
        const roleName = formData.get("role")?.toString();

        if (!roleName) {
            return json({ error: "Role name is required." }, { status: 400 });
        }

        // Check if the role already exists
        const existingRole = await prisma.role.findUnique({
            where: { name: roleName },
        });

        if (existingRole) {
            return json({ error: "Role already exists." }, { status: 400 });
        }

        // Create new role
        await prisma.role.create({
            data: { name: roleName },
        });

        return redirect("/admin?message=role-created");
    } catch (error) {
        console.error("Error creating role:", error);
        return json({ error: "Failed to create role. Please try again." }, { status: 500 });
    }
};

// Add Role Component
export default function AddRole() {
    const actionData = useActionData<{ error?: string }>();
    const navigation = useNavigation();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
            <div className="max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200 mb-4">
                    Add New Role
                </h1>

                {actionData?.error && (
                    <div className="text-red-600 bg-red-100 p-3 rounded-md mb-4 dark:bg-red-800 dark:text-red-200">
                        {actionData.error}
                    </div>
                )}

                <Form method="post" className="space-y-4">
                    <div>
                        <label
                            htmlFor="role"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Role Name
                        </label>
                        <input
                            type="text"
                            id="role"
                            name="role"
                            required
                            className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={navigation.state === "submitting"}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
                    >
                        {navigation.state === "submitting" ? "Creating..." : "Create Role"}
                    </button>
                </Form>

                <div className="mt-4 text-center">
                    <Link to="/admin" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                        Back to Admin Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
