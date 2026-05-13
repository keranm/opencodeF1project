export default function Footer() {
  return (
    <footer className="border-t border-gray-100 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-red-600">PIT LANE</span>
            <span className="text-xs text-gray-400">F1 News Dashboard</span>
          </div>
          <p className="text-sm text-gray-400">
            This site aggregates publicly available RSS feeds from F1 news sources.
            All content belongs to their respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
}
