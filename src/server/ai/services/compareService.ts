import 'server-only';
import { generateJson } from '../gemini';
import { buildComparePrompt } from '../prompts/compare';
import { findProductById } from '../../db/repositories/products';
import { AIComparisonResult, Product } from '../../../types';

export async function processAiCompare(
  productIds: string[],
  language: string = 'ku'
): Promise<AIComparisonResult | null> {
  const loaded = await Promise.all(productIds.map((id) => findProductById(id)));
  const products = loaded.filter(Boolean) as Product[];

  if (products.length < 2) return null;

  const prompt = buildComparePrompt(products, language);
  const result = await generateJson<AIComparisonResult>(prompt);

  if (result) return result;

  // Fallback programmatic comparison synthesis if Gemini is unavailable
  return {
    summary: `Side-by-side comparison of ${products.map((p) => p.name).join(' and ')}.`,
    summary_ckb: `بەراوردکاری ڕاستەوخۆی نێوان بەرهەمەکان.`,
    summary_ar: `مقارنة مباشرة بين المنتجات المحددة.`,
    recommendation_rationale: `Evaluate local warranty and delivery options according to your city.`,
    comparison_matrix: [
      {
        feature: 'Price',
        values: Object.fromEntries(products.map((p) => [p.id, `${p.price.toLocaleString()} ${p.currency}`])),
      },
      {
        feature: 'Warranty',
        values: Object.fromEntries(products.map((p) => [p.id, p.warranty || 'Not provided'])),
      },
      {
        feature: 'Delivery',
        values: Object.fromEntries(products.map((p) => [p.id, p.delivery_info || 'Not provided'])),
      },
    ],
    information_gaps: products.map((p) => ({
      productId: p.id,
      productName: p.name,
      missing: [
        ...(!p.warranty || p.warranty === 'Information unavailable' ? ['Warranty terms omitted'] : []),
        ...(!p.return_policy || p.return_policy === 'Not provided' ? ['Return policy omitted'] : []),
      ],
    })),
  };
}
