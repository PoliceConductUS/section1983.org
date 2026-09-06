import {
  CIRCUITS,
  STATE_LABELS,
  TOPICS,
  circuitForCourt,
  type TopicMeta,
} from "./case-hubs";

export interface HubCase {
  id: string;
  tags: string[];
  court: string;
}

export interface HubIndex {
  /** state slug -> case ids, only states that meet the minimum */
  states: Map<string, string[]>;
  /** circuit slug -> case ids, only circuits that meet the minimum */
  circuits: Map<string, string[]>;
  /** topic slug -> case ids, only topics with at least one case */
  topics: Map<string, string[]>;
  /** case id -> circuit slug (all cases, regardless of hub minimum) */
  caseCircuit: Map<string, string | undefined>;
}

export const STATE_HUB_MIN = 3;
export const CIRCUIT_HUB_MIN = 3;

/**
 * Build the hub membership tables once per build. Pages that link to hubs
 * use the same index, so a link never points at a hub that was not built.
 */
export function buildHubIndex(cases: HubCase[]): HubIndex {
  const states = new Map<string, string[]>();
  const circuits = new Map<string, string[]>();
  const topics = new Map<string, string[]>();
  const caseCircuit = new Map<string, string | undefined>();

  for (const c of cases) {
    for (const tag of c.tags) {
      if (tag in STATE_LABELS) {
        states.set(tag, [...(states.get(tag) ?? []), c.id]);
      }
    }
    const circuit = circuitForCourt(c.court);
    caseCircuit.set(c.id, circuit);
    if (circuit && circuit in CIRCUITS) {
      circuits.set(circuit, [...(circuits.get(circuit) ?? []), c.id]);
    }
    const tagSet = new Set(c.tags);
    for (const topic of TOPICS) {
      if (topic.tags.some((t) => tagSet.has(t))) {
        topics.set(topic.slug, [...(topics.get(topic.slug) ?? []), c.id]);
      }
    }
  }

  for (const [k, v] of [...states])
    if (v.length < STATE_HUB_MIN) states.delete(k);
  for (const [k, v] of [...circuits])
    if (v.length < CIRCUIT_HUB_MIN) circuits.delete(k);

  return { states, circuits, topics, caseCircuit };
}

export function topicMeta(slug: string): TopicMeta | undefined {
  return TOPICS.find((t) => t.slug === slug);
}

export interface HubLink {
  href: string;
  label: string;
  count: number;
  kind: "state" | "circuit" | "topic";
}

/** Hub links for one case: its states, its circuit, and its topics, only where a hub exists. */
export function hubLinksForCase(c: HubCase, index: HubIndex): HubLink[] {
  const links: HubLink[] = [];
  for (const tag of c.tags) {
    if (index.states.has(tag)) {
      links.push({
        href: `/cases/state/${tag}/`,
        label: STATE_LABELS[tag],
        count: index.states.get(tag)!.length,
        kind: "state",
      });
    }
  }
  const circuit = index.caseCircuit.get(c.id);
  if (circuit && index.circuits.has(circuit)) {
    links.push({
      href: `/cases/circuit/${circuit}/`,
      label: CIRCUITS[circuit].label,
      count: index.circuits.get(circuit)!.length,
      kind: "circuit",
    });
  }
  const tagSet = new Set(c.tags);
  for (const topic of TOPICS) {
    if (topic.tags.some((t) => tagSet.has(t)) && index.topics.has(topic.slug)) {
      links.push({
        href: `/cases/topic/${topic.slug}/`,
        label: topic.label,
        count: index.topics.get(topic.slug)!.length,
        kind: "topic",
      });
    }
  }
  return links;
}
