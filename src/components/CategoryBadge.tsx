import type { ArticleCategory } from "@/types";

const CATEGORY_LABELS: Record<ArticleCategory, string> = {
  "driver-news": "Driver News",
  "team-news": "Team News",
  "race-news": "Race News",
  "general": "General",
};

const CATEGORY_COLORS: Record<ArticleCategory, string> = {
  "driver-news": "bg-blue-100 text-blue-700",
  "team-news": "bg-purple-100 text-purple-700",
  "race-news": "bg-green-100 text-green-700",
  "general": "bg-gray-100 text-gray-700",
};

const CATEGORY_GRADIENTS: Record<ArticleCategory, string> = {
  "driver-news": "from-blue-900/90 to-blue-950",
  "team-news": "from-purple-900/90 to-purple-950",
  "race-news": "from-emerald-900/90 to-emerald-950",
  "general": "from-gray-800/90 to-gray-900",
};

export function getCategoryGradient(category: ArticleCategory): string {
  return CATEGORY_GRADIENTS[category];
}

export default function CategoryBadge({
  category,
}: {
  category: ArticleCategory;
}) {
  return (
    <span
      className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[category]}`}
    >
      {CATEGORY_LABELS[category]}
    </span>
  );
}

export function getCategoryLabel(category: ArticleCategory): string {
  return CATEGORY_LABELS[category];
}

export function getCategoryColor(category: ArticleCategory): string {
  return CATEGORY_COLORS[category];
}
