import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const contentDirs: Record<string, string> = {
  articles: "articles",
  process: "process",
  termsAndConcepts: "terms-and-concepts-content",
  cases: "cases",
};

const gitDateCache = new Map<string, Date | undefined>();

/**
 * Last commit date for a file, or undefined when git is unavailable or the
 * checkout is too shallow to know. Cached per build.
 */
export function getGitLastModified(filePath: string): Date | undefined {
  if (gitDateCache.has(filePath)) return gitDateCache.get(filePath);
  let result: Date | undefined;
  try {
    const output = execFileSync(
      "git",
      ["log", "-1", "--format=%cI", "--", filePath],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      },
    ).trim();
    if (output) {
      const parsed = new Date(output);
      if (!Number.isNaN(parsed.getTime())) result = parsed;
    }
  } catch {
    result = undefined;
  }
  gitDateCache.set(filePath, result);
  return result;
}

/**
 * Best-known modification date for a source file. Prefers git history so
 * CI builds (where every file's mtime is the checkout time) report real
 * dates. Falls back to mtime only outside CI.
 */
export function getFileLastModified(relativePath: string): Date | undefined {
  const fromGit = getGitLastModified(relativePath);
  if (fromGit) return fromGit;
  if (process.env.CI) return undefined;
  try {
    return fs.statSync(path.join(process.cwd(), relativePath)).mtime;
  } catch {
    return undefined;
  }
}

export function getContentUpdatedDate(
  baseDir: string,
  id: string,
  explicitDate?: Date | null,
) {
  if (explicitDate) return explicitDate;
  const resolvedBaseDir = contentDirs[baseDir] || baseDir;
  return getFileLastModified(path.join(resolvedBaseDir, `${id}.md`));
}
