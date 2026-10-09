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
    const p1 = products[0];
    const p2 = products[1];
    const isP1Cheaper = p1.price < p2.price;

    result = {
      summary: `Side-by-side comparison of ${products.map((p) => p.name).join(' and ')}.`,
      summary_ckb: `بەراوردکاری ڕاستەوخۆی نێوان ${products.map((p) => p.name_ckb || p.name).join(' و ')} لەسەر بنەمای داتابەیس.`,
      summary_ar: `مقارنة مباشرة بين ${products.map((p) => p.name_ar || p.name).join(' و ')} استناداً إلى بيانات الكتالوج.`,
      recommendation_rationale: `Evaluate local warranty and delivery options according to your city.`,
      comparison_matrix: [
        {
          feature: 'Price',
          values: Object.fromEntries(products.map((p) => [p.id, `${p.price.toLocaleString()} ${p.currency}`])),
        },
        {
          feature: 'Warranty',
          values: Object.fromEntries(products.map((p) => [p.id, p.warranty || 'Unknown / Not provided'])),
        },
        {
          feature: 'Delivery',
          values: Object.fromEntries(products.map((p) => [p.id, p.delivery_info || 'Unknown / Not provided'])),
        },
        {
          feature: 'Location',
          values: Object.fromEntries(products.map((p) => [p.id, p.location || 'Kurdistan'])),
        },
      ],
      advantages_disadvantages: products.map((p, idx) => {
        const other = products[idx === 0 ? 1 : 0];
        const adv: string[] = [];
        const dis: string[] = [];

        if (p.price < other.price) {
          adv.push(`Lower price (${p.price.toLocaleString()} ${p.currency} vs ${other.price.toLocaleString()} ${other.currency})`);
        } else if (p.price > other.price) {
          dis.push(`Higher price (${p.price.toLocaleString()} ${p.currency})`);
        }

        if (p.warranty && p.warranty !== 'Information unavailable' && p.warranty !== 'Not provided') {
          adv.push(`Disclosed warranty: ${p.warranty}`);
        } else {
          dis.push('Warranty terms not stated by seller');
        }

        if (p.delivery_info && p.delivery_info !== 'Not provided') {
          adv.push(`Delivery info: ${p.delivery_info}`);
        } else {
          dis.push('Delivery terms unconfirmed');
        }

        return {
          productId: p.id,
          productName: p.name,
          advantages: adv,
          disadvantages: dis,
        };
      }),
      best_match: {
        productId: isP1Cheaper ? p1.id : p2.id,
        productName: isP1Cheaper ? p1.name : p2.name,
        rationale: isP1Cheaper
          ? `Best choice for budget efficiency (${p1.price.toLocaleString()} ${p1.currency}). Verify with seller whether warranty applies.`
          : `Best balance of verified specifications for local buyers.`,
      },
      facts_vs_advice: {
        verified_database_facts: [
          `Prices are recorded as ${p1.price.toLocaleString()} ${p1.currency} and ${p2.price.toLocaleString()} ${p2.currency}.`,
          `Sellers are located in ${p1.location} and ${p2.location}.`,
          `Recorded warranty for ${p1.name}: ${p1.warranty || 'None stated'}. Recorded warranty for ${p2.name}: ${p2.warranty || 'None stated'}.`,
        ],
        general_buying_advice: [
          `Ask the seller directly about return policy if omitted in the listing.`,
          `Ensure safe hand-to-hand inspection or verified delivery upon receipt.`,
        ],
      },
      information_gaps: products.map((p) => ({
        productId: p.id,
        productName: p.name,
        missing: [
          ...(!p.warranty || p.warranty === 'Information unavailable' || p.warranty === 'Not provided' ? ['Warranty terms omitted by seller'] : []),
          ...(!p.return_policy || p.return_policy === 'Not provided' ? ['Return policy omitted by seller'] : []),
          ...(!p.origin || p.origin === 'Not provided' ? ['Origin/manufacturer not verified'] : []),
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
