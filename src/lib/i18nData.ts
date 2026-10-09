export type AppLang = 'en' | 'ckb' | 'ku' | 'ar';

export function normalizeLang(lang: string | undefined): 'en' | 'ckb' | 'ar' {
  if (lang === 'ckb' || lang === 'ku') return 'ckb';
  if (lang === 'ar') return 'ar';
  return 'en';
}

// 1. Categories
const categoryDict: Record<string, { en: string; ckb: string; ar: string }> = {
  // Top-Level Categories
  'kitchen-home': {
    en: 'Kitchen Appliances & Supplies',
    ckb: 'ئامێر و پێداویستییەکانی چێشتخانە',
    ar: 'أجهزة ومستلزمات المطبخ',
  },
  'home-appliances': {
    en: 'Home Appliances',
    ckb: 'ئامێرەکانی ماڵ',
    ar: 'الأجهزة المنزلية',
  },
  'electronics': {
    en: 'Electronics',
    ckb: 'ئەلیکترۆنیات',
    ar: 'الإلكترونيات',
  },
  'beauty-personal-care': {
    en: 'Beauty & Personal Care',
    ckb: 'جوانی و چاودێری کەسی',
    ar: 'الجمال والعناية الشخصية',
  },
  'beauty': {
    en: 'Beauty & Personal Care',
    ckb: 'جوانی و چاودێری کەسی',
    ar: 'الجمال والعناية الشخصية',
  },
  'handmade-crafts': {
    en: 'Handmade & Heritage',
    ckb: 'دەستکرد و کەلەپوور',
    ar: 'الحرف اليدوية والتراث',
  },
  'traditional-crafts': {
    en: 'Handmade & Heritage',
    ckb: 'دەستکرد و کەلەپوور',
    ar: 'الحرف اليدوية والتراث',
  },
  'handmade': {
    en: 'Handmade & Heritage',
    ckb: 'دەستکرد و کەلەپوور',
    ar: 'الحرف اليدوية والتراث',
  },
  'local-food-honey': {
    en: 'Local Food & Products',
    ckb: 'خۆراک و بەرهەمی خۆماڵی',
    ar: 'الأغذية والمنتجات المحلية',
  },
  'food-honey': {
    en: 'Local Food & Products',
    ckb: 'خۆراک و بەرهەمی خۆماڵی',
    ar: 'الأغذية والمنتجات المحلية',
  },
  'local-products': {
    en: 'Local Food & Honey',
    ckb: 'خۆراک و بەرهەمی خۆماڵی',
    ar: 'الأغذية والمنتجات المحلية',
  },
  'books': {
    en: 'Books',
    ckb: 'کتێب',
    ar: 'الكتب',
  },
  'book': {
    en: 'Books',
    ckb: 'کتێب',
    ar: 'الكتب',
  },
  'other': {
    en: 'Other',
    ckb: 'هی تر',
    ar: 'أخرى',
  },

  // Kitchen Subcategories
  'coffee-machines': {
    en: 'Coffee Machines',
    ckb: 'قاوەساز',
    ar: 'صانعات القهوة',
  },
  'air-fryers': {
    en: 'Air Fryers',
    ckb: 'ئێرفرایەر',
    ar: 'قلايات هوائية',
  },
  'blenders': {
    en: 'Blenders',
    ckb: 'خەڵاتە',
    ar: 'خلاطات',
  },
  'blenders-mixers': {
    en: 'Blenders',
    ckb: 'خەڵاتە',
    ar: 'خلاطات',
  },
  'tea-makers-kettles': {
    en: 'Kettles & Tea Makers',
    ckb: 'قۆری و چایساز',
    ar: 'غلايات وصانعات الشاي',
  },
  'cooking-kitchenware': {
    en: 'Cookware & Kitchen Tools',
    ckb: 'مەنجەڵ و پێداویستی چێشتخانە',
    ar: 'أدوات وأواني الطهي',
  },

  // Home Appliances Subcategories
  'vacuum-cleaners': {
    en: 'Vacuum Cleaners',
    ckb: 'جارووبەرەقی',
    ar: 'مكانس كهربائية',
  },
  'fans-cooling': {
    en: 'Fans & Cooling',
    ckb: 'فێنککەرەوە و پانکە',
    ar: 'مراوح وتبريد',
  },
  'heaters': {
    en: 'Heaters',
    ckb: 'زۆپا و گەرمکەرەوە',
    ar: 'مدافئ',
  },
  'heaters-heating': {
    en: 'Heaters',
    ckb: 'زۆپا و گەرمکەرەوە',
    ar: 'مدافئ',
  },
  'water-purifiers': {
    en: 'Water Purifiers',
    ckb: 'پاڵێوەری ئاو',
    ar: 'فلاتر مياه',
  },
  'smart-home': {
    en: 'Home Appliances',
    ckb: 'ئامێرەکانی ماڵ',
    ar: 'الأجهزة المنزلية',
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

  // Partial / semantic match checks
  const lower = raw.toLowerCase();
  if (lower.includes('honey') || lower.includes('food') || lower.includes('هەنگوین') || lower.includes('خۆراک') || lower.includes('عسل')) {
    return categoryDict['local-food-honey'][l];
  }
  if (lower.includes('coffee') || lower.includes('قاوە') || lower.includes('قهوة') || lower.includes('espresso')) {
    return categoryDict['coffee-machines'][l];
  }
  if (lower.includes('air fryer') || lower.includes('ئێرفرایەر') || lower.includes('قلاية')) {
    return categoryDict['air-fryers'][l];
  }
  if (lower.includes('blender') || lower.includes('خەڵاتە') || lower.includes('خلاط') || lower.includes('میکسەر')) {
    return categoryDict['blenders'][l];
  }
  if (lower.includes('vacuum') || lower.includes('جاڕوو') || lower.includes('جاروو') || lower.includes('مكنسة') || lower.includes('مكانس')) {
    return categoryDict['vacuum-cleaners'][l];
  }
  if (lower.includes('tea') || lower.includes('kettle') || lower.includes('چایساز') || lower.includes('قۆری') || lower.includes('شاي')) {
    return categoryDict['tea-makers-kettles'][l];
  }
  if (lower.includes('kitchen') || lower.includes('چێشتخانە') || lower.includes('مطبخ') || lower.includes('cookware')) {
    return categoryDict['kitchen-home'][l];
  }
  if (lower.includes('craft') || lower.includes('heritage') || lower.includes('دەستکرد') || lower.includes('تراث') || lower.includes('kelim')) {
    return categoryDict['handmade-crafts'][l];
  }
  if (lower.includes('beauty') || lower.includes('personal') || lower.includes('جوانی') || lower.includes('جمال')) {
    return categoryDict['beauty-personal-care'][l];
  }
  if (lower.includes('appliance') || lower.includes('ئامێرەکانی ماڵ') || lower.includes('ناوماڵ')) {
    return categoryDict['home-appliances'][l];
  }
  if (lower.includes('electronic') || lower.includes('ئەلیکترۆنی') || lower.includes('إلكتروني')) {
    return categoryDict['electronics'][l];
  }
  if (lower.includes('book') || lower.includes('کتێب') || lower.includes('پەرتووک') || lower.includes('کتاب') || lower.includes('كتب')) {
    return categoryDict['books'][l];
  }
  if (lower.includes('other') || lower.includes('هی تر') || lower.includes('أخرى')) {
    return categoryDict['other'][l];
  }

  // Fallback: Never return raw English if Kurdish was requested
  if (l === 'ckb') {
    return 'هی تر';
  }
  if (l === 'ar') {
    return 'أخرى';
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
  'penjwen & sulaymaniyah': {
    en: 'Penjwen & Sulaymaniyah',
    ckb: 'پێنجوێن و سلێمانی',
    ar: 'بنجوين والسليمانية',
  },
  'penjwen & sulaymaniyah outlet': {
    en: 'Penjwen & Sulaymaniyah outlet',
    ckb: 'پێنجوێن و پێشانگەی سلێمانی',
    ar: 'بنجوين ومنفذ السليمانية',
  },
  'sulaymaniyah (qaisari bazaar)': {
    en: 'Sulaymaniyah (Qaisari Bazaar)',
    ckb: 'سلێمانی (بازاڕی قەیسەری)',
    ar: 'السليمانية (سوق القيصرية)',
  },
  'sulaymaniyah old bazaar': {
    en: 'Sulaymaniyah Old Bazaar',
    ckb: 'سلێمانی (بازاڕی کۆن)',
    ar: 'السليمانية (السوق القديم)',
  },
  'sulaymaniyah, ashti district': {
    en: 'Sulaymaniyah, Ashti District',
    ckb: 'سلێمانی، گەڕەکی ئاشتی',
    ar: 'السليمانية، حي آشتي',
  },
  'sulaymaniyah, ashti': {
    en: 'Sulaymaniyah, Ashti',
    ckb: 'سلێمانی، گەڕەکی ئاشتی',
    ar: 'السليمانية، حي آشتي',
  },
  'sulaymaniyah (bakrajo)': {
    en: 'Sulaymaniyah (Bakrajo)',
    ckb: 'سلێمانی (بەکرەجۆ)',
    ar: 'السليمانية (بكرجو)',
  },
  'sulaymaniyah (salim st)': {
    en: 'Sulaymaniyah (Salim St)',
    ckb: 'سلێمانی (شەقامی سالم)',
    ar: 'السليمانية (شارع سالم)',
  },
  'sulaymaniyah, salim st': {
    en: 'Sulaymaniyah, Salim St',
    ckb: 'سلێمانی (شەقامی سالم)',
    ar: 'السليمانية (شارع سالم)',
  },
  'sulaymaniyah, mawlawi': {
    en: 'Sulaymaniyah, Mawlawi',
    ckb: 'سلێمانی، شەقامی مەولەوی',
    ar: 'السليمانية، شارع مولوي',
  },
  'sulaymaniyah (sarchinar)': {
    en: 'Sulaymaniyah (Sarchinar)',
    ckb: 'سلێمانی (سەرچنار)',
    ar: 'السليمانية (سرجنار)',
  },
  'sulaymaniyah, sarchinar': {
    en: 'Sulaymaniyah, Sarchinar',
    ckb: 'سلێمانی (سەرچنار)',
    ar: 'السليمانية (سرجنار)',
  },
  'erbil (60m road)': {
    en: 'Erbil (60m Road)',
    ckb: 'هەولێر (شەقامی ٦٠ مەتری)',
    ar: 'أربيل (شارع 60 متري)',
  },
  'erbil, 60m road': {
    en: 'Erbil, 60m Road',
    ckb: 'هەولێر (شەقامی ٦٠ مەتری)',
    ar: 'أربيل (شارع 60 متري)',
  },
  'erbil (100m road)': {
    en: 'Erbil (100m Road)',
    ckb: 'هەولێر (شەقامی ١٠٠ مەتری)',
    ar: 'أربيل (شارع 100 متري)',
  },
  'erbil, 100m road': {
    en: 'Erbil, 100m Road',
    ckb: 'هەولێر (شەقامی ١٠٠ مەتری)',
    ar: 'أربيل (شارع 100 متري)',
  },
  'erbil (italian city 1)': {
    en: 'Erbil (Italian City 1)',
    ckb: 'هەولێر (شاری ئیتاڵی ١)',
    ar: 'أربيل (القرية الإيطالية 1)',
  },
  'erbil, gulan street & empire': {
    en: 'Erbil, Gulan Street & Empire',
    ckb: 'هەولێر، شەقامی گوڵان و ئیمپایەر',
    ar: 'أربيل، شارع كولان وإمباير',
  },
  'erbil, gulan st': {
    en: 'Erbil, Gulan St',
    ckb: 'هەولێر، شەقامی گوڵان',
    ar: 'أربيل، شارع كولان',
  },
  'erbil, dream city': {
    en: 'Erbil, Dream City',
    ckb: 'هەولێر، دریم سیتی',
    ar: 'أربيل، دريم سيتي',
  },
  'duhok (kro district)': {
    en: 'Duhok (KRO District)',
    ckb: 'دهۆک (ناوچەی KRO)',
    ar: 'دهوك (منطقة KRO)',
  },
  'duhok, kro': {
    en: 'Duhok, KRO',
    ckb: 'دهۆک (ناوچەی KRO)',
    ar: 'دهوك (منطقة KRO)',
  },
  'duhok, kro commercial area': {
    en: 'Duhok, KRO Commercial Area',
    ckb: 'دهۆک (ناوچەی بازرگانی KRO)',
    ar: 'دهوك (المنطقة التجارية KRO)',
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
export function localizeWarranty(raw: any, lang: string): string {
  if (typeof raw === 'object' && raw !== null) {
    raw = raw.details || (raw.months ? `${raw.months} months warranty` : '');
  }
  if (!raw || typeof raw !== 'string' || raw === 'Information unavailable' || raw === 'Not provided') {
    return normalizeLang(lang) === 'ckb'
      ? 'گەرەنتی دیاری نەکراوە'
      : normalizeLang(lang) === 'ar'
      ? 'الضمان غير محدد'
      : 'No warranty provided';
  }
  const l = normalizeLang(lang);
  const lower = raw.toLowerCase();

  if (lower.includes('vegetable') || lower.includes('authenticity') || lower.includes('ڕەسەنایەتی') || lower.includes('أصالة')) {
    return l === 'ckb'
      ? 'گەرەنتی ڕەسەنایەتی (ڕەنگی سروشتی ڕووەکی)'
      : l === 'ar'
      ? 'ضمان الأصالة (أصباغ نباتية طبيعية)'
      : 'Authenticity Guarantee (Natural Vegetable Dyes)';
  }

  if (lower.includes('dyson') || lower.includes('دایسۆن')) {
    return l === 'ckb'
      ? '٢ ساڵ گەرەنتی دایسۆن (بریکاری فەرمی لە هەولێر)'
      : l === 'ar'
      ? 'سنتان ضمان دايسون (الوكيل المعتمد في أربيل)'
      : '2 Years Dyson Warranty (Agent in Erbil)';
  }

  if (lower.includes('philips') || lower.includes('فیلیپس')) {
    return l === 'ckb'
      ? '٢ ساڵ گەرەنتی بریکاری فەرمی فیلیپس'
      : l === 'ar'
      ? 'سنتان ضمان وكيل فيليبس الرسمي'
      : '2 Years Official Philips Agent Warranty';
  }

  if (lower.includes('6 month') || lower.includes('٦ مانگ')) {
    return l === 'ckb'
      ? '٦ مانگ گەرەنتی فرۆشگای ناوخۆیی'
      : l === 'ar'
      ? '6 أشهر ضمان المتجر المحلي'
      : '6 Months Local Shop Warranty';
  }

  if (lower.includes('repair') || lower.includes('parts') || lower.includes('پارچە')) {
    return l === 'ckb'
      ? '١ ساڵ گەرەنتی ناوخۆیی (چاککردنەوە و پارچەی یەدەگ)'
      : l === 'ar'
      ? 'سنة واحدة ضمان محلي (تصليح وقطع غيار)'
      : '1 Year Local Warranty (Repair & Parts)';
  }

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
export function localizeDelivery(raw: any, lang: string): string {
  if (typeof raw === 'object' && raw !== null) {
    raw = raw.info || (raw.available ? 'Local delivery available' : '');
  }
  if (!raw || typeof raw !== 'string' || raw === 'Not provided') {
    return normalizeLang(lang) === 'ckb'
      ? 'گەیاندن دیاری نەکراوە'
      : normalizeLang(lang) === 'ar'
      ? 'التوصيل غير محدد'
      : 'Delivery info not specified';
  }
  const l = normalizeLang(lang);
  const lower = raw.toLowerCase();

  if (lower.includes('insured delivery') || lower.includes('anywhere in kurdistan') || lower.includes('بیمەکراو')) {
    return l === 'ckb'
      ? 'گەیاندنی بیمەکراوی بێبەرامبەر بۆ هەموو کوردستان'
      : l === 'ar'
      ? 'توصيل مؤمن مجاني لكافة مناطق كوردستان'
      : 'Free insured delivery anywhere in Kurdistan';
  }

  if (lower.includes('free same-day delivery in erbil') || (lower.includes('erbil') && lower.includes('6,000'))) {
    return l === 'ckb'
      ? 'گەیاندنی بێبەرامبەری هەمان ڕۆژ لە هەولێر، ٦,٠٠٠ دینار بۆ سلێمانی و دهۆک'
      : l === 'ar'
      ? 'توصيل مجاني بنفس اليوم في أربيل، 6,000 دينار للسليمانية ودهوك'
      : 'Free same-day delivery in Erbil, 6,000 IQD to Sulaymaniyah/Duhok';
  }

  if (lower.includes('same-day delivery in sulaymaniyah') || (lower.includes('sulaymaniyah') && lower.includes('3,000'))) {
    return l === 'ckb'
      ? 'گەیاندنی هەمان ڕۆژ لە سلێمانی (٣,٠٠٠ دینار)، ٢ ڕۆژ بۆ هەولێر و دهۆک'
      : l === 'ar'
      ? 'توصيل بنفس اليوم في السليمانية (3,000 دينار)، يومان لأربيل ودهوك'
      : 'Same-day delivery in Sulaymaniyah (3,000 IQD), 2 days to Erbil/Duhok';
  }

  if (lower.includes('free delivery in erbil') || (lower.includes('erbil') && lower.includes('5,000'))) {
    return l === 'ckb'
      ? 'گەیاندنی بێبەرامبەر لە هەولێر، ٥,٠٠٠ دینار بۆ شارەکانی تر'
      : l === 'ar'
      ? 'توصيل مجاني في أربيل، 5,000 دينار لباقي مدن كوردستان'
      : 'Free delivery in Erbil, 5,000 IQD other Kurdistan cities';
  }

  if (lower.includes('duhok') && lower.includes('2,500')) {
    return l === 'ckb'
      ? 'گەیاندن لە دهۆک (٢,٥٠٠ دینار) و هەولێر (٤,٠٠٠ دینار)'
      : l === 'ar'
      ? 'التوصيل متوفر في دهوك (2,500 دينار) وأربيل (4,000 دينار)'
      : 'Delivery available in Duhok (2,500 IQD) and Erbil (4,000 IQD)';
  }

  if (lower.includes('free delivery across sulaymaniyah') || (lower.includes('sulaymaniyah') && lower.includes('4,000') && lower.includes('free'))) {
    return l === 'ckb'
      ? 'گەیاندنی بێبەرامبەر لە سلێمانی، ٤,٠٠٠ دینار بۆ شارەکانی تر'
      : l === 'ar'
      ? 'توصيل مجاني داخل السليمانية، 4,000 دينار لباقي المناطق'
      : 'Free delivery across Sulaymaniyah, 4,000 IQD elsewhere in KRI';
  }

  if (lower.includes('erbil 3,000')) {
    return l === 'ckb'
      ? 'گەیاندن لە هەولێر (٣,٠٠٠ دینار)'
      : l === 'ar'
      ? 'التوصيل متوفر في أربيل (3,000 دينار)'
      : 'Delivery available (Erbil 3,000 IQD)';
  }

  if (lower.includes('sulaymaniyah (4,000')) {
    return l === 'ckb'
      ? 'گەیاندن لە سلێمانی (٤,٠٠٠ دینار)'
      : l === 'ar'
      ? 'التوصيل متوفر في السليمانية (4,000 دينار)'
      : 'Delivery available in Sulaymaniyah (4,000 IQD)';
  }

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
export function localizeReturnPolicy(raw: any, lang: string): string {
  if (typeof raw === 'object' && raw !== null) {
    raw = raw.details || (raw.days ? `${raw.days} days return policy` : '');
  }
  if (!raw || typeof raw !== 'string' || raw === 'Not provided') {
    return normalizeLang(lang) === 'ckb'
      ? 'مەرجی گەڕاندنەوە دیاری نەکراوە'
      : normalizeLang(lang) === 'ar'
      ? 'سياسة الإرجاع غير محددة'
      : 'Return policy not provided';
  }
  const l = normalizeLang(lang);
  const lower = raw.toLowerCase();

  if (lower.includes('unsoiled') || lower.includes('inspection') || lower.includes('پشکنین')) {
    return l === 'ckb'
      ? '٧ ڕۆژ مافی پشکنین و گەڕاندنەوە ئەگەر بەکارنەهاتبێت'
      : l === 'ar'
      ? '7 أيام للمعاينة والاسترجاع في حال عدم الاستخدام'
      : '7 days inspection and return if unsoiled';
  }

  if (lower.includes('technical failure') || (lower.includes('14') && lower.includes('warranty'))) {
    return l === 'ckb'
      ? '١٤ ڕۆژ گەرەنتی بەرامبەر کێشەی تەکنیکی'
      : l === 'ar'
      ? '14 يوماً ضمان ضد الأعطال الفنية'
      : '14 days warranty against technical failure';
  }

  if (lower.includes('manufacturing defects') || lower.includes('3-day replacement')) {
    return l === 'ckb'
      ? '٣ ڕۆژ گۆڕینەوە لە کاتی بوونی کێشەی دروستکردن'
      : l === 'ar'
      ? 'استبدال خلال 3 أيام في حال وجود عيب مصنعي'
      : '3-day replacement for manufacturing defects';
  }

  if (lower.includes('unused return') || lower.includes('7 days unused')) {
    return l === 'ckb'
      ? '٧ ڕۆژ مافی گەڕاندنەوە بۆ کاڵای بەکارنەهاتوو'
      : l === 'ar'
      ? '7 أيام إرجاع للمنتجات غير المستخدمة'
      : '7 days unused return policy';
  }

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

  if (lower.includes('3 days exchange') || lower.includes('٣ ڕۆژ')) {
    return l === 'ckb'
      ? '٣ ڕۆژ مافی گۆڕینەوە'
      : l === 'ar'
      ? 'سياسة استبدال خلال 3 أيام'
      : '3 days exchange policy';
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
      ? 'بەریتانیا (براندی دایسۆن / دروستکراوی مالیزیا)'
      : l === 'ar'
      ? 'المملكة المتحدة (علامة دايسون / تصنيع ماليزيا)'
      : 'United Kingdom brand (Manufactured in Malaysia)';
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

// 7.1 Capacities
export function localizeCapacity(raw: string | undefined, lang: string): string {
  if (!raw || raw === 'N/A') {
    return normalizeLang(lang) === 'ckb' ? 'دیاری نەکراوە' : normalizeLang(lang) === 'ar' ? 'غير محدد' : 'N/A';
  }
  const l = normalizeLang(lang);
  const lower = raw.toLowerCase();

  if (lower.includes('150cm') || lower.includes('200cm')) {
    return l === 'ckb' ? '١٥٠سم × ٢٠٠سم' : l === 'ar' ? '150سم × 200سم' : '150cm x 200cm';
  }
  if (lower.includes('1.1')) {
    return l === 'ckb' ? '١.١ لیتر' : l === 'ar' ? '1.1 لتر' : '1.1 Liters';
  }
  if (lower.includes('1.8')) {
    return l === 'ckb' ? '١.٨ لیتر (لەگەڵ کۆگای دانەوێڵە)' : l === 'ar' ? '1.8 لتر مع خزان الحبوب' : '1.8 Liters with Bean Hopper';
  }
  if (lower.includes('4 cup') || lower.includes('250ml')) {
    return l === 'ckb' ? '٤ کووپ (٢٥٠ مل)' : l === 'ar' ? '4 أكواب (250 مل)' : '4 Cups (250ml)';
  }
  if (lower.includes('9.5')) {
    return l === 'ckb' ? '٩.٥ لیتر (٢ سەبەتەی ٤.٧٥ لیتری)' : l === 'ar' ? '9.5 لتر (سلتان سعة 4.75 لتر)' : '9.5 Liters (2 x 4.75L Baskets)';
  }
  if (lower.includes('4.0') || lower.includes('4l')) {
    return l === 'ckb' ? '٤.٠ لیتر' : l === 'ar' ? '4.0 لتر' : '4.0 Liters';
  }
  if (lower.includes('1,000') || lower.includes('1000')) {
    return l === 'ckb' ? '١,٠٠٠ گرام (پوخت)' : l === 'ar' ? '1,000 غرام (صافي)' : '1,000 grams (Net)';
  }
  if (lower.includes('2.0l') || lower.includes('food processor')) {
    return l === 'ckb' ? '٢.٠ لیتر خۆراک ئامادەکەر + ٥٠٠ مل وردکەرەوە' : l === 'ar' ? 'محضر طعام 2.0 لتر + مفرمة 500 مل' : '2.0L Food Processor + 500ml Chopper';
  }
  if (lower.includes('0.35l') || lower.includes('2.2kg')) {
    return l === 'ckb' ? '٠.٣٥ لیتر کۆکەرەوە / کێش ٢.٢ کگم' : l === 'ar' ? 'حاوية 0.35 لتر / وزن 2.2 كغم' : '0.35L Bin / 2.2kg Weight';
  }

  return raw;
}

// 7.2 Power
export function localizePower(raw: string | undefined, lang: string): string {
  if (!raw || raw === 'N/A') {
    return normalizeLang(lang) === 'ckb' ? 'بەردەست نییە' : normalizeLang(lang) === 'ar' ? 'غير متوفر' : 'N/A';
  }
  const l = normalizeLang(lang);
  const lower = raw.toLowerCase();

  if (lower.includes('1300w') || lower.includes('15-bar')) {
    return l === 'ckb' ? '١٣٠٠ وات / پەستانی ١٥ بار' : l === 'ar' ? '1300 واط / ضغط 15 بار' : '1300W / 15-Bar Pressure';
  }
  if (lower.includes('1500w') || lower.includes('ceramic grinder')) {
    return l === 'ckb' ? '١٥٠٠ وات / هاڕەڕی سیرامیکی ناوەکی' : l === 'ar' ? '1500 واط / مطحنة سيراميك مدمجة' : '1500W / Ceramic Grinder built-in';
  }
  if (lower.includes('800w')) {
    return l === 'ckb' ? '٨٠٠ وات' : l === 'ar' ? '800 واط' : '800W';
  }
  if (lower.includes('2470w')) {
    return l === 'ckb' ? '٢٤٧٠ وات' : l === 'ar' ? '2470 واط' : '2470W';
  }
  if (lower.includes('1600w')) {
    return l === 'ckb' ? '١٦٠٠ وات / ٤٠ بۆ ٢٠٠ پلەی سیلیزی' : l === 'ar' ? '1600 واط / 40 - 200 درجة مئوية' : '1600W / 40°C - 200°C';
  }
  if (lower.includes('1200w')) {
    return l === 'ckb' ? '١٢٠٠ وات تیغەی ئەکتیڤ بلەیدی بەهێز' : l === 'ar' ? '1200 واط شفرة أكتيف بليد قوية' : '1200W Heavy-duty ActiveBlade';
  }
  if (lower.includes('150 air watts') || lower.includes('60 min')) {
    return l === 'ckb' ? '١٥٠ ئێر وات / ٦٠ خولەک کارکردن' : l === 'ar' ? '150 واط هوائي / 60 دقيقة تشغيل' : '150 Air Watts / 60 Min Runtime';
  }

  return raw;
}

// 7.3 Descriptions
const descriptionsDict: Record<string, { en: string; ckb: string; ar: string }> = {
  'prod-001': {
    en: 'Slimline 15 cm width stainless steel manual espresso machine. Includes double filter, pannarello milk frother wand, and rapid thermo-block heating system. Perfect for home baristas in Kurdistan.',
    ckb: 'ئامێری دروستکردنی قاوەی ئیسپرێسۆی دەستی لە ستیلی دژە ژەنگ بە پانی ١٥ سم. فلتەری دووانی، چڵی فۆمکردنی شیر، و سیستەمی گەرمکردنی خێرای تێرمۆبلۆک لەخۆدەگرێت. گونجاوە بۆ بارێستاکانی ماڵەوە لە کوردستان.',
    ar: 'ماكينة إسبريسو يدوية من الفولاذ المقاوم للصدأ بعرض 15 سم. تحتوي على فلتر مزدوج، وعصا تبخير الحليب، ونظام تسخين سريع ثيرموبلوك. مثالية لعشاق القهوة في كوردستان.',
  },
  'prod-002': {
    en: 'Fresh bean-to-cup coffee with 100% ceramic grinders. Intuitive touch display lets you adjust aroma strength and coffee quantity easily.',
    ckb: 'قاوەی فرێش لە دانەوێڵەوە بۆ کووپ بە هاڕەڕی ١٠٠٪ سیرامیک. شاشەی دەستلێدانی ژیر ڕێگەت پێدەدات خەستی و بڕی قاوەکە بە ئاسانی ڕێکبخەیت.',
    ar: 'قهوة طازجة من الحبوب مباشرة بفضل مطاحن سيراميك 100%. شاشة لمس بديهية تتيح لك ضبط قوة النكهة وكمية القهوة بسهولة.',
  },
  'prod-003': {
    en: 'Compact rapid Turkish coffee pot with anti-overflow sensor and stainless steel base. Affordable daily kitchen device.',
    ckb: 'قاوەسازی بچووک و خێرای تورکی بە هەستەوەری دژە ڕژان و بنی ستیلی دژە ژەنگ. ئامێرێکی هەرزان و گونجاو بۆ بەکارهێنانی ڕۆژانەی چێشتخانە.',
    ar: 'وعاء قهوة تركي مدمج وسريع مع مستشعر مانع للانسكاب وقاعدة من الفولاذ المقاوم للصدأ. جهاز اقتصادي ومثالي للاستخدام اليومي.',
  },
  'prod-004': {
    en: 'Cook 2 foods 2 ways and finish at the same time with Sync Cook feature. Large capacity suitable for big Kurdish family feasts.',
    ckb: 'دوو خواردن بە دوو شێوازی جیاواز ئامادە بکە و لە یەک کاتدا تەواو ببن بە تایبەتمەندی Sync Cook. قەبارەی گەورە و گونجاو بۆ خێزانە گەورەکانی کوردستان.',
    ar: 'اطبخ وجبتين بطريقتين مختلفتين وانتهِ في نفس الوقت بفضل ميزة المزامنة Sync Cook. سعة كبيرة مناسبة للعائلات الكبيرة في كوردستان.',
  },
  'prod-005': {
    en: 'Transparent visual window allows real-time monitoring. Connects to Mi Home app for remote scheduling, voice control, and over 100 cloud recipes.',
    ckb: 'پەنجەرەی شوشەیی شەفاف ڕێگە دەدات بە شێوازی ڕاستەوخۆ چاودێری برژاندن بکەیت. دەبەسترێتەوە بە ئەپی Mi Home بۆ کۆنترۆڵی دەنگی و زیاتر لە ١٠٠ ڕەچەتەی ئۆنلاین.',
    ar: 'نافذة زجاجية شفافة تتيح متابعة الطهي مباشرة. تتصل بتطبيق Mi Home للتحكم عن بُعد والجدولة وأكثر من 100 وصفة سحابية.',
  },
  'prod-006': {
    en: 'Harvested from wild mountain flora in high altitude Penjwen mountains. Unpasteurized, cold-extracted, and raw with zero artificial additives.',
    ckb: 'بەرهەمهێنراو لە گوڵ و گیای کێوی لە شاخە بەرزەکانی پێنجوێن. خاو، نەکوڵاو و بەبێ هیچ ماددەیەکی کیمیایی یان دەستکاری کراو.',
    ar: 'مجموع من أزهار البرية في مرتفعات بنجوين الشاهقة. عسل خام غير مبستر معصور على البارد وبدون أي إضافات صناعية.',
  },
  'prod-007': {
    en: 'Braun flagship hand blender featuring ActiveBlade technology that moves up and down to chop even the hardest foods like nuts and root vegetables easily.',
    ckb: 'میکسەری دەستی بەناوبانگی براون بە تەکنەلۆجیای ActiveBlade کە سەردەکەوێت و دێتە خوارەوە بۆ وردکردنی ڕەقترین کەرەستە وەک چەرەزات و سەوزە بە ئاسانی.',
    ar: 'خلاط براون الرائد المزود بتقنية ActiveBlade التي تتحرك لأعلى ولأسفل لفرم أصلب المكونات مثل المكسرات والخضروات بسهولة.',
  },
  'prod-008': {
    en: 'Traditional flat-weave wool kelim crafted by master artisans using 100% organic local sheep wool and hand-extracted vegetable dyes. Genuine heirloom quality.',
    ckb: 'بەرمای دەستچنی ڕەسەنی کوردی لە خوری سروشتی مەڕی خۆماڵی و بە ڕەنگی ڕووەکی دەرهێنراو بە دەست. بەرهەمێکی کەلەپووری بەنرخ و کوالیتی بەرز.',
    ar: 'سجاد كليم كردي تقليدي منسوج يدوياً من صوف الأغنام المحلي 100% وأصباغ نباتية طبيعية مستخرجة يدوياً. قطعة تراثية أصيلة عالية القيمة.',
  },
  'prod-009': {
    en: 'Lightweight cordless vacuum with laser illumination that reveals invisible dust on hard floors. Piezo sensor scientifically sizes and counts dust particles.',
    ckb: 'گسکە کارەبایی بێ وایەری کێش سووک بە ڕووناکیی لەیزەر کە تۆزی نادیار لەسەر زەوی دەردەخات. هەستەوەری پێزۆ بە شێوەیەکی زانستی قەبارە و ژمارەی تۆزەکە دیاری دەکات.',
    ar: 'مكنسة لاسلكية خفيفة الوزن مزودة بإضاءة ليزر تكشف الغبار غير المرئي على الأرضيات الصلبة. مستشعر بيزو يقيس ويعد جزيئات الغبار علمياً.',
  },
};

export function localizeDescription(raw: string | undefined, idOrSlug: string | undefined, lang: string): string {
  if (!raw && !idOrSlug) return '';
  const l = normalizeLang(lang);
  if (idOrSlug && descriptionsDict[idOrSlug]) {
    return descriptionsDict[idOrSlug][l];
  }

  // Fallback search by matching snippet in dictionary
  if (raw) {
    const rawLower = raw.toLowerCase();
    for (const item of Object.values(descriptionsDict)) {
      if (rawLower.includes(item.en.toLowerCase().slice(0, 20))) {
        return item[l];
      }
    }
  }

  return raw || '';
}

// 8. Universal Product Localizer
export function localizeProduct<T extends {
  id?: string;
  name: string;
  name_ckb?: string;
  name_ar?: string;
  category: string;
  location: string;
  seller_name: string;
  seller_location?: string;
  capacity?: string;
  power?: string;
  warranty?: string;
  delivery_info?: string;
  return_policy?: string;
  origin?: string;
  description?: string;
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
    seller_location: prod.seller_location ? localizeLocation(prod.seller_location, lang) : prod.seller_location,
    capacity: prod.capacity ? localizeCapacity(prod.capacity, lang) : prod.capacity,
    power: prod.power ? localizePower(prod.power, lang) : prod.power,
    warranty: localizeWarranty(prod.warranty, lang),
    delivery_info: localizeDelivery(prod.delivery_info, lang),
    return_policy: localizeReturnPolicy(prod.return_policy, lang),
    origin: localizeOrigin(prod.origin, lang),
    description: localizeDescription(prod.description, prod.id, lang),
    images: (prod as any).images && (prod as any).images.length > 0 ? (prod as any).images : [(prod as any).image_url].filter(Boolean),
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
