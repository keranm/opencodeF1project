const wikiCache = new Map<string, string | null>();

export async function fetchWikipediaThumbnail(wikiUrl: string): Promise<string | null> {
  const title = wikiUrl.replace(/^https?:\/\/en\.wikipedia\.org\/wiki\//, "").split("#")[0];
  if (!title) return null;
  if (wikiCache.has(title)) return wikiCache.get(title) ?? null;

  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      { next: { revalidate: 86400 }, headers: { "Accept": "application/json" } },
    );
    if (!res.ok) {
      wikiCache.set(title, null);
      return null;
    }
    const data = await res.json();
    const thumb = data?.thumbnail?.source ?? null;
    wikiCache.set(title, thumb);
    return thumb;
  } catch {
    wikiCache.set(title, null);
    return null;
  }
}

export function clearWikiCache(): void {
  wikiCache.clear();
}
