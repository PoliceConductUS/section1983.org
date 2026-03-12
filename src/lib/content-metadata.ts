import fs from "node:fs";
import path from "node:path";

export function getContentUpdatedDate(
  baseDir: string,
  id: string,
  explicitDate?: Date | null,
) {
  if (explicitDate) return explicitDate;

  const contentDirs: Record<string, string> = {
    articles: "articles",
    process: "process",
    termsAndConcepts: "terms-and-concepts-content",
    cases: "cases",
  };
  const resolvedBaseDir = contentDirs[baseDir] || baseDir;
  const filePath = path.join(process.cwd(), resolvedBaseDir, `${id}.md`);

  try {
    return fs.statSync(filePath).mtime;
  } catch {
    return undefined;
  }
}
