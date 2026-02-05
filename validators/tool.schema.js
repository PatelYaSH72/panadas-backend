import { z } from "zod";

export const ToolSchema = z.object({
  name: z.string().min(2).max(50),
  rating: z.number().min(1).max(5),
  pricing: z.enum(["Free", "Freemium", "Paid", "Open Source"]),
  category: z.array(z.string()).min(1),
  whatItDoes: z.string().min(30).max(500),

  howToUse: z.array(z.string()).optional(),       
  techRelevance: z.array(z.string()).optional(), 

  officialLink: z.string().url(),
  docLink: z.string().url().optional(),
  tutorialLink: z.string().url().optional(),
  githubLink: z.string().url().optional(),
  image: z.string().url().nullable().optional(),

});
