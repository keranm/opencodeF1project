import type { DriverStanding, ConstructorStanding } from "@/types";
import { getTeamColor } from "@/lib/teamColors";

const POSITION_STYLES: Record<number, string> = {
  1: "bg-amber-100 text-amber-700",
  2: "bg-gray-100 text-gray-500",
  3: "bg-orange-100 text-orange-700",
};

function PositionBadge({ position }: { position: number }) {
  return (
    <span
      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
        POSITION_STYLES[position] || "bg-gray-50 text-gray-400"
      }`}
    >
      {position}
    </span>
  );
}

function PointsBar({ points, maxPoints, color }: { points: number; maxPoints: number; color: string }) {
  const pct = Math.max(0, Math.min(100, (points / Math.max(maxPoints, 1)) * 100));
  return (
    <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

function DriverRow({ driver, maxPoints }: { driver: DriverStanding; maxPoints: number }) {
  const color = getTeamColor(driver.constructorId);
  return (
    <div className="px-4 py-2.5 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-2.5">
        <PositionBadge position={driver.position} />

        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
          {driver.imageUrl ? (
            <img src={driver.imageUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-500">
              {driver.code}
            </div>
          )}
        </div>

        <span className="text-base font-mono font-bold text-gray-900 w-9 flex-shrink-0">
          {driver.code}
        </span>

        <div className="w-1 h-7 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />

        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-900 truncate leading-tight">
            {driver.driverName}
          </p>
          <p className="text-[11px] text-gray-500 truncate leading-tight">{driver.constructor}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm font-bold text-gray-900 tabular-nums">{driver.points}</span>
          <PointsBar points={driver.points} maxPoints={maxPoints} color={color} />
        </div>
      </div>
    </div>
  );
}

function ConstructorRow({ constructor, maxPoints }: { constructor: ConstructorStanding; maxPoints: number }) {
  const color = getTeamColor(constructor.constructorId);
  return (
    <div className="px-4 py-2.5 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-2.5">
        <PositionBadge position={constructor.position} />

        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
          {constructor.logoUrl ? (
            <img src={constructor.logoUrl} alt="" className="max-h-8 max-w-10 object-contain" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
              {constructor.constructor[0]}
            </div>
          )}
        </div>

        <div className="w-1 h-7 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate leading-tight">
            {constructor.constructor}
          </p>
          <p className="text-[11px] text-gray-500 truncate leading-tight">{constructor.nationality}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm font-bold text-gray-900 tabular-nums">{constructor.points}</span>
          <PointsBar points={constructor.points} maxPoints={maxPoints} color={color} />
        </div>
      </div>
    </div>
  );
}

export default function StandingsTable({
  drivers,
  constructors,
}: {
  drivers: DriverStanding[];
  constructors: ConstructorStanding[];
}) {
  if (drivers.length === 0 && constructors.length === 0) return null;

  const maxDriverPoints = Math.max(...drivers.map((d) => d.points), 1);
  const maxConstructorPoints = Math.max(...constructors.map((c) => c.points), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {drivers.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-sm text-gray-900">Driver Standings</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {drivers.map((driver) => (
              <DriverRow key={driver.driverId} driver={driver} maxPoints={maxDriverPoints} />
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
              <ConstructorRow
                key={constructor.constructorId}
                constructor={constructor}
                maxPoints={maxConstructorPoints}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
