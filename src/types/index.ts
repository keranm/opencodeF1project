export interface NewsSource {
  id: string;
  name: string;
  siteUrl: string;
  rssUrl: string;
  tier: 1 | 2;
  favicon?: string;
}

export interface RawArticle {
  id: string;
  sourceId: string;
  sourceName: string;
  sourceSiteUrl: string;
  sourceTier: 1 | 2;
  title: string;
  description: string;
  content: string;
  url: string;
  imageUrl: string | null;
  publishedAt: string;
  categories: string[];
}

export type ArticleCategory = "driver-news" | "team-news" | "race-news" | "general";

export interface Article extends RawArticle {
  normalizedTitle: string;
  category: ArticleCategory;
}

export interface StoryCluster {
  id: string;
  slug: string;
  title: string;
  summarySentence: string;
  keyPoints: KeyPoint[];
  articles: Article[];
  category: ArticleCategory;
  primaryImageUrl: string | null;
  sourceCount: number;
  latestDate: string;
  youtubeVideos: YouTubeVideo[];
}

export interface KeyPoint {
  text: string;
  sourceName: string;
  sourceUrl: string;
}

export interface DriverStanding {
  position: number;
  driverName: string;
  driverNationality: string;
  constructor: string;
  points: number;
  wins: number;
}

export interface ConstructorStanding {
  position: number;
  constructor: string;
  nationality: string;
  points: number;
  wins: number;
}

export interface RaceCalendarEntry {
  round: number;
  raceName: string;
  circuit: string;
  locality: string;
  country: string;
  date: string;
  time: string;
  sessionTimes: {
    fp1?: string;
    fp2?: string;
    fp3?: string;
    qualifying?: string;
    sprint?: string;
    race: string;
  };
  isCompleted: boolean;
  winner?: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  channelTitle: string;
  channelId: string;
}
