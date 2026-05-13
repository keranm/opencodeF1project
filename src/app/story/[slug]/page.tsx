import { notFound } from "next/navigation";
import { getDashboardData, getStoryCluster } from "@/lib/data";
import ExecutiveSummary from "@/components/ExecutiveSummary";
import SourceLinks from "@/components/SourceLinks";
import YouTubeSection from "@/components/YouTubeSection";
import { fetchYouTubeVideos } from "@/lib/youtube";
import type { YouTubeVideo } from "@/types";

export const revalidate = 21600;
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

      <div className="mt-8 space-y-6">
        {cluster.articles.slice(0, 1).map((article) => (
          <div key={article.id}>
            {article.content && (
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                {article.content.split("\n").filter(Boolean).slice(0, 20).map((paragraph, i) => (
                  <p key={i} className="mb-4">{paragraph}</p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

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
