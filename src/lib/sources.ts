import type { NewsSource } from "@/types";

export const NEWS_SOURCES: NewsSource[] = [
  {
    id: "formula1-official",
    name: "Formula 1",
    siteUrl: "https://www.formula1.com",
    rssUrl: "https://www.formula1.com/en/latest/all.xml",
    tier: 1,
  },
  {
    id: "bbc-sport",
    name: "BBC Sport",
    siteUrl: "https://www.bbc.com/sport/formula1",
    rssUrl: "https://feeds.bbci.co.uk/sport/formula1/rss.xml",
    tier: 1,
  },
  {
    id: "autosport",
    name: "Autosport",
    siteUrl: "https://www.autosport.com/f1",
    rssUrl: "https://www.autosport.com/f1/rss",
    tier: 1,
  },
  {
    id: "motorsport",
    name: "Motorsport.com",
    siteUrl: "https://www.motorsport.com/f1",
    rssUrl: "https://www.motorsport.com/rss/f1/news/",
    tier: 1,
  },
  {
    id: "the-race",
    name: "The Race",
    siteUrl: "https://www.the-race.com/formula-1",
    rssUrl: "https://www.the-race.com/feed/",
    tier: 1,
  },
  {
    id: "planetf1",
    name: "PlanetF1",
    siteUrl: "https://www.planetf1.com",
    rssUrl: "https://www.planetf1.com/feed",
    tier: 2,
  },
  {
    id: "crashnet",
    name: "Crash.net",
    siteUrl: "https://www.crash.net/f1",
    rssUrl: "https://www.crash.net/rss/f1",
    tier: 2,
  },
  {
    id: "gpblog",
    name: "GP Blog",
    siteUrl: "https://www.gpblog.com",
    rssUrl: "https://www.gpblog.com/en/rss",
    tier: 2,
  },
  {
    id: "racefans",
    name: "Racefans",
    siteUrl: "https://www.racefans.net",
    rssUrl: "https://www.racefans.net/feed/",
    tier: 2,
  },
  {
    id: "f1i",
    name: "F1i",
    siteUrl: "https://f1i.com",
    rssUrl: "https://f1i.com/feed",
    tier: 2,
  },
];
