import { LoaderFunction, ActionFunction, json, redirect } from "@remix-run/node";
import { useLoaderData, Form, useNavigation, useActionData } from "@remix-run/react";
import { prisma } from "~/utils/prisma.server";
import { checkRole } from "~/utils/roleChecker";
import { useState } from "react";

// Loader to fetch all roles
export const loader: LoaderFunction = async ({ request }) => {
    await checkRole(request, ["admin"]);

    const roles = await prisma.role.findMany({
        select: { id: true, name: true },
    });

    return json({ roles });
};

// Action to handle adding, updating, and deleting roles
export const action: ActionFunction = async ({ request }) => {
    await checkRole(request, ["admin"]);

    const formData = await request.formData();
    const actionType = formData.get("action");
    const roleId = formData.get("id")?.toString();
    const roleName = formData.get("name")?.toString();

    const validRoleNamePattern = /^[a-zA-Z]+$/;

    if (actionType === "add" || actionType === "update") {
        if (!roleName || !validRoleNamePattern.test(roleName)) {
            return json({ error: "Invalid role name. Only letters (A-Z, a-z) are allowed." }, { status: 400 });
        }
    }

    try {
        if (actionType === "add") {
            if (roleName) {
                await prisma.role.create({ data: { name: roleName.toLowerCase() } });
            }
            return json({
                success: "Role added successfully!"
            });
        } else if (actionType === "update" && roleId) {
            if (roleName) {
                await prisma.role.update({ where: { id: roleId }, data: { name: roleName.toLowerCase() } });
            }
            return json({ success: "Role updated successfully!" });
        } else if (actionType === "delete" && roleId) {
            await prisma.role.delete({ where: { id: roleId } });
            return json({ success: "Role deleted successfully!" });
        }
    } catch (error) {
        console.error("Error managing role:", error);
        return json({ error: "An error occurred while managing the role." }, { status: 500 });
    }

    return null;
};

// Role Management Page
export default function RoleIndex() {
    const { roles } = useLoaderData<{ roles: { id: string; name: string }[] }>();
    const actionData = useActionData<{ error?: string; success?: string }>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
    const [updatedRoleName, setUpdatedRoleName] = useState("");

    // Dynamic message style
    const messageStyle = (type: "error" | "success") =>
        `p-3 mb-4 text-sm rounded-md ${type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-6 py-6">
            <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-200 mb-6">Manage Roles</h1>

                {/* Error/Success Messages */}
                {actionData?.error && <div className={messageStyle("error")}>{actionData.error}</div>}
                {actionData?.success && <div className={messageStyle("success")}>{actionData.success}</div>}

                {/* Role List */}
                <div className="mb-6">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Role Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Role ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {roles.map((role) => (
                                <tr key={role.id}>
                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-200">
                                        {editingRoleId === role.id ? (
                                            <input
                                                type="text"
                                                value={updatedRoleName}
                                                onChange={(e) => setUpdatedRoleName(e.target.value)}
                                                className="w-full px-2 py-1 border rounded-md"
                                            />
                                        ) : (
                                            role.name.charAt(0).toUpperCase() + role.name.slice(1))}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{role.id}</td>
                                    <td className="px-6 py-4 flex gap-2">
                                        {editingRoleId === role.id ? (
                                            <>
                                                <Form method="post">
                                                    <input type="hidden" name="action" value="update" />
                                                    <input type="hidden" name="id" value={role.id} />
                                                    <input type="hidden" name="name" value={updatedRoleName} />
                                                    <button
                                                        type="submit"
                                                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                                    >
                                                        Save
                                                    </button>
                                                </Form>
                                                <button
                                                    onClick={() => setEditingRoleId(null)}
                                                    className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        setEditingRoleId(role.id);
                                                        setUpdatedRoleName(role.name);
                                                    }}
                                                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                                >
                                                    Edit
                                                </button>
                                                <Form method="post">
                                                    <input type="hidden" name="action" value="delete" />
                                                    <input type="hidden" name="id" value={role.id} />
                                                    <button
                                                        type="submit"
                                                        onClick={(e) => {
                                                            if (!confirm("Are you sure you want to delete this role?")) e.preventDefault();
                                                        }}
                                                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                                                    >
                                                        Delete
                                                    </button>
                                                </Form>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Add New Role */}
                <div className="border-t pt-6">
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">Add New Role</h2>
                    <Form method="post" className="flex gap-4">
                        <input
                            type="hidden"
                            name="action"
                            value="add"
                        />
                        <input
                            type="text"
                            name="name"
                            placeholder="Enter role name"
                            required
                            className="flex-1 px-4 py-2 border rounded-md"
                        />
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            {isSubmitting ? "Adding..." : "Add Role"}
                        </button>
                    </Form>
                </div>
            </div>
        </div>
    );
}
