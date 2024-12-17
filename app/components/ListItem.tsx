import { Link } from "@remix-run/react";

export function ListItem({
    title,
    subtitle,
    link,
}: {
    title: string;
    subtitle: string;
    link: string;
}) {
    return (
        <li className="flex justify-between items-center py-3">
            <div>
                <p className="text-gray-800 dark:text-gray-200 font-medium">{title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
            </div>
            <Link
                to={link}
                className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
                View
            </Link>
        </li>
    );
}
