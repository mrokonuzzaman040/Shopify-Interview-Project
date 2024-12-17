import { LoaderFunction, json, redirect } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { PrismaClient } from "@prisma/client";
import { checkRole } from "~/utils/roleChecker";
import { StatCard } from "~/components/StatCard";
import { SectionCard } from "~/components/SectionCard";
import { ListItem } from "~/components/ListItem";

const prisma = new PrismaClient();

// Loader Function to fetch data for Admin Dashboard
export const loader: LoaderFunction = async ({ request }) => {
    try {
        await checkRole(request, ["admin"]);

        const totalUsers = await prisma.user.count();
        const totalAdmins = await prisma.user.count({ where: { role: "admin" } });
        const totalRoles = await prisma.role.count();

        const recentUsers = await prisma.user.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            select: { id: true, username: true, email: true, role: true },
        });

        const recentAdmins = await prisma.user.findMany({
            where: { role: "admin" },
            take: 5,
            orderBy: { createdAt: "desc" },
            select: { id: true, username: true, email: true },
        });

        return json({ totalUsers, totalAdmins, totalRoles, recentUsers, recentAdmins });
    } catch (error) {
        console.error("Access Denied:", error);
        return redirect("/logout");
    }
};

export default function AdminDashboard() {
    const { totalUsers, totalAdmins, totalRoles, recentUsers, recentAdmins } = useLoaderData<{
        totalUsers: number;
        totalAdmins: number;
        totalRoles: number;
        recentUsers: { id: string; username: string; email: string; role: string }[];
        recentAdmins: { id: string; username: string; email: string }[];
    }>();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-gray-200">Admin Dashboard</h1>

                {/* Stats Cards */}
                <div className="flex items-center justify-center gap-4 p-6">
                    <StatCard title="Total Users" count={totalUsers} color="blue" />
                    <StatCard title="Total Admins" count={totalAdmins} color="green" />
                    <StatCard title="Total Roles" count={totalRoles} color="yellow" />
                </div>

                <div className="flex flex-col gap-6">
                    {/* Recent Users */}
                    <SectionCard title="Recent Users">
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            {recentUsers.map((user) => (
                                <ListItem
                                    key={user.id}
                                    title={user.username}
                                    subtitle={`${user.email} - ${user.role}`}
                                    link={`/users/${user.id}`}
                                />
                            ))}
                        </ul>
                    </SectionCard>

                    {/* Recent Admins */}
                    <SectionCard title="Recent Admins">
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            {recentAdmins.map((admin) => (
                                <ListItem
                                    key={admin.id}
                                    title={admin.username}
                                    subtitle={admin.email}
                                    link={`/users/${admin.id}`}
                                />
                            ))}
                        </ul>
                    </SectionCard>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <Link
                        to="/roles"
                        className="flex-1 text-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
                    >
                        Roles
                    </Link>
                    <Link
                        to="/users"
                        className="flex-1 text-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                    >
                        View All Users
                    </Link>
                    <Link
                        to="/dashboard"
                        className="flex-1 text-center px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}