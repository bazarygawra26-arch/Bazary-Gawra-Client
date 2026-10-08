import 'server-only';

export function buildSearchPrompt(query: string, language: string = 'ku'): string {
  return `You are Bazary Gawra's Kurdish Local Marketplace AI Assistant.
Analyze this user query for Iraqi Kurdistan local commerce: "${query}".

The user may write in Kurdish Sorani (ئارەزوو دەکەم..., دەمەوێت...), Arabic, or English.
Extract and identify:
1. Product type / target category
2. City / Neighborhood (Sulaymaniyah, Erbil, Duhok, etc.)
3. Maximum price / budget in Iraqi Dinar (IQD)
4. Specific constraints (warranty required, delivery needed, etc.)

Return ONLY valid JSON matching this schema:
{
  "detected_language": "ckb" | "ar" | "en",
  "product_type": "string",
  "target_location": "string",
  "budget_max": number or null,
  "currency": "IQD",
  "extracted_preferences": ["string"],
  "explanation": {
    "en": "Short clear summary in English",
    "ckb": "پوختەیەکی ڕوون بە کوردی سۆرانی",
    "ar": "ملخص واضح بالعربية"
  }
}`;
}
