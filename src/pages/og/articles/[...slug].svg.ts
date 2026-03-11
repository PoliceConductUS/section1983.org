import { getCollection } from "astro:content";

export async function getStaticPaths() {
  const articles = await getCollection("articles", ({ data }) => !data.draft);
  return articles.map((article) => ({
    params: { slug: article.id },
    props: { article },
  }));
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function wrapLines(value: string, maxLength: number) {
  const words = value.trim().split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines.slice(0, 4);
}

export async function GET({ props }) {
  const { article } = props;
  const titleLines = wrapLines(article.data.title, 26);
  const description = escapeXml((article.data.description || "").slice(0, 110));
  const tags = (article.data.tags || []).slice(0, 3).map(escapeXml);
  const date = article.data.pubDate
    ? new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date(article.data.pubDate))
    : "Plain-language guide";

  const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#0B1F3A" />
      <stop offset="1" stop-color="#17355F" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" rx="32" fill="url(#bg)" />
  <circle cx="1040" cy="92" r="180" fill="#E7B957" fill-opacity="0.12" />
  <circle cx="180" cy="560" r="220" fill="#E7B957" fill-opacity="0.1" />
  <rect x="72" y="72" width="1056" height="486" rx="24" fill="white" fill-opacity="0.06" stroke="white" stroke-opacity="0.12" />
  <text x="96" y="130" fill="#E7B957" font-family="Georgia, serif" font-size="36" font-weight="700">section1983.org</text>
  <text x="96" y="175" fill="#F7F1E3" font-family="Arial, sans-serif" font-size="22">Plain-language guide to police accountability in federal court</text>
  ${titleLines
    .map(
      (line, index) =>
        `<text x="96" y="${260 + index * 74}" fill="white" font-family="Georgia, serif" font-size="56" font-weight="700">${escapeXml(line)}</text>`,
    )
    .join("")}
  <text x="96" y="500" fill="#D7DEE8" font-family="Arial, sans-serif" font-size="28">${description}</text>
  <text x="96" y="558" fill="#E7B957" font-family="Arial, sans-serif" font-size="24">${escapeXml(date)}</text>
  ${tags
    .map(
      (tag, index) => `
      <rect x="${96 + index * 184}" y="84" width="160" height="34" rx="17" fill="#E7B957" fill-opacity="0.18" />
      <text x="${112 + index * 184}" y="107" fill="#F4D387" font-family="Arial, sans-serif" font-size="18">${tag}</text>`,
    )
    .join("")}
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
