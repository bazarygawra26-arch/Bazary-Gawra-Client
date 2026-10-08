export type AppLang = 'en' | 'ckb' | 'ku' | 'ar';

export function normalizeLang(lang: string | undefined): 'en' | 'ckb' | 'ar' {
  if (lang === 'ckb' || lang === 'ku') return 'ckb';
  if (lang === 'ar') return 'ar';
  return 'en';
}

// 1. Categories
const categoryDict: Record<string, { en: string; ckb: string; ar: string }> = {
  'kitchen-home': {
    en: 'Kitchen & Home',
    ckb: 'چێشتخانە و ماڵ',
    ar: 'المطبخ والمنزل',
  },
  'coffee-machines': {
    en: 'Coffee & Espresso',
    ckb: 'قاوە و قاوەساز',
    ar: 'القهوة والإسبريسو',
  },
  'home-appliances': {
    en: 'Home Appliances',
    ckb: 'کەلوپەلی کارەبایی ماڵ',
    ar: 'الأجهزة المنزلية',
  },
  'smart-home': {
    en: 'Smart Home & Tech',
    ckb: 'ماڵی ژیر و تەکنەلۆجیا',
    ar: 'المنزل الذكي والتقنية',
  },
  'local-food-honey': {
    en: 'Local Food & Honey',
    ckb: 'هەنگوین و بەرهەمی خۆماڵی',
    ar: 'العسل والمنتجات المحلية',
  },
  'cooking-kitchenware': {
    en: 'Cookware & Kitchen',
    ckb: 'مەنجەڵ و پێداویستی چێشتخانە',
    ar: 'أواني وأدوات المطبخ',
  },
  'traditional-crafts': {
    en: 'Handmade & Heritage',
    ckb: 'دەستکرد و کەلەپوور',
    ar: 'حرف يدوية وتراث',
  },
  'vacuum-cleaners': {
    en: 'Vacuum Cleaners',
    ckb: 'جاڕووبەرقی',
    ar: 'مكانس كهربائية',
  },
  'fans-cooling': {
    en: 'Cooling & Fans',
    ckb: 'فێنککەرەوە و پانکە',
    ar: 'التبريد والمراوح',
  },
  'heaters-heating': {
    en: 'Heaters & Warming',
    ckb: 'زۆپا و گەرمکەرەوە',
    ar: 'المدافئ والتدفئة',
  },
  'water-purifiers': {
    en: 'Water Purifiers',
    ckb: 'پاڵاوتنی ئاو',
    ar: 'فلاتر المياه',
  },
  'blenders-mixers': {
    en: 'Blenders & Food Prep',
    ckb: 'خەڵاتە و ئامادەکاری خواردن',
    ar: 'خلاطات وتحضير الطعام',
  },
  'electronics': {
    en: 'Electronics & Accessories',
    ckb: 'ئەلیکترۆنیات و بەشەکان',
    ar: 'إلكترونيات وإكسسوارات',
  },
  'tea-makers-kettles': {
    en: 'Kettles & Tea Makers',
    ckb: 'قۆری و چایساز',
    ar: 'غلايات وصانعات الشاي',
  },
};

export function localizeCategory(raw: string | undefined, lang: string): string {
  if (!raw) return '';
  const l = normalizeLang(lang);
  const normalizedKey = raw.toLowerCase().trim().replace(/\s+/g, '-');

  for (const [key, val] of Object.entries(categoryDict)) {
    if (
      normalizedKey === key ||
      raw.toLowerCase() === val.en.toLowerCase() ||
      raw === val.ckb ||
      raw === val.ar
    ) {
      return val[l];
    }
  }

  // Partial match checks
  const lower = raw.toLowerCase();
  if (lower.includes('honey') || lower.includes('food') || lower.includes('هەنگوین') || lower.includes('عسل')) {
    return categoryDict['local-food-honey'][l];
  }
  if (lower.includes('coffee') || lower.includes('قاوە') || lower.includes('قهوة')) {
    return categoryDict['coffee-machines'][l];
  }
  if (lower.includes('kitchen') || lower.includes('چێشتخانە') || lower.includes('مطبخ')) {
    return categoryDict['kitchen-home'][l];
  }
  if (lower.includes('vacuum') || lower.includes('جاڕوو') || lower.includes('مكانس')) {
    return categoryDict['vacuum-cleaners'][l];
  }
  if (lower.includes('craft') || lower.includes('heritage') || lower.includes('دەستکرد') || lower.includes('تراث')) {
    return categoryDict['traditional-crafts'][l];
  }

  return raw;
}

// 2. Locations
const locationDict: Record<string, { en: string; ckb: string; ar: string }> = {
  'sulaymaniyah & penjwen': {
    en: 'Sulaymaniyah & Penjwen',
    ckb: 'سلێمانی و پێنجوێن',
    ar: 'السليمانية وبنجوين',
  },
  'sulaymaniyah': {
    en: 'Sulaymaniyah',
    ckb: 'سلێمانی',
    ar: 'السليمانية',
  },
  'erbil': {
    en: 'Erbil',
    ckb: 'هەولێر',
    ar: 'أربيل',
  },
  'duhok': {
    en: 'Duhok',
    ckb: 'دهۆک',
    ar: 'دهوك',
  },
  'halabja': {
    en: 'Halabja',
    ckb: 'هەڵەبجە',
    ar: 'حلبجة',
  },
  'zakho': {
    en: 'Zakho',
    ckb: 'زاخۆ',
    ar: 'زاخو',
  },
  'koya': {
    en: 'Koya',
    ckb: 'کۆیە',
    ar: 'كوية',
  },
  'kalar': {
    en: 'Kalar',
    ckb: 'کەلار',
    ar: 'كلار',
  },
  'penjwen': {
    en: 'Penjwen',
    ckb: 'پێنجوێن',
    ar: 'بنجوين',
  },
  'hawraman': {
    en: 'Hawraman',
    ckb: 'هەورامان',
    ar: 'هورامان',
  },
  'kurdistan': {
    en: 'Kurdistan',
    ckb: 'کوردستان',
    ar: 'كوردستان',
  },
};

export function localizeLocation(raw: string | undefined, lang: string): string {
  if (!raw) return '';
  const l = normalizeLang(lang);
  const lower = raw.toLowerCase().trim();

  for (const [key, val] of Object.entries(locationDict)) {
    if (lower === key || raw === val.ckb || raw === val.ar) {
      return val[l];
    }
  }

  if (lower.includes('penjwen') && lower.includes('sulaymaniyah')) {
    return locationDict['sulaymaniyah & penjwen'][l];
  }
  if (lower.includes('sulaymaniyah') || lower.includes('سلێمانی') || lower.includes('سليمانية')) {
    return locationDict['sulaymaniyah'][l];
  }
  if (lower.includes('erbil') || lower.includes('هەولێر') || lower.includes('أربيل')) {
    return locationDict['erbil'][l];
  }
  if (lower.includes('duhok') || lower.includes('دهۆک') || lower.includes('دهوك')) {
    return locationDict['duhok'][l];
  }
  if (lower.includes('hawraman') || lower.includes('هەورامان') || lower.includes('هورامان')) {
    return locationDict['hawraman'][l];
  }

  return raw;
}

// 3. Sellers
const sellerDict: Record<string, { en: string; ckb: string; ar: string }> = {
  'chiya natural mountain goods': {
    en: 'Chiya Natural Mountain Goods',
    ckb: 'بەرهەمە سروشتییەکانی چیا',
    ar: 'منتجات جبل جيا الطبيعية',
  },
  'chiya natural goods': {
    en: 'Chiya Natural Mountain Goods',
    ckb: 'بەرهەمە سروشتییەکانی چیا',
    ar: 'منتجات جبل جيا الطبيعية',
  },
  'sulaymaniyah home tech': {
    en: 'Sulaymaniyah Home Tech',
    ckb: 'ماڵی تەکنەلۆجی سلێمانی',
    ar: 'تكنولوجيا منزل السليمانية',
  },
  'erbil modern appliances': {
    en: 'Erbil Modern Appliances',
    ckb: 'کەلوپەلی مۆدێرنی هەولێر',
    ar: 'أجهزة أربيل الحديثة',
  },
  'duhok elite electronics': {
    en: 'Duhok Elite Electronics',
    ckb: 'ئێلیت ئەلیکترۆنیکس دهۆک',
    ar: 'إلكترونيات دهوك النخبة',
  },
  'hawraman heritage crafts': {
    en: 'Hawraman Heritage Crafts',
    ckb: 'کەلەپوور و دەستکردی هەورامان',
    ar: 'حرف وتراث هورامان',
  },
  'prestige tech erbil': {
    en: 'Prestige Tech Erbil',
    ckb: 'پرێستیج تێک هەولێر',
    ar: 'بريستيج تك أربيل',
  },
  'sulaymaniyah home (demo)': {
    en: 'Sulaymaniyah Home (Demo)',
    ckb: 'ماڵی سلێمانی (دیمۆ)',
    ar: 'منزل السليمانية (تجريبي)',
  },
  'erbil kitchen warehouse (demo)': {
    en: 'Erbil Kitchen Warehouse (Demo)',
    ckb: 'کۆگای چێشتخانەی هەولێر (دیمۆ)',
    ar: 'مستودع مطبخ أربيل (تجريبي)',
  },
  'kurdistan pure honey (demo)': {
    en: 'Kurdistan Pure Honey (Demo)',
    ckb: 'ماڵی هەنگوینی کوردستان (دیمۆ)',
    ar: 'عسل كوردستان النقي (تجريبي)',
  },
  'zagros handmade crafts (demo)': {
    en: 'Zagros Handmade Crafts (Demo)',
    ckb: 'دەستکردی زاگرۆس (دیمۆ)',
    ar: 'حرف زاغروس اليدوية (تجريبي)',
  },
  'kawa electrical goods': {
    en: 'Kawa Electrical Goods',
    ckb: 'کەلوپەلی کارەبایی کاوە',
    ar: 'أجهزة كاوه الكهربائية',
  },
  'modern kitchen sulaymaniyah': {
    en: 'Modern Kitchen Sulaymaniyah',
    ckb: 'چێشتخانەی مۆدێرنی سلێمانی',
    ar: 'مطبخ السليمانية الحديث',
  },
  'smart living kurdistan': {
    en: 'Smart Living Kurdistan',
    ckb: 'ژیانی ژیر کوردستان',
    ar: 'الحياة الذكية كوردستان',
  },
  'hawraman organic apiaries': {
    en: 'Hawraman Organic Apiaries',
    ckb: 'هەنگوینی سروشتی هەورامان',
    ar: 'مناحل هورامان العضوية',
  },
};

export function localizeSellerName(raw: string | undefined, lang: string): string {
  if (!raw) return '';
  const l = normalizeLang(lang);
  const lower = raw.toLowerCase().trim();

  for (const [key, val] of Object.entries(sellerDict)) {
    if (lower === key || raw === val.ckb || raw === val.ar) {
      return val[l];
    }
  }

  if (lower.includes('chiya') || lower.includes('چیا') || lower.includes('جيا')) {
    return sellerDict['chiya natural mountain goods'][l];
  }
  if (lower.includes('sulaymaniyah home tech') || lower.includes('ماڵی تەکنەلۆجی')) {
    return sellerDict['sulaymaniyah home tech'][l];
  }
  if (lower.includes('erbil modern') || lower.includes('مۆدێرنی هەولێر')) {
    return sellerDict['erbil modern appliances'][l];
  }
  if (lower.includes('duhok elite') || lower.includes('ئێلیت ئەلیکترۆنیکس')) {
    return sellerDict['duhok elite electronics'][l];
  }
  if (lower.includes('hawraman heritage') || lower.includes('دەستکردی هەورامان')) {
    return sellerDict['hawraman heritage crafts'][l];
  }
  if (lower.includes('prestige tech') || lower.includes('پرێستیج تێک')) {
    return sellerDict['prestige tech erbil'][l];
  }

  return raw;
}

// 4. Warranties
export function localizeWarranty(raw: string | undefined, lang: string): string {
  if (!raw || raw === 'Information unavailable' || raw === 'Not provided') {
    return normalizeLang(lang) === 'ckb'
      ? 'گەرەنتی دیاری نەکراوە'
      : normalizeLang(lang) === 'ar'
      ? 'الضمان غير محدد'
      : 'No warranty provided';
  }
  const l = normalizeLang(lang);
  const lower = raw.toLowerCase();

  if (lower.includes('purity') || lower.includes('lab') || lower.includes('پاکی') || lower.includes('نقاوة')) {
    return l === 'ckb'
      ? 'گەرەنتی پاکی ١٠٠٪ (بڕوانامەی تاقیگەی باوەڕپێکراو)'
      : l === 'ar'
      ? 'ضمان النقاوة 100% (شهادة فحص مخبري معتمدة)'
      : '100% Purity Guarantee (Lab Tested Certificate available)';
  }

  if (lower.includes('weave') || lower.includes('lifetime') || lower.includes('دەستچنی') || lower.includes('الحياكة')) {
    return l === 'ckb'
      ? 'گەرەنتی ڕەسەنایەتی و دەستچنی هەتاهەتایی'
      : l === 'ar'
      ? 'ضمان الأصالة وجودة الحياكة مدى الحياة'
      : 'Authenticity & Lifetime Weave Guarantee';
  }

  if (lower.includes('24 month') || lower.includes('2 year') || lower.includes('٢٤ مانگ') || lower.includes('24 شهر') || lower.includes('سنتان')) {
    return l === 'ckb'
      ? '٢٤ مانگ گەرەنتی فەرمی ناوخۆیی'
      : l === 'ar'
      ? 'ضمان رسمي محلي لمدة 24 شهراً'
      : '24 Months Official Warranty';
  }

  if (lower.includes('12 month') || lower.includes('1 year') || lower.includes('١٢ مانگ') || lower.includes('12 شهر') || lower.includes('سنة')) {
    return l === 'ckb'
      ? '١٢ مانگ گەرەنتی فەرمی ناوخۆیی'
      : l === 'ar'
      ? 'ضمان رسمي محلي لمدة 12 شهراً'
      : '12 Months Official Warranty';
  }

  if (lower.includes('standard') || lower.includes('ستاندارد') || lower.includes('قياسي')) {
    return l === 'ckb'
      ? 'گەرەنتی ستانداردی ناوخۆیی'
      : l === 'ar'
      ? 'ضمان قياسي محلي'
      : 'Standard Local Warranty';
  }

  return raw;
}

// 5. Delivery info
export function localizeDelivery(raw: string | undefined, lang: string): string {
  if (!raw || raw === 'Not provided') {
    return normalizeLang(lang) === 'ckb'
      ? 'گەیاندن دیاری نەکراوە'
      : normalizeLang(lang) === 'ar'
      ? 'التوصيل غير محدد'
      : 'Delivery info not specified';
  }
  const l = normalizeLang(lang);
  const lower = raw.toLowerCase();

  if (lower.includes('free delivery') || lower.includes('2+ jar') || lower.includes('بێبەرامبەر') || lower.includes('مجاني')) {
    return l === 'ckb'
      ? 'گەیاندنی بێبەرامبەر بۆ ٢ دانە و زیاتر لە سەرتاسەری کوردستان'
      : l === 'ar'
      ? 'توصيل مجاني لعلبتين فأكثر في كافة مناطق كوردستان'
      : 'Free delivery across Kurdistan for 2+ items';
  }

  if (lower.includes('fragile') || lower.includes('glass') || lower.includes('شوشە') || lower.includes('زجاج')) {
    return l === 'ckb'
      ? 'گەیاندنی پارێزراو بە پلەی گەرمی گونجاو بۆ شوشە'
      : l === 'ar'
      ? 'توصيل مبرد ومحمي للعبوات الزجاجية'
      : 'Temperature-controlled fragile glass delivery';
  }

  if (lower.includes('express') || lower.includes('1-2') || lower.includes('خێرا') || lower.includes('سريع')) {
    return l === 'ckb'
      ? 'گەیاندنی خێرا لە سەرتاسەری کوردستان (١-٢ ڕۆژ)'
      : l === 'ar'
      ? 'توصيل سريع لجميع مناطق كوردستان (1-2 يوم)'
      : 'Express delivery across Kurdistan (1-2 days)';
  }

  if (lower.includes('delivery available') || lower.includes('local fast') || lower.includes('بەردەستە') || lower.includes('متوفر')) {
    return l === 'ckb'
      ? 'گەیاندنی خێرا بەردەستە بۆ هەموو شارەکان'
      : l === 'ar'
      ? 'توصيل سريع متوفر لكافة المدن'
      : 'Local fast delivery available';
  }

  return raw;
}

// 6. Return Policy
export function localizeReturnPolicy(raw: string | undefined, lang: string): string {
  if (!raw || raw === 'Not provided') {
    return normalizeLang(lang) === 'ckb'
      ? 'مەرجی گەڕاندنەوە دیاری نەکراوە'
      : normalizeLang(lang) === 'ar'
      ? 'سياسة الإرجاع غير محددة'
      : 'Return policy not provided';
  }
  const l = normalizeLang(lang);
  const lower = raw.toLowerCase();

  if (lower.includes('purity') || lower.includes('laboratory') || lower.includes('تاقیگە') || lower.includes('مخبر')) {
    return l === 'ckb'
      ? 'گەڕاندنەوەی تەواوی پارە ئەگەر پشکنینی تاقیگە دەرنەچوو'
      : l === 'ar'
      ? 'استرجاع كامل للمبلغ في حال عدم اجتياز الفحص المخبري'
      : 'Full refund if laboratory test fails purity check';
  }

  if (lower.includes('48') || lower.includes('replacement') || lower.includes('گۆڕین') || lower.includes('استبدال')) {
    return l === 'ckb'
      ? '٤٨ کاتژمێر تاقیکردنەوە و گۆڕینی دەستبەجێ'
      : l === 'ar'
      ? '48 ساعة تجربة واستبدال فوري'
      : '48 hours test & replacement guarantee';
  }

  if (lower.includes('7') || lower.includes('satisfaction') || lower.includes('ناڕازی') || lower.includes('استرجاع')) {
    return l === 'ckb'
      ? '٧ ڕۆژ گەرەنتی گەڕاندنەوەی پارە لە کاتی ناڕازیبوون'
      : l === 'ar'
      ? 'ضمان استرجاع المبلغ خلال 7 أيام'
      : '7-day money-back satisfaction guarantee';
  }

  if (lower.includes('14') || lower.includes('defect') || lower.includes('کێشە') || lower.includes('عيب')) {
    return l === 'ckb'
      ? '١٤ ڕۆژ مافی گۆڕین یان وەرگرتنەوەی پارە لە کاتی بوونی کێشە'
      : l === 'ar'
      ? '14 يوماً للاستبدال أو الاسترجاع في حال وجود عيب'
      : '14-day exchange or refund if defect detected';
  }

  return raw;
}

// 7. Origins
export function localizeOrigin(raw: string | undefined, lang: string): string {
  if (!raw || raw === 'Not provided') {
    return normalizeLang(lang) === 'ckb'
      ? 'دیاری نەکراوە'
      : normalizeLang(lang) === 'ar'
      ? 'غير محدد'
      : 'Not provided';
  }
  const l = normalizeLang(lang);
  const lower = raw.toLowerCase();

  if (lower.includes('penjwen') || lower.includes('پێنجوێن') || lower.includes('بنجوين')) {
    return l === 'ckb'
      ? 'کوێستانەکانی پێنجوێن، هەرێمی کوردستان'
      : l === 'ar'
      ? 'مرتفعات بنجوين، إقليم كوردستان'
      : 'Penjwen Highlands, Kurdistan Region';
  }

  if (lower.includes('hawraman') || lower.includes('هەورامان') || lower.includes('هورامان')) {
    return l === 'ckb'
      ? 'دۆڵی هەورامان، هەرێمی کوردستان'
      : l === 'ar'
      ? 'وادي هورامان، إقليم كوردستان'
      : 'Hawraman Valley, Kurdistan Region';
  }

  if (lower.includes('italy') || lower.includes('ئیتاڵیا') || lower.includes('إيطاليا')) {
    return l === 'ckb'
      ? 'ئیتاڵیا (مۆنتاری فەرمی)'
      : l === 'ar'
      ? 'إيطاليا (تجميع رسمي معتمد)'
      : 'Italy (Official Assembly)';
  }

  if (lower.includes('germany') || lower.includes('ئەڵمانیا') || lower.includes('ألمانيا')) {
    return l === 'ckb'
      ? 'ئەڵمانیا (دیزاین و ئەندازیاری)'
      : l === 'ar'
      ? 'ألمانيا (تصميم وهندسة)'
      : 'Germany (Designed & Engineered)';
  }

  if (lower.includes('united kingdom') || lower.includes('dyson') || lower.includes('بەریتانیا') || lower.includes('المملكة المتحدة')) {
    return l === 'ckb'
      ? 'بەریتانیا (تایبەت بە دایسۆن)'
      : l === 'ar'
      ? 'المملكة المتحدة (أبحاث دايسون)'
      : 'United Kingdom (Dyson)';
  }

  if (lower.includes('china') || lower.includes('چین') || lower.includes('الصين')) {
    return l === 'ckb'
      ? 'چین (وەشانی ژیری جیهانی)'
      : l === 'ar'
      ? 'الصين (النسخة الذكية العالمية)'
      : 'China (Global Edition)';
  }

  return raw;
}

// 8. Universal Product Localizer
export function localizeProduct<T extends {
  name: string;
  name_ckb?: string;
  name_ar?: string;
  category: string;
  location: string;
  seller_name: string;
  warranty?: string;
  delivery_info?: string;
  return_policy?: string;
  origin?: string;
}>(prod: T, lang: string): T {
  const l = normalizeLang(lang);
  const localizedName =
    l === 'ckb' && prod.name_ckb
      ? prod.name_ckb
      : l === 'ar' && prod.name_ar
      ? prod.name_ar
      : prod.name;

  return {
    ...prod,
    name: localizedName,
    category: localizeCategory(prod.category, lang),
    location: localizeLocation(prod.location, lang),
    seller_name: localizeSellerName(prod.seller_name, lang),
    warranty: localizeWarranty(prod.warranty, lang),
    delivery_info: localizeDelivery(prod.delivery_info, lang),
    return_policy: localizeReturnPolicy(prod.return_policy, lang),
    origin: localizeOrigin(prod.origin, lang),
  };
}

// 9. AI Vision Scanner Result Localizer
export interface AIImageAnalysisData {
  category: string;
  product_type: string;
  brand_name: string;
  model_number: string;
  visible_capacity: string;
  visible_power: string;
  visible_features: string[];
  visible_labels_text: string;
  available_signals: string[];
  missing_signals: string[];
  summary: string;
  suggested_search_query: string;
  draft_listing: {
    suggested_title: string;
    category: string;
    visible_specs: string;
    missing_required_fields: string[];
  };
}

export function localizeAnalysisResult(data: AIImageAnalysisData, lang: string): AIImageAnalysisData {
  const l = normalizeLang(lang);
  if (l === 'en') return data;

  const isCkb = l === 'ckb';

  // Helper for single phrase translation
  const translatePhrase = (str: string): string => {
    if (!str) return str;
    const lower = str.toLowerCase();

    // Missing signals
    if (lower.includes('price not provided') || lower.includes('not in image')) {
      return isCkb ? 'نرخ دیاری نەکراوە (لە وێنەکەدا نییە)' : 'السعر غير محدد (غير موجود في الصورة)';
    }
    if (lower.includes('warranty terms not visible') || lower.includes('warranty coverage')) {
      return isCkb ? 'مەرجەکانی گەرەنتی دیار نین' : 'شروط الضمان غير مرئية';
    }
    if (lower.includes('seller and shop') || lower.includes('seller identity') || lower.includes('seller shop address')) {
      return isCkb ? 'ناوی فرۆشیار و شوناسی دوکان نادیارە' : 'اسم البائع وهوية المتجر غير محددة';
    }
    if (lower.includes('delivery information') || lower.includes('delivery terms not stated')) {
      return isCkb ? 'زانیاری و تێچووی گەیاندن دابین نەکراوە' : 'معلومات وشروط التوصيل غير متوفرة';
    }
    if (lower.includes('return policy not stated') || lower.includes('return policy')) {
      return isCkb ? 'یاسای گەڕاندنەوە دیاری نەکراوە' : 'سياسة الإرجاع غير مذكورة';
    }
    if (lower.includes('purity guarantee') || lower.includes('laboratory certificate')) {
      return isCkb ? 'بڕوانامەی دڵنیایی پاکی و گەرەنتی دابین نەکراوە' : 'شهادة فحص النقاء والضمان غير متوفرة';
    }

    // Available signals
    if (lower.includes('product category identified: kitchen') || lower.includes('kitchen appliances')) {
      return isCkb ? 'پۆلی بەرهەم دیاریکرا: ئامێرەکانی چێشتخانە' : 'تم تحديد فئة المنتج: أجهزة المطبخ';
    }
    if (lower.includes('product category identified: coffee') || lower.includes('coffee & espresso')) {
      return isCkb ? 'پۆلی بەرهەم دیاریکرا: قاوە و ئێسپرێسۆ' : 'تم تحديد فئة المنتج: القهوة والإسبريسو';
    }
    if (lower.includes('product category identified: local') || lower.includes('honey')) {
      return isCkb ? 'پۆلی بەرهەم دیاریکرا: خۆراکی خۆماڵی و هەنگوین' : 'تم تحديد فئة المنتج: عسل وأغذية محلية';
    }
    if (lower.includes('dual basket form factor') || lower.includes('dual basket')) {
      return isCkb ? 'شێوەی دوو سەبەتەی سەربەخۆ لە وێنەکەدا دیارە' : 'تصميم السلتين المستقلتين مرئي بوضوح';
    }
    if (lower.includes('digital control interface verified') || lower.includes('digital touch')) {
      return isCkb ? 'شاشەی کۆنترۆڵی دیجیتاڵی پشتڕاستکرایەوە' : 'واجهة التحكم الرقمية مؤكدة';
    }
    if (lower.includes('stainless steel body') || lower.includes('stainless steel')) {
      return isCkb ? 'پێکهاتەی جەستەی ستیلی دژە ژەنگ دیارە' : 'هيكل الستانلس ستيل مرئي بوضوح';
    }
    if (lower.includes('portafilter')) {
      return isCkb ? 'دەسکی پۆرتافیلتەری دەستی بەستراوەتەوە' : 'ملحق فلتر القهوة اليدوي موجود';
    }
    if (lower.includes('net weight') || lower.includes('1kg')) {
      return isCkb ? 'کێشی تۆمارکراو دیارە (١ کگم)' : 'علامة الوزن الصافي مرئية (1 كغم)';
    }
    if (lower.includes('natural harvest') || lower.includes('certification badge')) {
      return isCkb ? 'نیشانەی بڕوانامەی سروشتیبوون لەسەر لێبڵەکە دیارە' : 'شارة الاعتماد الطبيعي مرئية على الملصق';
    }

    // Features
    if (lower.includes('two independent cooking baskets')) {
      return isCkb ? 'دوو سەبەتەی سەربەخۆی لێنانی خواردن' : 'سلتان مستقلتان لطهي الطعام';
    }
    if (lower.includes('digital touch panel')) {
      return isCkb ? 'شاشەی دەستلێدانی دیجیتاڵی' : 'لوحة لمس رقمية ذكية';
    }
    if (lower.includes('cool-touch front handles')) {
      return isCkb ? 'دەسکی ساردی پێشەوە بۆ بەکارهێنانی پارێزراو' : 'مقابض أمامية باردة الملمس';
    }
    if (lower.includes('steam frother wand')) {
      return isCkb ? 'لوولەی هەڵمی کەفکردنی شیر' : 'عصا بخار مدمجة لرغوة الحليب';
    }
    if (lower.includes('slim 15cm metallic body')) {
      return isCkb ? 'دیزاینی باریکی کانزایی ١٥ سانتیمەتری' : 'هيكل معدني أنيق ونحيف بعرض 15 سم';
    }
    if (lower.includes('heavy clear glass jar')) {
      return isCkb ? 'شوشەی ئەستووری ڕوون بە سەرقاپی پێچدراوی کانزایی' : 'وعاء زجاجي شفاف وسميك بغطاء معدني محكم';
    }
    if (lower.includes('golden natural amber honey')) {
      return isCkb ? 'ڕەنگی زەردباوی ئەنبەریی سروشتیی هەنگوین' : 'لون عسلي كهرماني طبيعي وجذاب';
    }
    if (lower.includes('kurdish harvest label')) {
      return isCkb ? 'لێبڵی فەرمیی بەروبوومی کوردستان' : 'ملصق إنتاج محلي كوردستاني';
    }

    // Missing required fields
    if (lower.includes('price (iqd)')) {
      return isCkb ? 'نرخ (دیناری عێراقی)' : 'السعر (دينار عراقي)';
    }
    if (lower.includes('seller name & physical location') || lower.includes('seller name')) {
      return isCkb ? 'ناوی فرۆشیار و ناونیشانی فیزیکی' : 'اسم البائع والموقع الجغرافي';
    }
    if (lower.includes('warranty duration')) {
      return isCkb ? 'ماوەی گەرەنتی' : 'مدة الضمان';
    }
    if (lower.includes('delivery terms')) {
      return isCkb ? 'مەرجەکانی گەیاندن' : 'شروط التوصيل';
    }
    if (lower.includes('return policy')) {
      return isCkb ? 'یاسای گەڕاندنەوە' : 'سياسة الإرجاع';
    }
    if (lower.includes('laboratory certificate')) {
      return isCkb ? 'بڕوانامەی پشکنینی تاقیگە' : 'شهادة الفحص المخبري';
    }

    // Not visible values
    if (lower === 'not visible' || lower === 'not provided') {
      return isCkb ? 'لە وێنەکەدا دیار نییە' : 'غير مرئي في الصورة';
    }

    return str;
  };

  // Localize Product Type
  let localizedProductType = data.product_type;
  if (data.product_type) {
    const ptLower = data.product_type.toLowerCase();
    if (ptLower.includes('air fryer') || ptLower.includes('dual basket')) {
      localizedProductType = isCkb ? 'قلاێنەری هەوایی دوو سەبەتە' : 'قلاية هوائية بسلتين';
    } else if (ptLower.includes('espresso') || ptLower.includes('coffee')) {
      localizedProductType = isCkb ? 'ئامێری دەستیی قاوەی ئێسپرێسۆ' : 'ماكينة إسبريسو يدوية';
    } else if (ptLower.includes('honey')) {
      localizedProductType = isCkb ? 'شوشەی هەنگوینی کێوی شاخ' : 'وعاء عسل جبلي بري';
    }
  }

  // Localize Brand
  let localizedBrand = data.brand_name;
  if (data.brand_name) {
    const bLower = data.brand_name.toLowerCase();
    if (bLower.includes('ninja')) {
      localizedBrand = isCkb ? 'نینجا فودی (Ninja Foodi - لۆگۆی دیارە)' : 'نينجا فودي (علامة مرئية)';
    } else if (bLower.includes('delonghi')) {
      localizedBrand = isCkb ? 'دیلۆنگی (DeLonghi - لۆگۆی دیارە)' : 'ديلونجي (علامة مرئية)';
    } else if (bLower.includes('penjwen')) {
      localizedBrand = isCkb ? 'بەروبوومی شاخی پێنجوێن' : 'محصول جبال بنجوين';
    } else if (bLower === 'not visible' || bLower === 'not provided') {
      localizedBrand = isCkb ? 'لە وێنەکەدا دیار نییە' : 'غير مرئي في الصورة';
    }
  }

  // Localize Capacity
  let localizedCapacity = data.visible_capacity;
  if (data.visible_capacity) {
    const cLower = data.visible_capacity.toLowerCase();
    if (cLower.includes('9.5l') || cLower.includes('dual basket')) {
      localizedCapacity = isCkb ? 'دوو سەبەتە (نزیکەی ٩.٥ لیتر قەبارەی خەمڵێنراو)' : 'سلتان (حوالي 9.5 لتر سعة تقديرية)';
    } else if (cLower.includes('1.1l')) {
      localizedCapacity = isCkb ? 'نیشانەی تانکی ئاوی ١.١ لیتر' : 'علامة خزان ماء سعة 1.1 لتر';
    } else if (cLower.includes('1kg') || cLower.includes('1000g')) {
      localizedCapacity = isCkb ? '١ کگم (شوشەی ١٠٠٠ گرام)' : '1 كغم (وعاء زجاجي 1000 غرام)';
    } else if (cLower === 'not visible' || cLower === 'not provided') {
      localizedCapacity = isCkb ? 'لە وێنەکەدا دیار نییە' : 'غير مرئي في الصورة';
    }
  }

  // Localize Summary
  let localizedSummary = data.summary;
  if (data.summary) {
    const sLower = data.summary.toLowerCase();
    if (sLower.includes('air fryer') || sLower.includes('dual basket')) {
      localizedSummary = isCkb
        ? 'ژیری دەستکرد ئەمەی وەک قلاێنەری هەوایی دوو سەبەتەی چێشتخانە لەگەڵ شاشەی دیجیتاڵی ناساند. نرخ، گەرەنتی، شوێنی فرۆشیار، و مەرجەکانی گەیاندن لە وێنەکەدا دیار نین.'
        : 'حدد الذكاء الاصطناعي هذا كقلاية هوائية للمطبخ بسلتين مع شاشة تحكم رقمية. السعر والضمان وموقع البائع وشروط التوصيل غير مرئية في الصورة.';
    } else if (sLower.includes('espresso') || sLower.includes('delonghi')) {
      localizedSummary = isCkb
        ? 'ژیری دەستکرد ئەمەی وەک ئامێری باریکی دەستیی ئێسپرێسۆی ستیل ناساند. نرخ، ماوەی گەرەنتی، شوناسی فرۆشیار، و زانیاری گەیاندن لە وێنەکەدا دیار نین.'
        : 'حدد الذكاء الاصطناعي هذا كآلة إسبريسو يدوية نحيفة من الستانلس ستيل. السعر والضمان وهوية البائع ومعلومات التوصيل غير مرئية في الصورة.';
    } else if (sLower.includes('honey')) {
      localizedSummary = isCkb
        ? 'ژیری دەستکرد ئەمەی وەک شوشەی ١ کیلۆگرامی هەنگوینی کێوی شاخ بە لێبڵی کوردی/عەرەبی ناساند. نرخ، پەیوەندی فرۆشیار، و بژاردەکانی گەیاندن لە وێنەکەدا دیار نین.'
        : 'حدد الذكاء الاصطناعي هذا كوعاء زجاجي بوزن 1 كغم من عسل الجبال البري بملصق عربي/كردي. السعر ومعلومات البائع وخيارات التوصيل غير مرئية في الصورة.';
    }
  }

  // Localize Draft Title & Specs
  let draftTitle = data.draft_listing?.suggested_title || '';
  if (draftTitle) {
    const dtLower = draftTitle.toLowerCase();
    if (dtLower.includes('ninja')) {
      draftTitle = isCkb ? 'قلاێنەری هەوایی نینجا دوو سەبەتە (لە وێنەوە دەرهێنراوە)' : 'قلاية هوائية نينجا بسلتين (معبأة مسبقاً من الصورة)';
    } else if (dtLower.includes('delonghi') || dtLower.includes('dedica')) {
      draftTitle = isCkb ? 'ئامێری قاوەی ئێسپرێسۆی دیلۆنگی دێدیکا (لە وێنەوە دەرهێنراوە)' : 'ماكينة قهوة ديلونجي ديديكا (معبأة مسبقاً من الصورة)';
    } else if (dtLower.includes('honey')) {
      draftTitle = isCkb ? 'هەنگوینی کێوی شاخی پێنجوێن ١ کگم (لە وێنەوە دەرهێنراوە)' : 'عسل جبال بري 1 كغم (معبأ مسبقاً من الصورة)';
    }
  }

  let draftSpecs = data.draft_listing?.visible_specs || '';
  if (draftSpecs) {
    const dsLower = draftSpecs.toLowerCase();
    if (dsLower.includes('dual independent') || dsLower.includes('touch interface')) {
      draftSpecs = isCkb ? 'دوو سەبەتەی سەربەخۆ لەگەڵ شاشەی دیجیتاڵی دەستلێدان' : 'سلتان مستقلتان مع واجهة لمس رقمية';
    } else if (dsLower.includes('slim stainless steel') || dsLower.includes('steam wand')) {
      draftSpecs = isCkb ? 'ئامێری ستیلی باریکی دەستی ئێسپرێسۆ لەگەڵ لوولەی هەڵم' : 'ماكينة إسبريسو يدوية نحيفة من الستانلس ستيل مع عصا بخار';
    } else if (dsLower.includes('1000g') || dsLower.includes('wild mountain')) {
      draftSpecs = isCkb ? '١٠٠٠ گرام شوشەی هەنگوینی کێوی سروشتیی شاخ' : 'وعاء زجاجي 1000 غرام عسل جبلي بري طبيعي';
    }
  }

  return {
    ...data,
    category: localizeCategory(data.category, lang),
    product_type: localizedProductType,
    brand_name: localizedBrand,
    visible_capacity: localizedCapacity,
    visible_features: (data.visible_features || []).map(translatePhrase),
    available_signals: (data.available_signals || []).map(translatePhrase),
    missing_signals: (data.missing_signals || []).map(translatePhrase),
    summary: localizedSummary,
    draft_listing: {
      ...data.draft_listing,
      suggested_title: draftTitle,
      category: localizeCategory(data.draft_listing?.category, lang),
      visible_specs: draftSpecs,
      missing_required_fields: (data.draft_listing?.missing_required_fields || []).map(translatePhrase),
    },
  };
}
