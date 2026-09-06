const SITE_NAME = "section1983.org";
const MAX_DESCRIPTION_LENGTH = 155;

/**
 * Normalize a page title for the <title> tag and social cards.
 * Searchers type "section 1983", not "§ 1983", so the title tag uses the
 * spelled-out form even when the on-page H1 keeps the section symbol.
 */
export function seoTitle(title: string): string {
  return title
    .replace(/§\s?1983/g, "Section 1983")
    .replace(/§\s?(\d)/g, "Section $1")
    .replace(/\s+/g, " ")
    .trim();
}

export function fullTitle(title: string): string {
  const normalized = seoTitle(title);
  if (normalized.toLowerCase().endsWith(SITE_NAME)) return normalized;
  return `${normalized} | ${SITE_NAME}`;
}

/**
 * Add "in a Section 1983 Case" to short, context-free titles such as
 * "Venue" or "Tolling" so the title tag carries the site's core keyword.
 */
export function contextualTitle(title: string, suffix: string): string {
  if (/1983/.test(title)) return title;
  if (title.length > 40) return title;
  return `${title} ${suffix}`;
}

/**
 * Cut a meta description at a sentence, clause, or word boundary so it
 * fits the ~155 character snippet budget.
 */
export function truncateDescription(
  text: string | undefined,
  maxLength = MAX_DESCRIPTION_LENGTH,
): string | undefined {
  if (!text) return text;
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;

  const sentenceBreak = normalized.lastIndexOf(". ", maxLength);
  if (sentenceBreak >= 90) {
    return normalized.slice(0, sentenceBreak + 1);
  }

  const clauseBreaks = [
    normalized.lastIndexOf("; ", maxLength),
    normalized.lastIndexOf(", ", maxLength),
    normalized.lastIndexOf(" — ", maxLength),
  ].filter((index) => index >= 90);

  const bestClauseBreak = Math.max(-1, ...clauseBreaks);
  if (bestClauseBreak >= 90) {
    return `${normalized.slice(0, bestClauseBreak).trim()}.`;
  }

  const wordBreak = normalized.lastIndexOf(" ", maxLength - 1);
  if (wordBreak >= 90) {
    return `${normalized.slice(0, wordBreak).trim()}...`;
  }

  return `${normalized.slice(0, maxLength - 3).trim()}...`;
}

const CASE_TOPIC_LABELS: [string, string][] = [
  ["excessive-force", "Excessive Force"],
  ["beaten-by-police", "Excessive Force"],
  ["police-shooting", "Police Shooting"],
  ["killed-by-police", "Deadly Force"],
  ["tased", "Taser Use"],
  ["wrongful-arrest", "False Arrest"],
  ["malicious-prosecution", "Malicious Prosecution"],
  ["arrested-for-speech", "Retaliatory Arrest"],
  ["arrested-for-filming", "Right to Record"],
  ["retaliation", "First Amendment Retaliation"],
  ["first-amendment-retaliation", "First Amendment Retaliation"],
  ["searched-illegally", "Unlawful Search"],
  ["traffic-stop", "Traffic Stop"],
  ["stopped-for-no-reason", "Terry Stop"],
  ["probable-cause", "Probable Cause"],
  ["reasonable-suspicion", "Reasonable Suspicion"],
  ["suing-the-city", "Monell Liability"],
  ["monell-liability", "Monell Liability"],
  ["how-to-plead", "Pleading Standards"],
  ["ignored-medical-needs", "Medical Neglect"],
  ["jail-conditions", "Jail Conditions"],
  ["prisoner-case", "Prisoner Rights"],
  ["school-case", "Student Rights"],
  ["due-process", "Due Process"],
  ["conspiracy", "Conspiracy"],
  ["failure-to-intervene", "Failure to Intervene"],
  ["brady-violation", "Brady Violation"],
  ["lied-to-get-warrant", "Warrant Fraud"],
  ["sovereign-immunity", "Sovereign Immunity"],
  ["absolute-immunity", "Absolute Immunity"],
  ["heck-v-humphrey", "Heck Bar"],
  ["heck-bar", "Heck Bar"],
  ["attorneys-fees", "Attorney's Fees"],
  ["punitive-damages", "Punitive Damages"],
];

const CASE_OUTCOME_LABELS: [string, string][] = [
  ["qi-defeated", "QI Denied"],
  ["plaintiff-won", "Plaintiff Won"],
  ["survived-mtd", "Survived Dismissal"],
  ["case-dismissed", "Dismissed"],
  ["qualified-immunity", "Qualified Immunity"],
];

function courtLabel(citation: string, court: string): string | undefined {
  const match = citation.match(/\(([^)]*)\)\s*$/);
  const parenthetical = match?.[1]?.trim();
  if (!parenthetical) return undefined;
  if (/^\d{4}$/.test(parenthetical) && /supreme/i.test(court)) {
    return `U.S. ${parenthetical}`;
  }
  return parenthetical.replace(/\s+/g, " ");
}

/**
 * Build a case-page title such as
 * "Adams v. Metiva (6th Cir. 1994): Excessive Force, QI Denied".
 * Topics are appended only while the title stays within the snippet budget.
 */
export function caseTitle(
  name: string,
  citation: string,
  court: string,
  tags: string[] | undefined,
  maxLength = 60,
): string {
  const label = courtLabel(citation, court);
  let base = label ? `${name} (${label})` : name;

  const tagSet = new Set(tags ?? []);
  const labels: string[] = [];
  const topic = CASE_TOPIC_LABELS.find(([tag]) => tagSet.has(tag));
  if (topic) labels.push(topic[1]);
  const outcome = CASE_OUTCOME_LABELS.find(([tag]) => tagSet.has(tag));
  if (outcome && outcome[1] !== topic?.[1]) labels.push(outcome[1]);

  const chosen: string[] = [];
  for (const candidate of labels) {
    const attempt = `${base}: ${[...chosen, candidate].join(", ")}`;
    if (attempt.length <= maxLength) chosen.push(candidate);
  }

  if (chosen.length === 0 && labels.length > 0 && base.length < maxLength - 8) {
    // Always try to carry at least one topic, even if it runs a little long.
    chosen.push(labels[0]);
  }

  return chosen.length > 0 ? `${base}: ${chosen.join(", ")}` : base;
}
