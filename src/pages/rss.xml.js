import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { articleUrl, byNewest } from "../lib/content";

export async function GET(context) {
  const articles = (await getCollection("articles", ({ data }) => !data.draft)).sort(byNewest);
  return rss({
    title: "小行星 AI 观测站",
    description: "周报、专题与日报：视频之外更完整的 AI 信号档案。",
    site: context.site,
    items: articles.map((article) => ({
      title: article.data.title,
      description: article.data.description,
      pubDate: article.data.publishedAt,
      link: articleUrl(article),
      categories: [article.data.kind, ...article.data.tags]
    }))
  });
}
