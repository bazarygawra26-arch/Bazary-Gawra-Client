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
