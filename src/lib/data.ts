import { fetchAllFeeds } from "./feeds";
import { clusterArticles } from "./clustering";
import { fetchDriverStandings, fetchConstructorStandings, fetchRaceCalendar } from "./standings";
import { fetchYouTubeVideos } from "./youtube";
import type { StoryCluster, DriverStanding, ConstructorStanding, RaceCalendarEntry, YouTubeVideo } from "@/types";

export interface DashboardData {
  clusters: StoryCluster[];
  driverStandings: DriverStanding[];
  constructorStandings: ConstructorStanding[];
  calendar: RaceCalendarEntry[];
  youtubeVideos: YouTubeVideo[];
  generatedAt: string;
}

const CACHE_TTL = 6 * 60 * 60 * 1000;

let cachedData: { data: DashboardData; timestamp: number } | null = null;

export async function getDashboardData(): Promise<DashboardData> {
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    return cachedData.data;
  }

  const [rawArticles, driverStandings, constructorStandings, calendar, youtubeVideos] =
    await Promise.all([
      fetchAllFeeds(),
      fetchDriverStandings(),
      fetchConstructorStandings(),
      fetchRaceCalendar(),
      fetchYouTubeVideos(process.env.YOUTUBE_API_KEY),
    ]);

  const clusters = clusterArticles(rawArticles);
  const data: DashboardData = {
    clusters,
    driverStandings,
    constructorStandings,
    calendar,
    youtubeVideos,
    generatedAt: new Date().toISOString(),
  };

  cachedData = { data, timestamp: Date.now() };
  return data;
}

export function clearCache(): void {
  cachedData = null;
}

export async function getStoryCluster(slug: string): Promise<StoryCluster | null> {
  const data = await getDashboardData();
  return data.clusters.find((c) => c.slug === slug) || null;
}

export async function getClustersByCategory(category: string): Promise<StoryCluster[]> {
  const data = await getDashboardData();
  return data.clusters.filter((c) => c.category === category);
}
