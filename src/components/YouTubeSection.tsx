import type { YouTubeVideo } from "@/types";

export default function YouTubeSection({
  videos,
  title = "Latest Videos",
}: {
  videos: YouTubeVideo[];
  title?: string;
}) {
  if (videos.length === 0) return null;

  return (
    <section>
      <h2 className="text-xl font-bold text-gray-900 mb-6">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {videos.map((video) => (
          <a
            key={video.id}
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all"
          >
            <div className="aspect-video bg-gray-100 relative">
              {video.thumbnailUrl && (
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-red-600 transition-colors mb-1">
                {video.title}
              </h3>
              <p className="text-xs text-gray-500">{video.channelTitle}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
