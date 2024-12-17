import { LoaderFunction, ActionFunction, json, redirect } from "@remix-run/node";
import { useLoaderData, Form, useNavigation, useActionData, useNavigate } from "@remix-run/react";
import { prisma } from "~/utils/prisma.server";
import { checkRole } from "~/utils/roleChecker";

// Loader to fetch all roles
export const loader: LoaderFunction = async ({ request }) => {
    await checkRole(request, ["admin"]);

    const roles = await prisma.role.findMany({
        select: { id: true, name: true },
    });

    return json({ roles });
};

// Action to handle adding a new role
export const action: ActionFunction = async ({ request }) => {
    await checkRole(request, ["admin"]);

    const formData = await request.formData();
    const roleName = formData.get("name")?.toString();

    if (!roleName) {
        return json({ error: "Role name is required." }, { status: 400 });
    }

    try {
        await prisma.role.create({
            data: { name: roleName },
        });
        return json({ success: "Role added successfully!" });
    } catch (error) {
        console.error("Error creating role:", error);
        return json({ error: "Failed to create the role. The role may already exist." }, { status: 500 });
    }
};

// Role Management Page
export default function RoleIndex() {
    const { roles } = useLoaderData<{ roles: { id: string; name: string }[] }>();
    const actionData = useActionData<{ error?: string; success?: string }>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";
    const navigate = useNavigate();

    // Dynamic message styles
    const messageStyle = (type: "error" | "success") => {
        return `p-3 mb-4 text-sm rounded-md ${type === "error"
            ? "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200"
            : "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200"
            }`;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-6 py-6">
            <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-200 mb-6">
                    Manage Roles
                </h1>

                {/* Error/Success Messages */}
                {actionData?.error && <div className={messageStyle("error")}>{actionData.error}</div>}
                {actionData?.success && <div className={messageStyle("success")}>{actionData.success}</div>}

                {/* Role List */}
                <div className="mb-6">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Role Name
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Role ID
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {roles.length > 0 ? (
                                roles.map((role) => (
                                    <tr key={role.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                                            {role.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {role.id}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={2} className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 text-center">
                                        No roles available.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Add New Role */}
                <div className="border-t pt-6">
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">Add New Role</h2>
                    <Form method="post" className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Role Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                placeholder="Enter role name"
                                required
                                className="w-full px-4 py-2 mt-1 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none"
                        >
                            {isSubmitting ? "Adding..." : "Add Role"}
                        </button>
                    </Form>
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 focus:outline-none mt-4"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div >
    );
}
