import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const articles = await getCollection("articles", ({ data }) => !data.draft);
  const sorted = articles.sort((a, b) => {
    const da = a.data.pubDate ? new Date(a.data.pubDate).getTime() : 0;
    const db = b.data.pubDate ? new Date(b.data.pubDate).getTime() : 0;
    return db - da;
  });

  return rss({
    title: "section1983.org",
    description:
      "A free survival guide for pro se § 1983 civil rights litigants.",
    site: context.site ?? "https://www.section1983.org",
    items: sorted.map((article) => ({
      title: article.data.title,
      description: article.data.description,
      pubDate: article.data.pubDate ?? undefined,
      link: `/articles/${article.id}/`,
      author: article.data.author ?? "Institute for Police Conduct, Inc.",
    })),
    customData: "<language>en-us</language>",
  });
}
