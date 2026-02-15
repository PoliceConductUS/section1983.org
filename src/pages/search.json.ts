import { getCollection } from "astro:content";
import type { APIContext } from "astro";

export async function GET(_context: APIContext) {
  const articles = await getCollection("articles", ({ data }) => !data.draft);
  const primer = await getCollection("primer");
  const process = await getCollection("process");
  const cases = await getCollection("cases");

  const index = [
    ...articles.map((a) => ({
      type: "article",
      title: a.data.title,
      description: a.data.description ?? "",
      url: `/articles/${a.id}/`,
      tags: a.data.tags ?? [],
    })),
    ...primer.map((p) => ({
      type: "primer",
      title: p.data.term,
      description: p.data.description ?? "",
      url: `/primer/${p.id}/`,
      tags: [p.data.category],
    })),
    ...process.map((p) => ({
      type: "process",
      title: `Step ${p.data.order}: ${p.data.title}`,
      description: p.data.description ?? "",
      url: `/process/${p.id}/`,
      tags: p.data.tags ?? [],
    })),
    ...cases.map((c) => ({
      type: "case",
      title: c.data.title,
      description: c.data.holding ?? "",
      url: `/cases/${c.id}/`,
      tags: c.data.tags ?? [],
    })),
  ];

  return new Response(JSON.stringify(index), {
    headers: { "Content-Type": "application/json" },
  });
}
