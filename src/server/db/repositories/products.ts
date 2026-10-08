import 'server-only';
import { supabaseAdmin } from '../supabaseAdmin';
import { Product } from '../../../types';
import { mockProducts } from '../../../data/mockData';

// Map a Supabase row (either from search_products RPC or get_product_context_by_slug) to domain Product
function mapDbProductToDomain(row: any, lang: 'en' | 'ku' | 'ar' = 'ku'): Product {
  const id = row.product_id || row.id;
  const slug = row.slug || id;
  const name = row.name || row.slug;
  const location = row.location_name || (typeof row.location === 'string' ? row.location : row.location?.name) || 'Kurdistan';
  const seller = row.seller_name || (typeof row.seller === 'string' ? row.seller : row.seller?.name) || 'Local Seller';
  const sellerLoc = (typeof row.seller === 'object' && row.seller?.location) || location;
  const sellerId = row.seller_id || (typeof row.seller === 'object' ? row.seller?.id : undefined);
  const sellerSlug = row.seller_slug || (typeof row.seller === 'object' ? row.seller?.slug : undefined);
  const sellerPhone = row.seller_phone || (typeof row.seller === 'object' ? row.seller?.phone : undefined);
  const sellerWhatsapp = row.seller_whatsapp || (typeof row.seller === 'object' ? row.seller?.whatsapp : undefined);
  const sellerVerification = row.seller_verification || (typeof row.seller === 'object' ? row.seller?.verification_status : undefined);

  const hasWarranty = row.warranty_applicable || (row.warranty?.applicable ?? false) || !!row.warranty;
  const hasDelivery = row.delivery_available || (row.delivery?.available ?? false) || !!row.delivery_info;
  const hasReturn = !!row.return_policy || !!row.return_days || (row.return_policy?.days ?? 0) > 0;
  const hasSpecs = !!row.capacity || !!row.power_watts || (row.specs && Object.keys(row.specs).length > 0);

  const missingList: string[] = [];
  if (!hasWarranty) missingList.push(lang === 'ku' ? 'گەرەنتی دیاری نەکراوە' : lang === 'ar' ? 'الضمان غير محدد' : 'No warranty provided');
  if (!hasDelivery) missingList.push(lang === 'ku' ? 'زانیاری گەیاندن دیاری نەکراوە' : lang === 'ar' ? 'تفاصيل التوصيل غير محددة' : 'No delivery details');
  if (!hasReturn) missingList.push(lang === 'ku' ? 'مەرجی گەڕاندنەوە دیاری نەکراوە' : lang === 'ar' ? 'سياسة الإرجاع غير محددة' : 'No return policy');
  if (!hasSpecs) missingList.push(lang === 'ku' ? 'تایبەتمەندی تەکنیکی ناتەواوە' : lang === 'ar' ? 'المواصفات الفنية ناقصة' : 'Missing specifications');

  let defaultWarranty = lang === 'ku' ? 'گەرەنتی ستانداردی ناوخۆیی' : lang === 'ar' ? 'ضمان قياسي محلي' : 'Standard Warranty';
  let warrantyText = typeof row.warranty === 'string' ? row.warranty : defaultWarranty;
  if (row.warranty_months) {
    if (lang === 'ku') warrantyText = `${row.warranty_months} مانگ گەرەنتی فەرمی ناوخۆیی`;
    else if (lang === 'ar') warrantyText = `${row.warranty_months} شهراً ضمان رسمي محلي`;
    else warrantyText = `${row.warranty_months} Months Official Warranty`;
  }

  let deliveryText = row.delivery_info || (row.delivery?.info ?? undefined);
  if (!deliveryText && (row.delivery_available || row.delivery?.available)) {
    if (lang === 'ku') deliveryText = 'گەیاندنی خێرا بەردەستە بۆ هەموو شارەکان';
    else if (lang === 'ar') deliveryText = 'توصيل سريع متوفر لكافة المدن';
    else deliveryText = 'Local delivery available';
  }

  let returnText = row.return_policy;
  if (!returnText && (row.return_days || row.return_policy?.days)) {
    const days = row.return_days || row.return_policy?.days;
    if (lang === 'ku') returnText = `ماوەی ${days} ڕۆژ بۆ گەڕاندنەوە یان گۆڕین`;
    else if (lang === 'ar') returnText = `فترة استرجاع أو استبدال ${days} أيام`;
    else returnText = `${days} days return / exchange policy`;
  }

  return {
    id: id,
    slug: slug,
    name: name,
    name_ckb: row.name_ckb || (row.name_ku ?? name),
    name_ar: row.name_ar || name,
    category: row.category_name || (row.category?.name ?? (row.category_slug || 'General')),
    price: Number(row.price || 0),
    currency: (row.currency === 'USD' ? 'USD' : 'IQD') as 'IQD' | 'USD',
    location: location,
    seller_name: seller,
    seller_location: sellerLoc,
    seller_id: sellerId,
    seller_slug: sellerSlug,
    seller_phone: sellerPhone,
    seller_whatsapp: sellerWhatsapp,
    seller_verification: sellerVerification,
    is_demo: row.is_demo ?? false,
    brand: row.brand || undefined,
    capacity: row.capacity || undefined,
    power: row.power_watts ? `${row.power_watts}W` : (row.power || undefined),
    warranty: warrantyText,
    delivery_info: deliveryText,
    return_policy: returnText,
    origin: row.origin || undefined,
    description: row.description || '',
    image_url: row.image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    information_signals: {
      has_location: !!location,
      has_warranty: hasWarranty,
      has_delivery: hasDelivery,
      has_return_policy: hasReturn,
      has_specifications: hasSpecs,
      missing_points: missingList,
    },
    ai_match: {
      score: row.information_check?.score || 88,
      match_reason: lang === 'ku' ? 'لیستی پشتڕاستکراوی بەرهەم بە زانیاری و بەڵێنی ڕوون.' : lang === 'ar' ? 'منتج معتمد مع إشارات شفافية واضحة.' : 'Verified product listing with clear transparent signals.',
      highlights: [`${location}`, `${Number(row.price || 0).toLocaleString('en-US')} IQD`],
      cautions: missingList.length > 0 ? [`${missingList[0]}`] : [],
    },
  };
}

export async function findProducts(filters?: {
  category?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  lang?: 'en' | 'ku' | 'ar';
}): Promise<Product[]> {
  const activeLang = filters?.lang || 'ku';

  if (supabaseAdmin) {
    try {
      const { data, error } = await (supabaseAdmin as any).rpc('search_products', {
        p_query: filters?.search || undefined,
        p_category_slug: filters?.category || undefined,
        p_location_slug: filters?.city || undefined,
        p_min_price: filters?.minPrice || undefined,
        p_max_price: filters?.maxPrice || undefined,
        p_lang: activeLang,
        p_limit: 50,
      });

      if (!error && Array.isArray(data)) {
        return (data as any[]).map((row) => mapDbProductToDomain(row, activeLang));
      }
    } catch (err) {
      console.warn('Repository findProducts rpc error, trying fallback:', err);
    }
  }

  // Local verified fallback dataset
  let result = [...mockProducts];
  if (filters?.category) {
    result = result.filter((p) => p.category.toLowerCase().includes(filters.category!.toLowerCase()));
  }
  if (filters?.city) {
    result = result.filter(
      (p) =>
        p.location.toLowerCase().includes(filters.city!.toLowerCase()) ||
        p.seller_location.toLowerCase().includes(filters.city!.toLowerCase())
    );
  }
  if (filters?.maxPrice) {
    result = result.filter((p) => p.price <= filters.maxPrice!);
  }
  if (filters?.minPrice) {
    result = result.filter((p) => p.price >= filters.minPrice!);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.name_ckb && p.name_ckb.includes(q)) ||
        (p.name_ar && p.name_ar.includes(q))
    );
  }

  return result;
}

export async function findProductById(id: string, lang: 'en' | 'ku' | 'ar' = 'ku'): Promise<Product | null> {
  if (supabaseAdmin) {
    try {
      const { data, error } = await (supabaseAdmin as any).rpc('get_product_context', {
        p_product_id: id,
        p_lang: lang,
      });
      if (!error && data) {
        const prod = mapDbProductToDomain(data, lang);
        await enrichProductWithSellerSlug(prod);
        return prod;
      }
    } catch (err) {
      console.warn('Repository findProductById error:', err);
    }
  }

  return mockProducts.find((p) => p.id === id) || null;
}

export async function findProductBySlug(slug: string, lang: 'en' | 'ku' | 'ar' = 'ku'): Promise<Product | null> {
  if (supabaseAdmin) {
    try {
      const { data, error } = await (supabaseAdmin as any).rpc('get_product_context_by_slug', {
        p_slug: slug,
        p_lang: lang,
      });
      if (!error && data) {
        const prod = mapDbProductToDomain(data, lang);
        await enrichProductWithSellerSlug(prod);
        return prod;
      }
    } catch (err) {
      console.warn('Repository findProductBySlug error:', err);
    }
  }

  const all = await findProducts({ lang });
  const matched = (
    all.find(
      (p) =>
        p.id === slug ||
        p.slug === slug ||
        p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug.toLowerCase()
    ) || null
  );
  if (matched) {
    await enrichProductWithSellerSlug(matched);
  }
  return matched;
}

async function enrichProductWithSellerSlug(prod: Product) {
  if (!prod.seller_slug && prod.seller_id && supabaseAdmin) {
    try {
      const { data } = await supabaseAdmin
        .from('sellers')
        .select('slug, phone, whatsapp, verification_status')
        .eq('id', prod.seller_id)
        .maybeSingle();
      if (data) {
        const d = data as any;
        prod.seller_slug = d.slug;
        prod.seller_phone = d.phone || prod.seller_phone;
        prod.seller_whatsapp = d.whatsapp || prod.seller_whatsapp;
        prod.seller_verification = d.verification_status as any;
      }
    } catch (err) {
      // quiet fallback
    }
  }
}

export async function getProductsForComparison(productIds: string[], lang: 'en' | 'ku' | 'ar' = 'ku'): Promise<Product[]> {
  if (supabaseAdmin && productIds.length > 0) {
    try {
      const { data, error } = await (supabaseAdmin as any).rpc('get_products_for_comparison', {
        p_product_ids: productIds,
        p_lang: lang,
      });
      if (!error && Array.isArray(data) && data.length > 0) {
        return (data as any[]).map((row) => mapDbProductToDomain(row, lang));
      }
    } catch (err) {
      console.warn('Repository getProductsForComparison error:', err);
    }
  }

  const all = await findProducts({ lang });
  return all.filter((p) => productIds.includes(p.id));
}
