import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const characters = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/characters" }),
  schema: z.object({
    name: z.string(),
    streamer: z.string(),
    agency: z.string().default("Independent"),
    faction: z.string(),
    status: z.enum([
      "AT LARGE",
      "IN CUSTODY",
      "DECEASED",
      "ACTIVE DUTY",
      "DISCHARGED",
      "EMPLOYED",
    ]),
    threatLevel: z.number().min(1).max(10),
    mugshot: z.string().optional(),
    youtube: z.string().optional(),
    twitch: z.string().optional(),
    associates: z.array(z.string()).default([]),
  }),
});

const days = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/days" }),
  schema: z.object({
    day: z.number(),
    date: z.string(),
    title: z.string(),
  }),
});

const factions = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/factions" }),
  schema: z.object({
    name: z.string(),
    color: z.string(),
    colorClass: z.string(),
    leader: z.string(),
    type: z.string(),
    members: z.array(z.string()).default([]),
    formerMembers: z.array(z.string()).default([]),
  }),
});

const sightings = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/sightings" }),
  schema: z.object({
    title: z.string(),
    url: z.string(),
    author: z.string().optional(),
    characters: z.array(z.string()).default([]),
    date: z.string().optional(),
  }),
});

export const collections = { characters, days, factions, sightings };
