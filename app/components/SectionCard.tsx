export function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">{title}</h2>
        {children}
      </div>
    );
  }
  