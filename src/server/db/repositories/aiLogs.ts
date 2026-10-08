import 'server-only';
import { supabaseAdmin } from '../supabaseAdmin';

export async function logAiRequest(record: {
  feature: string;
  input_text?: string;
  input_lang?: string;
  output_lang?: string;
  structured_request?: any;
  product_ids?: string[];
  response?: any;
  model?: string;
  latency_ms?: number;
  status?: string;
  error_message?: string;
}) {
  if (!supabaseAdmin) return;
  try {
    await (supabaseAdmin.from('ai_requests') as any).insert([
      {
        feature: record.feature,
        input_text: record.input_text || null,
        input_lang: record.input_lang || null,
        output_lang: record.output_lang || null,
        structured_request: record.structured_request || {},
        product_ids: record.product_ids || null,
        response: record.response || {},
        model: record.model || 'gemini-3.8-flash',
        latency_ms: record.latency_ms || null,
        status: record.status || 'success',
        error_message: record.error_message || null,
      },
    ]);
  } catch (err) {
    console.warn('aiLogs: logAiRequest error:', err);
  }
}

export async function logSearchQuery(record: {
  query_text: string;
  detected_language: string | null;
  parsed_product_type: string | null;
  parsed_location: string | null;
  parsed_budget: number | null;
  results_count: number | null;
}) {
  await logAiRequest({
    feature: 'search',
    input_text: record.query_text,
    input_lang: record.detected_language || undefined,
    structured_request: record,
    status: 'success',
  });
}

export async function logComparison(comp: {
  product_ids: string[];
  lang: 'en' | 'ku' | 'ar';
  user_preferences?: any;
  result: any;
}) {
  if (!supabaseAdmin) return;
  try {
    await (supabaseAdmin.from('ai_comparisons') as any).insert([
      {
        product_ids: comp.product_ids,
        lang: comp.lang,
        user_preferences: comp.user_preferences || {},
        result: comp.result,
      },
    ]);
  } catch (err) {
    console.warn('aiLogs: logComparison error:', err);
  }
}

export async function logProductScan(scan: {
  image_name: string | null;
  product_type: string | null;
  suggested_category: string | null;
  identified_attributes: any;
  available_info: any;
  missing_info: any;
  draft_title: string | null;
  estimated_price_iqd: number | null;
}) {
  if (!supabaseAdmin) return;
  try {
    await (supabaseAdmin.from('ai_image_analyses') as any).insert([
      {
        detected_product_type: scan.product_type,
        detected_category_slug: scan.suggested_category,
        visible_attributes: scan.identified_attributes || {},
        available_info: scan.available_info || {},
        missing_info: scan.missing_info || {},
        summary: scan.draft_title,
        confidence: 0.95,
        raw_response: scan,
      },
    ]);
  } catch (err) {
    console.warn('aiLogs: logProductScan error:', err);
  }
}
