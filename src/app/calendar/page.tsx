import { fetchRaceCalendar } from "@/lib/standings";
import RaceCalendar from "@/components/RaceCalendar";

export const revalidate = 21600;

export default async function CalendarPage() {
  const calendar = await fetchRaceCalendar();
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="border-b border-gray-100 pb-6">
        <h1 className="text-3xl font-bold text-gray-900">2026 Race Calendar</h1>
        <p className="text-gray-500 mt-1">
          {calendar.length > 0
            ? `${calendar.filter((r) => r.isCompleted).length} completed, ${calendar.filter((r) => !r.isCompleted).length} remaining`
            : "Calendar data not yet available"}
        </p>
      </div>
      <RaceCalendar calendar={calendar} />
    </div>
  );
}
