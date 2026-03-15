import { getCollection } from "astro:content";
import type { APIContext } from "astro";

export async function GET(_context: APIContext) {
  const articles = await getCollection("articles", ({ data }) => !data.draft);
  const termsAndConcepts = await getCollection("termsAndConcepts");
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
    ...termsAndConcepts.map((p) => ({
      type: "termsAndConcepts",
      title: p.data.term,
      description: p.data.description ?? "",
      url: `/terms-and-concepts/${p.id}/`,
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
