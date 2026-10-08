const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment variables directly from .env.local
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...rest] = trimmed.split('=');
    if (key) envVars[key.trim()] = rest.join('=').trim();
  }
}

const supabaseUrl = envVars.SUPABASE_URL || envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.SUPABASE_SECRET_KEY || envVars.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('--- Seeding Local Data to Supabase ---');
  console.log('Connecting to:', supabaseUrl);

  // 1. Ensure No Clothing Category
  console.log('1. Ensuring no clothing category in DB...');
  await supabase.from('categories').delete().eq('slug', 'clothing');

  // 2. Upsert Categories with rich images & multilingual names
  console.log('2. Upserting Categories...');
  const categoriesData = [
    {
      slug: 'kitchen-home',
      name_en: 'Kitchen & Home',
      name_ku: 'چێشتخانە و ماڵ',
      name_ar: 'المطبخ والمنزل',
      icon: 'UtensilsCrossed',
      image_url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
      is_active: true,
      sort_order: 1,
    },
    {
      slug: 'coffee-machines',
      name_en: 'Coffee & Espresso',
      name_ku: 'قاوە و قاوەساز',
      name_ar: 'القهوة والإسبريسو',
      icon: 'Coffee',
      image_url: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=600&q=80',
      is_active: true,
      sort_order: 2,
    },
    {
      slug: 'home-appliances',
      name_en: 'Home Appliances',
      name_ku: 'ئامێرەکانی ناوماڵ',
      name_ar: 'الأجهزة المنزلية',
      icon: 'Zap',
      image_url: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80',
      is_active: true,
      sort_order: 3,
    },
    {
      slug: 'local-food-honey',
      name_en: 'Local Food & Honey',
      name_ku: 'هەنگوین و بەرهەمی خۆماڵی',
      name_ar: 'العسل والمنتجات المحلية',
      icon: 'Sparkles',
      image_url: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=600&q=80',
      is_active: true,
      sort_order: 4,
    },
    {
      slug: 'handmade-crafts',
      name_en: 'Handmade & Crafts',
      name_ku: 'دەستکرد و کەلەپوور',
      name_ar: 'الأعمال اليدوية والحرف',
      icon: 'HeartHandshake',
      image_url: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=600&q=80',
      is_active: true,
      sort_order: 5,
    },
    {
      slug: 'electronics',
      name_en: 'Electronics',
      name_ku: 'ئەلیکترۆنیات',
      name_ar: 'الإلكترونيات',
      icon: 'Laptop',
      image_url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=600&q=80',
      is_active: true,
      sort_order: 6,
    },
    {
      slug: 'beauty',
      name_en: 'Beauty & Personal Care',
      name_ku: 'جوانی و چاودێری کەسی',
      name_ar: 'الجمال والعناية الشخصية',
      icon: 'Sparkles',
      image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
      is_active: true,
      sort_order: 7,
    },
  ];

  const catMap = {};
  for (const c of categoriesData) {
    const { data, error } = await supabase
      .from('categories')
      .upsert(c, { onConflict: 'slug' })
      .select('id, slug')
      .single();
    if (error) {
      console.warn('Category upsert notice:', c.slug, error.message);
      const { data: existing } = await supabase.from('categories').select('id, slug').eq('slug', c.slug).single();
      if (existing) catMap[existing.slug] = existing.id;
    } else if (data) {
      catMap[data.slug] = data.id;
    }
  }

  // Get all categories in DB into map
  const { data: allCats } = await supabase.from('categories').select('id, slug');
  if (allCats) {
    allCats.forEach((c) => { catMap[c.slug] = c.id; });
  }

  // 3. Ensure Locations in DB
  console.log('3. Checking Locations...');
  const { data: allLocs } = await supabase.from('locations').select('id, slug');
  const locMap = {};
  if (allLocs) {
    allLocs.forEach((l) => { locMap[l.slug] = l.id; });
  }

  // 4. Upsert Local Merchants / Sellers
  console.log('4. Upserting Local Kurdish Sellers...');
  const sellersData = [
    {
      slug: 'sulaymaniyah-home-tech',
      name_en: 'Sulaymaniyah Home Tech',
      name_ku: 'ماڵی تەکنەلۆجی سلێمانی',
      name_ar: 'بيت التكنولوجيا السليمانية',
      description_en: 'Leading home and kitchen electronics retailer on Salim Street with dedicated local repair center.',
      description_ku: 'پێشەنگی فرۆشتنی کەلوپەلی کارەبایی و ئەلیکترۆنی لە شەقامی سە Salim لەگەڵ وەرشەی چاککردنەوەی تایبەت.',
      description_ar: 'الرائد في بيع إلكترونيات المنزل والمطبخ في شارع سالم مع ورشة صيانة متخصصة.',
      location_id: locMap['sulaymaniyah'],
      address: 'Salim Street, Ashti, Sulaymaniyah',
      phone: '+964 770 123 4567',
      whatsapp: '+9647701234567',
      logo_url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=200&q=80',
      verification_status: 'verified',
      is_demo: false,
      is_active: true,
    },
    {
      slug: 'erbil-modern-appliances',
      name_en: 'Erbil Modern Appliances',
      name_ku: 'کەلوپەلی مۆدێرنی هەولێر',
      name_ar: 'أجهزة أربيل الحديثة',
      description_en: 'Official agency warranty certificates provided for European and smart kitchen appliances in Gulan Street.',
      description_ku: 'بریکاری فەرمی ئامێرە ئەوروپی و زیرەکەکانی چێشتخانە لە شەقامی گوڵان.',
      description_ar: 'وكيل معتمد للأجهزة الأوروبية والذكية للمطبخ في شارع كولان بأربيل.',
      location_id: locMap['erbil'],
      address: 'Gulan Street & Empire World, Erbil',
      phone: '+964 750 234 5678',
      whatsapp: '+9647502345678',
      logo_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=200&q=80',
      verification_status: 'verified',
      is_demo: false,
      is_active: true,
    },
    {
      slug: 'chiya-natural-mountain-goods',
      name_en: 'Chiya Natural Mountain Goods',
      name_ku: 'بەرهەمە سروشتییەکانی چیا',
      name_ar: 'منتجات جبل جيا الطبيعية',
      description_en: '100% pure raw mountain honey from Penjwen highlands with accredited laboratory purity certificates.',
      description_ku: 'هەنگوینی شاخاوی ڕەسەنی پێنجوێن بە گەرەنتی پشکنینی تاقیگەی باوەڕپێکراو.',
      description_ar: 'عسل جبلي طبيعي 100% من مرتفعات بنجوين مع شهادة فحص مختبري.',
      location_id: locMap['sulaymaniyah'],
      address: 'Penjwen Highlands & Sulaymaniyah Outlet',
      phone: '+964 771 987 6543',
      whatsapp: '+9647719876543',
      logo_url: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=200&q=80',
      verification_status: 'verified',
      is_demo: false,
      is_active: true,
    },
    {
      slug: 'duhok-elite-electronics',
      name_en: 'Duhok Elite Electronics',
      name_ku: 'ئێلیت ئەلیکترۆنیکس دهۆک',
      name_ar: 'إيليت للإلكترونيات دهوك',
      description_en: 'Trusted household goods and electronics retailer in KRO commercial area with express delivery.',
      description_ku: 'کۆگای باوەڕپێکراوی کەلوپەلی ناوماڵ و ئەلیکترۆنی لە ناوچەی بازرگانی KRO لە دهۆک.',
      description_ar: 'متجر موثوق للأجهزة المنزلية والإلكترونيات في منطقة KRO التجارية بدهوك.',
      location_id: locMap['duhok'],
      address: 'KRO Commercial Area, Duhok',
      phone: '+964 750 888 1234',
      whatsapp: '+9647508881234',
      logo_url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=200&q=80',
      verification_status: 'verified',
      is_demo: false,
      is_active: true,
    },
    {
      slug: 'hawraman-heritage-crafts',
      name_en: 'Hawraman Heritage Crafts',
      name_ku: 'کەلەپوور و دەستکردی هەورامان',
      name_ar: 'حرف وتراث هورامان الأصيلة',
      description_en: 'Authentic handmade Kurdish rugs, kilims, and traditional copper goods crafted by artisan weavers.',
      description_ku: 'بەرمای دەستچنی کوردی هەورامان و کەلوپەلی مسی ڕەسەن لە بازاڕی کۆنی سلێمانی.',
      description_ar: 'سجاد كليم يدوي الصنع ونحاسيات كردية أصيلة منسوجة بأيدي حرفيين مهرة.',
      location_id: locMap['sulaymaniyah'],
      address: 'Qaisari Bazaar, Sulaymaniyah Old City',
      phone: '+964 770 555 7890',
      whatsapp: '+9647705557890',
      logo_url: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=200&q=80',
      verification_status: 'verified',
      is_demo: false,
      is_active: true,
    },
    {
      slug: 'prestige-tech-erbil',
      name_en: 'Prestige Tech Erbil',
      name_ku: 'پرێستیج تێک هەولێر',
      name_ar: 'بريستيج تك أربيل',
      description_en: 'Premium cordless vacuums and lifestyle tech with 2-year warranty support.',
      description_ku: 'ئامێرە پێشکەوتووەکانی پاککردنەوە و تەکنەلۆجیای ڕۆژانە بە گەرەنتی ٢ ساڵ لە هەولێر.',
      description_ar: 'أحدث المكانس اللاسلكية والتكنولوجيا المتقدمة مع ضمان لمدة سنتين.',
      location_id: locMap['erbil'],
      address: '100m Road Commercial Center, Erbil',
      phone: '+964 750 111 2233',
      whatsapp: '+9647501112233',
      logo_url: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=200&q=80',
      verification_status: 'verified',
      is_demo: false,
      is_active: true,
    },
  ];

  const sellerMap = {};
  for (const s of sellersData) {
    const { data, error } = await supabase
      .from('sellers')
      .upsert(s, { onConflict: 'slug' })
      .select('id, slug')
      .single();
    if (error) {
      console.warn('Seller upsert notice:', s.slug, error.message);
      const { data: existing } = await supabase.from('sellers').select('id, slug').eq('slug', s.slug).single();
      if (existing) sellerMap[existing.slug] = existing.id;
    } else if (data) {
      sellerMap[data.slug] = data.id;
    }
  }

  // Also read all sellers
  const { data: allSellers } = await supabase.from('sellers').select('id, slug');
  if (allSellers) {
    allSellers.forEach((s) => { sellerMap[s.slug] = s.id; });
  }

  // 5. Upsert Rich Authentic Products
  console.log('5. Upserting Local Products...');
  const productsToSeed = [
    {
      slug: 'delonghi-dedica-ec685',
      category_slug: 'coffee-machines',
      seller_slug: 'sulaymaniyah-home-tech',
      location_slug: 'sulaymaniyah',
      price: 185000,
      currency: 'IQD',
      brand: 'DeLonghi',
      model: 'EC685 Dedica Style',
      capacity: '1.1 Liters',
      power_watts: 1300,
      warranty_applicable: true,
      warranty_months: 12,
      warranty_details: '1 Year Local Warranty (Repair & Parts covered)',
      delivery_available: true,
      delivery_info: 'Same-day delivery in Sulaymaniyah (3,000 IQD), 2 days to Erbil/Duhok',
      return_days: 3,
      return_policy: '3-day replacement for manufacturing defects',
      origin: 'Italy (Manufactured for EMEA)',
      image_url: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80',
      is_demo: false,
      translations: {
        en: {
          name: 'DeLonghi Dedica Espresso Machine (EC685)',
          description: 'Slimline 15 cm width stainless steel manual espresso machine. Includes double filter, pannarello milk frother wand, and rapid thermo-block heating system. Perfect for home baristas in Kurdistan.',
        },
        ku: {
          name: 'ئامێری قاوەی دیدیکا دێلۆنگی EC685',
          description: 'قاوەسازێکی ستیلی ئەسڵی بە پانی تەنها ١٥ سم. خاوەنی فلتەری دووانی، فۆمەری شیر و گەرمکەرەوەی خێرای تەرمۆبلۆکە. گونجاوترینە بۆ ماڵ و ئۆفیس لە کوردستان.',
        },
        ar: {
          name: 'ماكينة إسبريسو ديلونجي ديديكا EC685',
          description: 'ماكينة إسبريسو يدوية من الستانلس ستيل بعرض 15 سم فقط. تشمل فلتر مزدوج وعصا تبخير الحليب ونظام تسخين ثيرموبلوك سريع.',
        },
      },
    },
    {
      slug: 'philips-series-2200-auto',
      category_slug: 'coffee-machines',
      seller_slug: 'erbil-modern-appliances',
      location_slug: 'erbil',
      price: 495000,
      currency: 'IQD',
      brand: 'Philips',
      model: 'Series 2200 Fully Automatic',
      capacity: '1.8 Liters',
      power_watts: 1500,
      warranty_applicable: true,
      warranty_months: 24,
      warranty_details: '2 Years Official Philips Agent Warranty in Erbil',
      delivery_available: true,
      delivery_info: 'Free delivery in Erbil, 5,000 IQD other Kurdistan cities',
      return_days: 7,
      return_policy: '7 days unused return policy in original packaging',
      origin: 'Romania / Netherlands',
      image_url: 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?auto=format&fit=crop&w=800&q=80',
      is_demo: false,
      translations: {
        en: {
          name: 'Philips Series 2200 Fully Automatic Espresso & Coffee',
          description: 'Fresh bean-to-cup coffee with 100% ceramic grinders. Intuitive touch display lets you adjust aroma strength and coffee quantity easily.',
        },
        ku: {
          name: 'قاوەسازی تەواو ئۆتۆماتیکی فیلیپس ٢٢٠٠',
          description: 'قاوەی تازە دەستبەجێ لە دەنکە قاوەوە دەهاڕێت بە ئاشی سیرامیک. شاشەی دەستلێدانی زیرەک ڕێگەت پێدەدات خەستی و بڕی قاوەکەت دیاری بکەیت بە گەرەنتی ٢ ساڵ.',
        },
        ar: {
          name: 'ماكينة قهوة أوتوماتيكية بالكامل فيليبس سيريس 2200',
          description: 'قهوة طازجة من الحبوب مباشرة مع مطاحن سيراميك 100%. شاشة لمس سهلة الاستخدام تتيح ضبط قوة النكهة وكمية القهوة بسهولة مع ضمان سنتين.',
        },
      },
    },
    {
      slug: 'ninja-foodi-dualzone-af400',
      category_slug: 'kitchen-home',
      seller_slug: 'sulaymaniyah-home-tech',
      location_slug: 'sulaymaniyah',
      price: 265000,
      currency: 'IQD',
      brand: 'Ninja Foodi',
      model: 'DualZone AF400EU Max',
      capacity: '9.5 Liters (Dual 4.75L Baskets)',
      power_watts: 2470,
      warranty_applicable: true,
      warranty_months: 6,
      warranty_details: '6 Months Local Shop Technical Warranty',
      delivery_available: true,
      delivery_info: 'Free delivery across Sulaymaniyah, 4,000 IQD elsewhere in KRI',
      return_days: 2,
      return_policy: '48 hours testing window for hardware',
      origin: 'United States brand (EMEA Spec)',
      image_url: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80',
      is_demo: false,
      translations: {
        en: {
          name: 'Ninja Foodi DualZone Air Fryer 9.5L (AF400EU)',
          description: 'Cook 2 foods 2 ways and finish at the same time with Sync Cook feature. Large capacity suitable for big Kurdish family feasts.',
        },
        ku: {
          name: 'ئێر فرایەری دوو بەشی نینجا فودی ٩.٥ لیتر',
          description: 'دوو خواردنی جیاواز بە دوو شێوازی جیاواز ئامادە بکە و لە یەک کاتدا تەواو دەبن بە تایبەتمەندی Sync Cook. قەبارەی گەورە و گونجاو بۆ خێزانی گەورە لە سلێمانی.',
        },
        ar: {
          name: 'قلاية هوائية نينجا فودي دبل 9.5 لتر (AF400EU)',
          description: 'طهي طعامين مختلفين بطريقتين مختلفتين والانتهاء في نفس الوقت بفضل ميزة المزامنة. سعة كبيرة جداً 9.5 لتر تناسب العائلات الكبيرة.',
        },
      },
    },
    {
      slug: 'xiaomi-smart-air-fryer-pro-4l',
      category_slug: 'kitchen-home',
      seller_slug: 'erbil-modern-appliances',
      location_slug: 'erbil',
      price: 115000,
      currency: 'IQD',
      brand: 'Xiaomi',
      model: 'Smart Air Fryer Pro 4L',
      capacity: '4.0 Liters',
      power_watts: 1600,
      warranty_applicable: true,
      warranty_months: 12,
      warranty_details: '1 Year Local Warranty in Erbil',
      delivery_available: true,
      delivery_info: 'Delivery available in Erbil (3,000 IQD)',
      return_days: null,
      return_policy: null,
      origin: 'China',
      image_url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
      is_demo: false,
      translations: {
        en: {
          name: 'Xiaomi Smart Air Fryer Pro 4L Window Edition',
          description: 'Transparent visual window allows real-time monitoring. Connects to Mi Home app for remote scheduling, voice control, and over 100 cloud recipes.',
        },
        ku: {
          name: 'ئێر فرایەری ژیری شیاومی پرۆ ٤ لیتر بە جام',
          description: 'جامێکی ڕوونی هەیە کە ڕێگەت پێدەدات چاودێری برژانی خواردنەکە بکەیت. پەیوەست دەبێت بە مۆبایل لە ڕێگەی ئەپی Mi Home بە گەرەنتی یەک ساڵ.',
        },
        ar: {
          name: 'قلاية شاومي الذكية برو 4 لتر مع نافذة مراقبة',
          description: 'نافذة زجاجية شفافة تتيح مراقبة الطهي في الوقت الفعلي. تتصل بتطبيق الهاتف الذكي للتحكم وجدولة الطهي مع ضمان سنة كاملة.',
        },
      },
    },
    {
      slug: 'penjwen-wild-mountain-honey-1kg',
      category_slug: 'local-food-honey',
      seller_slug: 'chiya-natural-mountain-goods',
      location_slug: 'sulaymaniyah',
      price: 65000,
      currency: 'IQD',
      brand: 'Chiya Natural',
      model: 'Wild Mountain Harvest 2026',
      capacity: '1,000g Glass Jar',
      power_watts: null,
      warranty_applicable: true,
      warranty_months: 24,
      warranty_details: '100% Purity Guarantee with Laboratory Certificate',
      delivery_available: true,
      delivery_info: 'Free delivery across Kurdistan for 2+ jars, otherwise 3,000 IQD',
      return_days: 14,
      return_policy: 'Full refund if laboratory test fails purity check',
      origin: 'Penjwen Highlands, Kurdistan Region',
      image_url: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=800&q=80',
      is_demo: false,
      translations: {
        en: {
          name: 'Pure Raw Penjwen Wild Mountain Honey (1kg Glass Jar)',
          description: 'Harvested from wild mountain flora in high altitude Penjwen mountains. Unpasteurized, cold-extracted, and raw with zero artificial additives.',
        },
        ku: {
          name: 'هەنگوینی شاخی پێنجوێن - سروشتی ١٠٠٪ (١ کیلۆ)',
          description: 'بەرهەمهێنراو لە گوڵ و گیای شاخاوی بەرزاییەکانی پێنجوێن. بەبێ هیچ گەرمکردنێک و بە تاقیگەکراوی، ١٠٠٪ ڕەسەن بە گەرەنتی گەڕاندنەوەی پارە.',
        },
        ar: {
          name: 'عسل جبلي طبيعي خالص من بنجوين (1 كغم)',
          description: 'عسل نقي مستخرج من زهور البراري الجبلية في مرتفعات بنجوين. غير مبستر وخام 100% مع ضمان فحص المختبر واسترجاع كامل.',
        },
      },
    },
    {
      slug: 'braun-multiquick-9-blender',
      category_slug: 'kitchen-home',
      seller_slug: 'duhok-elite-electronics',
      location_slug: 'duhok',
      price: 215000,
      currency: 'IQD',
      brand: 'Braun',
      model: 'MultiQuick 9 MQ9187XLI',
      capacity: '2.0L Food Processor + 500ml Chopper',
      power_watts: 1200,
      warranty_applicable: true,
      warranty_months: 12,
      warranty_details: '1 Year Warranty covered in Duhok and Erbil',
      delivery_available: true,
      delivery_info: 'Delivery available in Duhok (2,500 IQD) and Erbil (4,000 IQD)',
      return_days: 3,
      return_policy: '3 days exchange policy for unboxed items',
      origin: 'Germany (Designed in Germany)',
      image_url: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=800&q=80',
      is_demo: false,
      translations: {
        en: {
          name: 'Braun MultiQuick 9 Hand Blender 1200W (MQ9187XLI)',
          description: 'Braun flagship hand blender featuring ActiveBlade technology that moves up and down to chop even the hardest foods like nuts and root vegetables easily.',
        },
        ku: {
          name: 'میکسەری دەستی براون مەلتی کویک ٩ بە هێزی ١٢٠٠ وات',
          description: 'بەهێزترین میکسەری دەستی براون بە تەکنەلۆجیای ActiveBlade کە چەقۆکانی سەر و خوار دەبن بۆ وردکردنی چەرەس و کەرەستە ڕەقەکان بە ئاسانی.',
        },
        ar: {
          name: 'خلاط يدوي براون مالتي كويك 9 بقدرة 1200 واط',
          description: 'الخلاط الرائد من براون بتقنية ActiveBlade لتقطيع أصعب الأطعمة والمكسرات بسهولة مع قوة 1200 واط وضمان سنة.',
        },
      },
    },
    {
      slug: 'kurdish-kelim-rug-hawraman',
      category_slug: 'handmade-crafts',
      seller_slug: 'hawraman-heritage-crafts',
      location_slug: 'sulaymaniyah',
      price: 340000,
      currency: 'IQD',
      brand: 'Hawraman Heritage',
      model: 'Sina / Hawraman Diamond Weave',
      capacity: '150cm x 200cm',
      power_watts: null,
      warranty_applicable: true,
      warranty_months: 60,
      warranty_details: 'Lifetime Authenticity Guarantee (Natural Vegetable Dyes)',
      delivery_available: true,
      delivery_info: 'Free insured delivery anywhere in Kurdistan',
      return_days: 7,
      return_policy: '7 days inspection and return if unsoiled',
      origin: 'Hawraman / Kurdistan Region',
      image_url: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=800&q=80',
      is_demo: false,
      translations: {
        en: {
          name: 'Handwoven Kurdish Kelim Rug (Hawraman Pattern, 1.5m x 2m)',
          description: 'Traditional flat-weave wool kelim crafted by master artisans using 100% organic local sheep wool and hand-extracted vegetable dyes. Genuine heirloom quality.',
        },
        ku: {
          name: 'بەرمای دەستچنی کوردی هەورامان (١.٥م × ٢م)',
          description: 'بەرمایەکی ڕەسەنی دەستچن لە خوری سروشتی مەڕ و ڕەنگی ڕووەکی سروشتی. نەخشی دێرینی هەورامان بە کوالیتی بەرز و گەیاندنی بێبەرامبەر لە کوردستان.',
        },
        ar: {
          name: 'سجاد كليم كردي منسوج يدوياً بنقوش هورامان (1.5م × 2م)',
          description: 'سجاد كليم تقليدي أصيل مصنوع يدوياً من صوف الأغنام المحلي 100% وأصباغ نباتية طبيعية من جبال هورامان مع توصيل مؤمن مجاني.',
        },
      },
    },
    {
      slug: 'dyson-v12-detect-slim-vacuum',
      category_slug: 'home-appliances',
      seller_slug: 'prestige-tech-erbil',
      location_slug: 'erbil',
      price: 720000,
      currency: 'IQD',
      brand: 'Dyson',
      model: 'V12 Detect Slim Absolute',
      capacity: '0.35L Bin (2.2kg Weight)',
      power_watts: 150,
      warranty_applicable: true,
      warranty_months: 24,
      warranty_details: '2 Years Dyson Warranty (Agent Support in Erbil)',
      delivery_available: true,
      delivery_info: 'Free same-day delivery in Erbil, 6,000 IQD to Sulaymaniyah/Duhok',
      return_days: 14,
      return_policy: '14 days warranty against technical hardware failure',
      origin: 'United Kingdom brand (Engineered in UK)',
      image_url: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&q=80',
      is_demo: false,
      translations: {
        en: {
          name: 'Dyson V12 Detect Slim Cordless Vacuum Cleaner',
          description: 'Lightweight cordless vacuum with laser illumination that reveals invisible dust on hard floors. Piezo sensor scientifically sizes and counts dust particles.',
        },
        ku: {
          name: 'گسکە کارەبایی بێ وایەری دایسۆن V12 دەستنیشانکەری تۆز',
          description: 'گسکێکی کارەبایی زۆر کێش سووک بە تەکنەلۆجیای لێزەری سەوز کە تەپوتۆزی نەبینراو ئاشکرا دەکات. کێشی تەنها ٢.٢ کگم بە گەرەنتی فەرمی ٢ ساڵ لە هەولێر.',
        },
        ar: {
          name: 'مكنسة دايسون اللاسلكية V12 ديتكت سليم بالليزر',
          description: 'مكنسة لاسلكية فائقة الخفة مزودة بليزر يكشف الغبار غير المرئي على الأرضيات الصلبة. وزن خفيف 2.2 كغم مع ضمان سنتين.',
        },
      },
    },
    {
      slug: 'dsp-turkish-coffee-maker',
      category_slug: 'coffee-machines',
      seller_slug: 'sulaymaniyah-home-tech',
      location_slug: 'sulaymaniyah',
      price: 38000,
      currency: 'IQD',
      brand: 'DSP',
      model: 'Electric Turkish Coffee 800W',
      capacity: '4 Cups (250ml)',
      power_watts: 800,
      warranty_applicable: false,
      warranty_months: null,
      warranty_details: null,
      delivery_available: true,
      delivery_info: 'Delivery available in Sulaymaniyah (4,000 IQD)',
      return_days: null,
      return_policy: null,
      origin: 'China',
      image_url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',
      is_demo: false,
      translations: {
        en: {
          name: 'DSP Electric Turkish & Arabic Coffee Maker 800W',
          description: 'Compact rapid Turkish coffee pot with anti-overflow sensor and stainless steel base. Affordable daily kitchen device.',
        },
        ku: {
          name: 'قاوەسازی تورکی دی ئێس پی ٨٠٠ وات',
          description: 'قاوەسازێکی خێرای قاوەی تورکی و کوردی بە سێنسەری دژە سەرڕێژبوون و بنی ستیل. هەرزانترین بژاردە بۆ قاوەی ڕۆژانە.',
        },
        ar: {
          name: 'صانعة القهوة التركية DSP قدرة 800 واط',
          description: 'وعاء قهوة تركي كهربائي سريع مع حساس لمنع فيضان القهوة وقاعدة من الستانلس ستيل. جهاز اقتصادي وعملي جداً.',
        },
      },
    },
    {
      slug: 'handmade-kurdish-copper-jazwa',
      category_slug: 'handmade-crafts',
      seller_slug: 'hawraman-heritage-crafts',
      location_slug: 'sulaymaniyah',
      price: 45000,
      currency: 'IQD',
      brand: 'Qaisari Artisans',
      model: 'Carved Kurdish Cezve Jazwa Set',
      capacity: '3 Small Cups (180ml)',
      power_watts: null,
      warranty_applicable: true,
      warranty_months: 36,
      warranty_details: 'Guaranteed pure hand-hammered heavy copper with tin interior',
      delivery_available: true,
      delivery_info: 'Fast delivery across Sulaymaniyah, Erbil and Duhok',
      return_days: 7,
      return_policy: 'Full return if copper purity is unsatisfied',
      origin: 'Sulaymaniyah Copper Market (Kurdish Artisan Guild)',
      image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
      is_demo: false,
      translations: {
        en: {
          name: 'Handcrafted Kurdish Engraved Copper Jazwa Set',
          description: 'Heavy solid copper traditional Kurdish cezve with hand-engraved motifs and turned wooden handle. Tinned food-safe interior.',
        },
        ku: {
          name: 'جەزوەی مسی دەستکردی قەیسەری نەخشێنراو',
          description: 'جەزوەیەکی مسی قورسی دەستکرد بە نەخشی ڕەسەنی کوردی و دەسکی داری گوێز. ناوەوەی سپیکراوە بە قەڵایی بۆ تەندروستی و سەلامەتی.',
        },
        ar: {
          name: 'ركوة قهوة نحاسية كردية يدوية الصنع',
          description: 'ركوة نحاس ثقيل أصيلة منقوشة يدوياً بنقوش تراثية ومقبض خشبي أنيق مع طلاء داخلي بالقصدير الصحي.',
        },
      },
    },
  ];

  for (const p of productsToSeed) {
    const categoryId = catMap[p.category_slug] || catMap['kitchen-home'];
    const sellerId = sellerMap[p.seller_slug] || Object.values(sellerMap)[0];
    const locationId = locMap[p.location_slug] || locMap['sulaymaniyah'];

    const searchText = [
      p.slug,
      p.brand || '',
      p.model || '',
      p.capacity || '',
      p.translations.en.name,
      p.translations.en.description,
      p.translations.ku.name,
      p.translations.ku.description,
      p.translations.ar.name,
      p.translations.ar.description,
    ].join(' ').toLowerCase();

    const productPayload = {
      slug: p.slug,
      category_id: categoryId,
      seller_id: sellerId,
      location_id: locationId,
      price: p.price,
      currency: p.currency,
      brand: p.brand,
      model: p.model,
      capacity: p.capacity,
      power_watts: p.power_watts,
      specs: {},
      warranty_applicable: p.warranty_applicable,
      warranty_months: p.warranty_months,
      warranty_details: p.warranty_details,
      delivery_available: p.delivery_available,
      delivery_info: p.delivery_info,
      return_days: p.return_days,
      return_policy: p.return_policy,
      origin: p.origin,
      image_url: p.image_url,
      status: 'active',
      is_demo: p.is_demo,
      search_text: searchText,
    };

    const { data: upsertedProd, error: pError } = await supabase
      .from('products')
      .upsert(productPayload, { onConflict: 'slug' })
      .select('id, slug')
      .single();

    if (pError) {
      console.warn('Product upsert notice:', p.slug, pError.message);
      continue;
    }

    const prodId = upsertedProd.id;
    console.log(`✓ Product upserted: ${p.slug} (${prodId})`);

    // Insert Translations (en, ku, ar)
    for (const [lang, trans] of Object.entries(p.translations)) {
      const { error: tErr } = await supabase
        .from('product_translations')
        .upsert(
          {
            product_id: prodId,
            lang: lang,
            name: trans.name,
            description: trans.description,
          },
          { onConflict: 'product_id,lang' }
        );
      if (tErr) {
        // If no unique constraint on product_id,lang, insert if not present
        const { data: existingT } = await supabase
          .from('product_translations')
          .select('id')
          .eq('product_id', prodId)
          .eq('lang', lang)
          .maybeSingle();

        if (existingT) {
          await supabase
            .from('product_translations')
            .update({ name: trans.name, description: trans.description })
            .eq('id', existingT.id);
        } else {
          await supabase.from('product_translations').insert({
            product_id: prodId,
            lang: lang,
            name: trans.name,
            description: trans.description,
          });
        }
      }
    }
  }

  // 6. Also update any existing demo products with clean Unsplash images & realistic titles
  console.log('6. Upgrading existing demo product images to high-res photography...');
  const demoImageFixes = [
    { slug: 'coffee-machine-a', image_url: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80', brand: 'Smeg' },
    { slug: 'coffee-machine-b', image_url: 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?auto=format&fit=crop&w=800&q=80', brand: 'DeLonghi' },
    { slug: 'coffee-machine-c', image_url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80', brand: 'Breville' },
    { slug: 'air-fryer-a', image_url: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80', brand: 'Ninja' },
    { slug: 'air-fryer-b', image_url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80', brand: 'Philips' },
    { slug: 'blender-a', image_url: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=800&q=80', brand: 'Nutribullet' },
    { slug: 'blender-b', image_url: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=800&q=80', brand: 'Braun' },
    { slug: 'vacuum-cleaner-a', image_url: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&q=80', brand: 'Dyson' },
    { slug: 'mountain-honey-1kg', image_url: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=800&q=80', brand: 'Hawraman Wild' },
    { slug: 'handmade-wool-rug', image_url: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=800&q=80', brand: 'Kurdish Kilims' },
  ];

  for (const fix of demoImageFixes) {
    await supabase
      .from('products')
      .update({ image_url: fix.image_url, brand: fix.brand })
      .eq('slug', fix.slug);
  }

  console.log('--- Seeding Complete Successfully! ---');
}

main().catch((err) => {
  console.error('Seeding fatal error:', err);
  process.exit(1);
});
