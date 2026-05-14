function extractTextBetweenTags(html: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = html.match(regex);
  if (match) {
    return match[1]
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x27;/g, "'")
      .replace(/\s+/g, " ")
      .trim();
  }
  return "";
}

function extractFromParagraphs(html: string): string {
  const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  const parts: string[] = [];
  let match;
  const clean = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  while ((match = pRegex.exec(clean)) !== null) {
    const text = match[1]
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x27;/g, "'")
      .replace(/\s+/g, " ")
      .trim();
    if (text.length > 20) parts.push(text);
  }
  return parts.join("\n\n");
}

function extractViaReadability(html: string, url: string): string | null {
  try {
    const { JSDOM } = require("jsdom");
    const { Readability } = require("@mozilla/readability");
    const clean = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
    const dom = new JSDOM(clean, { url });
    const reader = new Readability(dom.window.document);
    const result = reader.parse();
    if (result?.textContent) {
      return result.textContent.replace(/\s+/g, " ").trim();
    }
  } catch {
    // ignore
  }
  return null;
}

export function extractContent(html: string, url: string): string {
  const readability = extractViaReadability(html, url);
  if (readability && readability.length > 300) return readability;

  for (const tag of ["article", "main"]) {
    const text = extractTextBetweenTags(html, tag);
    if (text.length > 300) return text;
  }

  const pText = extractFromParagraphs(html);
  if (pText.length > 300) return pText;

  return pText || extractTextBetweenTags(html, "body") || "";
}
