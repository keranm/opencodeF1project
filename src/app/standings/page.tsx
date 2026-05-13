import { fetchDriverStandings, fetchConstructorStandings } from "@/lib/standings";
import StandingsTable from "@/components/StandingsTable";

export const revalidate = 2220;

export default async function StandingsPage() {
  const [drivers, constructors] = await Promise.all([
    fetchDriverStandings(),
    fetchConstructorStandings(),
  ]);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="border-b border-gray-100 pb-6">
        <h1 className="text-3xl font-bold text-gray-900">2026 Championship Standings</h1>
        <p className="text-gray-500 mt-1">
          {drivers.length > 0
            ? `${drivers.length} drivers, ${constructors.length} constructors`
            : "Standings data not yet available for the 2026 season"}
        </p>
      </div>
      <StandingsTable drivers={drivers} constructors={constructors} />
    </div>
  );
}
