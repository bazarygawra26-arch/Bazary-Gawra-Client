import { z } from 'zod';

export const aiImageAnalyzeRequestSchema = z.object({
  image: z.string().min(10, 'Base64 image data is required'),
  mimeType: z.string().default('image/jpeg'),
  locale: z.enum(['en', 'ku', 'ckb', 'ar']).default('ku'),
});

export const aiImageAnalyzeResponseSchema = z.object({
  product_type: z.string(),
  suggested_category: z.string(),
  visible_attributes: z.array(
    z.object({
      key: z.string(),
      value: z.string(),
      confidence: z.enum(['high', 'medium', 'low']),
    })
  ),
  transparency_audit: z.object({
    available_info: z.array(z.string()),
    missing_info: z.array(z.string()),
  }),
  seller_draft: z.object({
    title_draft: z.string(),
    category_slug: z.string(),
    estimated_price_iqd: z.number().optional(),
    required_missing_seller_inputs: z.array(z.string()),
  }),
  search_suggestions: z.array(z.string()),
});

export type AIImageAnalyzeRequest = z.infer<typeof aiImageAnalyzeRequestSchema>;
export type AIImageAnalyzeResponse = z.infer<typeof aiImageAnalyzeResponseSchema>;
