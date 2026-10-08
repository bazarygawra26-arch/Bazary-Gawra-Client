import { z } from 'zod';

export const aiCompareRequestSchema = z.object({
  productIds: z.array(z.string()).min(2, 'At least 2 products required for comparison'),
  language: z.enum(['en', 'ku', 'ckb', 'ar']).default('ku'),
});

export const aiCompareResponseSchema = z.object({
  summary: z.string(),
  summary_ckb: z.string().optional(),
  summary_ar: z.string().optional(),
  recommendation_rationale: z.string(),
  comparison_matrix: z.array(
    z.object({
      feature: z.string(),
      values: z.record(z.string(), z.string()),
    })
  ),
  information_gaps: z.array(
    z.object({
      productId: z.string(),
      productName: z.string(),
      missing: z.array(z.string()),
    })
  ),
});

export type AICompareRequest = z.infer<typeof aiCompareRequestSchema>;
export type AICompareResponse = z.infer<typeof aiCompareResponseSchema>;
