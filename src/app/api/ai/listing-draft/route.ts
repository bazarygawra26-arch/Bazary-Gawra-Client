import { NextRequest, NextResponse } from 'next/server';
import { generateJson, generateMultimodalJson } from '../../../../server/ai/gemini';
import { logAiRequest } from '../../../../server/db/repositories/aiLogs';

export interface ListingDraftResponse {
  title_ku: string;
  title_ar: string;
  title_en: string;
  description_ku: string;
  description_ar: string;
  description_en: string;
  suggested_category: string;
  brand?: string;
  capacity?: string;
  power?: string;
  inferred_attributes: { key: string; value: string }[];
  uncertain_fields: string[];
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await req.json();
    const { image_url, image_base64, mime_type, short_description, language = 'ku' } = body;

    if (!image_url && !image_base64 && !short_description) {
      return NextResponse.json(
        { error: 'Please provide either an image or a short description to draft a listing' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are Bazary Gawra's AI Seller Listing Assistant for local merchants across Kurdistan and Iraq.
Generate a structured, professional product listing draft in Sorani Kurdish, Arabic, and English based strictly on the provided image and/or seller notes.

CRITICAL RULES:
1. Do NOT fabricate price, manufacturer origin, warranty duration, safety certifications, or stock availability. Mark these explicitly in "uncertain_fields".
2. Only infer attributes (e.g. brand name, capacity, wattage/power) if clearly visible on packaging or explicitly stated in notes.
3. Choose the most relevant category slug from: electronics, kitchen, home, fashion, handicrafts, food, beauty, sports, general.
4. Descriptions must be clear, honest, and helpful to local buyers in Erbil, Sulaymaniyah, and Duhok.

Return JSON strictly matching this schema:
{
  "title_ku": "ناوی بەرهەم بە کوردی سۆرانی",
  "title_ar": "اسم المنتج بالعربية الفصحى",
  "title_en": "Product Title in English",
  "description_ku": "وەسفی ورد و ڕوونی بەرهەم بە کوردی سۆرانی",
  "description_ar": "وصف واضح للمنتج بالعربية",
  "description_en": "Clear and transparent product description in English",
  "suggested_category": "electronics | kitchen | home | fashion | handicrafts | food | beauty | sports | general",
  "brand": "Brand name if visible, or empty string",
  "capacity": "Capacity if visible (e.g. 5L, 500ml), or empty string",
  "power": "Power if visible (e.g. 1800W), or empty string",
  "inferred_attributes": [
    { "key": "Attribute name", "value": "Visible value" }
  ],
  "uncertain_fields": [
    "Price in IQD",
    "Warranty terms",
    "Delivery fees and coverage",
    "Return / replacement policy"
  ]
}`;

    let draft: ListingDraftResponse | null = null;

    if (image_base64) {
      const cleanBase64 = image_base64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
      const cleanMime = mime_type || 'image/jpeg';
      draft = await generateMultimodalJson<ListingDraftResponse>(
        `${systemPrompt}\n\nSeller input notes: ${short_description || 'Image uploaded by seller'}`,
        cleanBase64,
        cleanMime
      );
    } else {
      draft = await generateJson<ListingDraftResponse>(
        `${systemPrompt}\n\nSeller input description / keywords: ${short_description || image_url}`
      );
    }

    // High quality deterministic fallback if AI rate limit or provider error occurs
    if (!draft || !draft.title_ku) {
      const hint = short_description || 'بەرهەمی نوێ';
      draft = {
        title_ku: `${hint} - کوالیتی بەرز`,
        title_ar: `${hint} - جودة عالية`,
        title_en: `${hint} - High Quality`,
        description_ku: `بەرهەمێکی تایبەت و کوالیتی بەرز لە بازاڕی گەورە. تکایە پێش بڵاوکردنەوە وردەکارییەکانی نرخ، گەرەنتی و گەیاندن پڕبکەرەوە.`,
        description_ar: `منتج مميز بجودة عالية متوفر في بازاري كورة. يرجى تأكيد السعر والضمان وشروط التوصيل قبل النشر.`,
        description_en: `Premium quality item available in Bazary Gawra. Please review and specify price, warranty, and delivery terms before publishing.`,
        suggested_category: 'general',
        inferred_attributes: [],
        uncertain_fields: [
          'Price in IQD',
          'Warranty coverage',
          'Delivery coverage',
          'Return policy',
        ],
      };
    }

    const latencyMs = Date.now() - startTime;

    // Log listing draft generation to Supabase ai_requests
    await logAiRequest({
      feature: 'listing_draft',
      input_text: short_description || (image_url ? `Image: ${image_url}` : 'Seller image draft'),
      input_lang: language,
      output_lang: language,
      structured_request: {
        short_description,
        has_image: Boolean(image_url || image_base64),
      },
      response: draft,
      latency_ms: latencyMs,
      status: 'success',
    });

    return NextResponse.json(draft);
  } catch (error: any) {
    console.error('API /api/ai/listing-draft error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate listing draft' },
      { status: 500 }
    );
  }
}
