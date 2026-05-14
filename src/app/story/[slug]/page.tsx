import { notFound } from "next/navigation";
import { getDashboardData, getStoryCluster } from "@/lib/data";
import ExecutiveSummary from "@/components/ExecutiveSummary";
import SourceLinks from "@/components/SourceLinks";
import YouTubeSection from "@/components/YouTubeSection";
import { fetchYouTubeVideos } from "@/lib/youtube";
import type { YouTubeVideo } from "@/types";

function formatCondensed(text: string): string[] {
  return text
    .split("\n\n")
    .map((b) => b.trim())
    .filter(Boolean);
}

export const revalidate = 2220;
export const dynamicParams = true;

export async function generateStaticParams() {
  const data = await getDashboardData();
  return data.clusters.map((cluster) => ({ slug: cluster.slug }));
}

export default async function StoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cluster = await getStoryCluster(slug);

  if (!cluster) {
    notFound();
  }

  let youtubeVideos: YouTubeVideo[] = [];
  if (process.env.YOUTUBE_API_KEY) {
    const allVideos = await fetchYouTubeVideos(process.env.YOUTUBE_API_KEY);
    const keywords = cluster.title.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    youtubeVideos = allVideos.filter((v) =>
      keywords.some((kw) => v.title.toLowerCase().includes(kw))
    ).slice(0, 2);
  }

  return (
    <article className="max-w-4xl mx-auto">
      {cluster.primaryImageUrl && (
        <div className="aspect-[2/1] relative overflow-hidden rounded-2xl mb-8 bg-gray-100">
          <img
            src={cluster.primaryImageUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <ExecutiveSummary cluster={cluster} />

      {cluster.condensedContent && (
        <div className="mt-8 bg-white border border-gray-100 rounded-2xl p-6 sm:p-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Condensed Article
          </h2>
          <div className="text-sm sm:text-base text-gray-700 leading-relaxed space-y-4">
            {formatCondensed(cluster.condensedContent).map((block, i) => (
              <p key={i}>{block}</p>
            ))}
          </div>
        </div>
      )}

      {youtubeVideos.length > 0 && (
        <div className="mt-10">
          <YouTubeSection videos={youtubeVideos} title="Related Videos" />
        </div>
      )}

      <div className="mt-10">
        <SourceLinks cluster={cluster} />
      </div>
    </article>
  );
}
