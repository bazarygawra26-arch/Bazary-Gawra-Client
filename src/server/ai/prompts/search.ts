import 'server-only';

export function buildSearchPrompt(query: string, language: string = 'ku', previousQuery?: string): string {
  let contextSection = '';
  if (previousQuery && previousQuery.trim()) {
    contextSection = `\nPREVIOUS SEARCH CONTEXT: "${previousQuery.trim()}". The user is now refining this search (e.g., adding constraints like "only with warranty", changing location, or lowering budget). Preserve the original product intent while incorporating the new constraint.`;
  }

  return `You are Bazary Gawra's Kurdish Local Marketplace AI Assistant.
Analyze this user query for Iraqi Kurdistan local commerce: "${query}".${contextSection}

The user may write in Kurdish Sorani (ئارەزوو دەکەم..., دەمەوێت..., بە گەرەنتی..., کەمتر لە...), Arabic, or English.
Extract structured commerce search criteria according to Bazary Gawra rules:
1. "product": Short canonical product keyword in English or Kurdish (e.g. "air fryer", "coffee machine", "honey", "blender", "vacuum cleaner")
2. "category": Target standardized parent category:
   - "Kitchen Appliances & Supplies" (for air fryers / ئێرفرایەر, coffee machines / قاوەساز, blenders / خەڵاتە, kettles / قۆری و چایساز, cookware)
   - "Home Appliances" (for vacuum cleaners / جارووبەرەقی, fans / فێنککەرەوە, heaters / زۆپا, water purifiers / پاڵێوەری ئاو)
   - "Electronics" (for electronics / ئەلیکترۆنیات)
   - "Beauty & Personal Care" (for personal care / جوانی و چاودێری کەسی)
   - "Handmade & Heritage" (for crafts, heritage / دەستکرد و کەلەپوور)
   - "Local Food & Products" (for mountain honey, food / خۆراک و بەرهەمی خۆماڵی)
   - "Books" (for books, literature, novels, poetry, diwan / کتێب، ڕۆمان، دیوان، پەرتووک، کتب)
   - "Other" (for unclassified items / هی تر)
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
