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

    const slug = generateSlug(primaryArticle.title);
    const clusterId = `${slug}-${Date.now()}`;

    clusters.push({
      id: clusterId,
      slug,
      title: primaryArticle.title,
      summarySentence: getBestDescription(clusterArticles),
      keyPoints: extractKeyPoints(clusterArticles),
      articles: clusterArticles,
      category,
      primaryImageUrl: clusterArticles.find((a) => a.imageUrl)?.imageUrl || getFallbackImage(category),
      sourceCount: clusterArticles.length,
      latestDate: clusterArticles[0].publishedAt,
      youtubeVideos: [],
      condensedContent: condenseArticles(clusterArticles),
    });
  }

  return clusters.sort(
    (a, b) => new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime()
  );
}

function getBestDescription(articles: Article[]): string {
  let best = "";
  let bestScore = -1;

  for (const a of articles) {
    const desc = (a.description || "").trim();
    if (desc.length < 60) continue;

    const titleWords = new Set(a.title.toLowerCase().split(/\s+/).filter(Boolean));
    const descWords = desc.toLowerCase().split(/\s+/).filter(Boolean);
    const overlap = descWords.filter((w) => titleWords.has(w)).length / Math.max(descWords.length, 1);

    const score = Math.min(desc.length / 300, 1) * 0.4 + (1 - overlap) * 0.6;
    if (score > bestScore) {
      bestScore = score;
      best = desc.slice(0, 300);
    }
  }

  return best || (articles[0]?.description.slice(0, 300) ?? "");
}

function extractKeyPoints(articles: Article[]): KeyPoint[] {
  const points: KeyPoint[] = [];
  const seenNorms = new Set<string>();
  const sorted = [...articles].sort((a, b) => a.sourceTier - b.sourceTier);

  for (const article of sorted) {
    if (points.length >= 6) break;

    const body = stripHtml(article.fullContent || article.content || article.description || "");
    const sentences = body
      .split(/[.!?]\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 60 && s.length < 800)
      .filter((s) => {
        const titleWords = new Set(article.title.toLowerCase().split(/\s+/).filter(Boolean));
        const sWords = s.toLowerCase().split(/\s+/).filter(Boolean);
        return sWords.filter((w) => titleWords.has(w)).length / sWords.length < 0.65;
      });

    for (const sentence of sentences) {
      if (points.length >= 6) break;

      const norm = sentence.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
      if (!norm || seenNorms.has(norm)) continue;

      const words = new Set(norm.split(/\s+/).filter(Boolean));
      let isDuplicate = false;
      for (const seen of seenNorms) {
        const seenWords = new Set(seen.split(/\s+/).filter(Boolean));
        const intersection = [...words].filter((w) => seenWords.has(w)).length;
        const union = new Set([...words, ...seenWords]).size;
        if (union > 0 && intersection / union > 0.55) {
          isDuplicate = true;
          break;
        }
      }
      if (isDuplicate) continue;

      seenNorms.add(norm);
      points.push({
        text: sentence,
        sourceName: article.sourceName,
        sourceUrl: article.url,
      });
    }
  }

  return points;
}

function stripHtml(text: string): string {
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

function cleanArticleParagraphs(raw: string, title: string, description: string): string[] {
  const noisePatterns = /(show more tags|sign up for|newsletter|privacy policy|All the latest|Don't miss)/i;
  const datePattern = /\d{1,2}:\d{2}(am|pm)/i;

  return raw
    .split(/\n+/)
    .map((p) => p.replace(/[ \t]+/g, " ").trim())
    .filter(Boolean)
    .filter((p) => {
      const clean = p.replace(/[^a-zA-Z0-9 ]/g, "").trim();
      return clean.split(/\s+/).filter(Boolean).length >= 4;
    })
    .filter((p) => !/^[{<\[\"]/.test(p))
    .filter((p) => !(p.length < 120 && datePattern.test(p)))
    .filter((p) => {
      const pLow = p.toLowerCase();
      const t = title.toLowerCase();
      const d = description.toLowerCase();
      if (t && pLow === t) return false;
      if (d && pLow === d) return false;
      if (t && pLow.startsWith(t.slice(0, 40))) return false;
      if (d && pLow.startsWith(d.slice(0, 40))) return false;
      return true;
    })
    .filter((p) => !(p.length < 120 && noisePatterns.test(p)))
    .slice(0, 50);
}

function getBodyStart(paragraphs: string[]): number {
  const idx = paragraphs.findIndex((p) => p.length > 150);
  return idx === -1 ? 0 : idx;
}

function condenseSingleSource(article: Article): string {
  const raw = stripHtml(article.fullContent || article.content || article.description || "");
  if (raw.length < 60) return (article.description || "").slice(0, 500);

  const paragraphs = cleanArticleParagraphs(raw, article.title, article.description || "");
  const body = paragraphs.slice(getBodyStart(paragraphs));

  if (body.length === 0) return (article.description || "").slice(0, 500);

  let total = 0;
  const included: string[] = [];
  for (const p of body) {
    if (included.length > 0 && total + p.length > 2500) break;
    included.push(p);
    total += p.length;
  }

  return included.join("\n\n") + `\n\n— ${article.sourceName}`;
}

function jaccardOverlap(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().split(/\s+/).filter(Boolean));
  const wordsB = new Set(b.toLowerCase().split(/\s+/).filter(Boolean));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  const intersect = [...wordsA].filter((w) => wordsB.has(w)).length;
  const union = new Set([...wordsA, ...wordsB]).size;
  return intersect / union;
}

function condenseMultiSource(articles: Article[]): string {
  const sorted = [...articles].sort((a, b) => a.sourceTier - b.sourceTier);

  type ParaSource = { text: string; sourceName: string; tier: number };
  const allParas: ParaSource[] = [];

  for (const article of sorted) {
    const raw = stripHtml(article.fullContent || article.content || article.description || "");
    if (raw.length < 60) continue;

    const paragraphs = cleanArticleParagraphs(raw, article.title, article.description || "");
    const body = paragraphs.slice(getBodyStart(paragraphs));

    for (const p of body) {
      const existing = allParas.find((ep) => jaccardOverlap(ep.text, p) > 0.75);
      if (existing) {
        if (article.sourceTier < existing.tier) {
          existing.text = p;
          existing.sourceName = article.sourceName;
          existing.tier = article.sourceTier;
        }
      } else {
        allParas.push({ text: p, sourceName: article.sourceName, tier: article.sourceTier });
      }
    }
  }

  if (allParas.length === 0) {
    return condenseSingleSource(sorted[0]);
  }

  const primarySource = sorted[0];
  const primaryRaw = stripHtml(primarySource.fullContent || primarySource.content || primarySource.description || "");
  const primaryParas = cleanArticleParagraphs(primaryRaw, primarySource.title, primarySource.description || "");
  const primaryBody = primaryParas.slice(getBodyStart(primaryParas));
  const primaryTexts = new Set(primaryBody);

  const ordered = allParas.sort((a, b) => {
    const aIsPrimary = primaryTexts.has(a.text) ? 0 : 1;
    const bIsPrimary = primaryTexts.has(b.text) ? 0 : 1;
    return aIsPrimary - bIsPrimary;
  });

  let total = 0;
  const included: string[] = [];
  const usedSources = new Set<string>();
  for (const p of ordered) {
    if (included.length > 0 && total + p.text.length > 2500) break;
    included.push(p.text);
    total += p.text.length;
    usedSources.add(p.sourceName);
  }

  if (included.length === 0) return (sorted[0]?.description || "").slice(0, 500);

  const sourceList = [...usedSources].slice(0, 5).join(", ");
  return included.join("\n\n") + `\n\n— Sources: ${sourceList}`;
}

function condenseArticles(articles: Article[]): string {
  if (articles.length === 0) return "";
  if (articles.length === 1) return condenseSingleSource(articles[0]);
  return condenseMultiSource(articles);
}

function getDominantCategory(articles: Article[]): ArticleCategory {
  const counts: Record<string, number> = { "general": 0, "driver-news": 0, "team-news": 0, "race-news": 0 };
  for (const a of articles) {
    counts[a.category] = (counts[a.category] || 0) + 1;
  }
  return (Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as ArticleCategory);
}
