import type { DriverStanding, ConstructorStanding } from "@/types";

export default function StandingsTable({
  drivers,
  constructors,
}: {
  drivers: DriverStanding[];
  constructors: ConstructorStanding[];
}) {
  if (drivers.length === 0 && constructors.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {drivers.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-sm text-gray-900">Driver Standings</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {drivers.slice(0, 10).map((driver) => (
              <div
                key={driver.position}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
              >
                <span
                  className={`w-6 text-center text-sm font-bold ${
                    driver.position <= 3 ? "text-red-600" : "text-gray-400"
                  }`}
                >
                  {driver.position}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {driver.driverName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{driver.constructor}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{driver.points}</p>
                  <p className="text-xs text-gray-400">{driver.wins} win{driver.wins !== 1 ? "s" : ""}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {constructors.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-sm text-gray-900">Constructor Standings</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {constructors.map((constructor) => (
              <div
                key={constructor.position}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
              >
                <span
                  className={`w-6 text-center text-sm font-bold ${
                    constructor.position <= 3 ? "text-red-600" : "text-gray-400"
                  }`}
                >
                  {constructor.position}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {constructor.constructor}
                  </p>
                  <p className="text-xs text-gray-500">{constructor.nationality}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{constructor.points}</p>
                  <p className="text-xs text-gray-400">{constructor.wins} win{constructor.wins !== 1 ? "s" : ""}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
