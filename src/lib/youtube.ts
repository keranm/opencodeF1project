import type { YouTubeVideo } from "@/types";

const YOUTUBE_CHANNELS = [
  { id: "UCB_qr75-ydFVKSF9Dmo6izg", name: "Formula 1" },
  { id: "UCZqNme_MY-jl_1ziSr2VMjA", name: "Kym Illman" },
];

const MAX_VIDEOS_PER_CHANNEL = 5;

interface YouTubeApiResponse {
  items?: Array<{
    id: { videoId: string };
    snippet: {
      title: string;
      description: string;
      thumbnails: { high?: { url: string }; medium?: { url: string }; default?: { url: string } };
      publishedAt: string;
      channelTitle: string;
      channelId: string;
    };
  }>;
}

export async function fetchYouTubeVideos(apiKey?: string): Promise<YouTubeVideo[]> {
  if (!apiKey) return [];

  const allVideos: YouTubeVideo[] = [];

  for (const channel of YOUTUBE_CHANNELS) {
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channel.id}&maxResults=${MAX_VIDEOS_PER_CHANNEL}&order=date&type=video&key=${apiKey}`;
      const response = await fetch(url, { next: { revalidate: 2220 } });
      
      if (!response.ok) continue;

      const data: YouTubeApiResponse = await response.json();
      
      if (data.items) {
        for (const item of data.items) {
          allVideos.push({
            id: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url || "",
            publishedAt: item.snippet.publishedAt,
            channelTitle: item.snippet.channelTitle,
            channelId: item.snippet.channelId,
          });
        }
      }
    } catch {
      continue;
    }
  }

  return allVideos.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}
