import 'server-only';
import { generateJson } from '../gemini';
import { buildSearchPrompt } from '../prompts/search';
import { findProducts } from '../../db/repositories/products';
import { logSearchQuery } from '../../db/repositories/aiLogs';
import { AISearchInterpretation, Product } from '../../../types';

export async function processAiSearch(
  query: string,
  language: string = 'ku'
): Promise<{ interpretation: AISearchInterpretation; products: Product[] }> {
  const prompt = buildSearchPrompt(query, language);
  const parsed = await generateJson<any>(prompt);

  const interpretation: AISearchInterpretation = {
    query,
    detected_language: parsed?.detected_language || (language === 'ku' ? 'ckb' : language),
    product_type: parsed?.product_type || 'Products',
    target_location: parsed?.target_location || 'Kurdistan Region',
    budget_max: parsed?.budget_max || undefined,
    currency: 'IQD',
    extracted_preferences: parsed?.extracted_preferences || [],
    explanation: parsed?.explanation || {
      en: `Looking for ${parsed?.product_type || 'items'} in ${parsed?.target_location || 'Kurdistan'}.`,
      ckb: `گەڕان بەدوای ${parsed?.product_type || 'کاڵاکان'} لە ${parsed?.target_location || 'کوردستان'}.`,
      ar: `البحث عن ${parsed?.product_type || 'المنتجات'} في ${parsed?.target_location || 'كوردستان'}.`,
    },
  };

  // Query products matching extracted location and budget
  const products = await findProducts({
    search: interpretation.product_type,
    city: interpretation.target_location !== 'Kurdistan Region' ? interpretation.target_location : undefined,
    maxPrice: interpretation.budget_max || undefined,
  });

  // Log query asynchronously
  await logSearchQuery({
    query_text: query,
    detected_language: interpretation.detected_language,
    parsed_product_type: interpretation.product_type,
    parsed_location: interpretation.target_location,
    parsed_budget: interpretation.budget_max || null,
    results_count: products.length,
  });

  return { interpretation, products };
}
