import type { StoryCluster } from "@/types";
import NewsCard from "./NewsCard";

export default function NewsGrid({
  clusters,
  title,
  cols = 3,
}: {
  clusters: StoryCluster[];
  title?: string;
  cols?: 2 | 3 | 4;
}) {
  if (clusters.length === 0) return null;

  const gridCols = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <section>
      {title && (
        <h2 className="text-xl font-bold text-gray-900 mb-6">{title}</h2>
      )}
      <div className={`grid grid-cols-1 ${gridCols[cols]} gap-4 sm:gap-6`}>
        {clusters.slice(0, 12).map((cluster) => (
          <NewsCard key={cluster.id} cluster={cluster} />
        ))}
      </div>
    </section>
  );
}
