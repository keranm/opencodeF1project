import { notFound } from "next/navigation";
import { getDashboardData } from "@/lib/data";
import NewsGrid from "@/components/NewsGrid";
import { getCategoryLabel } from "@/components/CategoryBadge";
import type { ArticleCategory } from "@/types";

export const revalidate = 21600;
export const dynamicParams = true;

const VALID_CATEGORIES: ArticleCategory[] = ["driver-news", "team-news", "race-news", "general"];

export async function generateStaticParams() {
  return VALID_CATEGORIES.map((slug) => ({ slug }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!VALID_CATEGORIES.includes(slug as ArticleCategory)) {
    notFound();
  }

  const data = await getDashboardData();
  const clusters = data.clusters.filter((c) => c.category === slug);

  if (clusters.length === 0) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-100 pb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {getCategoryLabel(slug as ArticleCategory)}
        </h1>
        <p className="text-gray-500 mt-1">{clusters.length} story cluster{clusters.length > 1 ? "s" : ""}</p>
      </div>
      <NewsGrid clusters={clusters} cols={3} />
    </div>
  );
}
