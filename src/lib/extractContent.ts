function extractTextBetweenTags(html: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = html.match(regex);
  if (match) {
    return match[1]
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
  while ((match = pRegex.exec(html)) !== null) {
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

export function extractContent(html: string, url: string): string {
  for (const tag of ["article", "main"]) {
    const text = extractTextBetweenTags(html, tag);
    if (text.length > 300) return text;
  }

  const pText = extractFromParagraphs(html);
  if (pText.length > 300) return pText;

  // fallback: jsdom + readability
  try {
    const { JSDOM } = require("jsdom");
    const { Readability } = require("@mozilla/readability");
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const result = reader.parse();
    if (result?.textContent) {
      const text = result.textContent.replace(/\s+/g, " ").trim();
      if (text.length > 300) return text;
    }
  } catch {
    // ignore
  }

  return pText || extractTextBetweenTags(html, "body") || "";
}
