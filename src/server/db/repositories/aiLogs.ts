import 'server-only';
import { supabaseAdmin } from '../supabaseAdmin';

export type AiFeature =
  | 'search'
  | 'compare'
  | 'recommend'
  | 'info_check'
  | 'product_assistant'
  | 'image_analysis'
  | 'listing_draft';

export type LangCode = 'en' | 'ku' | 'ar';

function isValidUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

export function normalizeLang(lang?: string): LangCode {
  if (!lang) return 'ku';
  const lower = lang.toLowerCase();
  if (lower.startsWith('ar')) return 'ar';
  if (lower.startsWith('en')) return 'en';
  return 'ku';
}

/**
 * Primary logger for all AI model training datasets.
 * Stores prompts, raw inputs, model completions, parameters, latencies, and token metadata.
 */
export async function logAiRequest(record: {
  feature: AiFeature;
  input_text?: string;
  input_lang?: string;
  output_lang?: string;
  structured_request?: any;
  product_ids?: string[];
  response?: any;
  model?: string;
  prompt_tokens?: number;
  completion_tokens?: number;
  latency_ms?: number;
  status?: 'success' | 'error' | 'blocked';
  error_message?: string;
  session_key?: string;
}): Promise<string | null> {
  if (!supabaseAdmin) {
    console.warn('aiLogs: logAiRequest - supabaseAdmin is not initialized');
    return null;
  }

  try {
    const validProductIds = (record.product_ids || []).filter(isValidUuid);
    const inLang = normalizeLang(record.input_lang);
    const outLang = normalizeLang(record.output_lang || record.input_lang);

    const { data, error } = await (supabaseAdmin.from('ai_requests') as any)
      .insert([
        {
          feature: record.feature,
          input_text: record.input_text || null,
          input_lang: inLang,
          output_lang: outLang,
          structured_request: record.structured_request || {},
          product_ids: validProductIds.length > 0 ? validProductIds : null,
          response: record.response || {},
          model: record.model || 'gemini-3.8-flash',
          prompt_tokens: record.prompt_tokens || null,
          completion_tokens: record.completion_tokens || null,
          latency_ms: record.latency_ms || null,
          status: record.status || 'success',
          error_message: record.error_message || null,
          session_key: record.session_key || null,
        },
      ])
      .select('id')
      .single();

    if (error) {
      console.warn('aiLogs: logAiRequest insert error:', error);
    }

    if (!error && data?.id) {
      console.log('aiLogs: successfully logged AI interaction with ID:', data.id);
      return data.id;
    }
  } catch (err) {
    console.warn('aiLogs: logAiRequest error:', err);
  }
  return null;
}

/**
 * Log AI Search query and extracted intent for model training
 */
export async function logSearchQuery(record: {
  query_text: string;
  detected_language: string | null;
  parsed_product_type: string | null;
  parsed_location: string | null;
  parsed_budget: number | null;
  results_count: number | null;
  product_ids?: string[];
  full_interpretation?: any;
  latency_ms?: number;
}) {
  return await logAiRequest({
    feature: 'search',
    input_text: record.query_text,
    input_lang: record.detected_language || undefined,
    output_lang: record.detected_language || undefined,
    structured_request: {
      query: record.query_text,
      parsed_product_type: record.parsed_product_type,
      parsed_location: record.parsed_location,
      parsed_budget: record.parsed_budget,
      training_target: 'multilingual_intent_extraction_kurdish_iraq',
    },
    product_ids: record.product_ids || [],
    response: {
      interpretation: record.full_interpretation,
      results_count: record.results_count,
    },
    latency_ms: record.latency_ms,
    status: 'success',
  });
}

/**
 * Log AI Product Comparison to both ai_requests and ai_comparisons
 */
export async function logComparison(comp: {
  product_ids: string[];
  lang: string;
  user_preferences?: any;
  result: any;
  products_summary?: any;
  latency_ms?: number;
}) {
  const normLang = normalizeLang(comp.lang);
  const requestId = await logAiRequest({
    feature: 'compare',
    input_text: `Compare products [${comp.product_ids.join(', ')}] in ${normLang}`,
    input_lang: normLang,
    output_lang: normLang,
    product_ids: comp.product_ids,
    structured_request: {
      product_ids: comp.product_ids,
      products_summary: comp.products_summary,
      preferences: comp.user_preferences,
      training_target: 'local_marketplace_product_comparison_and_information_gaps',
    },
    response: comp.result,
    latency_ms: comp.latency_ms,
    status: 'success',
  });

  if (supabaseAdmin) {
    try {
      const validUuids = comp.product_ids.filter(isValidUuid);
      await (supabaseAdmin.from('ai_comparisons') as any).insert([
        {
          product_ids: validUuids,
          lang: normLang,
          user_preferences: comp.user_preferences || {},
          result: comp.result,
          request_id: requestId || null,
        },
      ]);
    } catch (err) {
      console.warn('aiLogs: logComparison error:', err);
    }
  }

  return requestId;
}

/**
 * Log AI Product Chat conversation to ai_requests, ai_chat_sessions, and ai_chat_messages
 */
export async function logChatInteraction(chat: {
  productId: string;
  question: string;
  answer: string;
  isInformationGap: boolean;
  verifiedAttributes?: string[];
  language?: string;
  latency_ms?: number;
}) {
  const normLang = normalizeLang(chat.language);
  const requestId = await logAiRequest({
    feature: 'product_assistant',
    input_text: chat.question,
    input_lang: normLang,
    output_lang: normLang,
    product_ids: isValidUuid(chat.productId) ? [chat.productId] : [],
    structured_request: {
      product_id: chat.productId,
      question: chat.question,
      training_target: 'customer_support_qna_and_hallucination_prevention',
    },
    response: {
      answer: chat.answer,
      isInformationGap: chat.isInformationGap,
      verifiedAttributes: chat.verifiedAttributes || [],
    },
    latency_ms: chat.latency_ms,
    status: 'success',
  });

  if (supabaseAdmin && isValidUuid(chat.productId)) {
    try {
      // Create session
      const { data: session } = await (supabaseAdmin.from('ai_chat_sessions') as any)
        .insert([
          {
            product_id: chat.productId,
            lang: normLang,
            title: chat.question.slice(0, 80),
          },
        ])
        .select('id')
        .single();

      if (session?.id) {
        // Insert user message
        await (supabaseAdmin.from('ai_chat_messages') as any).insert([
          {
            session_id: session.id,
            role: 'user',
            content: chat.question,
            lang: normLang,
            metadata: {},
          },
          {
            session_id: session.id,
            role: 'assistant',
            content: chat.answer,
            lang: normLang,
            metadata: {
              request_id: requestId,
              isInformationGap: chat.isInformationGap,
              verifiedAttributes: chat.verifiedAttributes,
            },
          },
        ]);
      }
    } catch (err) {
      console.warn('aiLogs: logChatInteraction session error:', err);
    }
  }

  return requestId;
}

/**
 * Log AI Multimodal Image Analysis to ai_requests and ai_image_analyses
 */
export async function logProductScan(scan: {
  image_name?: string | null;
  product_type: string | null;
  suggested_category: string | null;
  identified_attributes: any;
  available_info: any;
  missing_info: any;
  draft_title: string | null;
  estimated_price_iqd: number | null;
  raw_result?: any;
  locale?: string;
  latency_ms?: number;
}) {
  const normLang = normalizeLang(scan.locale);
  const requestId = await logAiRequest({
    feature: 'image_analysis',
    input_text: `Multimodal scanner: ${scan.draft_title || scan.product_type}`,
    input_lang: normLang,
    output_lang: normLang,
    structured_request: {
      image_name: scan.image_name,
      suggested_category: scan.suggested_category,
      training_target: 'multimodal_product_vision_understanding_kurdish_iraq',
    },
    response: scan.raw_result || scan,
    latency_ms: scan.latency_ms,
    status: 'success',
  });

  if (supabaseAdmin) {
    try {
      await (supabaseAdmin.from('ai_image_analyses') as any).insert([
        {
          detected_product_type: scan.product_type,
          detected_category_slug: scan.suggested_category,
          visible_attributes: scan.identified_attributes || {},
          available_info: scan.available_info || {},
          missing_info: scan.missing_info || {},
          summary: scan.draft_title,
          summary_lang: normLang,
          confidence: 0.95,
          raw_response: scan.raw_result || scan,
          model: 'gemini-3.8-flash',
          request_id: requestId || null,
        },
      ]);
    } catch (err) {
      console.warn('aiLogs: logProductScan error:', err);
    }
  }

  return requestId;
}

/**
 * Log AI Recommendation and User Feedback for RLHF training
 */
export async function logAiFeedback(record: {
  request_id?: string;
  helpful: boolean;
  comment?: string;
}) {
  if (!supabaseAdmin) return;
  try {
    await (supabaseAdmin.from('ai_feedback') as any).insert([
      {
        request_id: record.request_id && isValidUuid(record.request_id) ? record.request_id : null,
        helpful: record.helpful,
        comment: record.comment || null,
      },
    ]);
  } catch (err) {
    console.warn('aiLogs: logAiFeedback error:', err);
  }
}
