import type { RawArticle, ArticleCategory } from "@/types";

const DRIVERS = [
  "verstappen", "hamilton", "leclerc", "norris", "sainz",
  "russell", "alonso", "piastri", "stroll", "gasly",
  "ocon", "tsunoda", "albon", "bottas", "hulkenberg",
  "magnussen", "ricciardo", "lawson", "colapinto", "bearman",
  "antonelli", "doohan", "hadjar", "bortoleto",
];

const TEAMS = [
  "red bull", "mercedes", "ferrari", "mclaren", "aston martin",
  "alpine", "williams", "rb", "haas", "sauber",
  "racing bulls", "alphatauri", "alpine f1",
];

const RACES = [
  "grand prix", "gp", "australian", "australia", "chinese", "china",
  "japanese", "japan", "bahrain", "saudi arabia", "saudi",
  "miami", "emilia romagna", "imola", "monaco", "catalunya",
  "spanish", "spain", "canadian", "canada", "austrian", "austria",
  "silverstone", "british", "britain", "hungarian", "hungary",
  "belgian", "belgium", "dutch", "netherlands", "monza",
  "italian", "italy", "azerbaijan", "baku", "singapore",
  "united states", "usa", "mexico", "mexican", "brazilian",
  "brazil", "las vegas", "qatar", "abu dhabi",
  "sprint", "qualifying", "practice", "fp1", "fp2", "fp3",
  "race", "race day", "pre-season", "testing",
];

export function categorizeArticle(article: RawArticle): ArticleCategory {
  const text = `${article.title} ${article.description} ${article.categories.join(" ")}`.toLowerCase();

  const hasDriver = DRIVERS.some((d) => text.includes(d));
  const hasTeam = TEAMS.some((t) => text.includes(t));
  const hasRace = RACES.some((r) => text.includes(r));

  if (hasDriver && !hasTeam && !hasRace) return "driver-news";
  if (hasTeam && !hasRace && !hasDriver) return "team-news";
  if (hasRace) return "race-news";
  if (hasDriver) return "driver-news";
  if (hasTeam) return "team-news";

  return "general";
}
