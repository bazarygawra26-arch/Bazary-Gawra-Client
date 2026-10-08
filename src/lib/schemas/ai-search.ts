import { z } from 'zod';

export const aiSearchRequestSchema = z.object({
  query: z.string().min(1, 'Query cannot be empty'),
  language: z.enum(['en', 'ku', 'ckb', 'ar']).default('ku'),
});

export const aiSearchResponseSchema = z.object({
  interpretation: z.object({
    query: z.string(),
    detected_language: z.string(),
    product_type: z.string(),
    target_location: z.string(),
    budget_max: z.number().nullable().optional(),
    currency: z.string().optional(),
    extracted_preferences: z.array(z.string()),
    explanation: z.object({
      en: z.string(),
      ckb: z.string(),
      ar: z.string(),
    }),
  }),
  products: z.array(z.any()),
});

export type AISearchRequest = z.infer<typeof aiSearchRequestSchema>;
export type AISearchResponse = z.infer<typeof aiSearchResponseSchema>;
