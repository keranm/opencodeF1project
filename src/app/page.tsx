import { getDashboardData } from "@/lib/data";
import HeroStory from "@/components/HeroStory";
import NewsGrid from "@/components/NewsGrid";
import CategorySection from "@/components/CategorySection";
import StandingsTable from "@/components/StandingsTable";
import RaceCalendar from "@/components/RaceCalendar";
import YouTubeSection from "@/components/YouTubeSection";

export const revalidate = 21600;

export default async function HomePage() {
  const data = await getDashboardData();
  const { clusters, driverStandings, constructorStandings, calendar, youtubeVideos } = data;

  const [hero, ...rest] = clusters;
  const latestClusters = rest.slice(0, 6);

  return (
    <div className="space-y-12">
      {hero && <HeroStory cluster={hero} />}

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {calendar.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Race Calendar</h2>
            <RaceCalendar calendar={calendar} />
          </section>
        )}

        {youtubeVideos.length > 0 && (
          <YouTubeSection videos={youtubeVideos.slice(0, 4)} title="Latest Videos" />
        )}
      </div>
    </div>
  );
}
