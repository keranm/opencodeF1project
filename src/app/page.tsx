import { getDashboardData } from "@/lib/data";
import HeroCarousel from "@/components/HeroCarousel";
import NewsGrid from "@/components/NewsGrid";
import CategorySection from "@/components/CategorySection";
import StandingsTable from "@/components/StandingsTable";
import RaceCalendar from "@/components/RaceCalendar";
import VideoStrip from "@/components/VideoStrip";

export const revalidate = 2220;

export default async function HomePage() {
  const data = await getDashboardData();
  const { clusters, driverStandings, constructorStandings, calendar, youtubeVideos } = data;

  const heroClusters = clusters.slice(0, 5);
  const latestClusters = clusters.slice(5, 11);

  return (
    <div className="space-y-12">
      {heroClusters.length > 0 && <HeroCarousel clusters={heroClusters} />}

      {youtubeVideos.length > 0 && <VideoStrip videos={youtubeVideos} />}

      {latestClusters.length > 0 && (
        <NewsGrid clusters={latestClusters} title="Latest News" />
      )}

      <CategorySection clusters={clusters} category="driver-news" />
      <CategorySection clusters={clusters} category="team-news" />
      <CategorySection clusters={clusters} category="race-news" />

      {(driverStandings.length > 0 || constructorStandings.length > 0) && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Championship Standings</h2>
          <StandingsTable drivers={driverStandings} constructors={constructorStandings} />
        </section>
      )}

      {calendar.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Race Calendar</h2>
          <RaceCalendar calendar={calendar} />
        </section>
      )}
    </div>
  );
}
