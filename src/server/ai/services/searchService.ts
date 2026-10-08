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
  language: string = 'ku'
): Promise<AiSearchComprehensiveResult> {
  const startTime = Date.now();
  const normLang = language === 'ar' ? 'ar' : language === 'en' ? 'en' : 'ckb';
  const dbLang: 'en' | 'ku' | 'ar' = normLang === 'ckb' ? 'ku' : normLang;
  const isCkb = normLang === 'ckb';
  const isAr = normLang === 'ar';

  const prompt = buildSearchPrompt(query, language);
  const parsed = await generateJson<any>(prompt);

  const productTerm = parsed?.product || parsed?.product_type || query.trim();
  const categoryTerm = parsed?.category || 'General';
  const targetLocation = parsed?.location || parsed?.target_location || 'Kurdistan Region';
  const budgetMax = typeof parsed?.max_price === 'number' ? parsed.max_price : typeof parsed?.budget_max === 'number' ? parsed.budget_max : null;
  const budgetMin = typeof parsed?.min_price === 'number' ? parsed.min_price : null;
  const preferences: string[] = Array.isArray(parsed?.preferences) ? parsed.preferences : Array.isArray(parsed?.extracted_preferences) ? parsed.extracted_preferences : [];

  const interpretation: AISearchInterpretation = {
    query,
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

  // 1. Query Supabase products using deterministic criteria
  let rawProducts = await findProducts({
    search: productTerm,
    city: targetLocation !== 'Kurdistan Region' && targetLocation !== 'Kurdistan' ? targetLocation : undefined,
    maxPrice: budgetMax || undefined,
    minPrice: budgetMin || undefined,
    lang: dbLang,
  });

  // If strict city search returned 0 results, expand city to show nearby Kurdistan merchants while preserving the gap notice
  if (rawProducts.length === 0 && (targetLocation !== 'Kurdistan Region' && targetLocation !== 'Kurdistan')) {
    rawProducts = await findProducts({
      search: productTerm,
      maxPrice: budgetMax || undefined,
      minPrice: budgetMin || undefined,
      lang: dbLang,
    });
  }

  // If search was very narrow, fetch relevant fallback category items
  if (rawProducts.length === 0) {
    rawProducts = await findProducts({
      category: categoryTerm !== 'General' ? categoryTerm : undefined,
      maxPrice: budgetMax || undefined,
      lang: dbLang,
    });
  }

  // Localize product attributes according to active user language
  const products: Product[] = rawProducts.map((p) => localizeProduct(p, normLang));

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
      ? `هیچ بەرهەمێک بە تەواوی هاوتای ئەم مەرجانە لە داتابەیسی ئێستادا نەدۆزرایەوە. تکایە بودجەکەت فراوانتر بکە یان شارێکی تر هەڵبژێرە.`
      : isAr
      ? `لم يتم العثور على منتجات مطابقة تماماً لهذه الشروط في قاعدة البيانات الحالية. يرجى تعديل الميزانية أو اختيار مدينة أخرى.`
      : `No products matching these exact criteria were found in the current database. Try broadening your budget or location filter.`;
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
    comparison,
    information_gaps,
    recommendation,
    seller_questions,
    language: normLang,
  };
}
