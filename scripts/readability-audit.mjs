import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const ARTICLES_DIR = path.join(ROOT, "articles");

function stripFrontmatter(source) {
  if (!source.startsWith("---")) return source;
  const end = source.indexOf("\n---", 3);
  if (end === -1) return source;
  return source.slice(end + 4);
}

function stripMarkdown(source) {
  return source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/\|/g, " ")
    .replace(/\*|_/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function splitSentences(text) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function splitWords(text) {
  return (text.toLowerCase().match(/\b[\p{L}\p{N}'-]+\b/gu) || []).filter(
    Boolean,
  );
}

function countSyllables(word) {
  const cleaned = word
    .toLowerCase()
    .replace(/(?:[^a-z]|ed|es|e)$/g, "")
    .replace(/^y/, "");
  const matches = cleaned.match(/[aeiouy]{1,2}/g);
  return Math.max(1, matches ? matches.length : 1);
}

function computeReadability(text) {
  const sentences = splitSentences(text);
  const words = splitWords(text);
  const sentenceCount = Math.max(1, sentences.length);
  const wordCount = Math.max(1, words.length);
  const syllableCount = words.reduce(
    (sum, word) => sum + countSyllables(word),
    0,
  );
  const longWords = words.filter((word) => word.length >= 7).length;
  const avgSentenceLength = wordCount / sentenceCount;
  const fleschKincaidGrade =
    0.39 * avgSentenceLength + 11.8 * (syllableCount / wordCount) - 15.59;
  const fleschReadingEase =
    206.835 - 1.015 * avgSentenceLength - 84.6 * (syllableCount / wordCount);

  return {
    sentenceCount,
    wordCount,
    avgSentenceLength,
    fleschKincaidGrade,
    fleschReadingEase,
    longWordRate: longWords / wordCount,
  };
}

function riskLevel(metrics) {
  let score = 0;
  if (metrics.fleschKincaidGrade > 11) score += 2;
  else if (metrics.fleschKincaidGrade > 9) score += 1;

  if (metrics.avgSentenceLength > 22) score += 2;
  else if (metrics.avgSentenceLength > 18) score += 1;

  if (metrics.longWordRate > 0.22) score += 1;

  if (score >= 4) return "high";
  if (score >= 2) return "medium";
  return "low";
}

function formatNumber(value) {
  return Number.isFinite(value) ? value.toFixed(1) : "0.0";
}

async function main() {
  const files = (await fs.readdir(ARTICLES_DIR))
    .filter((file) => file.endsWith(".md"))
    .sort();

  const results = [];

  for (const file of files) {
    const fullPath = path.join(ARTICLES_DIR, file);
    const source = await fs.readFile(fullPath, "utf8");
    const content = stripMarkdown(stripFrontmatter(source));
    const metrics = computeReadability(content);
    results.push({
      slug: file.replace(/\.md$/, ""),
      ...metrics,
      risk: riskLevel(metrics),
    });
  }

  results.sort((left, right) => {
    if (right.fleschKincaidGrade !== left.fleschKincaidGrade) {
      return right.fleschKincaidGrade - left.fleschKincaidGrade;
    }
    return right.avgSentenceLength - left.avgSentenceLength;
  });

  console.log(
    [
      "slug".padEnd(52),
      "grade".padStart(7),
      "ease".padStart(7),
      "sent".padStart(7),
      "words".padStart(8),
      "avg".padStart(7),
      "long%".padStart(7),
      "risk".padStart(8),
    ].join(" "),
  );

  for (const result of results) {
    console.log(
      [
        result.slug.padEnd(52),
        formatNumber(result.fleschKincaidGrade).padStart(7),
        formatNumber(result.fleschReadingEase).padStart(7),
        String(result.sentenceCount).padStart(7),
        String(result.wordCount).padStart(8),
        formatNumber(result.avgSentenceLength).padStart(7),
        formatNumber(result.longWordRate * 100).padStart(7),
        result.risk.padStart(8),
      ].join(" "),
    );
  }
}

await main();
