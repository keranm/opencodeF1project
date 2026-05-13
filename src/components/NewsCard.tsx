import Link from "next/link";
import type { StoryCluster } from "@/types";
import CategoryBadge, { getCategoryGradient } from "./CategoryBadge";

export default function NewsCard({ cluster }: { cluster: StoryCluster }) {
  const gradient = getCategoryGradient(cluster.category);

  return (
    <Link
      href={`/story/${cluster.slug}`}
      className="group block bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all"
    >
      <div className={`aspect-[16/10] bg-gradient-to-br ${gradient} relative overflow-hidden`}>
        {cluster.primaryImageUrl ? (
          <img
            src={cluster.primaryImageUrl}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-20">
            <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="mb-2">
          <CategoryBadge category={cluster.category} />
        </div>
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-red-600 transition-colors mb-2">
          {cluster.title}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">
          {cluster.summarySentence}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{cluster.sourceCount} source{cluster.sourceCount > 1 ? "s" : ""}</span>
          <span>{new Date(cluster.latestDate).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
          })}</span>
        </div>
      </div>
    </Link>
  );
}
