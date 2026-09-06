/**
 * Data for the case-library hub pages (by state, by circuit, by topic) and
 * for mapping case tags to related terms and articles.
 *
 * Every slug referenced here is filtered against the live content
 * collections at build time, so a stale slug degrades to "no link" rather
 * than a broken one.
 */

export const STATE_LABELS: Record<string, string> = {
  alabama: "Alabama",
  alaska: "Alaska",
  arizona: "Arizona",
  arkansas: "Arkansas",
  california: "California",
  colorado: "Colorado",
  connecticut: "Connecticut",
  delaware: "Delaware",
  florida: "Florida",
  georgia: "Georgia",
  hawaii: "Hawaii",
  idaho: "Idaho",
  illinois: "Illinois",
  indiana: "Indiana",
  iowa: "Iowa",
  kansas: "Kansas",
  kentucky: "Kentucky",
  louisiana: "Louisiana",
  maine: "Maine",
  maryland: "Maryland",
  massachusetts: "Massachusetts",
  michigan: "Michigan",
  minnesota: "Minnesota",
  mississippi: "Mississippi",
  missouri: "Missouri",
  montana: "Montana",
  nebraska: "Nebraska",
  nevada: "Nevada",
  "new-hampshire": "New Hampshire",
  "new-jersey": "New Jersey",
  "new-mexico": "New Mexico",
  "new-york": "New York",
  "north-carolina": "North Carolina",
  "north-dakota": "North Dakota",
  ohio: "Ohio",
  oklahoma: "Oklahoma",
  oregon: "Oregon",
  pennsylvania: "Pennsylvania",
  "puerto-rico": "Puerto Rico",
  "rhode-island": "Rhode Island",
  "south-carolina": "South Carolina",
  "south-dakota": "South Dakota",
  tennessee: "Tennessee",
  texas: "Texas",
  utah: "Utah",
  vermont: "Vermont",
  virginia: "Virginia",
  washington: "Washington",
  "west-virginia": "West Virginia",
  wisconsin: "Wisconsin",
  wyoming: "Wyoming",
};

/** Federal circuit each state's district courts sit in. */
export const STATE_CIRCUIT: Record<string, string> = {
  maine: "first",
  massachusetts: "first",
  "new-hampshire": "first",
  "puerto-rico": "first",
  "rhode-island": "first",
  connecticut: "second",
  "new-york": "second",
  vermont: "second",
  delaware: "third",
  "new-jersey": "third",
  pennsylvania: "third",
  maryland: "fourth",
  "north-carolina": "fourth",
  "south-carolina": "fourth",
  virginia: "fourth",
  "west-virginia": "fourth",
  louisiana: "fifth",
  mississippi: "fifth",
  texas: "fifth",
  kentucky: "sixth",
  michigan: "sixth",
  ohio: "sixth",
  tennessee: "sixth",
  illinois: "seventh",
  indiana: "seventh",
  wisconsin: "seventh",
  arkansas: "eighth",
  iowa: "eighth",
  minnesota: "eighth",
  missouri: "eighth",
  nebraska: "eighth",
  "north-dakota": "eighth",
  "south-dakota": "eighth",
  alaska: "ninth",
  arizona: "ninth",
  california: "ninth",
  hawaii: "ninth",
  idaho: "ninth",
  montana: "ninth",
  nevada: "ninth",
  oregon: "ninth",
  washington: "ninth",
  colorado: "tenth",
  kansas: "tenth",
  "new-mexico": "tenth",
  oklahoma: "tenth",
  utah: "tenth",
  wyoming: "tenth",
  alabama: "eleventh",
  florida: "eleventh",
  georgia: "eleventh",
};

export interface CircuitMeta {
  slug: string;
  label: string;
  shortLabel: string;
  description: string;
}

export const CIRCUITS: Record<string, CircuitMeta> = {
  "supreme-court": {
    slug: "supreme-court",
    label: "U.S. Supreme Court",
    shortLabel: "Supreme Court",
    description:
      "Supreme Court decisions bind every federal and state court. These are the cases that define Section 1983 itself: qualified immunity, Monell, probable cause, excessive force, and the pleading standard.",
  },
  first: {
    slug: "first",
    label: "First Circuit",
    shortLabel: "1st Cir.",
    description:
      "The First Circuit covers Maine, Massachusetts, New Hampshire, Rhode Island, and Puerto Rico. Its published decisions bind the federal district courts in those places.",
  },
  second: {
    slug: "second",
    label: "Second Circuit",
    shortLabel: "2d Cir.",
    description:
      "The Second Circuit covers Connecticut, New York, and Vermont. Its published decisions bind the federal district courts in those states.",
  },
  third: {
    slug: "third",
    label: "Third Circuit",
    shortLabel: "3d Cir.",
    description:
      "The Third Circuit covers Delaware, New Jersey, Pennsylvania, and the Virgin Islands. Its published decisions bind the federal district courts in those places.",
  },
  fourth: {
    slug: "fourth",
    label: "Fourth Circuit",
    shortLabel: "4th Cir.",
    description:
      "The Fourth Circuit covers Maryland, North Carolina, South Carolina, Virginia, and West Virginia. Its published decisions bind the federal district courts in those states.",
  },
  fifth: {
    slug: "fifth",
    label: "Fifth Circuit",
    shortLabel: "5th Cir.",
    description:
      "The Fifth Circuit covers Texas, Louisiana, and Mississippi. Its published decisions bind every federal district court in those three states, and it is the circuit that decides most of the cases in this library. It reads qualified immunity strictly and requires a complaint to plead clearly established law with specificity.",
  },
  sixth: {
    slug: "sixth",
    label: "Sixth Circuit",
    shortLabel: "6th Cir.",
    description:
      "The Sixth Circuit covers Kentucky, Michigan, Ohio, and Tennessee. Its published decisions bind the federal district courts in those states.",
  },
  seventh: {
    slug: "seventh",
    label: "Seventh Circuit",
    shortLabel: "7th Cir.",
    description:
      "The Seventh Circuit covers Illinois, Indiana, and Wisconsin. Its published decisions bind the federal district courts in those states.",
  },
  eighth: {
    slug: "eighth",
    label: "Eighth Circuit",
    shortLabel: "8th Cir.",
    description:
      "The Eighth Circuit covers Arkansas, Iowa, Minnesota, Missouri, Nebraska, North Dakota, and South Dakota. Its published decisions bind the federal district courts in those states.",
  },
  ninth: {
    slug: "ninth",
    label: "Ninth Circuit",
    shortLabel: "9th Cir.",
    description:
      "The Ninth Circuit covers Alaska, Arizona, California, Hawaii, Idaho, Montana, Nevada, Oregon, Washington, Guam, and the Northern Mariana Islands. Its published decisions bind the federal district courts in those places.",
  },
  tenth: {
    slug: "tenth",
    label: "Tenth Circuit",
    shortLabel: "10th Cir.",
    description:
      "The Tenth Circuit covers Colorado, Kansas, New Mexico, Oklahoma, Utah, and Wyoming. Its published decisions bind the federal district courts in those states.",
  },
  eleventh: {
    slug: "eleventh",
    label: "Eleventh Circuit",
    shortLabel: "11th Cir.",
    description:
      "The Eleventh Circuit covers Alabama, Florida, and Georgia. Its published decisions bind the federal district courts in those states.",
  },
  dc: {
    slug: "dc",
    label: "D.C. Circuit",
    shortLabel: "D.C. Cir.",
    description:
      "The D.C. Circuit covers the District of Columbia. Its published decisions bind the federal district court there.",
  },
};

const ORDINAL_TO_SLUG: Record<string, string> = {
  first: "first",
  second: "second",
  third: "third",
  fourth: "fourth",
  fifth: "fifth",
  sixth: "sixth",
  seventh: "seventh",
  eighth: "eighth",
  ninth: "ninth",
  tenth: "tenth",
  eleventh: "eleventh",
  "d.c.": "dc",
  dc: "dc",
};

const DISTRICT_STATE_PATTERNS: [RegExp, string][] = [
  [/\bTex(as|\.)\b/i, "texas"],
  [/\bLouisiana\b|\bLa\.\b/i, "louisiana"],
  [/\bMississippi\b|\bMiss\.\b/i, "mississippi"],
  [/\bNew York\b|\bN\.Y\.\b/i, "new-york"],
  [/\bMaryland\b|\bMd\.\b/i, "maryland"],
  [/\bSouth Carolina\b|\bS\.C\.\b/i, "south-carolina"],
  [/\bCalifornia\b|\bCal\.\b/i, "california"],
  [/\bIllinois\b|\bIll\.\b/i, "illinois"],
  [/\bFlorida\b|\bFla\.\b/i, "florida"],
  [/\bGeorgia\b|\bGa\.\b/i, "georgia"],
  [/\bOhio\b/i, "ohio"],
  [/\bMichigan\b|\bMich\.\b/i, "michigan"],
  [/\bPennsylvania\b|\bPa\.\b/i, "pennsylvania"],
  [/\bVirginia\b|\bVa\.\b/i, "virginia"],
  [/\bColorado\b|\bColo\.\b/i, "colorado"],
  [/\bArizona\b|\bAriz\.\b/i, "arizona"],
];

/**
 * Resolve a case to a circuit-hub slug from its court string.
 * Returns undefined for state courts and anything unrecognized.
 */
export function circuitForCourt(court: string): string | undefined {
  const c = court.trim();
  if (
    /^(u\.s\.|united states) supreme court$/i.test(c) ||
    /^supreme court of the united states$/i.test(c)
  ) {
    return "supreme-court";
  }
  const circuitMatch = c.match(
    /\b(First|Second|Third|Fourth|Fifth|Sixth|Seventh|Eighth|Ninth|Tenth|Eleventh|D\.C\.)\s+Circuit\b/i,
  );
  if (circuitMatch) {
    return ORDINAL_TO_SLUG[circuitMatch[1].toLowerCase()];
  }
  if (/district (court|of)/i.test(c) && !/court of appeals,/i.test(c)) {
    // A federal district court. Skip Texas state "Court of Appeals, First District".
    if (/court of appeals/i.test(c)) return undefined;
    for (const [pattern, state] of DISTRICT_STATE_PATTERNS) {
      if (pattern.test(c)) return STATE_CIRCUIT[state];
    }
  }
  return undefined;
}

export interface TopicMeta {
  slug: string;
  label: string;
  title: string;
  description: string;
  intro: string;
  tags: string[];
  articles: string[];
}

export const TOPICS: TopicMeta[] = [
  {
    slug: "excessive-force",
    label: "Excessive Force",
    title: "Excessive Force Cases",
    description:
      "Section 1983 excessive force cases: when force during an arrest or stop violated the Fourth Amendment, how courts apply the Graham factors, and when officers lost qualified immunity.",
    intro:
      "Excessive force is judged under the Fourth Amendment's objective reasonableness standard. Courts weigh the severity of the suspected offense, whether the person posed an immediate threat, and whether the person was resisting or fleeing. Since Barnes v. Felix, the inquiry covers the whole encounter, not just the moment force was used. These cases show where the line has been drawn, and which officers lost immunity for crossing it.",
    tags: ["beaten-by-police", "excessive-force", "not-resisting"],
    articles: [
      "excessive-force-claim-elements-and-graham-factors-in-a-section-1983-case",
      "how-to-plead-clearly-established-law-in-a-section-1983-complaint",
      "video-evidence-and-your-section-1983-complaint",
      "how-to-write-a-declaration-in-a-section-1983-case",
    ],
  },
  {
    slug: "police-shooting",
    label: "Police Shootings",
    title: "Police Shooting Cases",
    description:
      "Section 1983 cases involving police shootings and deadly force: the Tennessee v. Garner and Graham standards, split-second judgment, and qualified immunity.",
    intro:
      "Deadly force is reasonable only when the officer has probable cause to believe the person poses a significant threat of death or serious injury to the officer or others. These cases show how courts apply that rule to shootings during stops, chases, and mental-health calls, and how often qualified immunity turns on whether a prior case involved similar facts.",
    tags: ["police-shooting", "killed-by-police"],
    articles: [
      "excessive-force-claim-elements-and-graham-factors-in-a-section-1983-case",
      "how-to-research-clearly-established-law-in-a-section-1983-case",
      "how-to-plead-clearly-established-law-in-a-section-1983-complaint",
    ],
  },
  {
    slug: "taser",
    label: "Taser Use",
    title: "Taser and Stun Gun Cases",
    description:
      "Section 1983 cases about taser use: when tasing a compliant, handcuffed, or nonresisting person is excessive force, and what clearly established law says.",
    intro:
      "Tasers occupy a middle ground in force cases. Courts have repeatedly held that tasing someone who is not resisting, is already restrained, or has stopped resisting is excessive. They have also granted immunity where the person was actively resisting or the law was unsettled on the specific facts. The sequence and timing matter more than the device.",
    tags: ["tased"],
    articles: [
      "excessive-force-claim-elements-and-graham-factors-in-a-section-1983-case",
      "how-to-plead-clearly-established-law-in-a-section-1983-complaint",
    ],
  },
  {
    slug: "false-arrest",
    label: "False Arrest",
    title: "False Arrest Cases",
    description:
      "Section 1983 false arrest cases: probable cause, arguable probable cause, alternative offenses under Devenpeck, and how courts decide whether an arrest violated the Fourth Amendment.",
    intro:
      "A false arrest claim turns on whether the officer had probable cause for any offense based on the facts known at the moment of the seizure. The defense can point to an offense the officer never named. Qualified immunity adds a second question: could a reasonable officer have believed probable cause existed? These cases show both walls, and the facts that got plaintiffs past them.",
    tags: ["wrongful-arrest", "probable-cause"],
    articles: [
      "false-arrest-claim-elements-and-defenses-in-a-section-1983-case",
      "sample-section-1983-complaint-for-a-false-arrest-case",
      "how-to-plead-a-false-police-report-or-warrant-affidavit",
      "statute-of-limitations-and-tolling-in-a-section-1983-case",
    ],
  },
  {
    slug: "retaliatory-arrest",
    label: "Retaliatory Arrest",
    title: "First Amendment Retaliation and Retaliatory Arrest Cases",
    description:
      "Section 1983 cases about arrests for speech, criticism, and protest: the Nieves v. Bartlett probable-cause rule, the Gonzalez v. Trevino exception, and Fifth Circuit applications.",
    intro:
      "When an arrest follows criticism of police, the First Amendment claim runs into probable cause. Under Nieves v. Bartlett, probable cause generally defeats the claim unless the plaintiff has objective evidence that similarly situated people who were not engaged in the same speech were not arrested. Gonzalez v. Trevino widened what counts as objective evidence. These cases show the rule, the exception, and how the Fifth Circuit applies both.",
    tags: ["arrested-for-speech", "retaliation", "first-amendment"],
    articles: [
      "retaliation-retaliatory-arrest-after-speech-or-recording",
      "retaliation-probable-cause-arguable-probable-cause-and-nieves",
      "false-arrest-claim-elements-and-defenses-in-a-section-1983-case",
    ],
  },
  {
    slug: "right-to-record",
    label: "Right to Record Police",
    title: "Right to Record Police Cases",
    description:
      "Section 1983 cases about arrests for filming or photographing police: Turner v. Driver and the First Amendment right to record, subject to time, place, and manner limits.",
    intro:
      "The Fifth Circuit held in Turner v. Driver that the First Amendment protects the right to record police in public, subject to reasonable time, place, and manner restrictions, and that the right is clearly established going forward. Arrests for filming still turn on whether the officer had probable cause for some other offense, such as interference or obstruction. These cases show how that fight plays out.",
    tags: ["arrested-for-filming"],
    articles: [
      "retaliation-retaliatory-arrest-after-speech-or-recording",
      "retaliation-probable-cause-arguable-probable-cause-and-nieves",
      "video-evidence-and-your-section-1983-complaint",
    ],
  },
  {
    slug: "unlawful-search",
    label: "Unlawful Searches",
    title: "Unlawful Search Cases",
    description:
      "Section 1983 cases about searches without a warrant or probable cause: homes, vehicles, phones, and persons, and the exceptions officers rely on.",
    intro:
      "A search without a warrant is presumptively unreasonable unless an exception applies: consent, exigent circumstances, search incident to arrest, plain view, or the automobile exception. These cases show how courts test the officer's claimed exception against the facts known at the time, and when a search that went beyond the exception cost the officer immunity.",
    tags: ["searched-illegally"],
    articles: [
      "terry-stop-and-stop-and-frisk-claims-in-a-section-1983-case",
      "how-to-get-police-records-before-filing-a-section-1983-case",
    ],
  },
  {
    slug: "traffic-stop",
    label: "Traffic Stops",
    title: "Traffic Stop Cases",
    description:
      "Section 1983 cases arising from traffic stops: reasonable suspicion, prolonged detention, pretext under Whren, and force during roadside encounters.",
    intro:
      "A traffic stop is a seizure. It needs reasonable suspicion of a violation to begin and must end when the mission of the stop is complete, unless something observed during the stop supplies new suspicion. These cases show how courts analyze stops that were extended, escalated, or used as a pretext, and what happened to the officers involved.",
    tags: ["traffic-stop", "stopped-for-no-reason"],
    articles: [
      "terry-stop-and-stop-and-frisk-claims-in-a-section-1983-case",
      "false-arrest-claim-elements-and-defenses-in-a-section-1983-case",
    ],
  },
  {
    slug: "false-police-report",
    label: "False Reports and Affidavits",
    title: "False Police Report and Warrant Affidavit Cases",
    description:
      "Section 1983 cases about false statements in police reports, probable-cause affidavits, and testimony: Franks v. Delaware, fabricated evidence, and malicious prosecution.",
    intro:
      "A false statement in an official account can support several claims: a Franks challenge to a warrant, a due-process fabricated-evidence claim, or a Fourth Amendment malicious-prosecution claim. Each has its own elements and its own accrual date. These cases show how courts test the challenged statement against the record and decide whether the corrected account would still have supported probable cause.",
    tags: ["lied-in-report", "lied-to-get-warrant", "malicious-prosecution"],
    articles: [
      "how-to-plead-a-false-police-report-or-warrant-affidavit",
      "how-to-get-police-records-before-filing-a-section-1983-case",
      "statute-of-limitations-and-tolling-in-a-section-1983-case",
    ],
  },
  {
    slug: "jail-medical-care",
    label: "Jail Medical Care",
    title: "Jail Medical Care and Deliberate Indifference Cases",
    description:
      "Section 1983 cases about denied or delayed medical care in jail: deliberate indifference, pretrial detainees under the Fourteenth Amendment, intake screening, and suicide.",
    intro:
      "A pretrial detainee's medical-care claim requires a serious medical need and an official who knew of the risk and disregarded it. The Fifth Circuit separates claims about a specific jailer's act from claims about the jail's conditions and customs, which run against the county under Monell. These cases show both tracks, including the intake-screening failures that have produced county liability.",
    tags: ["ignored-medical-needs", "mental-health-crisis", "jail-suicide"],
    articles: [
      "jail-due-process-after-arrest",
      "monell-what-a-monell-claim-is-and-how-to-plead-it",
      "fifth-amendment-questioning-after-you-invoke",
    ],
  },
  {
    slug: "jail-and-prison",
    label: "Jail and Prison",
    title: "Jail and Prison Cases",
    description:
      "Section 1983 cases brought by pretrial detainees and prisoners: conditions of confinement, force by guards, medical care, and the PLRA's exhaustion and screening rules.",
    intro:
      "Prisoners and pretrial detainees bring a large share of Section 1983 cases, and they face rules others do not: PLRA exhaustion, screening, and the three-strikes limit on filing without paying the fee. Convicted prisoners' claims run under the Eighth Amendment. Pretrial detainees' claims run under the Fourteenth. These cases cover both.",
    tags: ["prisoner-case", "jail-conditions"],
    articles: [
      "jail-due-process-after-arrest",
      "in-forma-pauperis-the-ifp-trap-in-a-section-1983-case",
      "who-you-cannot-sue-under-section-1983",
    ],
  },
  {
    slug: "prolonged-detention",
    label: "Prolonged Detention",
    title: "Prolonged and Wrongful Detention Cases",
    description:
      "Section 1983 cases about being held too long: detention after charges were dropped, mistaken identity, delayed hearings, and the Baker v. McCollan limits.",
    intro:
      "Detention that continues after its legal basis ends can violate the Fourth or Fourteenth Amendment. But detention on a valid warrant is not a due-process violation just because the wrong person was arrested, and jailers have no general duty to investigate claims of innocence. These cases mark the boundary between an actionable over-detention and one the courts will not reach.",
    tags: ["held-too-long"],
    articles: [
      "jail-due-process-after-arrest",
      "false-arrest-claim-elements-and-defenses-in-a-section-1983-case",
    ],
  },
  {
    slug: "qualified-immunity",
    label: "Qualified Immunity",
    title: "Qualified Immunity Cases",
    description:
      "Section 1983 cases where qualified immunity was decided: the two-prong test, clearly established law, Pearson sequencing, and the Fifth Circuit's specificity requirement.",
    intro:
      "Qualified immunity shields an officer unless the plaintiff shows a constitutional violation and shows that the right was clearly established at the time, at the level of the specific conduct. Courts may decide the second prong first. These cases show how the doctrine has been built and applied, and they are the raw material for the clearly-established-law research every plaintiff has to do.",
    tags: ["qualified-immunity"],
    articles: [
      "how-to-research-clearly-established-law-in-a-section-1983-case",
      "how-to-plead-clearly-established-law-in-a-section-1983-complaint",
      "why-hasnt-qualified-immunity-been-overturned",
      "how-courts-cut-back-section-1983-with-court-made-rules",
    ],
  },
  {
    slug: "qualified-immunity-denied",
    label: "Qualified Immunity Denied",
    title: "Cases Where Qualified Immunity Was Denied",
    description:
      "Section 1983 cases where officers lost qualified immunity: the facts that made the violation obvious or the law clearly established, from the Supreme Court and the Fifth Circuit.",
    intro:
      "These are the cases plaintiffs cite. Each one is a set of facts on which a court held that a reasonable officer would have known the conduct was unlawful. When your facts resemble one of these, you have your lead case for prong two. Read the facts, not just the holding, and be ready to explain the differences as well as the similarities.",
    tags: ["qi-defeated"],
    articles: [
      "how-to-research-clearly-established-law-in-a-section-1983-case",
      "how-to-plead-clearly-established-law-in-a-section-1983-complaint",
      "how-to-stress-test-your-case-before-filing",
    ],
  },
  {
    slug: "dismissed-cases",
    label: "Dismissed Cases",
    title: "Section 1983 Cases That Were Dismissed",
    description:
      "Section 1983 cases dismissed at the pleading stage or on summary judgment, and why: group pleading, missing elements, probable cause, qualified immunity, and Monell failures.",
    intro:
      "Losing cases teach as much as winning ones. Each of these was dismissed for a reason a court wrote down: a complaint that lumped defendants together, a missing element, probable cause for some offense, a right that was not clearly established, or a Monell theory with no policy behind it. Read them to see what the court needed and did not get.",
    tags: ["case-dismissed"],
    articles: [
      "how-to-write-a-section-1983-complaint",
      "how-the-defense-will-try-to-shrink-reframe-or-kill-your-section-1983-case",
      "how-to-amend-a-section-1983-complaint",
      "how-to-review-your-own-section-1983-filing-before-you-file",
    ],
  },
  {
    slug: "plaintiff-won",
    label: "Plaintiff Victories",
    title: "Section 1983 Cases the Plaintiff Won",
    description:
      "Section 1983 cases where the plaintiff prevailed: verdicts, reversals, and rulings that sent the case forward, with the facts and pleading that made the difference.",
    intro:
      "Plaintiffs do win Section 1983 cases. These are the ones in this library where the court ruled for the plaintiff on the merits, reversed a dismissal, or let a jury verdict stand. Look at what the record contained and how the claims were framed. The pattern repeats: specific facts, one officer at a time, tied to an element.",
    tags: ["plaintiff-won"],
    articles: [
      "you-will-probably-lose-you-might-sue-anyway-heres-why-that-still-matters",
      "damages-and-how-to-document-them-in-a-section-1983-case",
      "how-to-stress-test-your-case-before-filing",
    ],
  },
  {
    slug: "survived-dismissal",
    label: "Survived Dismissal",
    title: "Complaints That Survived a Motion to Dismiss",
    description:
      "Section 1983 cases where the complaint survived Rule 12: what the pleading contained, how the court applied Iqbal and Twombly, and how qualified immunity was handled at the pleading stage.",
    intro:
      "Surviving the motion to dismiss is the first real test of a Section 1983 case, and in the Fifth Circuit it means pleading specific facts for each officer and addressing qualified immunity in the complaint. These cases show complaints that met that bar. They are the best models for how to structure your own.",
    tags: ["survived-mtd"],
    articles: [
      "how-to-write-a-section-1983-complaint",
      "sample-response-to-a-motion-to-dismiss-in-a-section-1983-case",
      "how-to-plead-clearly-established-law-in-a-section-1983-complaint",
    ],
  },
  {
    slug: "pleading-standards",
    label: "Pleading Standards",
    title: "Pleading Standard Cases",
    description:
      "The cases that define how a Section 1983 complaint must be written: Twombly, Iqbal, Johnson v. City of Shelby, Erickson v. Pardus, and the Fifth Circuit's qualified-immunity specificity rule.",
    intro:
      "A complaint must state a plausible claim, not just a possible one. Legal conclusions are disregarded and facts are credited. A pro se complaint is read generously, but not so generously that a missing element is excused. These are the cases courts cite when they decide whether your complaint goes forward.",
    tags: ["how-to-plead"],
    articles: [
      "how-to-write-a-section-1983-complaint",
      "how-to-plead-clearly-established-law-in-a-section-1983-complaint",
      "monell-what-a-monell-claim-is-and-how-to-plead-it",
      "how-to-use-ai-in-your-section-1983-case",
    ],
  },
  {
    slug: "monell",
    label: "Monell and Cities",
    title: "Monell and Municipal Liability Cases",
    description:
      "Section 1983 cases against cities and counties: policy, custom, final policymaker, ratification, failure to train, and the moving-force requirement under Monell.",
    intro:
      "A city is liable under Section 1983 only for its own policy or custom, not for an employee's act. These cases show the six paths to municipal liability and what each requires: a written policy, a widespread practice with notice, a final policymaker's decision, ratification, or a training or supervision failure amounting to deliberate indifference, each tied to the injury as its moving force.",
    tags: ["suing-the-city", "monell-liability"],
    articles: [
      "monell-what-a-monell-claim-is-and-how-to-plead-it",
      "monell-pleading-multiple-theories",
      "monell-finding-evidence-before-discovery",
      "monell-why-claims-get-dismissed-at-rule-12",
    ],
  },
  {
    slug: "landmark",
    label: "Landmark Decisions",
    title: "Landmark Section 1983 Decisions",
    description:
      "The Supreme Court and circuit decisions that built Section 1983 doctrine: Monroe, Monell, Harlow, Graham, Heck, Pearson, Iqbal, Nieves, and the cases that narrowed the statute.",
    intro:
      "Section 1983 says a person who violates constitutional rights under color of law shall be liable. Almost everything else about the statute was decided by courts. These are the decisions that created qualified immunity, limited municipal liability, defined excessive force, and set the pleading standard. Read them to understand why the law looks the way it does.",
    tags: ["landmark"],
    articles: [
      "how-courts-cut-back-section-1983-with-court-made-rules",
      "section-1983-is-getting-harder-to-win",
      "why-hasnt-qualified-immunity-been-overturned",
    ],
  },
  {
    slug: "conspiracy",
    label: "Conspiracy",
    title: "Section 1983 Conspiracy Cases",
    description:
      "Section 1983 and Section 1985 conspiracy cases: pleading an agreement, the intracorporate conspiracy doctrine, and why presence alone is not enough.",
    intro:
      "A conspiracy claim requires an agreement to violate rights and an actual violation. Courts dismiss conspiracy counts that infer agreement from the fact that officers were present together or work for the same department. These cases show what facts have supported the inference and how the intracorporate conspiracy doctrine has been applied.",
    tags: ["conspiracy"],
    articles: [
      "how-to-name-defendants-in-a-section-1983-lawsuit",
      "who-you-cannot-sue-under-section-1983",
    ],
  },
  {
    slug: "body-camera",
    label: "Body Camera Video",
    title: "Body Camera Video Cases",
    description:
      "Section 1983 cases where body-camera or dash-camera video decided the outcome: Scott v. Harris, video at the pleading stage, and what ambiguous footage means for summary judgment.",
    intro:
      "Video can end a case or save one. Under Scott v. Harris, a court may disregard a party's account that the video clearly contradicts. But most police video is partial, and ambiguous footage is a jury question. These cases show how courts have treated recordings at each stage, and why what you say the video shows has to survive the judge watching it.",
    tags: ["body-camera", "video-evidence"],
    articles: [
      "video-evidence-and-your-section-1983-complaint",
      "how-to-get-police-records-before-filing-a-section-1983-case",
      "how-to-write-a-declaration-in-a-section-1983-case",
    ],
  },
  {
    slug: "federal-officers",
    label: "Federal Officers",
    title: "Cases Against Federal Officers",
    description:
      "Bivens and related cases against federal agents: why Section 1983 does not reach federal officers, and how narrow the Bivens remedy has become.",
    intro:
      "Section 1983 applies to people acting under color of state law. Federal officers are sued, if at all, under Bivens, a judge-made remedy the Supreme Court has refused to extend to almost any new context since 1980. These cases show what remains of it and why suing a federal agent is a different problem from suing a city police officer.",
    tags: ["federal-agents"],
    articles: [
      "who-you-cannot-sue-under-section-1983",
      "how-to-name-defendants-in-a-section-1983-lawsuit",
    ],
  },
  {
    slug: "due-process",
    label: "Due Process",
    title: "Due Process Cases",
    description:
      "Section 1983 due process cases: pretrial detainees, fabricated evidence, substantive due process and the shocks-the-conscience test, and when the Fourth Amendment displaces it.",
    intro:
      "Due process claims fill the gaps the Fourth and Eighth Amendments leave: a pretrial detainee's conditions, fabricated evidence used in a prosecution, conduct that shocks the conscience. Where a more specific amendment applies, courts use that instead. These cases show where due process still does work in a police case.",
    tags: ["due-process", "fourteenth-amendment"],
    articles: [
      "jail-due-process-after-arrest",
      "how-to-plead-a-false-police-report-or-warrant-affidavit",
    ],
  },
];

/** Case tag -> term slugs that explain it. Filtered against the collection at build. */
export const CASE_TAG_TO_TERMS: Record<string, string[]> = {
  "beaten-by-police": ["excessive-force", "graham-factors"],
  "excessive-force": ["excessive-force", "graham-factors"],
  "not-resisting": ["excessive-force", "graham-factors"],
  tased: ["excessive-force", "graham-factors"],
  "police-shooting": ["deadly-force", "excessive-force"],
  "killed-by-police": ["deadly-force", "excessive-force"],
  "wrongful-arrest": ["false-arrest", "probable-cause"],
  "probable-cause": ["probable-cause", "false-arrest"],
  "arrested-for-speech": ["first-amendment-retaliation", "probable-cause"],
  retaliation: ["first-amendment-retaliation"],
  "first-amendment": ["first-amendment-retaliation"],
  "arrested-for-filming": [
    "right-to-record-police",
    "first-amendment-retaliation",
  ],
  "searched-illegally": [
    "warrant-requirement",
    "fourth-amendment",
    "consent-search",
  ],
  "traffic-stop": ["terry-stop", "reasonable-suspicion"],
  "stopped-for-no-reason": ["terry-stop", "reasonable-suspicion"],
  "lied-in-report": ["franks-violation", "malicious-prosecution"],
  "lied-to-get-warrant": ["franks-violation", "warrant-requirement"],
  "malicious-prosecution": ["malicious-prosecution", "favorable-termination"],
  "ignored-medical-needs": ["deliberate-indifference", "pretrial-detention"],
  "mental-health-crisis": ["deliberate-indifference", "excessive-force"],
  "jail-suicide": ["deliberate-indifference", "pretrial-detention"],
  "jail-conditions": ["pretrial-detention", "eighth-amendment"],
  "prisoner-case": ["eighth-amendment", "plra", "deliberate-indifference"],
  "held-too-long": ["pretrial-detention", "false-imprisonment"],
  "qualified-immunity": ["qualified-immunity", "clearly-established-law"],
  "qi-defeated": ["qualified-immunity", "clearly-established-law"],
  "case-dismissed": ["motion-to-dismiss", "plausibility-pleading"],
  "survived-mtd": ["motion-to-dismiss", "plausibility-pleading"],
  "how-to-plead": ["plausibility-pleading", "amended-complaint"],
  "suing-the-city": ["monell-liability", "custom", "final-policymaker"],
  "monell-liability": ["monell-liability", "moving-force-causation"],
  conspiracy: ["section-1983-conspiracy", "intracorporate-conspiracy-doctrine"],
  "failure-to-intervene": ["failure-to-intervene"],
  "body-camera": ["body-camera-footage", "spoliation"],
  "video-evidence": ["body-camera-footage"],
  "due-process": ["fourteenth-amendment", "substantive-due-process"],
  "fourteenth-amendment": ["fourteenth-amendment"],
  "fourth-amendment": ["fourth-amendment", "seizure"],
  "fifth-amendment": ["state-action"],
  "eighth-amendment": ["eighth-amendment"],
  "sovereign-immunity": ["sovereign-immunity", "eleventh-amendment"],
  "absolute-immunity": ["absolute-immunity", "prosecutorial-immunity"],
  "official-capacity": ["official-capacity", "individual-capacity"],
  "federal-agents": ["bivens-action"],
  "heck-v-humphrey": ["heck-doctrine", "favorable-termination"],
  "heck-bar": ["heck-doctrine"],
  "brady-violation": ["brady-violation"],
  "punitive-damages": ["punitive-damages"],
  "attorneys-fees": ["attorneys-fees", "section-1988"],
  "summary-judgment": ["summary-judgment"],
  "pro-se": ["pro-se"],
  "respondeat-superior": ["respondeat-superior", "supervisory-liability"],
  "destroyed-evidence": ["spoliation"],
  "coerced-confession": ["state-of-mind"],
  "school-case": ["state-action"],
  "section-1988": ["section-1988", "attorneys-fees"],
  "color-of-law": ["color-of-law", "state-action"],
  "under-color-of-law": ["color-of-law"],
  "nominal-damages": ["nominal-damages"],
  "individual-capacity": ["individual-capacity"],
  "prosecutorial-immunity": ["prosecutorial-immunity", "absolute-immunity"],
  "first-amendment-retaliation": ["first-amendment-retaliation"],
  "substantive-due-process": ["substantive-due-process"],
  "service-of-process": ["service-of-process"],
};

/** Case tag -> article tags that mean the same thing. */
export const CASE_TAG_TO_ARTICLE_TAGS: Record<string, string[]> = {
  "beaten-by-police": ["excessive-force"],
  "not-resisting": ["excessive-force"],
  tased: ["excessive-force"],
  "police-shooting": ["excessive-force"],
  "killed-by-police": ["excessive-force"],
  "wrongful-arrest": ["false-arrest", "probable-cause"],
  "arrested-for-speech": [
    "first-amendment-retaliation",
    "retaliatory-arrest",
    "retaliation",
  ],
  "arrested-for-filming": [
    "first-amendment-retaliation",
    "recording-police",
    "retaliatory-arrest",
  ],
  "suing-the-city": ["monell", "municipal-liability"],
  "qi-defeated": ["qualified-immunity", "clearly-established-law"],
  "case-dismissed": ["motion-to-dismiss", "filing", "drafting"],
  "survived-mtd": ["motion-to-dismiss", "drafting"],
  "how-to-plead": ["drafting", "complaint", "filing"],
  "prisoner-case": ["jail", "pretrial-detention"],
  "ignored-medical-needs": ["jail", "deliberate-indifference"],
  "lied-in-report": ["fabricated-evidence", "franks"],
  "lied-to-get-warrant": ["franks", "warrant"],
  "body-camera": ["video", "body-camera", "evidence"],
  "heck-v-humphrey": ["heck"],
  "traffic-stop": ["terry-stop"],
  "searched-illegally": ["fourth-amendment"],
};

export function topicsForTags(tags: string[]): TopicMeta[] {
  const set = new Set(tags);
  return TOPICS.filter((topic) => topic.tags.some((tag) => set.has(tag)));
}

export function statesForTags(tags: string[]): string[] {
  return tags.filter((tag) => tag in STATE_LABELS);
}
