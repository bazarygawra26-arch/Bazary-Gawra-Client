import 'server-only';
import { supabaseAdmin } from '../supabaseAdmin';
import { SellerPlan, SellerSubscription, ProductPromotion, MonetizationPayment, Product } from '../../../types';
import { findProducts } from './products';

const db = supabaseAdmin as any;

export const DEFAULT_PLANS: Record<string, {
  id: string;
  slug: string;
  name_en: string;
  name_ku: string;
  name_ar: string;
  price_iqd: number;
  billing_period: string;
  max_products: number;
  can_promote_products: boolean;
  analytics_tier: 'basic' | 'advanced';
  features_en: string[];
  features_ku: string[];
  features_ar: string[];
}> = {
  free: {
    id: 'plan_free',
    slug: 'free',
    name_en: 'Free Starter',
    name_ku: 'پلانی بێبەرامبەر (دەستپێک)',
    name_ar: 'الخطة المجانية',
    price_iqd: 0,
    billing_period: 'monthly',
    max_products: 5,
    can_promote_products: false,
    analytics_tier: 'basic',
    features_en: [
      'List up to 5 active products',
      'Basic product listing management',
      'Standard marketplace visibility',
      'Basic product view statistics',
    ],
    features_ku: [
      'دانانی تا ٥ کاڵای چالاک لە بازاڕدا',
      'بەڕێوەبردنی سەرەتایی کەتەلۆگ و وێنەکان',
      'دەرکەوتنی ئاسایی لە کاتی گەڕانی کڕیاران',
      'ئاماری سەرەتایی ژمارەی بینینەکان',
    ],
    features_ar: [
      'إدراج حتى 5 منتجات نشطة في السوق',
      'إدارة أساسية لقوائم المنتجات والصور',
      'ظهور قياسي ومناسب في نتائج البحث',
      'إحصائيات أساسية لمشاهدات المنتجات',
    ],
  },
  pro: {
    id: 'plan_pro',
    slug: 'pro',
    name_en: 'Pro Merchant',
    name_ku: 'فرۆشیاری پێشکەوتوو (Pro)',
    name_ar: 'التاجر المحترف (Pro)',
    price_iqd: 25000,
    billing_period: 'monthly',
    max_products: 50,
    can_promote_products: true,
    analytics_tier: 'advanced',
    features_en: [
      'List up to 50 active products',
      'Enhanced seller dashboard & customer analytics',
      'Eligibility to sponsor and promote products (5,000 IQD / 7 days)',
      'Advanced listing-management & AI draft assistants',
      'Clear plan status, badge & priority support',
    ],
    features_ku: [
      'دانانی تا ٥٠ کاڵای چالاک لە کەتەلۆکدا',
      'داشبۆردی پێشکەوتوو و شیکاری تەواوی بینەران',
      'مافی سپۆنسەرکردنی کاڵاکان بۆ دەرکەوتن لە سەرووی بازاڕ',
      'ئامرازە پێشکەوتووەکانی نووسینی بەرهەم بە ژیری دەستکرد',
      'نیشانەی تایبەتی فرۆشیار و نوێکردنەوەی ئاسان',
    ],
    features_ar: [
      'إدراج حتى 50 منتجاً نشطاً في الكتالوج',
      'لوحة تحكم متقدمة وتحليلات تفصيلية للزبائن',
      'أهلية ترويج ورعاية المنتجات المميزة في الواجهة',
      'أدوات الذكاء الاصطناعي المتقدمة لتحرير المنتجات',
      'شارة متجر معتمد وتجديد شهري مرن',
    ],
  },
};

export async function findSellerPlans(lang: 'en' | 'ku' | 'ar' = 'ku'): Promise<SellerPlan[]> {
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('seller_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_iqd', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((row: any) => {
          const name = lang === 'ku' ? row.name_ku : lang === 'ar' ? row.name_ar : row.name_en;
          const features =
            lang === 'ku'
              ? (row.features_ku || row.features_en || [])
              : lang === 'ar'
              ? (row.features_ar || row.features_en || [])
              : (row.features_en || []);

          return {
            id: row.id,
            slug: row.slug,
            name,
            name_en: row.name_en,
            name_ku: row.name_ku,
            name_ar: row.name_ar,
            price_iqd: Number(row.price_iqd) || 0,
            billing_period: row.billing_period || 'monthly',
            max_products: Number(row.max_products) || 5,
            can_promote_products: !!row.can_promote_products,
            analytics_tier: row.analytics_tier || 'basic',
            features: Array.isArray(features) ? features : [],
            features_en: row.features_en,
            features_ku: row.features_ku,
            features_ar: row.features_ar,
            is_active: true,
          };
        });
      }
    } catch (e) {
      console.warn('[monetization] seller_plans DB lookup warning, using static definitions:', e);
    }
  }

  // Fallback to memory plans
  return Object.values(DEFAULT_PLANS).map((p) => ({
    id: p.id,
    slug: p.slug,
    name: lang === 'ku' ? p.name_ku : lang === 'ar' ? p.name_ar : p.name_en,
    name_en: p.name_en,
    name_ku: p.name_ku,
    name_ar: p.name_ar,
    price_iqd: p.price_iqd,
    billing_period: p.billing_period,
    max_products: p.max_products,
    can_promote_products: p.can_promote_products,
    analytics_tier: p.analytics_tier,
    features: lang === 'ku' ? p.features_ku : lang === 'ar' ? p.features_ar : p.features_en,
    features_en: p.features_en,
    features_ku: p.features_ku,
    features_ar: p.features_ar,
    is_active: true,
  }));
}

export async function getSellerSubscription(sellerId: string, lang: 'en' | 'ku' | 'ar' = 'ku'): Promise<{
  subscription: SellerSubscription;
  activeProductsCount: number;
  productLimit: number;
  canPromote: boolean;
}> {
  const plans = await findSellerPlans(lang);
  let activeProductsCount = 0;

  // Count active products for this seller
  if (supabaseAdmin) {
    try {
      const { count } = await supabaseAdmin
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', sellerId)
        .eq('status', 'active');
      activeProductsCount = count || 0;
    } catch (_) {}
  }

  // Check subscription in DB
  if (db) {
    try {
      const { data, error } = await db
        .from('seller_subscriptions')
        .select('*')
        .eq('seller_id', sellerId)
        .maybeSingle();

      if (!error && data) {
        const matchedPlan = plans.find((p) => p.id === data.plan_id || p.slug === data.plan_id) || plans[0];
        return {
          subscription: {
            id: data.id,
            seller_id: data.seller_id,
            plan_id: matchedPlan.id,
            plan: matchedPlan,
            status: data.status,
            current_period_start: data.current_period_start,
            current_period_end: data.current_period_end,
            renewal_date: data.renewal_date,
            is_demo: data.is_demo ?? true,
          },
          activeProductsCount,
          productLimit: matchedPlan.max_products,
          canPromote: matchedPlan.can_promote_products,
        };
      }
    } catch (e) {
      console.warn('[monetization] seller_subscriptions lookup error:', e);
    }
  }

  // Default Free Plan fallback
  const freePlan = plans.find((p) => p.slug === 'free') || plans[0];
  const now = new Date();
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  return {
    subscription: {
      id: `sub_free_${sellerId}`,
      seller_id: sellerId,
      plan_id: freePlan.id,
      plan: freePlan,
      status: 'active',
      current_period_start: now.toISOString(),
      current_period_end: nextMonth.toISOString(),
      renewal_date: nextMonth.toISOString(),
      is_demo: true,
    },
    activeProductsCount,
    productLimit: freePlan.max_products,
    canPromote: freePlan.can_promote_products,
  };
}

export async function updateSellerSubscription(
  sellerId: string,
  targetPlanSlug: 'free' | 'pro',
  paymentMethod: string = 'demo_checkout'
): Promise<{ success: boolean; subscription: SellerSubscription; error?: string }> {
  const plans = await findSellerPlans('ku');
  const targetPlan = plans.find((p) => p.slug === targetPlanSlug) || plans[0];

  const now = new Date();
  const renewalDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  if (db) {
    try {
      const { data: subData, error: subErr } = await db
        .from('seller_subscriptions')
        .upsert(
          {
            seller_id: sellerId,
            plan_id: targetPlan.id,
            status: 'active',
            current_period_start: now.toISOString(),
            current_period_end: renewalDate.toISOString(),
            renewal_date: renewalDate.toISOString(),
            is_demo: true,
            updated_at: now.toISOString(),
          },
          { onConflict: 'seller_id' }
        )
        .select()
        .single();

      if (!subErr && subData) {
        // Record payment record if paid plan
        if (targetPlan.price_iqd > 0) {
          await db.from('monetization_payments').insert({
            seller_id: sellerId,
            subscription_id: subData.id,
            amount_iqd: targetPlan.price_iqd,
            currency: 'IQD',
            payment_method: paymentMethod,
            payment_status: 'demo_verified',
            notes: `Demo subscription checkout for ${targetPlan.name_en}`,
            verified_at: now.toISOString(),
          });
        }

        return {
          success: true,
          subscription: {
            id: subData.id,
            seller_id: sellerId,
            plan_id: targetPlan.id,
            plan: targetPlan,
            status: 'active',
            current_period_start: subData.current_period_start,
            current_period_end: subData.current_period_end,
            renewal_date: subData.renewal_date,
            is_demo: true,
          },
        };
      }
    } catch (err: any) {
      console.warn('[monetization] DB update subscription error:', err);
    }
  }

  // In-memory fallback
  return {
    success: true,
    subscription: {
      id: `sub_${Date.now()}`,
      seller_id: sellerId,
      plan_id: targetPlan.id,
      plan: targetPlan,
      status: 'active',
      current_period_start: now.toISOString(),
      current_period_end: renewalDate.toISOString(),
      renewal_date: renewalDate.toISOString(),
      is_demo: true,
    },
  };
}

export async function getSellerPromotions(sellerId: string): Promise<ProductPromotion[]> {
  if (db) {
    try {
      const { data, error } = await db
        .from('product_promotions')
        .select(`
          id,
          product_id,
          seller_id,
          promotion_type,
          price_iqd,
          duration_days,
          starts_at,
          ends_at,
          status,
          badge_label_ku,
          badge_label_en,
          badge_label_ar,
          is_demo,
          created_at,
          products (
            id,
            slug,
            price,
            image_url,
            product_translations (
              name,
              lang
            )
          )
        `)
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        const now = new Date();
        return data.map((row: any) => {
          const isExpired = new Date(row.ends_at) <= now;
          const currentStatus = isExpired && row.status === 'active' ? 'expired' : row.status;

          const prod = row.products;
          const trans = Array.isArray(prod?.product_translations) ? prod.product_translations : [];
          const nameKu = trans.find((t: any) => t.lang === 'ku')?.name || prod?.slug || 'Product';

          return {
            id: row.id,
            product_id: row.product_id,
            product_name: nameKu,
            product_image: prod?.image_url,
            seller_id: row.seller_id,
            promotion_type: row.promotion_type,
            price_iqd: Number(row.price_iqd) || 5000,
            duration_days: row.duration_days || 7,
            starts_at: row.starts_at,
            ends_at: row.ends_at,
            status: currentStatus,
            badge_label_ku: row.badge_label_ku || 'بە سپۆنسەر',
            badge_label_en: row.badge_label_en || 'Sponsored',
            badge_label_ar: row.badge_label_ar || 'برعاية',
            is_demo: row.is_demo ?? true,
            created_at: row.created_at,
          };
        });
      }
    } catch (e) {
      console.warn('[monetization] getSellerPromotions error:', e);
    }
  }

  return [];
}

export async function requestProductPromotion(params: {
  productId: string;
  sellerId: string;
  durationDays?: number;
  priceIqd?: number;
  paymentMethod?: string;
}): Promise<{ success: boolean; promotion?: ProductPromotion; error?: string }> {
  const durationDays = params.durationDays || 7;
  const priceIqd = params.priceIqd || 5000;
  const now = new Date();
  const endsAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

  // 1. Verify seller owns this product
  if (supabaseAdmin) {
    try {
      const { data: prodData } = await db
        .from('products')
        .select('id, seller_id, slug, image_url')
        .eq('id', params.productId)
        .single();

      if (!prodData || prodData.seller_id !== params.sellerId) {
        return { success: false, error: 'Product does not belong to this seller or was not found.' };
      }

      // 2. Check seller subscription allows promotion
      const subInfo = await getSellerSubscription(params.sellerId);
      if (!subInfo.canPromote) {
        return {
          success: false,
          error: 'Free plan does not permit paid promotions. Please upgrade to Pro Merchant first.',
        };
      }

      // 3. Create promotion record
      const { data: promoData, error: promoErr } = await db
        .from('product_promotions')
        .insert({
          product_id: params.productId,
          seller_id: params.sellerId,
          promotion_type: 'sponsored_listing',
          price_iqd: priceIqd,
          duration_days: durationDays,
          starts_at: now.toISOString(),
          ends_at: endsAt.toISOString(),
          status: 'active',
          badge_label_ku: 'بە سپۆنسەر',
          badge_label_en: 'Sponsored',
          badge_label_ar: 'برعاية',
          is_demo: true,
        })
        .select()
        .single();

      if (!promoErr && promoData) {
        // Update product table is_promoted and promotion_expires_at
        await db
          .from('products')
          .update({
            is_promoted: true,
            promotion_expires_at: endsAt.toISOString(),
          })
          .eq('id', params.productId);

        // Record demo payment
        await db.from('monetization_payments').insert({
          seller_id: params.sellerId,
          promotion_id: promoData.id,
          amount_iqd: priceIqd,
          currency: 'IQD',
          payment_method: params.paymentMethod || 'demo_checkout',
          payment_status: 'demo_verified',
          notes: `7-Day Sponsored Promotion for product ${params.productId}`,
          verified_at: now.toISOString(),
        });

        return {
          success: true,
          promotion: {
            id: promoData.id,
            product_id: params.productId,
            seller_id: params.sellerId,
            promotion_type: promoData.promotion_type,
            price_iqd: priceIqd,
            duration_days: durationDays,
            starts_at: promoData.starts_at,
            ends_at: promoData.ends_at,
            status: 'active',
            badge_label_ku: 'بە سپۆنسەر',
            badge_label_en: 'Sponsored',
            badge_label_ar: 'برعاية',
            is_demo: true,
            created_at: promoData.created_at,
          },
        };
      }
    } catch (err: any) {
      console.warn('[monetization] DB requestProductPromotion error:', err);
      return { success: false, error: err?.message || 'Database error processing promotion.' };
    }
  }

  // Fallback demo result
  return {
    success: true,
    promotion: {
      id: `promo_${Date.now()}`,
      product_id: params.productId,
      seller_id: params.sellerId,
      promotion_type: 'sponsored_listing',
      price_iqd: priceIqd,
      duration_days: durationDays,
      starts_at: now.toISOString(),
      ends_at: endsAt.toISOString(),
      status: 'active',
      badge_label_ku: 'بە سپۆنسەر',
      badge_label_en: 'Sponsored',
      badge_label_ar: 'برعاية',
      is_demo: true,
      created_at: now.toISOString(),
    },
  };
}

export async function getActivePromotedProducts(lang: 'en' | 'ku' | 'ar' = 'ku'): Promise<Product[]> {
  const allProducts = await findProducts({ lang });
  const now = new Date();

  if (db) {
    try {
      const { data } = await db
        .from('product_promotions')
        .select('product_id, ends_at, status')
        .eq('status', 'active')
        .gt('ends_at', now.toISOString());

      if (Array.isArray(data) && data.length > 0) {
        const activeIds = new Set(data.map((d: any) => d.product_id));
        return allProducts
          .filter((p) => activeIds.has(p.id) || p.is_promoted)
          .map((p) => ({ ...p, is_promoted: true }));
      }
    } catch (e) {
      console.warn('[monetization] getActivePromotedProducts error:', e);
    }
  }

  // If no active promotions in DB yet, return any with is_promoted flag, or pick the top quality item as demo sponsored
  const flagged = allProducts.filter((p) => p.is_promoted);
  if (flagged.length > 0) return flagged;

  // For Hackathon demo preview: feature the top 5 products with real seller IDs
  return allProducts.slice(0, 5).map((p) => ({ ...p, is_promoted: true }));
}

export async function getAdminMonetizationSummary(): Promise<{
  activeSubscriptionsCount: number;
  proSubscriptionsCount: number;
  freeSubscriptionsCount: number;
  activePromotionsCount: number;
  totalRevenueIqd: number;
  recentPayments: MonetizationPayment[];
}> {
  let activeSubscriptionsCount = 2;
  let proSubscriptionsCount = 1;
  let freeSubscriptionsCount = 1;
  let activePromotionsCount = 1;
  let totalRevenueIqd = 30000;
  let recentPayments: MonetizationPayment[] = [
    {
      id: 'pay_demo_1',
      seller_id: '1ef9d0e1-dc94-437e-a1a9-e478055d3f73',
      seller_name: 'Sulaymaniyah Home Tech (ماڵی تەکنەلۆجی سلێمانی)',
      amount_iqd: 25000,
      currency: 'IQD',
      payment_method: 'demo_checkout',
      payment_status: 'demo_verified',
      transaction_reference: 'DEMO-SUB-PRO-2026',
      notes: 'Pro Merchant monthly subscription (Demo mode)',
      verified_at: new Date().toISOString(),
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'pay_demo_2',
      seller_id: '1ef9d0e1-dc94-437e-a1a9-e478055d3f73',
      seller_name: 'Sulaymaniyah Home Tech (ماڵی تەکنەلۆجی سلێمانی)',
      amount_iqd: 5000,
      currency: 'IQD',
      payment_method: 'demo_checkout',
      payment_status: 'demo_verified',
      transaction_reference: 'DEMO-PROMO-7D-2026',
      notes: '7-Day Sponsored product promotion (Demo mode)',
      verified_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
  ];

  if (db) {
    try {
      const [subsRes, promoRes, payRes] = await Promise.all([
        db.from('seller_subscriptions').select('plan_id, status'),
        db.from('product_promotions').select('*').eq('status', 'active').gt('ends_at', new Date().toISOString()),
        db.from('monetization_payments').select('*, sellers(name_en, name_ku)').order('created_at', { ascending: false }).limit(10),
      ]);

      if (Array.isArray(subsRes.data) && subsRes.data.length > 0) {
        activeSubscriptionsCount = subsRes.data.length;
        proSubscriptionsCount = subsRes.data.filter((s: any) => s.plan_id.includes('pro')).length;
        freeSubscriptionsCount = subsRes.data.filter((s: any) => s.plan_id.includes('free')).length;
      }

      if (Array.isArray(promoRes.data)) {
        activePromotionsCount = promoRes.data.length;
      }

      if (Array.isArray(payRes.data) && payRes.data.length > 0) {
        recentPayments = payRes.data.map((p: any) => ({
          id: p.id,
          seller_id: p.seller_id,
          seller_name: p.sellers?.name_ku || p.sellers?.name_en || 'Merchant',
          subscription_id: p.subscription_id,
          promotion_id: p.promotion_id,
          amount_iqd: Number(p.amount_iqd) || 0,
          currency: p.currency || 'IQD',
          payment_method: p.payment_method,
          payment_status: p.payment_status,
          transaction_reference: p.transaction_reference,
          notes: p.notes,
          verified_at: p.verified_at,
          created_at: p.created_at,
        }));
        totalRevenueIqd = recentPayments.reduce((acc, curr) => acc + curr.amount_iqd, 0);
      }
    } catch (e) {
      console.warn('[monetization] getAdminMonetizationSummary error:', e);
    }
  }

  return {
    activeSubscriptionsCount,
    proSubscriptionsCount,
    freeSubscriptionsCount,
    activePromotionsCount,
    totalRevenueIqd,
    recentPayments,
  };
}
