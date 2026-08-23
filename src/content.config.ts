import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const articles = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/articles" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    kind: z.enum(["weekly", "topic", "daily"]),
    slug: z.string(),
    issue: z.string().optional(),
    eyebrow: z.string().optional(),
    tags: z.array(z.string()).default([]),
    cover: z.string().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    readingMinutes: z.number().int().positive().optional(),
    video: z.object({
      bilibili: z.url().optional(),
      youtube: z.url().optional()
    }).optional()
  })
});

export const collections = { articles };
