import type { CollectionEntry } from "astro:content";

export type Article = CollectionEntry<"articles">;

export const kindMeta = {
  weekly: { label: "AI 周报", path: "/weekly/", index: "WEEKLY" },
  topic: { label: "专题深解读", path: "/stories/", index: "DEEP DIVE" },
  daily: { label: "AI 日报", path: "/daily/", index: "DAILY" }
} as const;

export function articleUrl(article: Article): string {
  const base = kindMeta[article.data.kind].path;
  return `${base}${article.data.slug}/`;
}

export function byNewest(a: Article, b: Article): number {
  return b.data.publishedAt.getTime() - a.data.publishedAt.getTime();
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Shanghai"
  }).format(date).replaceAll("/", ".");
}
