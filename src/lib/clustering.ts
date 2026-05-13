import type { RawArticle, Article, StoryCluster, KeyPoint, ArticleCategory } from "@/types";
import { normalizeTitle } from "./feeds";
import { categorizeArticle } from "./categories";
import { getFallbackImage } from "./fallbacks";

interface TFIDFVector {
  [term: string]: number;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2)
    .filter((t) => !["the", "and", "for", "are", "not", "but", "has", "was", "its"].includes(t));
}

function buildTFIDF(articles: Article[]): Map<string, TFIDFVector> {
  const docFreq = new Map<string, number>();
  const termInDoc = new Map<string, Set<number>>();
  const vectors = new Map<string, TFIDFVector>();

  articles.forEach((article, idx) => {
    const terms = tokenize(article.normalizedTitle);
    const seen = new Set<string>();
    for (const term of terms) {
      termInDoc.set(term, (termInDoc.get(term) || new Set()).add(idx));
      seen.add(term);
    }
    for (const term of seen) {
      docFreq.set(term, (docFreq.get(term) || 0) + 1);
    }
  });

  const N = articles.length;
  articles.forEach((article) => {
    const terms = tokenize(article.normalizedTitle);
    const tf: { [term: string]: number } = {};
    for (const term of terms) {
      tf[term] = (tf[term] || 0) + 1;
    }
    const vector: TFIDFVector = {};
    for (const [term, count] of Object.entries(tf)) {
      const tfVal = count / terms.length;
      const idfVal = Math.log((N + 1) / ((docFreq.get(term) || 0) + 1)) + 1;
      vector[term] = tfVal * idfVal;
    }
    vectors.set(article.id, vector);
  });

  return vectors;
}

function cosineSimilarity(a: TFIDFVector, b: TFIDFVector): number {
  const allTerms = new Set([...Object.keys(a), ...Object.keys(b)]);
  let dotProduct = 0;
  let magA = 0;
  let magB = 0;

  for (const term of allTerms) {
    const aVal = a[term] || 0;
    const bVal = b[term] || 0;
    dotProduct += aVal * bVal;
    magA += aVal * aVal;
    magB += bVal * bVal;
  }

  const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function clusterArticles(rawArticles: RawArticle[]): StoryCluster[] {
  const articles: Article[] = rawArticles.map((a) => ({
    ...a,
    normalizedTitle: normalizeTitle(a.title),
    category: categorizeArticle(a),
  }));

  const vectors = buildTFIDF(articles);
  const assigned = new Set<string>();
  const clusters: StoryCluster[] = [];
  const SIMILARITY_THRESHOLD = 0.5;

  for (let i = 0; i < articles.length; i++) {
    if (assigned.has(articles[i].id)) continue;

    const clusterArticles: Article[] = [articles[i]];
    assigned.add(articles[i].id);

    for (let j = i + 1; j < articles.length; j++) {
      if (assigned.has(articles[j].id)) continue;

      const vecA = vectors.get(articles[i].id);
      const vecB = vectors.get(articles[j].id);
      if (vecA && vecB) {
        const similarity = cosineSimilarity(vecA, vecB);
        if (similarity >= SIMILARITY_THRESHOLD) {
          clusterArticles.push(articles[j]);
          assigned.add(articles[j].id);
        }
      }
    }

    if (clusterArticles.length === 0) continue;

    clusterArticles.sort((a, b) => a.sourceTier - b.sourceTier || new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    const primaryArticle = clusterArticles[0];
    const category = getDominantCategory(clusterArticles);

    const keyPoints: KeyPoint[] = clusterArticles.map((a) => ({
      text: a.description.slice(0, 200) || a.title,
      sourceName: a.sourceName,
      sourceUrl: a.url,
    }));

    const slug = generateSlug(primaryArticle.title);
    const clusterId = `${slug}-${Date.now()}`;

    clusters.push({
      id: clusterId,
      slug,
      title: primaryArticle.title,
      summarySentence: primaryArticle.description.slice(0, 300),
      keyPoints,
      articles: clusterArticles,
      category,
      primaryImageUrl: clusterArticles.find((a) => a.imageUrl)?.imageUrl || getFallbackImage(category),
      sourceCount: clusterArticles.length,
      latestDate: clusterArticles[0].publishedAt,
      youtubeVideos: [],
    });
  }

  return clusters.sort(
    (a, b) => new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime()
  );
}

function getDominantCategory(articles: Article[]): ArticleCategory {
  const counts: Record<string, number> = { "general": 0, "driver-news": 0, "team-news": 0, "race-news": 0 };
  for (const a of articles) {
    counts[a.category] = (counts[a.category] || 0) + 1;
  }
  return (Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as ArticleCategory);
}
