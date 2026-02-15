#!/usr/bin/env node
/**
 * Remap case tags from lawyer-speak to layperson-friendly categories.
 *
 * Three categories:
 * 1. What the police did (behavior)
 * 2. What happened in court (outcome)
 * 3. What kind of case (type)
 *
 * Tags that are just case names (e.g., "graham-v-connor") are dropped.
 */

import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

const casesDir = join(import.meta.dirname, "..", "cases");

// Map old tags → new tags. Tags not in the map are dropped.
const tagMap = {
  // === POLICE BEHAVIOR ===
  "excessive-force": "beaten-by-police",
  "deadly-force": "police-shooting",
  taser: "tased",
  handcuffing: "handcuff-injury",
  "de-minimis-injury": "handcuff-injury",
  "false-arrest": "wrongful-arrest",
  "unlawful-arrest": "wrongful-arrest",
  "warrantless-arrest": "wrongful-arrest",
  "custodial-arrest": "wrongful-arrest",
  "pretextual-arrest": "wrongful-arrest",
  "mistaken-identity": "wrongful-arrest",
  "first-amendment-retaliation": "retaliation",
  "retaliatory-arrest": "retaliation",
  retaliation: "retaliation",
  "right-to-record-police": "arrested-for-filming",
  "right-to-record": "arrested-for-filming",
  "police-criticism": "arrested-for-speech",
  "free-speech": "arrested-for-speech",
  "protest-rights": "arrested-for-speech",
  "street-preaching": "arrested-for-speech",
  "search-and-seizure": "searched-illegally",
  "warrantless-entry": "searched-illegally",
  "no-knock-warrant": "raided-wrong-house",
  "fabrication-of-evidence": "lied-in-report",
  "false-statements": "lied-in-report",
  "franks-violation": "lied-to-get-warrant",
  "warrant-affidavit": "lied-to-get-warrant",
  "spoliation-of-evidence": "destroyed-evidence",
  "body-camera-footage": "body-camera",
  "conditions-of-confinement": "jail-conditions",
  "jail-conditions": "jail-conditions",
  "pretrial-detention": "held-too-long",
  "unlawful-detention": "held-too-long",
  "denial-of-medical-treatment": "ignored-medical-needs",
  "failure-to-treat": "ignored-medical-needs",
  "in-custody-death": "killed-by-police",
  "jail-suicide": "killed-by-police",
  "fleeing-suspect": "police-shooting",
  "high-speed-chase": "police-chase",
  "high-speed-pursuit": "police-chase",
  "police-chase": "police-chase",
  "police-dog": "used-dog",
  "hog-tie-restraint": "restrained",
  "coerced-confession": "coerced-confession",
  "traffic-stop": "traffic-stop",
  "pretextual-stop": "traffic-stop",
  "stop-and-frisk": "stopped-for-no-reason",
  "investigatory-stop": "stopped-for-no-reason",
  "terry-stop": "stopped-for-no-reason",
  "pat-down-search": "stopped-for-no-reason",
  "passive-resistance": "not-resisting",
  "mental-health": "mental-health-crisis",
  "mental-illness": "mental-health-crisis",
  "sexual-assault": "sexual-assault",
  "domestic-violence": "domestic-violence",

  // === COURT OUTCOME ===
  "qualified-immunity": "qualified-immunity",
  "clearly-established-law": "qualified-immunity",
  // Note: qi-defeated vs qi-granted requires reading the holding — handled below
  "motion-to-dismiss": "case-dismissed",
  "summary-judgment": "summary-judgment",
  "malicious-prosecution": "malicious-prosecution",
  "interlocutory-appeal": "appealed",
  "punitive-damages": "punitive-damages",
  "attorneys-fees": "attorneys-fees",
  "pro-se": "pro-se",
  "pro-se-litigation": "pro-se",

  // === CASE TYPE ===
  "municipal-liability": "suing-the-city",
  "monell-liability": "suing-the-city",
  monell: "suing-the-city",
  "failure-to-train": "suing-the-city",
  "failure-to-supervise": "suing-the-city",
  "supervisory-liability": "suing-the-city",
  "deliberate-indifference": "suing-the-city",
  custom: "suing-the-city",
  "custom-and-policy": "suing-the-city",
  "custom-or-practice": "suing-the-city",
  "official-policy": "suing-the-city",
  policymaker: "suing-the-city",
  "final-policymaker": "suing-the-city",
  "final-policymaking-authority": "suing-the-city",
  "hiring-decisions": "suing-the-city",
  "hiring-liability": "suing-the-city",
  ratification: "suing-the-city",
  "pleading-standards": "how-to-plead",
  "plausibility-pleading": "how-to-plead",
  "amended-complaint": "how-to-plead",
  "leave-to-amend": "how-to-plead",
  "rule-12": "how-to-plead",
  "rule-12b6": "how-to-plead",
  "section-1983": "section-1983",
  "section-1983-conspiracy": "conspiracy",
  conspiracy: "conspiracy",
  "intracorporate-conspiracy": "conspiracy",
  "intracorporate-conspiracy-doctrine": "conspiracy",
  "fourth-amendment": "fourth-amendment",
  "first-amendment": "first-amendment",
  "fourteenth-amendment": "fourteenth-amendment",
  "eighth-amendment": "eighth-amendment",
  "fifth-amendment": "fifth-amendment",
  "due-process": "due-process",
  "substantive-due-process": "due-process",
  "procedural-due-process": "due-process",
  "probable-cause": "probable-cause",
  "reasonable-suspicion": "reasonable-suspicion",
  "color-of-law": "color-of-law",
  "bystander-liability": "failure-to-intervene",
  "failure-to-intervene": "failure-to-intervene",
  "video-evidence": "video-evidence",
  "eleventh-amendment": "sovereign-immunity",
  "sovereign-immunity": "sovereign-immunity",
  "official-capacity": "official-capacity",
  "individual-capacity": "individual-capacity",
  "official-immunity": "sovereign-immunity",
  "governmental-immunity": "sovereign-immunity",
  "respondeat-superior": "respondeat-superior",
  "brady-violation": "brady-violation",
  miranda: "miranda",
  "miranda-rights": "miranda",
  suppression: "evidence-suppressed",
  "exclusionary-rule": "evidence-suppressed",
  schools: "school-case",
  "school-resource-officer": "school-case",
  education: "school-case",
  "prisoner-rights": "prisoner-case",
  plra: "prisoner-case",
  "equal-protection": "equal-protection",
  bivens: "federal-agents",
  "bivens-action": "federal-agents",
  "national-security": "federal-agents",
  "border-patrol": "federal-agents",
  "foreign-agents": "federal-agents",
};

// These SCOTUS landmark cases get a "landmark" tag
const landmarks = new Set([
  "ashcroft-v-iqbal",
  "bell-atlantic-corp-v-twombly",
  "graham-v-connor",
  "monell-v-dep-t-of-soc-servs",
  "tennessee-v-garner",
  "terry-v-ohio",
  "pearson-v-callahan",
  "hope-v-pelzer",
  "city-of-canton-v-harris",
  "heck-v-humphrey",
  "nieves-v-bartlett",
  "ziglar-v-abbasi",
  "scott-v-harris",
  "taylor-v-riojas",
  "pierson-v-ray",
  "tolan-v-cotton",
  "atwater-v-city-of-lago-vista",
  "kentucky-v-graham",
  "connick-v-thompson",
  "owen-v-city-of-independence",
  "will-v-michigan-department-of-state-police",
  "johnson-v-city-of-shelby",
  "mullenix-v-luna",
  "malley-v-briggs",
  "franks-v-delaware",
  "city-of-st-louis-v-praprotnik",
  "county-of-sacramento-v-lewis",
  "illinois-v-gates",
  "whren-v-united-states",
  "new-york-times-co-v-sullivan",
  "brosseau-v-haugen",
  "gonzalez-v-trevino",
  "devenpeck-v-alford",
  "leatherman-v-tarrant-cnty",
  "foman-v-davis",
  "city-of-newport-v-fact-concerts-inc",
  "beck-v-ohio",
  "sibron-v-new-york",
  "stone-v-powell",
  "pennsylvania-v-muniz",
  "bd-of-comm-rs-of-bryan-cnty-v-brown-brown",
  "piotrowski-v-city-of-houston",
  "turner-v-driver",
  "cole-v-carson",
  "morgan-v-swanson",
  "baker-v-mccollan",
]);

let modified = 0;
const files = readdirSync(casesDir).filter((f) => f.endsWith(".md"));

for (const file of files) {
  const slug = file.replace(".md", "");
  const path = join(casesDir, file);
  const content = readFileSync(path, "utf-8");

  // Parse frontmatter
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) continue;

  const frontmatter = match[1];
  const body = content.slice(match[0].length);

  // Extract current tags
  const tagMatch = frontmatter.match(/tags:\n((?:\s+-\s+"[^"]*"\n)*)/);
  if (!tagMatch) continue;

  const oldTags = [...tagMatch[1].matchAll(/"([^"]*)"/g)].map((m) => m[1]);

  // Remap
  const newTagSet = new Set();
  for (const tag of oldTags) {
    if (tagMap[tag]) {
      newTagSet.add(tagMap[tag]);
    } else if (
      tag.match(/-v-/) ||
      tag.match(
        /^(cases|bd-of-comm|city-of-|county-of-|in-re-|estate-of-|lone-star|martin-k|nelson-radio|new-york-times|united-states|texas-dps|young-v|zarnow|spencer-v)/,
      )
    ) {
      // Drop case-name tags
    } else if (
      [
        "excessive-force",
        "municipal-liability",
        "monell-liability",
        "motion-to-dismiss",
        "plausibility-pleading",
        "warrantless-arrest",
        "free-speech",
        "taser",
        "totality-of-circumstances",
      ].includes(tag)
    ) {
      // Already mapped above, skip stragglers
    }
    // Drop unmapped tags silently
  }

  // Add landmark if applicable
  if (landmarks.has(slug)) {
    newTagSet.add("landmark");
  }

  const newTags = [...newTagSet].sort();

  // Check if changed
  const oldSorted = [...new Set(oldTags)].sort();
  if (JSON.stringify(newTags) === JSON.stringify(oldSorted)) continue;

  // Rebuild tags section
  const newTagYaml =
    newTags.length > 0
      ? `tags:\n${newTags.map((t) => `  - "${t}"`).join("\n")}\n`
      : `tags: []\n`;

  const newFrontmatter = frontmatter.replace(
    /tags:\n(?:\s+-\s+"[^"]*"\n)*/,
    newTagYaml,
  );

  const newContent = `---\n${newFrontmatter}\n---${body}`;
  writeFileSync(path, newContent);
  modified++;
}

console.log(`Modified ${modified} of ${files.length} case files`);
