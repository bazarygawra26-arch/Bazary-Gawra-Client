import 'server-only';
import { Product } from '../../../types';

export function buildComparePrompt(products: Product[], language: string = 'ku'): string {
  return `You are Bazary Gawra's Neutral Information Gap & Comparison Engine for Kurdistan and Iraq.
Analyze and compare the following local marketplace items retrieved from the database:
${JSON.stringify(
  products.map((p) => ({
    id: p.id,
    name: p.name,
    price: `${p.price} ${p.currency}`,
    location: p.location,
    seller: p.seller_name,
    warranty: p.warranty || 'Unknown / Not provided',
    delivery: p.delivery_info || 'Unknown / Not provided',
    return_policy: p.return_policy || 'Unknown / Not provided',
    capacity: p.capacity || 'Unknown',
    power: p.power || 'Unknown',
    origin: p.origin || 'Unknown',
    rating: p.rating || null,
    review_count: p.review_count || 0,
  })),
  null,
  2
)}

CRITICAL RULES:
1. Grounding: Do NOT invent missing specifications, certifications, warranty length, origin, or delivery speed. If omitted in the database, explicitly mark it as "Unknown" or an "Information Gap".
2. Distinction: Explicitly distinguish between Verified Database Facts (what the seller actually recorded) and General Buying Advice (neutral market buying recommendations).
3. Advantages & Disadvantages: Extract genuine pros and cons based strictly on the provided listing data (e.g. price difference, presence/lack of warranty, city proximity).
4. Best Match: State which product best matches specific buyer needs (e.g. best for budget vs best for warranty coverage) with an honest explanation. Never claim a product is flawless.
5. Multilingual: Provide summary in English ("summary"), Sorani Kurdish ("summary_ckb"), and Arabic ("summary_ar").

Return valid JSON strictly matching this schema:
{
  "summary": "Executive comparison summary in English",
  "summary_ckb": "پوختەی بەراوردکارییە بێلایەنەکە بە کوردی سۆرانی",
  "summary_ar": "ملخص المقارنة المحايدة باللغة العربية",
  "recommendation_rationale": "Objective trade-off analysis explaining suitability for local buyers in Sulaymaniyah, Erbil, or Duhok",
  "comparison_matrix": [
    {
      "feature": "Price",
      "values": { "${products[0]?.id}": "...", "${products[1]?.id}": "..." }
    },
    {
      "feature": "Warranty",
      "values": { "${products[0]?.id}": "...", "${products[1]?.id}": "..." }
    },
    {
      "feature": "Delivery Terms",
      "values": { "${products[0]?.id}": "...", "${products[1]?.id}": "..." }
    },
    {
      "feature": "Seller Location",
      "values": { "${products[0]?.id}": "...", "${products[1]?.id}": "..." }
    }
  ],
  "advantages_disadvantages": [
    {
      "productId": "${products[0]?.id}",
      "productName": "${products[0]?.name}",
      "advantages": ["Factual advantage from listing..."],
      "disadvantages": ["Factual drawback or missing disclosure..."]
    }
  ],
  "best_match": {
    "productId": "${products[0]?.id}",
    "productName": "${products[0]?.name}",
    "rationale": "Clear, grounded explanation of which requirements this product best satisfies."
  },
  "facts_vs_advice": {
    "verified_database_facts": [
      "Factual point verified in database records..."
    ],
    "general_buying_advice": [
      "Neutral consumer advice for purchasing in Kurdistan..."
    ]
  },
  "information_gaps": [
    {
      "productId": "${products[0]?.id}",
      "productName": "${products[0]?.name}",
      "missing": ["Missing warranty/delivery/spec disclosures..."]
    }
  ]
}`;
}
