import Parser from "rss-parser";
import { NEWS_SOURCES } from "./sources";
import type { RawArticle } from "@/types";
import { extractContent } from "./extractContent";

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; F1-Dashboard/1.0; +https://github.com/f1-dashboard)",
  },
});

function sanitizeHtml(text: string): string {
  return text
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

type RSSItem = {
  title?: string;
  link?: string;
  guid?: string;
  contentSnippet?: string;
  content?: string;
  isoDate?: string;
  pubDate?: string;
  enclosure?: { url?: string };
  categories?: string[];
  "media:content"?: { url?: string };
  "media:thumbnail"?: { url?: string };
};

function extractImageUrl(item: RSSItem): string | null {
  if (item.enclosure?.url) return item.enclosure.url;
  if (item["media:content"]?.url) return item["media:content"].url;
  if (item["media:thumbnail"]?.url) return item["media:thumbnail"].url;
  const content = item.content || item.contentSnippet || "";
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/);
  if (imgMatch) return imgMatch[1];
  return null;
}

function generateArticleId(sourceId: string, url: string): string {
  const hash = url.split("").reduce((acc, c) => {
    return ((acc << 5) - acc + c.charCodeAt(0)) | 0;
  }, 0);
  return `${sourceId}-${Math.abs(hash).toString(36)}`;
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractCategories(item: RSSItem): string[] {
  if (item.categories && Array.isArray(item.categories)) {
    return item.categories;
  }
  return [];
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "unknown";
  }
}

function extractOGImageFromHtml(html: string, articleUrl: string): string | null {
  const patterns = [
    /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i,
    /<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i,
    /<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i,
    /<meta\s+content=["']([^"']+)["']\s+name=["']twitter:image["']/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      const ogUrl = match[1];
      if (ogUrl.startsWith("/")) {
        try {
          const base = new URL(articleUrl);
          return `${base.protocol}//${base.host}${ogUrl}`;
        } catch {
          return ogUrl;
        }
      }
      return ogUrl;
    }
  }
  return null;
}

function needsHtmlFetch(article: RawArticle): boolean {
  const short = (article.content || "").replace(/<[^>]+>/g, "").trim().split(/\s+/).filter(Boolean).length < 40;
  return !article.imageUrl || short;
}

async function fetchAndEnrich(article: RawArticle): Promise<void> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(article.url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; F1-Dashboard/1.0)",
        "Accept": "text/html,application/xhtml+xml",
      },
    });
    clearTimeout(timeout);

    if (!response.ok) return;
    const html = await response.text();

    if (!article.imageUrl) {
      article.imageUrl = extractOGImageFromHtml(html, article.url);
    }

    article.fullContent = extractContent(html, article.url);
  } catch {
    // silently fail
  }
}

async function runConcurrent<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrency: number
): Promise<R[]> {
  const results: R[] = [];
  const queue = [...items];

  async function worker(): Promise<void> {
    while (queue.length > 0) {
      const item = queue.shift()!;
      results.push(await fn(item));
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

export async function fetchAllFeeds(): Promise<RawArticle[]> {
  const allArticles: RawArticle[] = [];
  const seenUrls = new Set<string>();

  const results = await Promise.allSettled(
    NEWS_SOURCES.map(async (source) => {
      try {
        const feed = await parser.parseURL(source.rssUrl);
        return (feed.items || []).map((item) => {
          const rssItem = item as RSSItem;
          const url = rssItem.link || rssItem.guid || "";
          if (!url || seenUrls.has(url)) return null;
          seenUrls.add(url);

          return {
            id: generateArticleId(source.id, url),
            sourceId: source.id,
            sourceName: source.name,
            sourceSiteUrl: source.siteUrl,
            sourceTier: source.tier,
            title: rssItem.title || "Untitled",
            description: sanitizeHtml(rssItem.contentSnippet || rssItem.content || "").slice(0, 500),
            content: sanitizeHtml(rssItem.content || rssItem.contentSnippet || ""),
            url,
            imageUrl: extractImageUrl(rssItem),
            publishedAt: rssItem.isoDate || rssItem.pubDate || new Date().toISOString(),
            categories: extractCategories(rssItem),
          } as RawArticle;
        }).filter(Boolean) as RawArticle[];
      } catch (err) {
        console.warn(`Failed to fetch ${source.name}:`, err);
        return [];
      }
    })
  );

  for (const result of results) {
    if (result.status === "fulfilled") {
      allArticles.push(...result.value);
    }
  }

  const articlesToFetch = allArticles.filter(needsHtmlFetch);
  console.log(
    `  → ${allArticles.length} articles fetched (${articlesToFetch.length} need HTML fetch for images/content)`
  );

  if (articlesToFetch.length > 0) {
    await runConcurrent(articlesToFetch, fetchAndEnrich, 5);
    const withOg = allArticles.filter((a) => a.imageUrl).length;
    const withContent = allArticles.filter((a) => a.fullContent).length;
    const imageGain = allArticles.filter((a) => a.imageUrl).length - (allArticles.length - articlesToFetch.filter((a) => !a.imageUrl).length);
    console.log(`  → OG images: ${allArticles.filter((a) => a.imageUrl).length}/${allArticles.length}, full content: ${withContent}/${allArticles.length}`);
  }

  return allArticles.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export { normalizeTitle, sanitizeHtml };
