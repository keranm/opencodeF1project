import Link from "next/link";
import type { StoryCluster } from "@/types";
import CategoryBadge, { getCategoryGradient } from "./CategoryBadge";

export default function HeroStory({ cluster }: { cluster: StoryCluster }) {
  const gradient = getCategoryGradient(cluster.category);

  return (
    <Link
      href={`/story/${cluster.slug}`}
      className={`group block relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} min-h-[400px] sm:min-h-[500px]`}
      aria-label={cluster.title}
    >
      {cluster.primaryImageUrl ? (
        <img
          src={cluster.primaryImageUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-50 transition-opacity"
          loading="eager"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <svg className="w-32 h-32 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
      <div className="relative h-full flex flex-col justify-end p-6 sm:p-10">
        <div className="mb-3">
          <CategoryBadge category={cluster.category} />
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-white mb-3 leading-tight">
          {cluster.title}
        </h1>
        <p className="text-gray-300 text-sm sm:text-base line-clamp-2 mb-4 max-w-2xl">
          {cluster.summarySentence}
        </p>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>{cluster.sourceCount} source{cluster.sourceCount > 1 ? "s" : ""}</span>
          <span>{new Date(cluster.latestDate).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}</span>
        </div>
      </div>
    </Link>
  );
}
