import 'server-only';
import { generateJson } from '../gemini';
import { buildSearchPrompt } from '../prompts/search';
import { findProducts } from '../../db/repositories/products';
import { logSearchQuery } from '../../db/repositories/aiLogs';
import {
  AISearchInterpretation,
  AiSearchComprehensiveResult,
  DetailedInformationGap,
  Product,
} from '../../../types';
import { localizeProduct } from '../../../lib/i18nData';

export async function processAiSearch(
  query: string,
  language: string = 'ku',
  previousContext?: { previousQuery?: string; previousProducts?: string[] }
): Promise<AiSearchComprehensiveResult> {
  const startTime = Date.now();
  const normLang = language === 'ar' ? 'ar' : language === 'en' ? 'en' : 'ckb';
  const dbLang: 'en' | 'ku' | 'ar' = normLang === 'ckb' ? 'ku' : normLang;
  const isCkb = normLang === 'ckb';
  const isAr = normLang === 'ar';

  const cleanQuery = (query || '').trim();

  // Edge case: empty or invalid query
  if (!cleanQuery || cleanQuery.length < 2) {
    const defaultText = isCkb
      ? 'تکایە ناوی بەرهەم یان تایبەتمەندی بنووسە بۆ گەڕان (بۆ نموونە: ئێرفرایەر، قاوەساز، هەنگوینی شاخ).'
      : isAr
      ? 'يرجى كتابة اسم المنتج أو المواصفات للبحث (مثال: قلاية هوائية، ماكينة قهوة، عسل جبلي).'
      : 'Please enter a product name or preference to search (e.g., air fryer, coffee machine, mountain honey).';

    return {
      request: {
        product: '',
        category: 'General',
        location: 'Kurdistan',
        max_price: null,
        min_price: null,
        currency: 'IQD',
        preferences: [],
        language: normLang,
      },
      interpretation: {
        query: cleanQuery,
        detected_language: normLang,
        product_type: isCkb ? 'دیاری نەکراوە' : isAr ? 'غير محدد' : 'Unspecified',
        target_location: 'Kurdistan',
        budget_max: null,
        currency: 'IQD',
        extracted_preferences: [],
        explanation: { en: defaultText, ckb: defaultText, ar: defaultText },
      },
      products: [],
      information_gaps: [],
      recommendation: defaultText,
      seller_questions: [],
      language: normLang,
    };
  }

  // Detect conversational refinement
  let mergedQueryForPrompt = cleanQuery;
  const prevQ = previousContext?.previousQuery?.trim();
  if (prevQ && prevQ !== cleanQuery) {
    const isRefinementWord =
      /^(تەنها|تەنیا|فقط|only|under|less|لە|في|in|بە|with|without|cheaper|هەرزانتر|أرخص)/i.test(cleanQuery) ||
      cleanQuery.includes('گەرەنتی') ||
      cleanQuery.includes('ضمان') ||
      cleanQuery.includes('warranty') ||
      cleanQuery.includes('گەیاندن') ||
      cleanQuery.includes('توصيل') ||
      cleanQuery.includes('delivery');

    if (isRefinementWord) {
      mergedQueryForPrompt = `${prevQ} (${cleanQuery})`;
    }
  }

  // 1. Attempt Gemini 3.8 Flash structured search interpretation
  let parsed: any = null;
  try {
    const prompt = buildSearchPrompt(cleanQuery, language, prevQ);
    parsed = await generateJson<any>(prompt);
  } catch (err) {
    console.warn('Gemini generateJson call failed, using deterministic fallback parser:', err);
  }

  // 2. Deterministic Fallback Extractor if Gemini is 503 / offline / rate-limited
  if (!parsed || !parsed.product) {
    parsed = extractDeterministicCriteria(mergedQueryForPrompt, normLang);
  }

  const productTerm = parsed?.product || parsed?.product_type || cleanQuery;
  const categoryTerm = parsed?.category || 'General';
  const targetLocation = parsed?.location || parsed?.target_location || 'Kurdistan Region';
  const budgetMax = typeof parsed?.max_price === 'number' ? parsed.max_price : typeof parsed?.budget_max === 'number' ? parsed.budget_max : null;
  const budgetMin = typeof parsed?.min_price === 'number' ? parsed.min_price : null;
  const preferences: string[] = Array.isArray(parsed?.preferences)
    ? parsed.preferences
    : Array.isArray(parsed?.extracted_preferences)
    ? parsed.extracted_preferences
    : [];

  const interpretation: AISearchInterpretation = {
    query: cleanQuery,
    detected_language: parsed?.detected_language || normLang,
    product_type: productTerm,
    target_location: targetLocation,
    budget_max: budgetMax,
    currency: 'IQD',
    extracted_preferences: preferences,
    explanation: parsed?.explanation || {
      en: `Looking for ${productTerm} in ${targetLocation}${budgetMax ? ` under ${budgetMax.toLocaleString()} IQD` : ''}.`,
      ckb: `گەڕان بەدوای ${productTerm} لە ${targetLocation}${budgetMax ? ` بە کەمتر لە ${budgetMax.toLocaleString()} دینار` : ''}.`,
      ar: `البحث عن ${productTerm} في ${targetLocation}${budgetMax ? ` بأقل من ${budgetMax.toLocaleString()} دينار` : ''}.`,
    },
  };

  // 3. Query Supabase products using deterministic criteria
  let rawProducts = await findProducts({
    search: productTerm !== 'General' ? productTerm : undefined,
    city: targetLocation !== 'Kurdistan Region' && targetLocation !== 'Kurdistan' ? targetLocation : undefined,
    maxPrice: budgetMax || undefined,
    minPrice: budgetMin || undefined,
    lang: dbLang,
  });

  // If strict city search returned 0 results, expand city to show nearby Kurdistan merchants
  if (rawProducts.length === 0 && (targetLocation !== 'Kurdistan Region' && targetLocation !== 'Kurdistan')) {
    rawProducts = await findProducts({
      search: productTerm !== 'General' ? productTerm : undefined,
      maxPrice: budgetMax || undefined,
      minPrice: budgetMin || undefined,
      lang: dbLang,
    });
  }

  // If search was very narrow, fetch relevant fallback category items
  if (rawProducts.length === 0 && categoryTerm !== 'General') {
    rawProducts = await findProducts({
      category: categoryTerm,
      maxPrice: budgetMax || undefined,
      lang: dbLang,
    });
  }

  // Conversational Refinement filters (e.g. "only with warranty")
  const requiresWarranty = preferences.some(
    (p) => p.toLowerCase().includes('warranty') || p.includes('گەرەنتی') || p.includes('ضمان')
  );
  if (requiresWarranty) {
    const withW = rawProducts.filter(
      (p) => p.warranty && p.warranty !== 'Information unavailable' && p.warranty !== 'Not provided'
    );
    if (withW.length > 0) {
      rawProducts = withW;
    }
  }

  const requiresDelivery = preferences.some(
    (p) => p.toLowerCase().includes('delivery') || p.includes('گەیاندن') || p.includes('توصيل')
  );
  if (requiresDelivery) {
    const withD = rawProducts.filter((p) => p.delivery_info && p.delivery_info !== 'Not provided');
    if (withD.length > 0) {
      rawProducts = withD;
    }
  }

  // Localize product attributes according to active user language
  const products: Product[] = rawProducts.map((p) => localizeProduct(p, normLang));

  // If products is 0, find real alternatives from the database (never hallucinating outside shops)
  let alternatives: Product[] | undefined = undefined;
  if (products.length === 0) {
    const allDbFallback = await findProducts({ lang: dbLang });
    const catAlternatives = allDbFallback.filter(
      (p) => p.category.toLowerCase().includes((categoryTerm || '').toLowerCase())
    );
    const chosenAlt = catAlternatives.length > 0 ? catAlternatives : allDbFallback;
    alternatives = chosenAlt.slice(0, 3).map((p) => localizeProduct(p, normLang));
  }

  // 2. Perform Trust & Information Gap Analysis for each found product
  const information_gaps: DetailedInformationGap[] = products.map((p) => {
    const available: string[] = [];
    const missing: string[] = [];
    const seller_questions: string[] = [];

    // Check available signals
    if (p.price) {
      available.push(
        isCkb
          ? `نرخی دیاریکراو: ${p.price.toLocaleString()} ${p.currency}`
          : isAr
          ? `السعر المحدد: ${p.price.toLocaleString()} ${p.currency}`
          : `Stated price: ${p.price.toLocaleString()} ${p.currency}`
      );
    }
    if (p.location) {
      available.push(
        isCkb
          ? `شار/شوێنی دوکان: ${p.location}`
          : isAr
          ? `المدينة/الموقع: ${p.location}`
          : `Shop location: ${p.location}`
      );
    }
    if (p.capacity) {
      available.push(
        isCkb ? `قەبارە: ${p.capacity}` : isAr ? `السعة: ${p.capacity}` : `Capacity: ${p.capacity}`
      );
    }
    if (p.power) {
      available.push(
        isCkb ? `هێز/ڤۆڵتیە: ${p.power}` : isAr ? `القوة: ${p.power}` : `Power: ${p.power}`
      );
    }

    // Check missing fields (Warranty, Delivery, Return Policy)
    const hasWarranty = p.warranty && p.warranty !== 'Information unavailable' && p.warranty !== 'Not provided';
    if (hasWarranty) {
      available.push(
        isCkb ? `گەرەنتی: ${p.warranty}` : isAr ? `الضمان: ${p.warranty}` : `Warranty: ${p.warranty}`
      );
    } else {
      missing.push(
        isCkb
          ? 'مەرجەکانی گەرەنتی دیاری نەکراوە'
          : isAr
          ? 'شروط الضمان غير محددة من قبل البائع'
          : 'Warranty coverage not stated by seller'
      );
      seller_questions.push(
        isCkb
          ? 'ماوەی گەرەنتی چەندە و ئایا ماتۆڕ و بەشەکانی دەگرێتەوە؟'
          : isAr
          ? 'كم مدة الضمان وهل يغطي المحرك والأجزاء الداخلية؟'
          : 'How long is the warranty and does it cover parts/motor?'
      );
    }

    const hasDelivery = p.delivery_info && p.delivery_info !== 'Delivery info not specified' && p.delivery_info !== 'Not provided';
    if (hasDelivery) {
      available.push(
        isCkb ? `گەیاندن: ${p.delivery_info}` : isAr ? `التوصيل: ${p.delivery_info}` : `Delivery: ${p.delivery_info}`
      );
    } else {
      missing.push(
        isCkb
          ? 'تێچوو و شێوازی گەیاندن ڕوون نەکراوەتەوە'
          : isAr
          ? 'تفاصيل وتكلفة التوصيل غير موضحة'
          : 'Delivery terms and fee not specified'
      );
      seller_questions.push(
        isCkb
          ? `ئایا گەیاندنی پارێزراو هەیە بۆ ${p.location || 'شارەکەم'} و تێچووی چەندە؟`
          : isAr
          ? `هل يتوفر توصيل آمن إلى ${p.location || 'مدينتي'} وكم تبلغ الرسوم؟`
          : `Is safe delivery available to ${p.location || 'my city'} and what is the fee?`
      );
    }

    const hasReturn = p.return_policy && p.return_policy !== 'Return policy not provided' && p.return_policy !== 'Not provided';
    if (hasReturn) {
      available.push(
        isCkb ? `یاسای گەڕاندنەوە: ${p.return_policy}` : isAr ? `سياسة الإرجاع: ${p.return_policy}` : `Return policy: ${p.return_policy}`
      );
    } else {
      missing.push(
        isCkb
          ? 'یاسای گەڕاندنەوە دیاری نەکراوە'
          : isAr
          ? 'سياسة الإرجاع أو الاستبدال غير مذكورة'
          : 'Return/replacement policy not stated'
      );
      seller_questions.push(
        isCkb
          ? 'ئەگەر کاڵاکە کێشەی هەبێت، چەند ڕۆژ مۆڵەتی تاقیکردنەوە یان گۆڕین هەیە؟'
          : isAr
          ? 'في حال وجود خلل، كم يوماً مهلة التجربة أو الاستبدال؟'
          : 'How many days do I have to inspect and test or return the item?'
      );
    }

    return {
      productId: p.id,
      productName: p.name,
      available,
      missing,
      seller_questions,
    };
  });

  // Aggregate questions to ask the seller
  const allSellerQuestionsSet = new Set<string>();
  information_gaps.forEach((g) => g.seller_questions.forEach((q) => allSellerQuestionsSet.add(q)));
  const seller_questions = Array.from(allSellerQuestionsSet).slice(0, 4);

  // 3. Multi-product Comparison & Objective Recommendation (when >= 2 products exist)
  let comparison = null;
  let recommendation = '';

  if (products.length >= 2) {
    const p1 = products[0];
    const p2 = products[1];

    const diffs: string[] = [];
    if (p1.price !== p2.price) {
      const cheaper = p1.price < p2.price ? p1 : p2;
      const pricier = p1.price < p2.price ? p2 : p1;
      diffs.push(
        isCkb
          ? `بەرهەمی "${cheaper.name}" بە نرخی (${cheaper.price.toLocaleString()} ${cheaper.currency}) گونجاوترە لە "${pricier.name}" (${pricier.price.toLocaleString()} ${pricier.currency}).`
          : isAr
          ? `منتج "${cheaper.name}" بسعر (${cheaper.price.toLocaleString()} ${cheaper.currency}) أوفر من "${pricier.name}" (${pricier.price.toLocaleString()} ${pricier.currency}).`
          : `"${cheaper.name}" is more budget-friendly (${cheaper.price.toLocaleString()} ${cheaper.currency}) compared to "${pricier.name}" (${pricier.price.toLocaleString()} ${pricier.currency}).`
      );
    }

    if (p1.warranty !== p2.warranty) {
      diffs.push(
        isCkb
          ? `مەرجی گەرەنتی جیاوازە: "${p1.name}" (${p1.warranty || 'نادیار'}) بەرامبەر "${p2.name}" (${p2.warranty || 'نادیار'}).`
          : isAr
          ? `شروط الضمان تختلف: "${p1.name}" (${p1.warranty || 'غير محدد'}) مقابل "${p2.name}" (${p2.warranty || 'غير محدد'}).`
          : `Warranty coverage differs: "${p1.name}" (${p1.warranty || 'None'}) vs "${p2.name}" (${p2.warranty || 'None'}).`
      );
    }

    if (p1.capacity && p2.capacity && p1.capacity !== p2.capacity) {
      diffs.push(
        isCkb
          ? `قەبارە: "${p1.name}" خاوەنی (${p1.capacity})یە، لە کاتێکدا "${p2.name}" خاوەنی (${p2.capacity})یە.`
          : isAr
          ? `السعة: "${p1.name}" توفر (${p1.capacity})، بينما "${p2.name}" توفر (${p2.capacity}).`
          : `Capacity: "${p1.name}" has (${p1.capacity}), while "${p2.name}" has (${p2.capacity}).`
      );
    }

    comparison = {
      summary: isCkb
        ? `بەراوردکاری ڕاستەوخۆی نێوان ${products.length} بەرهەمی دۆزراوە لە سلێمانی، هەولێر و دهۆک لەسەر بنەمای زانیارییە پشتڕاستکراوەکانی داتابەیس.`
        : isAr
        ? `مقارنة مباشرة بين ${products.length} منتجات تم العثور عليها في السليمانية وأربيل ودهوك بناءً على بيانات قاعدة البيانات المؤكدة.`
        : `Direct comparison of ${products.length} matching products found in local Kurdistan shops based on verified database records.`,
      differences: diffs,
      matrix: [
        {
          feature: isCkb ? 'نرخ' : isAr ? 'السعر' : 'Price',
          values: Object.fromEntries(products.map((p) => [p.id, `${p.price.toLocaleString()} ${p.currency}`])),
        },
        {
          feature: isCkb ? 'گەرەنتی' : isAr ? 'الضمان' : 'Warranty',
          values: Object.fromEntries(products.map((p) => [p.id, p.warranty || (isCkb ? 'دیاری نەکراوە' : isAr ? 'غير محدد' : 'Not stated')])),
        },
        {
          feature: isCkb ? 'گەیاندن' : isAr ? 'التوصيل' : 'Delivery',
          values: Object.fromEntries(products.map((p) => [p.id, p.delivery_info || (isCkb ? 'دیاری نەکراوە' : isAr ? 'غير محدد' : 'Not stated')])),
        },
        {
          feature: isCkb ? 'شوێنی فرۆشیار' : isAr ? 'موقع البائع' : 'Seller Location',
          values: Object.fromEntries(products.map((p) => [p.id, `${p.seller_name} (${p.location})`])),
        },
      ],
    };

    // Objective recommendation rationale (NEVER claim one is objectively the absolute best)
    const bestP = products[0];
    const secondP = products[1];
    recommendation = isCkb
      ? `بەپێی پێداویستی و بودجەکەت، بەرهەمی "${bestP.name}" گونجاوترین هەڵبژاردەیە ئەگەر لە پێشینەت ${bestP.warranty ? 'گەرەنتی و ' : ''}نرخی کەمتر بێت. ئەگەر تایبەتمەندی و قەبارەی زیاترت دەوێت، "${secondP.name}" بژاردەیەکی شایستەیە.`
      : isAr
      ? `بناءً على طلبك وميزانيتك، منتج "${bestP.name}" هو الخيار الأكثر ملاءمة إذا كانت أولويتك السعر ${bestP.warranty ? 'والضمان' : ''}. أما إذا كنت تفضل سعة أو ميزات إضافية، فقد يكون "${secondP.name}" مناسباً أكثر.`
      : `Based on your stated request and preferences, "${bestP.name}" is the better match if your priority is price ${bestP.warranty ? 'and warranty' : ''}. If you require larger capacity or extra specs, "${secondP.name}" may be suitable.`;
  } else if (products.length === 1) {
    const p = products[0];
    recommendation = isCkb
      ? `بەرهەمی "${p.name}" لە "${p.seller_name}" (${p.location}) هاوتای تەواوی داواکارییەکەتە بە نرخی ${p.price.toLocaleString()} ${p.currency}.`
      : isAr
      ? `منتج "${p.name}" من متجر "${p.seller_name}" (${p.location}) يطابق تماماً طلبك بسعر ${p.price.toLocaleString()} ${p.currency}.`
      : `"${p.name}" from "${p.seller_name}" (${p.location}) matches your exact request at ${p.price.toLocaleString()} ${p.currency}.`;
  } else {
    recommendation = isCkb
      ? `هیچ بەرهەمێک بە تەواوی هاوتای ئەم مەرجانە (لە ${targetLocation}${budgetMax ? ` بە کەمتر لە ${budgetMax.toLocaleString()} دینار` : ''}) لە داتابەیسدا نەدۆزرایەوە. پێشنیار دەکەین بودجەکەت کەمێک بەرزتر بکەیتەوە یان شارێکی تر هەڵبژێریت. دەتوانیت سەیری بەرهەمە ڕاستەقینەکانی تری کەتەلۆگ بکەیت لەم پۆلەدا.`
      : isAr
      ? `لم يتم العثور على منتجات مطابقة تماماً لهذه الشروط (في ${targetLocation}${budgetMax ? ` بأقل من ${budgetMax.toLocaleString()} دينار` : ''}) في قاعدة البيانات. نقترح تعديل الميزانية أو اختيار مدينة أخرى. يمكنك الاطلاع على البدائل المتوفرة فعلياً في الكتالوج.`
      : `No products matching these exact criteria (in ${targetLocation}${budgetMax ? ` under ${budgetMax.toLocaleString()} IQD` : ''}) were found in the database. Suggestions: Consider raising your budget or selecting a different city. Real catalogue alternatives are available below.`;
  }

  const latencyMs = Date.now() - startTime;

  // Persist search query and AI results to Supabase ai_requests
  await logSearchQuery({
    query_text: query,
    detected_language: interpretation.detected_language,
    parsed_product_type: interpretation.product_type,
    parsed_location: interpretation.target_location,
    parsed_budget: interpretation.budget_max || null,
    results_count: products.length,
    product_ids: products.map((p) => p.id),
    full_interpretation: interpretation,
    latency_ms: latencyMs,
  });

  return {
    request: {
      product: productTerm,
      category: categoryTerm,
      location: targetLocation,
      max_price: budgetMax,
      min_price: budgetMin,
      currency: 'IQD',
      preferences,
      language: normLang,
    },
    interpretation,
    products,
    alternatives,
    comparison,
    information_gaps,
    recommendation,
    seller_questions,
    language: normLang,
  };
}

// Rule-based deterministic extractor for Kurdish, Arabic, and English queries (Zero-failure fallback when Gemini is 503 or offline)
function extractDeterministicCriteria(query: string, lang: string = 'ku'): any {
  const qLower = query.toLowerCase();

  // 1. Detect language
  let detectedLang = 'ckb';
  if (/[\u0600-\u06FF]/.test(query)) {
    if (
      query.includes('أريد') ||
      query.includes('ابحث') ||
      query.includes('التي') ||
      query.includes('سعر') ||
      query.includes('أربيل') ||
      query.includes('السليمانية')
    ) {
      detectedLang = 'ar';
    } else {
      detectedLang = 'ckb';
    }
  } else {
    detectedLang = 'en';
  }

  // 2. City extraction
  let city = 'Kurdistan Region';
  if (
    query.includes('سلێمانی') ||
    query.includes('السليمانية') ||
    qLower.includes('sulaymaniyah') ||
    qLower.includes('slemani')
  ) {
    city = 'Sulaymaniyah';
  } else if (
    query.includes('هەولێر') ||
    query.includes('أربيل') ||
    qLower.includes('erbil') ||
    qLower.includes('hawler')
  ) {
    city = 'Erbil';
  } else if (
    query.includes('دهۆک') ||
    query.includes('دهوك') ||
    qLower.includes('duhok')
  ) {
    city = 'Duhok';
  } else if (
    query.includes('هەڵەبجە') ||
    query.includes('حلبجة') ||
    qLower.includes('halabja')
  ) {
    city = 'Halabja';
  }

  // 3. Price / Budget extraction (converts Eastern Arabic numerals and words like هەزار / ألف)
  let maxPrice: number | null = null;
  const normalizedNumbers = query.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());

  const thousandMatch = normalizedNumbers.match(/(\d+)\s*(هەزار|الف|ألف|k)/i);
  if (thousandMatch) {
    maxPrice = parseInt(thousandMatch[1], 10) * 1000;
  } else {
    const rawNumMatch = normalizedNumbers.match(
      /(?:کەمتر لە|أقل من|under|less than|up to|بۆ|بە|budget)?\s*(\d{1,3}(?:[,\.]\d{3})+|\d{4,9})/i
    );
    if (rawNumMatch) {
      const cleaned = rawNumMatch[1].replace(/[,\.]/g, '');
      const parsed = parseInt(cleaned, 10);
      if (parsed > 1000) maxPrice = parsed;
    }
  }

  // 4. Product keyword & Category
  let product = 'General';
  let category = 'General';
  if (
    query.includes('ئێرفرایەر') ||
    query.includes('قلاية') ||
    qLower.includes('air fryer') ||
    qLower.includes('airfryer')
  ) {
    product = 'air fryer';
    category = 'Kitchen Appliances & Supplies';
  } else if (
    query.includes('قاوە') ||
    query.includes('قهوة') ||
    qLower.includes('coffee') ||
    qLower.includes('espresso')
  ) {
    product = 'coffee';
    category = 'Kitchen Appliances & Supplies';
  } else if (
    query.includes('خەڵاتە') ||
    query.includes('خلاط') ||
    qLower.includes('blender')
  ) {
    product = 'blender';
    category = 'Kitchen Appliances & Supplies';
  } else if (
    query.includes('جارووبەرەقی') ||
    query.includes('مكنسة') ||
    qLower.includes('vacuum')
  ) {
    product = 'vacuum';
    category = 'Home Appliances';
  } else if (
    query.includes('هەنگوین') ||
    query.includes('عسل') ||
    qLower.includes('honey')
  ) {
    product = 'honey';
    category = 'Local Food & Products';
  } else if (
    query.includes('بەرمای') ||
    query.includes('کەلەپوور') ||
    query.includes('سجاد') ||
    qLower.includes('rug') ||
    qLower.includes('craft')
  ) {
    product = 'rug';
    category = 'Handmade & Heritage';
  } else if (
    query.includes('جەزوە') ||
    query.includes('دلة') ||
    qLower.includes('copper')
  ) {
    product = 'copper';
    category = 'Handmade & Heritage';
  } else if (
    query.includes('کتێب') ||
    query.includes('پەرتووک') ||
    query.includes('کتاب') ||
    query.includes('کتب') ||
    query.includes('ڕۆمان') ||
    query.includes('شێعر') ||
    query.includes('مەم و زین') ||
    query.includes('نالی') ||
    qLower.includes('book') ||
    qLower.includes('novel') ||
    qLower.includes('poetry')
  ) {
    product = 'book';
    category = 'Books';
  }

  // 5. Preferences
  const preferences: string[] = [];
  if (query.includes('گەرەنتی') || query.includes('ضمان') || qLower.includes('warranty')) {
    preferences.push('warranty required');
  }
  if (query.includes('گەیاندن') || query.includes('توصيل') || qLower.includes('delivery')) {
    preferences.push('local delivery');
  }

  return {
    product,
    category,
    location: city,
    max_price: maxPrice,
    min_price: null,
    preferences,
    detected_language: detectedLang,
  };
}
