import 'server-only';
import { Product } from '../../../types';

export function buildComparePrompt(products: Product[], language: string = 'ku'): string {
  return `You are Bazary Gawra's Neutral Information Gap & Comparison Engine for Kurdistan.
Compare the following local marketplace items:
${JSON.stringify(
  products.map((p) => ({
    id: p.id,
    name: p.name,
    price: `${p.price} ${p.currency}`,
    location: p.location,
    seller: p.seller_name,
    warranty: p.warranty,
    delivery: p.delivery_info,
    return_policy: p.return_policy,
    specs: { capacity: p.capacity, power: p.power, origin: p.origin },
  })),
  null,
  2
)}

CRITICAL RULES:
1. Do not invent missing facts. If warranty or returns are omitted by the seller, explicitly flag it as an Information Gap.
2. Provide objective trade-offs for local buyers in Sulaymaniyah, Erbil, or Duhok.

Return JSON in this format:
{
  "summary": "Executive comparison summary in English",
  "summary_ckb": "پوختەی بەراوردکارییە بێلایەنەکە بە کوردی سۆرانی",
  "summary_ar": "ملخص المقارنة المحايدة بالعربية",
  "recommendation_rationale": "Objective analysis of suitability",
  "comparison_matrix": [
    {
      "feature": "Warranty",
      "values": { "${products[0]?.id}": "...", "${products[1]?.id}": "..." }
    },
    {
      "feature": "Delivery Terms",
      "values": { "${products[0]?.id}": "...", "${products[1]?.id}": "..." }
    }
  ],
  "information_gaps": [
    {
      "productId": "${products[0]?.id}",
      "productName": "${products[0]?.name}",
      "missing": ["Omitted points..."]
    }
  ]
}`;
}
