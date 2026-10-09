import 'server-only';
import { supabaseAdmin } from '../supabaseAdmin';
import { Promotion } from '../../../types';

export const fallbackPromotions: Promotion[] = [
  {
    id: 'promo-1',
    slug: 'kurdish-literature-festival',
    title_en: 'Kurdish Book & Heritage Season',
    title_ku: 'وەرزی کتێب و شاکارە ئەدەبییەکان',
    title_ar: 'موسم الكتاب والتراث الكردي',
    subtitle_en: 'Discover classic works like Mem û Zîn and Diwani Nali delivered to your doorstep',
    subtitle_ku: 'شاکارە دەگمەنەکانی مەم و زین و دیوانی نالی بە گەیاندنی خێرا بۆ هەموو کوردستان',
    subtitle_ar: 'اكتشف روائع الأدب الكردي مثل مم وزين وديوان نالي مع توصيل سريع',
    badge_en: 'New Category',
    badge_ku: 'پۆلی نوێ: کتێب',
    badge_ar: 'قسم جديد: كتب',
    image_url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1600&q=85',
    link_url: '/ku?category=books',
    is_active: true,
    sort_order: 1,
  },
  {
    id: 'promo-2',
    slug: 'kitchen-appliances-super-deals',
    title_en: 'Autumn Kitchen & Coffee Deals',
    title_ku: 'داشکاندنی وەرزی بۆ ئامێرەکانی چێشتخانە و قاوە',
    title_ar: 'تخفيضات الخريف لأجهزة المطبخ والقهوة',
    subtitle_en: 'Save up to 25% on DeLonghi, Ninja & Philips smart kitchen devices with local warranty',
    subtitle_ku: 'تا ٢٥٪ داشکاندن لەسەر ئامێرە براندەکان بە گەرەنتی فەرمی بریکار',
    subtitle_ar: 'وفر حتى 25% على أجهزة المطبخ والقهوة مع ضمان رسمي معتمد',
    badge_en: 'Special Deals',
    badge_ku: 'داشکاندنی گەورە',
    badge_ar: 'عروض خاصة',
    image_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1600&q=85',
    link_url: '/ku?category=kitchen-home',
    is_active: true,
    sort_order: 2,
  },
  {
    id: 'promo-3',
    slug: 'pure-hawraman-honey-harvest',
    title_en: 'Pure Mountain Honey Fresh Harvest',
    title_ku: 'بەرهەمی تازەی هەنگوینی کێوی هەورامان و پێنجوێن',
    title_ar: 'عسل هورامان الجبلي الطبيعي - قطفة جديدة',
    subtitle_en: '100% Raw, Lab-tested mountain honey directly from local Kurdistan beekeepers',
    subtitle_ku: '١٠٠٪ سروشتی بە گەرەنتی پشکنینی تاقیگە و گەیاندنی بێبەرامبەر',
    subtitle_ar: 'عسل طبيعي 100% مفحوص مخبرياً من مناحل كوردستان مباشرة',
    badge_en: '100% Organic',
    badge_ku: 'خۆماڵی و پاک',
    badge_ar: 'طبيعي 100%',
    image_url: 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=1600&q=85',
    link_url: '/ku?category=local-food-honey',
    is_active: true,
    sort_order: 3,
  },
];

export async function findPromotions(): Promise<Promotion[]> {
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('promotions' as any)
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data as Promotion[];
      }
    } catch (err) {
      // Quiet fallback
    }
  }

  return fallbackPromotions;
}
