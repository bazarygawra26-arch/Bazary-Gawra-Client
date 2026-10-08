import 'server-only';
import { generateJson } from '../gemini';
import { buildComparePrompt } from '../prompts/compare';
import { findProductById } from '../../db/repositories/products';
import { logComparison } from '../../db/repositories/aiLogs';
import { AIComparisonResult, Product } from '../../../types';

export async function processAiCompare(
  productIds: string[],
  language: string = 'ku'
): Promise<AIComparisonResult | null> {
  const startTime = Date.now();
  const loaded = await Promise.all(productIds.map((id) => findProductById(id, language === 'ar' ? 'ar' : language === 'en' ? 'en' : 'ku')));
  const products = loaded.filter(Boolean) as Product[];

  if (products.length < 2) return null;

  const prompt = buildComparePrompt(products, language);
  let result = await generateJson<AIComparisonResult>(prompt);

  if (!result) {
    // Fallback programmatic comparison synthesis if Gemini is temporarily unavailable
    result = {
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

  const latencyMs = Date.now() - startTime;

  // Persist comparison to Supabase ai_requests and ai_comparisons for future fine-tuning
  await logComparison({
    product_ids: products.map((p) => p.id),
    lang: language,
    result: result,
    products_summary: products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      currency: p.currency,
      location: p.location,
      warranty: p.warranty,
      delivery_info: p.delivery_info,
    })),
    latency_ms: latencyMs,
  });

  return result;
}
