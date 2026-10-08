import 'server-only';

export function buildSearchPrompt(query: string, language: string = 'ku'): string {
  return `You are Bazary Gawra's Kurdish Local Marketplace AI Assistant.
Analyze this user query for Iraqi Kurdistan local commerce: "${query}".

The user may write in Kurdish Sorani (ئارەزوو دەکەم..., دەمەوێت..., بە گەرەنتی..., کەمتر لە...), Arabic, or English.
Extract structured commerce search criteria according to Bazary Gawra rules:
1. "product": Short canonical product keyword in English or Kurdish (e.g. "air fryer", "coffee machine", "honey", "blender")
2. "category": Target category (e.g. "Kitchen & Home", "Coffee & Espresso", "Local Food & Honey", "Home Appliances", "Electronics")
3. "location": City if specified (e.g. "Sulaymaniyah", "Erbil", "Duhok", or "Kurdistan")
4. "max_price": Maximum price in Iraqi Dinar (IQD) as a number or null
5. "min_price": Minimum price in Iraqi Dinar (IQD) as a number or null
6. "currency": "IQD"
7. "preferences": Array of extracted user constraints (e.g. ["warranty required", "local delivery", "dual basket", "under budget"])
8. "detected_language": "ckb" | "ar" | "en"
9. "explanation": Concise 1-sentence user explanation in English, Kurdish Sorani, and Arabic

Return ONLY valid JSON matching this exact schema:
{
  "product": "string",
  "category": "string",
  "location": "string",
  "max_price": number | null,
  "min_price": number | null,
  "currency": "IQD",
  "preferences": ["string"],
  "detected_language": "ckb" | "ar" | "en",
  "explanation": {
    "en": "Short clear summary in English",
    "ckb": "پوختەیەکی ڕوون بە کوردی سۆرانی",
    "ar": "ملخص واضح بالعربية"
  }
}`;
}
