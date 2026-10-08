import { z } from 'zod';

export const productFilterSchema = z.object({
  category: z.string().optional(),
  city: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  hasWarranty: z.coerce.boolean().optional(),
  hasDelivery: z.coerce.boolean().optional(),
  search: z.string().optional(),
  sort: z.enum(['recommended', 'price_asc', 'price_desc']).optional(),
});

export type ProductFilterParams = z.infer<typeof productFilterSchema>;
