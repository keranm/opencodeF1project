import type { StoryCluster } from "@/types";
import Link from "next/link";
import NewsCard from "./NewsCard";
import { getCategoryLabel } from "./CategoryBadge";
import type { ArticleCategory } from "@/types";

export default function CategorySection({
  clusters,
  category,
  max = 3,
}: {
  clusters: StoryCluster[];
  category: string;
  max?: number;
}) {
  const filtered = clusters.filter((c) => c.category === category);
  if (filtered.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {getCategoryLabel(category as ArticleCategory)}
        </h2>
        <Link
          href={`/category/${category}`}
          className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
        >
          View all →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filtered.slice(0, max).map((cluster) => (
          <NewsCard key={cluster.id} cluster={cluster} />
        ))}
      </div>
    </section>
  );
}
