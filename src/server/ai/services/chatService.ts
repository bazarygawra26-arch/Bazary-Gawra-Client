import 'server-only';
import { generateJson } from '../gemini';
import { buildChatPrompt } from '../prompts/chat';
import { findProductById } from '../../db/repositories/products';

export async function processProductChat(
  productId: string,
  question: string,
  language: string = 'ku'
): Promise<{ answer: string; isInformationGap: boolean; verifiedAttributes?: string[] }> {
  const product = await findProductById(productId);
  if (!product) {
    return {
      answer: 'Product not found.',
      isInformationGap: false,
    };
  }

  const prompt = buildChatPrompt(product, question, language);
  const result = await generateJson<{
    answer: string;
    isInformationGap: boolean;
    verifiedAttributes?: string[];
  }>(prompt);

  if (result) return result;

  // Fallback direct audit answer
  const lower = question.toLowerCase();
  if (lower.includes('warranty') || question.includes('گەرەنتی') || question.includes('ضمان')) {
    return {
      answer: product.warranty
        ? `Stated warranty: "${product.warranty}".`
        : 'Information Gap: The seller has not provided warranty terms for this listing.',
      isInformationGap: !product.warranty,
    };
  }

  return {
    answer: `Listing details: ${product.name} from ${product.seller_name} in ${product.location} (${product.price} ${product.currency}).`,
    isInformationGap: false,
  };
}
