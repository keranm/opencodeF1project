import type { ArticleCategory } from "@/types";

const FALLBACKS: Record<ArticleCategory, string> = {
  "driver-news": "/images/fallbacks/driver.jpg",
  "team-news": "/images/fallbacks/team.jpg",
  "race-news": "/images/fallbacks/race.jpg",
  "general": "/images/fallbacks/general.jpg",
};

export function getFallbackImage(category: ArticleCategory): string {
  return FALLBACKS[category];
}
