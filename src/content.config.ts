import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const articles = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./articles" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date().nullable().optional(),
    updatedDate: z.coerce.date().nullable().optional(),
    author: z.string().optional(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().optional(),
  }),
});

const process = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./process" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number(),
    movant: z.string(),
    respondent: z.string(),
    stage: z.string(),
    updatedDate: z.coerce.date().nullable().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const termsAndConcepts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./terms-and-concepts-content" }),
  schema: z.object({
    title: z.string(),
    term: z.string(),
    description: z.string(),
    category: z.enum([
      "constitutional-law",
      "procedure",
      "evidence",
      "remedies",
      "qualified-immunity",
      "statute",
      "doctrine",
    ]),
    updatedDate: z.coerce.date().nullable().optional(),
    related: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const cases = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./cases" }),
  schema: z.object({
    title: z.string(),
    citation: z.string(),
    court: z.string(),
    dateDecided: z.coerce.date(),
    updatedDate: z.coerce.date().nullable().optional(),
    docketNumber: z.string(),
    courtlistener: z.string().url().optional(),
    holding: z.string(),
    officers: z
      .array(
        z.object({
          name: z.string(),
          profile: z.string().url().optional(),
        }),
      )
      .optional(),
    tags: z.array(z.string()).optional(),
    cites: z.array(z.string()).optional(),
    citedBy: z.array(z.string()).optional(),
  }),
});

export const collections = { articles, process, termsAndConcepts, cases };
