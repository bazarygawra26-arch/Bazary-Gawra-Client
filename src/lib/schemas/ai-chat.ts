import { z } from 'zod';

export const aiProductChatRequestSchema = z.object({
  productId: z.string(),
  question: z.string().min(1, 'Question cannot be empty'),
  language: z.enum(['en', 'ku', 'ckb', 'ar']).default('ku'),
});

export const aiProductChatResponseSchema = z.object({
  answer: z.string(),
  isInformationGap: z.boolean(),
  verifiedAttributes: z.array(z.string()).optional(),
});

export type AIProductChatRequest = z.infer<typeof aiProductChatRequestSchema>;
export type AIProductChatResponse = z.infer<typeof aiProductChatResponseSchema>;
