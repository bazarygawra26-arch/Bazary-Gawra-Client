import { z } from 'zod';

export const productFilterSchema = z.object({
  category: z.string().optional(),
  city: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  hasWarranty: z.coerce.boolean().optional(),
  hasDelivery: z.coerce.boolean().optional(),
  search: z.string().optional(),
  sort: z.enum(['recommended', 'price_asc', 'price_desc', 'low-to-high', 'high-to-low']).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(12),
  offset: z.coerce.number().int().nonnegative().optional(),
  paginate: z.coerce.boolean().optional(),
  format: z.string().optional(),
  lang: z.enum(['en', 'ku', 'ar', 'ckb']).optional(),
});

export type ProductFilterParams = z.infer<typeof productFilterSchema>;
