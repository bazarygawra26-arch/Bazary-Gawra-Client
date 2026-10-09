import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../server/db/supabaseAdmin';

export const dynamic = 'force-dynamic';

const RAW_PRODUCTS = [
  {
    name_ku: "ئامێری قاوەی ئێسپرێسۆ دیلۆنگی دێدیکا",
    name_ar: "ماكينة قهوة ديلونجي ديديكا إسببريسو",
    name_en: "De'Longhi Dedica Espresso Machine",
    category_slug: "kitchen-home",
    seller_slug: "sulaymaniyah-home-tech",
    price: 185000,
    original_price: 215000,
    currency: "IQD",
    brand: "De'Longhi",
    capacity: "1.1 لیتر",
    power: "1300W",
    warranty: "١٢ مانگ گەرەنتی فەرمی لە سلێمانی",
    delivery_info: "گەیاندن لە سلێمانی ٣,٠٠٠ د.ع / هەولێر و دهۆک ٤,٠٠٠ د.ع",
    return_policy: "٧ ڕۆژ مافی گۆڕین و تاقیکردنەوە",
    description_ku: "ئامێرێکی پێشکەوتووی دروستکردنی قاوەی ئیسپرێسۆ بە پەستانی ١٥ بار و دیزاینی پۆڵایین. زۆر گونجاوە بۆ ماڵ و ئۆفیس.",
    description_ar: "ماكينة إسبريسو أنيقة بقوة 15 بار وهيكل من الفولاذ المقاوم للصدأ مع خزان 1.1 لتر.",
    description_en: "Slim 15-bar pump espresso machine with stainless steel finish and adjustable cappuccino system.",
    image_url: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80",
    is_promoted: true
  },
  {
    name_ku: "قلاوەری هەوایی فیلیپس XXL مۆدێلی HD9285",
    name_ar: "قلاية هوائية فيليبس إكس إكس إل الذكية",
    name_en: "Philips Airfryer XXL Smart Connected",
    category_slug: "kitchen-home",
    seller_slug: "erbil-modern-appliances",
    price: 175000,
    original_price: 200000,
    currency: "IQD",
    brand: "Philips",
    capacity: "7.2 لیتر",
    power: "2000W",
    warranty: "٢ ساڵ گەرەنتی فەرمی",
    delivery_info: "گەیاندنی خێرا (١-٢ ڕۆژ) بۆ سەرجەم شارەکانی کوردستان",
    return_policy: "٧ ڕۆژ مۆڵەتی تاقیکردنەوە لە کاتی بوونی کێشەی تەکنیکی",
    description_ku: "قلاوەری هەوایی بێ ڕۆن بە تەکنەلۆجیای Rapid Air بۆ ئامادەکردنی خۆراکی تەندروست بە کەمتری لە ٩٠٪ی چەوری. خاوەنی ١٦ پرۆگرامی ئامادەکردنە.",
    description_ar: "قلاية هوائية ذكية سعة 7.2 لتر مع تقنية الهواء السريع لطهي صحي بدهون أقل بنسبة 90%.",
    description_en: "Connected XXL airfryer with 7.2L capacity, Rapid Air technology, and 16 cooking functions.",
    image_url: "https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=800&q=80",
    is_promoted: true
  },
  {
    name_ku: "چایدانی کارەبایی کۆرکماز دێمیستیل تورکی",
    name_ar: "ماكينة شاي كوركماز ديماستيل التركية",
    name_en: "Korkmaz Demkolik Turkish Electric Tea Maker",
    category_slug: "kitchen-home",
    seller_slug: "sulaymaniyah-home-tech",
    price: 78000,
    original_price: 92000,
    currency: "IQD",
    brand: "Korkmaz",
    capacity: "1.7 لیتر چایدان + 0.9 لیتر قۆری",
    power: "1600W",
    warranty: "١ ساڵ گەرەنتی گۆڕین",
    delivery_info: "گەیاندن لە سلێمانی بە خۆڕاییە بۆ سەروو ٥٠,٠٠٠ د.ع",
    return_policy: "٣ ڕۆژ مۆڵەتی گۆڕین",
    description_ku: "چایدان و قۆری ئەسڵی تورکی کۆرکماز لە پۆڵای دژە ژەنگی ١٨/١٠ دروستکراوە. سیستەمی هێشتنەوەی گەرمی خۆکاری هەیە بۆ دەمکردنی چای کوردی و تورکی.",
    description_ar: "صانعة الشاي الكهربائية المصنوعة من الستانلس ستيل 18/10 المقاوم للصدأ بنظام حفظ الحرارة التلقائي.",
    description_en: "Authentic Turkish double tea maker with 18/10 Cr-Ni stainless steel body and auto keep-warm function.",
    image_url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80",
    is_promoted: false
  },
  {
    name_ku: "سۆپای کارەبایی کۆمتێل ٤ مۆم بە تەڕکەرەوە",
    name_ar: "مدفأة كهربائية كومتيل 4 شمعات مع مرطب",
    name_en: "Kumtel 4-Tube Quartz Electric Heater with Humidifier",
    category_slug: "home-appliances",
    seller_slug: "erbil-modern-appliances",
    price: 42000,
    original_price: 50000,
    currency: "IQD",
    brand: "Kumtel",
    capacity: "ژووری ٢٥ مەتر چوارگۆشە",
    power: "2200W",
    warranty: "٦ مانگ گەرەنتی پشکنین",
    delivery_info: "گەیاندن لە هەولێر ٣,٠٠٠ د.ع / سلێمانی و دهۆک ٤,٠٠٠ د.ع",
    return_policy: "تاقیکردنەوە لە کاتی وەرگرتن",
    description_ku: "سۆپای کارەبایی ئەسڵی تورکی بە ٤ مۆمی کوارتز و سیستەمی هەڵمی ئاو بۆ ڕێگریکردن لە وشکبوونەوەی هەوای ژوور لە وەرزی زستاندا.",
    description_ar: "مدفأة كوارتز تركية أصلية بـ 4 أنابيب تسخين مع نظام ترطيب الهواء ومفتاح أمان ضد السقوط.",
    description_en: "Turkish quartz heater featuring 4 heating tubes, built-in steam humidifier, and safety tip-over switch.",
    image_url: "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=800&q=80",
    is_promoted: false
  },
  {
    name_ku: "ئوتووی هەڵمی تەفاڵ توربۆ پرۆ",
    name_ar: "مكواة بخار تيفال توربو برو",
    name_en: "Tefal Turbo Pro Anti-Calc Steam Iron",
    category_slug: "home-appliances",
    seller_slug: "sulaymaniyah-home-tech",
    price: 68000,
    original_price: 80000,
    currency: "IQD",
    brand: "Tefal",
    capacity: "300 ملم ئاو",
    power: "2800W",
    warranty: "١ ساڵ گەرەنتی فەرمی",
    delivery_info: "گەیاندنی خێرا بۆ ناو سلێمانی لە ماوەی کەمتر لە ٢٤ کاتژمێر",
    return_policy: "٧ ڕۆژ مافی گۆڕین",
    description_ku: "ئوتووی فەڕەنسی تەفاڵ بە هێزی ٢٨٠٠ واک و پەستانی هەڵمی بەرز. تەکنەلۆجیای پاککردنەوەی دژە کلس و کفی سیرامیکی خلیسکێنەری Durilium Airglide.",
    description_ar: "مكواة بخار بقوة 2800 واط مع صمام تجميع الكلس وقاعدة ديوريليوم المقاومة للخدش.",
    description_en: "High performance steam iron with 2800W power, Durilium AirGlide soleplate, and integrated anti-calc collector.",
    image_url: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800&q=80",
    is_promoted: false
  },
  {
    name_ku: "پاوەربانکی ئەنکەر 737 پرۆ ٢٤,٠٠٠ میلی ئەمپێر",
    name_ar: "شاحن متنقل أنكر 737 باور بنك 24000 ملي أمبير",
    name_en: "Anker 737 Power Bank (PowerCore 24K)",
    category_slug: "electronics",
    seller_slug: "duhok-elite-electronics",
    price: 145000,
    original_price: 165000,
    currency: "IQD",
    brand: "Anker",
    capacity: "24,000 mAh (140W)",
    power: "140W Two-Way Fast Charge",
    warranty: "١٨ مانگ گەرەنتی ئاڵوگۆڕ لە دهۆک و هەولێر",
    delivery_info: "گەیاندنی پارێزراو بۆ هەموو عێراق و هەرێمی کوردستان",
    return_policy: "٧ ڕۆژ گەرەنتی ئەسڵبوون و تاقیکردنەوە",
    description_ku: "بەهێزترین پاوەربانکی ئەنکەر بە شاشەی زیرەکی دیجیتاڵی. توانای بارگاویکردنەوەی لاپتۆپ و مۆبایل بە خێرایی ١٤٠ واک بە تەکنەلۆجیای GaNPrime.",
    description_ar: "بنك طاقة فائق السرعة بقدرة 140 واط مع شاشة رقمية ذكية وشحن سريع ثلاثي المنافذ للابتوب والهواتف.",
    description_en: "Ultra-powerful 140W two-way fast charging power bank with smart digital display and 24,000mAh capacity.",
    image_url: "https://images.unsplash.com/photo-1609592426815-58564f895315?auto=format&fit=crop&w=800&q=80",
    is_promoted: true
  },
  {
    name_ku: "سەماعەی بلوتووسی جی بی ئێڵ فلیپ ٦",
    name_ar: "مكبر صوت بلوتوث جي بي إل فليب 6 ضد الماء",
    name_en: "JBL Flip 6 Portable Waterproof Bluetooth Speaker",
    category_slug: "electronics",
    seller_slug: "duhok-elite-electronics",
    price: 125000,
    original_price: 140000,
    currency: "IQD",
    brand: "JBL",
    capacity: "١٢ کاتژمێر پاتری بەردەوام",
    power: "30W RMS",
    warranty: "١ ساڵ گەرەنتی شەریکە",
    delivery_info: "گەیاندن لە دهۆک ٣,٠٠٠ د.ع / ناوچەکانی تر ٤,٠٠٠ د.ع",
    return_policy: "تاقیکردنەوە لەبەردەم کارمەندی گەیاندن",
    description_ku: "بڵندگۆی گەڕۆکی ئەسڵی JBL بە دەنگێکی پڕ و بێگەرد، دژە ئاو و تەپوتۆز بە ستانداردی IP67. گونجاوە بۆ سەیران و گەشتەکانی چیاکانی کوردستان.",
    description_ar: "سماعة بلوتوث أصلية مقاومة للماء والغبار بمعيار IP67 مع بطارية تدوم حتى 12 ساعة وصوت نقي.",
    description_en: "Bold, waterproof portable speaker featuring 2-way speaker system, IP67 rating, and 12-hour playtime.",
    image_url: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80",
    is_promoted: false
  },
  {
    name_ku: "ئێیرپۆدز پرۆ ٢ مۆدێلی تایپ سی بە سڕینەوەی دەنگەدەنگ",
    name_ar: "سماعات أبل إيربودز برو الجيل الثاني Type-C",
    name_en: "Apple AirPods Pro (2nd Generation) USB-C",
    category_slug: "electronics",
    seller_slug: "sulaymaniyah-home-tech",
    price: 315000,
    original_price: 340000,
    currency: "IQD",
    brand: "Apple",
    capacity: "٣٠ کاتژمێر لەگەڵ کەیس",
    power: null,
    warranty: "١ ساڵ گەرەنتی فەرمی ئەپڵ",
    delivery_info: "گەیاندنی بێ بەرامبەر بۆ سەرتاسەری کوردستان",
    return_policy: "گەرەنتی ئەسڵبوون و سێریاڵ نەمبەری فەرمی ئەپڵ",
    description_ku: "سەماعەی ئەسڵی ئەپڵ بە چیپی نوێی H2، سڕینەوەی ژاوەژاوی چالاک (Active Noise Cancellation) و دەنگی بەهێزی دەوروبەر. پۆڕتی بارگاویکردنی USB-C.",
    description_ar: "سماعات أبل الأصلية بمنفذ تايب سي مع ميزة إلغاء الضوضاء النشطة وشريحة H2 الذكية.",
    description_en: "Apple AirPods Pro 2nd Gen with USB-C, up to 2x more Active Noise Cancellation, and Adaptive Audio.",
    image_url: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80",
    is_promoted: true
  },
  {
    name_ku: "تەسبیحی داری قەزوانی هەورامان ١٠١ دانەیی",
    name_ar: "مسبحة خشب القزوان الحوراماني الطبيعي 101 حبة",
    name_en: "Handcrafted Hawraman Qazwan Wood Prayer Beads (101 Beads)",
    category_slug: "handmade-crafts",
    seller_slug: "hawraman-heritage-crafts",
    price: 38000,
    original_price: 45000,
    currency: "IQD",
    brand: "Hawraman Heritage",
    capacity: "١٠١ دەنک / درێژی ٤٥ سم",
    power: null,
    warranty: "گەرەنتی دار و بەرهەمی ئەسڵی سروشتی",
    delivery_info: "گەیاندن لە سلێمانی و هەولێر لە ماوەی ٢٤-٤٨ کاتژمێر",
    return_policy: "مافی گەڕاندنەوە ئەگەر لەگەڵ وێنەکان یەکی نەگرتەوە",
    description_ku: "تەسبیحی دەستکردی ڕەسەن لە بەری داری قەزوانی چیاکانی هەورامان دروستکراوە بە داوی ئاوریشمی پتەو و دەستەوانی نەخشێنراو بە زیو.",
    description_ar: "سبحة يدوية تقليدية مصنوعة من حبوب القزوان الجبلي الطبيعي في حورامان مع خيط حريري قوي ومزينة بالفضة.",
    description_en: "Authentic handmade Kurdish prayer beads made from natural mountain terebinth (Qazwan) seeds from Hawraman.",
    image_url: "https://images.unsplash.com/photo-1599508704512-2f19efd1e35f?auto=format&fit=crop&w=800&q=80",
    is_promoted: true
  },
  {
    name_ku: "سەماوەری مسینی نەخشێنراوی دەستکردی کوردی",
    name_ar: "سماور نحاسي يدوي كلاسيكي منقوش",
    name_en: "Handmade Engraved Kurdish Brass & Copper Samovar",
    category_slug: "handmade-crafts",
    seller_slug: "hawraman-heritage-crafts",
    price: 85000,
    original_price: 105000,
    currency: "IQD",
    brand: "Hawraman Heritage",
    capacity: "4.5 لیتر",
    power: null,
    warranty: "گەرەنتی مسی قورس و کاری دەستی",
    delivery_info: "گەیاندنی تایبەت بە پاکێجی پارێزراو بۆ شارەکان",
    return_policy: "پشکنین لە کاتی وەرگرتنی کالا",
    description_ku: "سەماوەری دەستکردی مسین بە نەخشی گوڵ و تابلۆی کەلەپووری، لەسەر خەڵووز و دار کاردەکات بە فافۆنی خاوێنکراوی ناوەوە بۆ تامی چای ڕەسەنی کوردی.",
    description_ar: "سماور نحاسي مصنوع يدوياً بنقوش تراثية كوردية تقليدية، يعمل بالفحم ومبطن بالقصدير النقي.",
    description_en: "Artisanal hand-engraved copper samovar for traditional charcoal tea brewing with food-safe tin lining.",
    image_url: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80",
    is_promoted: false
  },
  {
    name_ku: "قاپ و کاسەی چێشتی داری گوێزی هەورامان",
    name_ar: "وعاء تقديم مصنوع يدوياً من خشب الجوز الحوراماني",
    name_en: "Hand-Carved Walnut Wood Serving Bowl from Hawraman",
    category_slug: "handmade-crafts",
    seller_slug: "hawraman-heritage-crafts",
    price: 32000,
    original_price: 40000,
    currency: "IQD",
    brand: "Hawraman Heritage",
    capacity: "قەبارەی مامناوەند (تیرەی ٢٨ سم)",
    power: null,
    warranty: "گەرەنتی داری سروشتی ١٠٠٪ و دژە قڵیشان",
    delivery_info: "گەیاندن لە سلێمانی بە ٣,٠٠٠ د.ع",
    return_policy: "٣ ڕۆژ مافی گۆڕین",
    description_ku: "کاسەی پێشکەشکردنی میوە و چەرەسات، لە یەک پارچە داری گوێزی کۆنی ناوچەی بیارە و هەورامان تاشراوە بە زەیتی زەیتوونی سروشتی دروستکراوە.",
    description_ar: "وعاء تقديم منحوت يدوياً من قطعة واحدة من خشب شجر الجوز الطبيعي ومعالج بزيت الزيتون الآمن للطعام.",
    description_en: "Hand-carved rustic serving bowl crafted from a single piece of native Hawraman walnut wood.",
    image_url: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80",
    is_promoted: false
  },
  {
    name_ku: "هەنگوینی شاخاوی پەتی هەورامان (١ کیلۆ)",
    name_ar: "عسل جبلي حوراماني نقي طبيعي 100% (1 كغم)",
    name_en: "100% Pure Raw Mountain Wildflower Honey from Hawraman (1kg)",
    category_slug: "local-food-honey",
    seller_slug: "chiya-natural-mountain-goods",
    price: 45000,
    original_price: 55000,
    currency: "IQD",
    brand: "Chiya Natural",
    capacity: "١ کیلۆگرام",
    power: null,
    warranty: "گەرەنتی پشکنینی تاقیگە و گەڕاندنەوەی پارە ئەگەر شەکری هەبێت",
    delivery_info: "گەیاندن بە شوشەی تایبەت و پارێزراو بۆ هەموو کوردستان",
    return_policy: "تاقیکردنەوە بە گرەنتی تاقیگە",
    description_ku: "هەنگوینی سروشتیی گولە کێویەکانی کوێستانەکانی هەورامان، بە تەواوی خاوێنە و بێ دەستێوەردانی شەکراوە. بەسوودە بۆ بەهێزکردنی بەرگری لەش و چارەسەری نەخۆشی.",
    description_ar: "عسل جبلي طبيعي وخام 100% مجني من أزهار جبال حورامان الوعرة بدون تغذية سكرية، مضمون بفحص المختبر.",
    description_en: "Pure, unpasteurized wild mountain honey harvested from the pristine high-altitude flora of Hawraman.",
    image_url: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80",
    is_promoted: true
  },
  {
    name_ku: "گوێزی ڕەسەنی پێنجوێن پێستی تەنک (١ کیلۆ)",
    name_ar: "جوز بنجوين الطبيعي رقيق القشرة (1 كغم)",
    name_en: "Organic Thin-Shelled Mountain Walnuts from Penjwen (1kg)",
    category_slug: "local-food-honey",
    seller_slug: "chiya-natural-mountain-goods",
    price: 16000,
    original_price: 20000,
    currency: "IQD",
    brand: "Chiya Natural",
    capacity: "١ کیلۆگرام پوختەکراو",
    power: null,
    warranty: "گەرەنتی سپێتی کڕۆک و تامی چەوری خۆماڵی",
    delivery_info: "گەیاندنی خێرا بۆ سەرجەم شارەکان",
    return_policy: "مافی گۆڕین لە کاتی ڕەشبوون یان خراپبوون",
    description_ku: "گوێزی خۆماڵی و بەناوبانگی ناوچەی پێنجوێن، پێست تەنک بە دەست دەشکێت، کڕۆکی سپی و پڕ چەوری و دەوڵەمەند بە ئۆمێگا ٣.",
    description_ar: "جوز محلي طازج من مزارع قضاء بنجوين، قشرة رقيقة تُكسر باليد مع لب أبيض غني بالزيوت الصحية.",
    description_en: "Locally grown organic walnuts from the Penjwen region, famous for thin easy-crack shells and rich buttery kernels.",
    image_url: "https://images.unsplash.com/photo-1563205764-79ea509b3e95?auto=format&fit=crop&w=800&q=80",
    is_promoted: false
  },
  {
    name_ku: "ڕووبەهەناری سروشتی هەڵەبجە بە ترش و شیرین (٧٥٠ مل)",
    name_ar: "دبس رمان حلبجة الطبيعي بدون سكر (750 مل)",
    name_en: "Pure Natural Pomegranate Molasses from Halabja (750ml)",
    category_slug: "local-food-honey",
    seller_slug: "chiya-natural-mountain-goods",
    price: 12000,
    original_price: 15000,
    currency: "IQD",
    brand: "Chiya Natural",
    capacity: "٧٥٠ میلیلیتر",
    power: null,
    warranty: "١٠٠٪ سروشتی بێ شەکری زیادکراو و بۆیە",
    delivery_info: "گەیاندنی ڕۆژانە لە سلێمانی بە ٣,٠٠٠ د.ع",
    return_policy: "مافی گەڕاندنەوە ئەگەر تامی دەستکرد بێت",
    description_ku: "ڕووبەهەناری ئەسڵی لە هەناری باخەکانی هەڵەبجە و سازان، بە شێوازی نەریتی لەسەر ئاگری دار کوڵێنراوە. تامی مەیخۆش (ترش و شیرین) و بێ هیچ ماددەیەکی پارێزەر.",
    description_ar: "دبس رمان أصلي مطبوخ على الحطب من رمان بساتين حلبجة الشهيرة، طعم طبيعي غني وخالٍ من المواد الحافظة.",
    description_en: "Traditional wood-fired pomegranate molasses made purely from renowned Halabja orchards without added sugar.",
    image_url: "https://images.unsplash.com/photo-1541344999736-83eca272f6fc?auto=format&fit=crop&w=800&q=80",
    is_promoted: false
  },
  {
    name_ku: "سماقی کوردی دەنکی بناری چیاکانی ئاکرێ (٥٠٠ گرام)",
    name_ar: "سماق عقرة الجبلي الطبيعي الممتاز (500 غرام)",
    name_en: "Wild Mountain Whole Grain Sumac from Akre (500g)",
    category_slug: "local-food-honey",
    seller_slug: "chiya-natural-mountain-goods",
    price: 9000,
    original_price: 12000,
    currency: "IQD",
    brand: "Chiya Natural",
    capacity: "٥٠٠ گرام پاککراوە",
    power: null,
    warranty: "پاک و بێ خەوش و گەرەنتی ترشی سروشتی",
    delivery_info: "گەیاندنی پۆستی خێرا",
    return_policy: "مافی تاقیکردنەوە لە شوێن",
    description_ku: "سماقی بناری چیای ئاکرێ بە ڕەنگی سووری ئاڵ و ترشی بەهێز و سروشتی. زۆر بەتامە بۆ کەباب، گۆشت و زەڵاتەی کوردی.",
    description_ar: "سماق جبلي أحمر داكن عالي الجودة من جبال قضاء عقرة، بطعم حامض طبيعي ورائحة زكية خالي من الأصباغ.",
    description_en: "Premium organic mountain sumac harvested from Akre hillsides, known for deep ruby color and tangy citrus flavor.",
    image_url: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80",
    is_promoted: false
  },
  {
    name_ku: "سابوونی سروشتی غار و ڕۆنی زەیتوون (پاکێجی ٤ دانەیی)",
    name_ar: "صابون الغار وزيت الزيتون الطبيعي التقليدي (بكج 4 قطع)",
    name_en: "Handmade Organic Laurel & Olive Oil Soap (Pack of 4)",
    category_slug: "beauty",
    seller_slug: "chiya-natural-mountain-goods",
    price: 10000,
    original_price: 14000,
    currency: "IQD",
    brand: "Chiya Natural",
    capacity: "٤ دانە / ٨٠٠ گرام",
    power: null,
    warranty: "١٠٠٪ ڕووەکی بە بێ کیمیایی",
    delivery_info: "گەیاندنی ئاسایی لە ماوەی ٢٤ کاتژمێر",
    return_policy: "مافی گۆڕین ئەگەر کارتۆنەکەی نەکرابێتەوە",
    description_ku: "سابوونی ڕەقی دەستکردی کۆن لە ڕۆنی غاری سروشتی و زەیتی زەیتوونی خۆماڵی. گونجاوە بۆ پێست و قژ، دژە کڕێش و نەرمکەرەوەی سروشتییە.",
    description_ar: "صابون غار وزيت زيتون بلدي طبيعي مصنوع يدوياً، مثالي لتنظيف البشرة والشعر ومقاومة القشرة دون مواد كيميائية.",
    description_en: "Traditional artisanal cold-processed soap made with pure laurel oil and virgin olive oil for sensitive skin and hair.",
    image_url: "https://images.unsplash.com/photo-1607006314592-a1f94d31481b?auto=format&fit=crop&w=800&q=80",
    is_promoted: false
  },
  {
    name_ku: "ئامێری تاشینی ڕیشی فیلیپس زنجیرەی ٥٠٠٠",
    name_ar: "ماكينة حلاقة وتشذيب اللحية فيليبس سيريس 5000",
    name_en: "Philips Series 5000 Beard Trimmer & Groomer",
    category_slug: "beauty",
    seller_slug: "sulaymaniyah-home-tech",
    price: 55000,
    original_price: 68000,
    currency: "IQD",
    brand: "Philips",
    capacity: "٦٠ خولەک کارکردنی پاتری",
    power: "Lithium-ion Fast Charge",
    warranty: "٢ ساڵ گەرەنتی نێودەوڵەتی فیلیپس",
    delivery_info: "گەیاندن لە هەموو کوردستان بە ٣,٠٠٠ بۆ ٤,٠٠٠ د.ع",
    return_policy: "٧ ڕۆژ مافی گۆڕین لە کاتی هەبوونی کێشە",
    description_ku: "ئامێری پێشکەوتووی تاشینی پیاوان بە تەکنەلۆجیای Lift & Trim کە مووەکان بەرز دەکاتەوە بۆ تاشینێکی یەکسان. خاوەنی ٢٠ قۆناغی دیاریکردنی درێژایی و تیغی پۆڵای دژە ژەنگە.",
    description_ar: "ماكينة تشذيب اللحية مع 20 إعداداً للطول وشفرات فولاذية تدوم طويلاً مع إمكانية الغسل بالماء بالكامل.",
    description_en: "Precision beard trimmer with 20 lock-in length settings, self-sharpening metal blades, and 60-min battery.",
    image_url: "https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=800&q=80",
    is_promoted: false
  },
  {
    name_ku: "ڕۆمانی دوواهەمین هەناری دونیا - بەختیار عەلی",
    name_ar: "رواية آخر رمانة في العالم - بختيار علي (بالكردية)",
    name_en: "The Last Pomegranate of the World by Bachtyar Ali (Kurdish Edition)",
    category_slug: "books",
    seller_slug: "hawraman-heritage-crafts",
    price: 12000,
    original_price: 15000,
    currency: "IQD",
    brand: "ناوەندی ڕەهەند",
    capacity: "چاپی ڕەق / ٤٢٠ لاپەڕە",
    power: null,
    warranty: "چاپی ئەسڵی بە ستانداردی کوالێتی بەرز",
    delivery_info: "گەیاندنی پەرتووک لە سلێمانی ٢,٥٠٠ د.ع / هەولێر ٣,٥٠٠ د.ع",
    return_policy: "گۆڕین لە ئەگەری ناتەواوی چاپ",
    description_ku: "شااکاری ئەدەبیاتی کوردی و یەکێک لە بەناوبانگترین ڕۆمانە وەرگێڕدراوەکانی نووسەری گەورە بەختیار عەلی لە سەرانسەری جیهاندا بە بەرگی قایم و چاپی نایاب.",
    description_ar: "التحفة الروائية الكردية العالمية الشهيرة للكاتب بختيار علي بطباعة أصلية فاخرة وغلاف مقوى.",
    description_en: "The iconic internationally acclaimed Kurdish masterpiece novel by Bachtyar Ali, hardbound collector's print.",
    image_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    is_promoted: true
  },
  {
    name_ku: "دیوانی نالی - چاپی مێژوویی بە لێکدانەوەی مامۆستا مەلا عەبدولکەریمی مودەریس",
    name_ar: "ديوان نالي - شرح العلامة عبد الكريم المدرس (بالكردية)",
    name_en: "Diwan of Nali - Classical Kurdish Poetry Annotated Edition",
    category_slug: "books",
    seller_slug: "hawraman-heritage-crafts",
    price: 18000,
    original_price: 22000,
    currency: "IQD",
    brand: "دەزگای ڕۆشنبیری",
    capacity: " بەرگی ڕەق / ٦٤٠ لاپەڕە",
    power: null,
    warranty: "چاپی تایبەت بە کاغەزی زەردی پارێزەری چاو",
    delivery_info: "گەیاندنی خێرا بۆ هەموو زانکۆ و کتێبخانەکان",
    return_policy: "مافی گۆڕین",
    description_ku: "کۆکراوەی سەرجەم شیعرەکانی شاعیری گەورەی کورد نالی، بە لێکدانەوە و ساغکردنەوەی ناودارترین زانای کورد مەلا عەبدولکەریمی مودەریس و محەمەدی مەلا کەریم.",
    description_ar: "المجموعة الشعرية الكاملة لشاعر الكلاسيكية الكردية نالي مع شروح العلامة عبد الكريم المدرس وطباعة مجلدة.",
    description_en: "The definitive annotated collection of classical Kurdish poetry by Nali, curated and explained by Mala Abdul Karim Mudarris.",
    image_url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
    is_promoted: false
  }
];

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .substring(0, 60);
}

export async function POST(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase admin not initialized' }, { status: 500 });
  }

  const db = supabaseAdmin as any;

  try {
    const body = await req.json().catch(() => null);
    const productsToSeed = Array.isArray(body) && body.length > 0 
      ? body 
      : Array.isArray(body?.products) && body.products.length > 0 
      ? body.products 
      : RAW_PRODUCTS;

    // 1. Fetch categories
    const { data: catData, error: catErr } = await db.from('categories').select('id, slug');
    if (catErr || !catData) {
      return NextResponse.json({ error: 'Failed to fetch categories', details: catErr }, { status: 500 });
    }
    const catMap = new Map<string, string>();
    for (const c of catData) {
      if (c.slug) catMap.set(c.slug.toLowerCase(), c.id);
    }

    // 2. Fetch sellers
    const { data: sellerData, error: sellerErr } = await db.from('sellers').select('id, slug');
    if (sellerErr || !sellerData) {
      return NextResponse.json({ error: 'Failed to fetch sellers', details: sellerErr }, { status: 500 });
    }
    const sellerMap = new Map<string, string>();
    for (const s of sellerData) {
      if (s.slug) sellerMap.set(s.slug.toLowerCase(), s.id);
    }

    const insertedProducts: any[] = [];
    const errors: any[] = [];

    const now = new Date();
    const promoEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    for (const item of productsToSeed) {
      try {
        const catId = catMap.get(item.category_slug.toLowerCase()) || catData[0]?.id;
        const sellerId = sellerMap.get(item.seller_slug.toLowerCase()) || sellerData[0]?.id;
        const slug = generateSlug(item.name_en || item.name_ku);

        // Check if product with slug already exists
        const { data: existingProd } = await db
          .from('products')
          .select('id')
          .eq('slug', slug)
          .maybeSingle();

        let prodId = existingProd?.id;
        const powerNum = item.power ? parseInt(item.power.replace(/[^0-9]/g, ''), 10) || null : null;

        if (!prodId) {
          const { data: newProd, error: insertErr } = await db
            .from('products')
            .insert({
              slug,
              category_id: catId,
              seller_id: sellerId,
              price: item.price,
              currency: item.currency || 'IQD',
              brand: item.brand,
              capacity: item.capacity,
              power_watts: powerNum,
              warranty_applicable: Boolean(item.warranty),
              warranty_details: item.warranty,
              delivery_available: Boolean(item.delivery_info),
              delivery_info: item.delivery_info,
              return_policy: item.return_policy,
              image_url: item.image_url,
              status: 'active',
              is_demo: false,
              view_count: Math.floor(Math.random() * 55) + 25,
              specs: {
                original_price: item.original_price || null,
                brand: item.brand,
                capacity: item.capacity,
                power: item.power,
                warranty: item.warranty,
                delivery_info: item.delivery_info,
                return_policy: item.return_policy,
                is_promoted: Boolean(item.is_promoted),
                promotion_expires_at: item.is_promoted ? promoEnd.toISOString() : null,
              },
            })
            .select('id')
            .single();

          if (insertErr || !newProd) {
            errors.push({ item: item.name_en, error: insertErr?.message || 'Insert failed' });
            continue;
          }

          prodId = newProd.id;
        } else {
          // Update existing row in Supabase
          await db
            .from('products')
            .update({
              category_id: catId,
              seller_id: sellerId,
              price: item.price,
              currency: item.currency || 'IQD',
              brand: item.brand,
              capacity: item.capacity,
              power_watts: powerNum,
              warranty_applicable: Boolean(item.warranty),
              warranty_details: item.warranty,
              delivery_available: Boolean(item.delivery_info),
              delivery_info: item.delivery_info,
              return_policy: item.return_policy,
              image_url: item.image_url,
              status: 'active',
              specs: {
                original_price: item.original_price || null,
                brand: item.brand,
                capacity: item.capacity,
                power: item.power,
                warranty: item.warranty,
                delivery_info: item.delivery_info,
                return_policy: item.return_policy,
                is_promoted: Boolean(item.is_promoted),
                promotion_expires_at: item.is_promoted ? promoEnd.toISOString() : null,
              },
            })
            .eq('id', prodId);
        }

        // Clean & Insert Translations
        try {
          await db.from('product_translations').delete().eq('product_id', prodId);
          await db.from('product_translations').insert([
            {
              product_id: prodId,
              lang: 'ku',
              name: item.name_ku,
              description: item.description_ku || '',
            },
            {
              product_id: prodId,
              lang: 'ar',
              name: item.name_ar,
              description: item.description_ar || '',
            },
            {
              product_id: prodId,
              lang: 'en',
              name: item.name_en,
              description: item.description_en || '',
            },
          ]);
        } catch (tErr: any) {
          console.warn('Translations insert error:', tErr);
        }

        // If promoted, also attempt to create promotion record & verified payment record
        if (item.is_promoted && sellerId) {
          try {
            const { data: promoData } = await db
              .from('product_promotions')
              .insert({
                product_id: prodId,
                seller_id: sellerId,
                promotion_type: 'sponsored_listing',
                price_iqd: 5000,
                duration_days: 7,
                starts_at: now.toISOString(),
                ends_at: promoEnd.toISOString(),
                status: 'active',
                badge_label_ku: 'بە سپۆنسەر',
                badge_label_en: 'Sponsored',
                badge_label_ar: 'برعاية',
                is_demo: true,
              })
              .select('id')
              .maybeSingle();

            if (promoData?.id) {
              await db.from('monetization_payments').insert({
                seller_id: sellerId,
                promotion_id: promoData.id,
                amount_iqd: 5000,
                currency: 'IQD',
                payment_method: 'fib',
                payment_status: 'demo_verified',
                notes: `7-Day Sponsored Promotion for ${item.name_en}`,
                verified_at: now.toISOString(),
              });
            }
          } catch (pErr) {
            // quiet fallback if tables not yet migrated
          }
        }

        insertedProducts.push({ id: prodId, slug, name_en: item.name_en, is_promoted: item.is_promoted });
      } catch (innerErr: any) {
        errors.push({ item: item.name_en, error: innerErr?.message || String(innerErr) });
      }
    }

    return NextResponse.json({
      success: true,
      insertedCount: insertedProducts.length,
      errorsCount: errors.length,
      insertedProducts,
      errors,
    });
  } catch (err: any) {
    console.error('Seed products API error:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
