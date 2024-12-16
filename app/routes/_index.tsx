import { Link } from "@remix-run/react";

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 dark:bg-gray-900">
      <h1 className="text-4xl font-extrabold mb-4 text-gray-800 dark:text-gray-100">
        Welcome to Shopify RBAC Project
      </h1>
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
        Manage users, roles, and permissions with ease.
      </p>
      <div className="flex space-x-4">
        <Link
          to="/register"
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:hover:bg-blue-500"
        >
          Register
        </Link>
        <Link
          to="/login"
          className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:hover:bg-green-500"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
