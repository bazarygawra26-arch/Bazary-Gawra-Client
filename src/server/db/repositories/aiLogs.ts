import 'server-only';
import { supabaseAdmin } from '../supabaseAdmin';

export async function logSearchQuery(record: {
  query_text: string;
  detected_language: string | null;
  parsed_product_type: string | null;
  parsed_location: string | null;
  parsed_budget: number | null;
  results_count: number | null;
}) {
  if (!supabaseAdmin) return;
  try {
    await (supabaseAdmin.from('ai_search_queries') as any).insert([record]);
  } catch (err) {
    console.warn('aiLogs: logSearchQuery error:', err);
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
    await (supabaseAdmin.from('ai_product_scans') as any).insert([scan]);
  } catch (err) {
    console.warn('aiLogs: logProductScan error:', err);
  }
}
