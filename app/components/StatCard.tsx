export function StatCard({
    title,
    count,
    color,
}: {
    title: string;
    count: number;
    color: "blue" | "green" | "yellow";
}) {
    const colorStyles = {
        blue: "text-blue-600 dark:text-blue-400",
        green: "text-green-600 dark:text-green-400",
        yellow: "text-yellow-600 dark:text-yellow-400",
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center">
            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">{title}</h2>
            <p className={`text-3xl font-semibold ${colorStyles[color]}`}>{count}</p>
        </div>
    );
}
