import type { DriverStanding, ConstructorStanding, RaceCalendarEntry } from "@/types";
import { fetchWikipediaThumbnail } from "./wikipedia";

const CURRENT_SEASON = 2026;

interface JolpicaDriverStanding {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Driver: {
    driverId: string;
    code: string;
    url: string;
    givenName: string;
    familyName: string;
    nationality: string;
  };
  Constructors: Array<{
    constructorId: string;
    url: string;
    name: string;
    nationality: string;
  }>;
}

interface JolpicaConstructorStanding {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Constructor: {
    constructorId: string;
    url: string;
    name: string;
    nationality: string;
  };
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
      season: string;
      round: string;
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
      next: { revalidate: 2220 },
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

  const drivers: DriverStanding[] = data.MRData.StandingsTable.StandingsLists[0].DriverStandings.map(
    (entry): DriverStanding => ({
      position: parseInt(entry.position, 10),
      driverName: `${entry.Driver.givenName} ${entry.Driver.familyName}`,
      driverNationality: entry.Driver.nationality,
      constructor: entry.Constructors[0]?.name || "Unknown",
      constructorId: entry.Constructors[0]?.constructorId || "",
      points: parseInt(entry.points, 10),
      wins: parseInt(entry.wins, 10),
      driverId: entry.Driver.driverId,
      code: entry.Driver.code,
    }),
  );

  const thumbnails = await Promise.allSettled(
    drivers.map((d) => {
      const wikiUrl = data.MRData!.StandingsTable!.StandingsLists![0]!.DriverStandings![
        drivers.indexOf(d)
      ]?.Driver?.url;
      return wikiUrl ? fetchWikipediaThumbnail(wikiUrl) : Promise.resolve(null);
    }),
  );

  return drivers.map((d, i) => ({
    ...d,
    imageUrl: thumbnails[i].status === "fulfilled" ? (thumbnails[i].value ?? undefined) : undefined,
  }));
}

export async function fetchConstructorStandings(): Promise<ConstructorStanding[]> {
  const url = `${BASE_URL}/${CURRENT_SEASON}/constructorStandings`;
  const data = await fetchJson<JolpicaResponse>(url);

  if (!data?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings) {
    return [];
  }

  const constructors: ConstructorStanding[] = data.MRData.StandingsTable.StandingsLists[0].ConstructorStandings.map(
    (entry): ConstructorStanding => ({
      position: parseInt(entry.position, 10),
      constructor: entry.Constructor.name,
      nationality: entry.Constructor.nationality,
      constructorId: entry.Constructor.constructorId,
      points: parseInt(entry.points, 10),
      wins: parseInt(entry.wins, 10),
    }),
  );

  const logos = await Promise.allSettled(
    constructors.map((c) => {
      const wikiUrl = data.MRData!.StandingsTable!.StandingsLists![0]!.ConstructorStandings![
        constructors.indexOf(c)
      ]?.Constructor?.url;
      return wikiUrl ? fetchWikipediaThumbnail(wikiUrl) : Promise.resolve(null);
    }),
  );

  return constructors.map((c, i) => ({
    ...c,
    logoUrl: logos[i].status === "fulfilled" ? (logos[i].value ?? undefined) : undefined,
  }));
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
