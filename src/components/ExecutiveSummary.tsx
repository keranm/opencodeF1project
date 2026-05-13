import type { StoryCluster } from "@/types";
import CategoryBadge from "./CategoryBadge";

export default function ExecutiveSummary({
  cluster,
}: {
  cluster: StoryCluster;
}) {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-6 sm:p-8">
      <div className="mb-4">
        <CategoryBadge category={cluster.category} />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-tight">
        {cluster.title}
      </h1>
      <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-6">
        {cluster.summarySentence}
      </p>
      {cluster.keyPoints.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Key Points
          </h3>
          <ul className="space-y-3">
            {cluster.keyPoints.map((point, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-red-500" />
                <span className="text-sm text-gray-700">
                  {point.text.length > 200
                    ? `${point.text.slice(0, 200)}...`
                    : point.text}
                  <a
                    href={point.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-600 hover:text-red-700 font-medium ml-1 whitespace-nowrap"
                  >
                    ({point.sourceName})
                  </a>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
