export function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function containsPhrase(haystack: string, needle: string) {
  if (!needle.trim()) return false;
  return new RegExp(`\\b${escapeRegExp(needle.toLowerCase())}\\b`, "i").test(
    haystack,
  );
}

export function countSharedTags(a: string[], b: string[]) {
  const set = new Set(a);
  return b.filter((tag) => set.has(tag)).length;
}

/**
 * Take the top `base` scored items, then keep adding while the next item is
 * still a strong match, up to `max`.
 */
export function selectRelatedEntries<T extends { score: number }>(
  items: T[],
  {
    base = 4,
    max = 10,
    strongScore = 4,
  }: { base?: number; max?: number; strongScore?: number } = {},
) {
  if (items.length <= base) return items;

  let count = Math.min(base, items.length);
  while (
    count < items.length &&
    count < max &&
    items[count].score >= strongScore
  ) {
    count += 1;
  }

  return items.slice(0, count);
}

export interface RelatedLink {
  href: string;
  label: string;
  description: string;
}
