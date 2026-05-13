import type { DriverStanding, ConstructorStanding, RaceCalendarEntry } from "@/types";

const CURRENT_SEASON = 2026;

interface JolpicaDriverStanding {
  position: string;
  Driver: {
    givenName: string;
    familyName: string;
    nationality: string;
  };
  Constructors: Array<{
    name: string;
  }>;
  points: string;
  wins: string;
}

interface JolpicaConstructorStanding {
  position: string;
  Constructor: {
    name: string;
    nationality: string;
  };
  points: string;
  wins: string;
}

interface JolpicaRace {
  round: string;
  raceName: string;
  Circuit: {
    circuitName: string;
    Location: {
      locality: string;
      country: string;
    };
  };
  date: string;
  time: string;
  Results?: Array<{
    Driver: {
      givenName: string;
      familyName: string;
    };
  }>;
}

interface JolpicaResponse {
  MRData?: {
    StandingsTable?: {
      StandingsLists?: Array<{
        DriverStandings?: JolpicaDriverStanding[];
        ConstructorStandings?: JolpicaConstructorStanding[];
      }>;
    };
    RaceTable?: {
      Races?: JolpicaRace[];
    };
  };
}

const BASE_URL = "https://api.jolpi.ca/ergast/f1";

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      next: { revalidate: 21600 },
      headers: { "Accept": "application/json" },
    });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export async function fetchDriverStandings(): Promise<DriverStanding[]> {
  const url = `${BASE_URL}/${CURRENT_SEASON}/driverStandings`;
  const data = await fetchJson<JolpicaResponse>(url);

  if (!data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings) {
    return [];
  }

  return data.MRData.StandingsTable.StandingsLists[0].DriverStandings.map(
    (entry): DriverStanding => ({
      position: parseInt(entry.position, 10),
      driverName: `${entry.Driver.givenName} ${entry.Driver.familyName}`,
      driverNationality: entry.Driver.nationality,
      constructor: entry.Constructors[0]?.name || "Unknown",
      points: parseInt(entry.points, 10),
      wins: parseInt(entry.wins, 10),
    })
  );
}

export async function fetchConstructorStandings(): Promise<ConstructorStanding[]> {
  const url = `${BASE_URL}/${CURRENT_SEASON}/constructorStandings`;
  const data = await fetchJson<JolpicaResponse>(url);

  if (!data?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings) {
    return [];
  }

  return data.MRData.StandingsTable.StandingsLists[0].ConstructorStandings.map(
    (entry): ConstructorStanding => ({
      position: parseInt(entry.position, 10),
      constructor: entry.Constructor.name,
      nationality: entry.Constructor.nationality,
      points: parseInt(entry.points, 10),
      wins: parseInt(entry.wins, 10),
    })
  );
}

export async function fetchRaceCalendar(): Promise<RaceCalendarEntry[]> {
  const url = `${BASE_URL}/${CURRENT_SEASON}`;
  const data = await fetchJson<JolpicaResponse>(url);

  if (!data?.MRData?.RaceTable?.Races) {
    return [];
  }

  const now = new Date();
  return data.MRData.RaceTable.Races.map((race): RaceCalendarEntry => {
    const raceDate = new Date(race.date + "T" + (race.time || "00:00:00"));
    return {
      round: parseInt(race.round, 10),
      raceName: race.raceName,
      circuit: race.Circuit.circuitName,
      locality: race.Circuit.Location.locality,
      country: race.Circuit.Location.country,
      date: race.date,
      time: race.time || "00:00:00",
      sessionTimes: { race: `${race.date}T${race.time || "00:00:00"}` },
      isCompleted: raceDate < now,
    };
  });
}

export { CURRENT_SEASON };
