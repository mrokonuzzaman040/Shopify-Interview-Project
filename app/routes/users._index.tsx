import { LoaderFunction, ActionFunction, json, redirect } from "@remix-run/node";
import { useLoaderData, Link, Form, useNavigation } from "@remix-run/react";
import { PrismaClient } from "@prisma/client";
import { checkRole } from "~/utils/roleChecker";

interface User {
    id: string;
    username: string;
    email: string;
    role: string;
    createdAt: Date;
}

interface LoaderData {
    users: User[];
}

const prisma = new PrismaClient();

// Loader to fetch all users
export const loader: LoaderFunction = async ({ request }) => {
    await checkRole(request, ["admin"]);

    const users = await prisma.user.findMany({
        select: { id: true, username: true, email: true, role: true, createdAt: true },
    });

    return json({ users });
};

// Action to delete a user
export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const userId = formData.get("userId")?.toString();

    await checkRole(request, ["admin"]);

    if (userId) {
        await prisma.user.delete({ where: { id: userId } });
    }

    return redirect("/users");
};

export default function UsersList() {
    const { users } = useLoaderData<LoaderData>();
    const navigation = useNavigation();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4 text-center">
                    All Users
                </h1>

                <table className="w-full border-collapse text-gray-800 dark:text-gray-200">
                    <thead>
                        <tr className="bg-gray-200 dark:bg-gray-700">
                            <th className="p-3">Username</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Role</th>
                            <th className="p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>


                        {users.map((user: User) => (
                            <tr key={user.id} className="border-b hover:bg-gray-100 dark:hover:bg-gray-700">
                                <td className="p-3">{user.username}</td>
                                <td className="p-3">{user.email}</td>
                                <td className="p-3">{user.role}</td>
                                <td className="p-3 flex space-x-2">
                                    <Link
                                        to={`/users/${user.id}`}
                                        className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        View
                                    </Link>
                                    <Form method="post">
                                        <input type="hidden" name="userId" value={user.id} />
                                        <button
                                            type="submit"
                                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                            disabled={navigation.state === "submitting"}
                                        >
                                            {navigation.state === "submitting" ? "Deleting..." : "Delete"}
                                        </button>
                                    </Form>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="mt-6 text-center">
                    <Link to="/admin" className="text-blue-600 hover:underline dark:text-blue-400">
                        Back to Admin Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
