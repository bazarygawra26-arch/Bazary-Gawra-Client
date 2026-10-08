import 'server-only';
import { supabaseAdmin } from '../supabaseAdmin';
import { Seller, SellerProfile, Product } from '../../../types';
import { mockSellers, mockProducts } from '../../../data/mockData';

export async function findSellers(lang: 'en' | 'ku' | 'ar' = 'ku'): Promise<Seller[]> {
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('sellers')
        .select(`
          id,
          slug,
          name_en,
          name_ku,
          name_ar,
          description_en,
          description_ku,
          description_ar,
          address,
          phone,
          whatsapp,
          logo_url,
          verification_status,
          is_demo,
          is_active,
          locations (
            name_en,
            name_ku,
            name_ar
          )
        `)
        .eq('is_active', true);

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((s: any) => {
          const locObj = s.locations;
          const locName =
            lang === 'ku'
              ? (locObj?.name_ku || s.address || 'کوردستان')
              : lang === 'ar'
              ? (locObj?.name_ar || s.address || 'كوردستان')
              : (locObj?.name_en || s.address || 'Kurdistan');

          const name =
            lang === 'ku'
              ? (s.name_ku || s.name_en)
              : lang === 'ar'
              ? (s.name_ar || s.name_en)
              : s.name_en;

          return {
            id: s.id,
            slug: s.slug || s.id,
            name: name,
            location: locName,
            productCount: 4,
            delivery_info: 'Local fast delivery available',
            warranty_support: 'Official local warranty support',
            return_window: '3 to 7 days replacement window',
            phone_placeholder: s.phone || s.whatsapp || '+964 770 000 0000',
            phone: s.phone || null,
            whatsapp: s.whatsapp || null,
            logo_url: s.logo_url || null,
            verification_status: s.verification_status || 'unverified',
            is_demo: s.is_demo ?? false,
            avatar_bg: 'from-amber-500 to-amber-700',
            description: lang === 'ku' ? s.description_ku : lang === 'ar' ? s.description_ar : s.description_en,
          };
        });
      }
    } catch (err) {
      console.warn('Repository findSellers error, using fallback:', err);
    }
  }

  return mockSellers;
}

export async function findSellerBySlug(slug: string, lang: 'en' | 'ku' | 'ar' = 'ku'): Promise<Seller | null> {
  const all = await findSellers(lang);
  return (
    all.find(
      (s) =>
        s.slug === slug ||
        s.id === slug ||
        s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug.toLowerCase()
    ) || null
  );
}

/**
 * Fetch detailed seller profile with honest disclosures and category stats
 * Calls get_seller_profile RPC if available, or direct DB query fallback.
 */
export async function getSellerProfile(
  slug: string,
  lang: 'en' | 'ku' | 'ar' = 'ku'
): Promise<SellerProfile | null> {
  const pLang = lang === 'ku' ? 'ku' : lang === 'ar' ? 'ar' : 'en';

  if (supabaseAdmin) {
    // 1. Try get_seller_profile RPC
    try {
      const { data, error } = await (supabaseAdmin as any).rpc('get_seller_profile', {
        p_slug: slug,
        p_lang: pLang,
      });

      if (!error && data && data.id) {
        return data as SellerProfile;
      }
    } catch (rpcErr) {
      // RPC not yet applied, will fall back to direct DB queries below
    }

    // 2. Direct DB fallback matching the exact schema
    try {
      const { data: seller, error: sErr } = await supabaseAdmin
        .from('sellers')
        .select(`
          id,
          slug,
          name_en,
          name_ku,
          name_ar,
          description_en,
          description_ku,
          description_ar,
          address,
          phone,
          whatsapp,
          logo_url,
          verification_status,
          is_demo,
          is_active,
          locations (
            name_en,
            name_ku,
            name_ar
          )
        `)
        .or(`slug.eq.${slug},id.eq.${slug}`)
        .eq('is_active', true)
        .maybeSingle();

      if (!sErr && seller) {
        const s = seller as any;
        const locObj = s.locations;
        const locName =
          pLang === 'ku'
            ? (locObj?.name_ku || s.address || 'کوردستان')
            : pLang === 'ar'
            ? (locObj?.name_ar || s.address || 'كوردستان')
            : (locObj?.name_en || s.address || 'Kurdistan');

        const name =
          pLang === 'ku'
            ? (s.name_ku || s.name_en)
            : pLang === 'ar'
            ? (s.name_ar || s.name_en)
            : s.name_en;

        const description =
          pLang === 'ku'
            ? s.description_ku
            : pLang === 'ar'
            ? s.description_ar
            : s.description_en;

        // Query active products for this seller to calculate honest stats
        const { data: prods } = await supabaseAdmin
          .from('products')
          .select(`
            id,
            category_id,
            warranty_months,
            delivery_available,
            return_policy,
            return_days,
            categories (
              slug,
              name_en,
              name_ku,
              name_ar
            )
          `)
          .eq('seller_id', s.id)
          .eq('status', 'active');

        const activeProds = Array.isArray(prods) ? prods : [];
        const totalCount = activeProds.length;

        // Calculate honest statistics
        const withWarranty = activeProds.filter((p: any) => p.warranty_months !== null).length;
        const withDelivery = activeProds.filter((p: any) => p.delivery_available !== null && p.delivery_available !== false).length;
        const withReturn = activeProds.filter((p: any) => p.return_policy !== null || p.return_days !== null).length;

        // Group by category
        const catMap = new Map<string, { slug: string; name: string; count: number }>();
        for (const p of activeProds) {
          const c = (p as any).categories;
          if (c?.slug) {
            const catName =
              pLang === 'ku' ? (c.name_ku || c.name_en) : pLang === 'ar' ? (c.name_ar || c.name_en) : c.name_en;
            const existing = catMap.get(c.slug);
            if (existing) {
              existing.count += 1;
            } else {
              catMap.set(c.slug, { slug: c.slug, name: catName, count: 1 });
            }
          }
        }

        return {
          id: s.id,
          slug: s.slug || s.id,
          name: name || 'Local Seller',
          description: description || undefined,
          location: locName,
          phone: s.phone || undefined,
          whatsapp: s.whatsapp || undefined,
          logo_url: s.logo_url || undefined,
          verification_status: (s.verification_status as any) || 'unverified',
          is_demo: s.is_demo ?? false,
          product_count: totalCount,
          categories: Array.from(catMap.values()).sort((a, b) => b.count - a.count),
          info_summary: {
            with_warranty: withWarranty,
            with_delivery_info: withDelivery,
            with_return_policy: withReturn,
          },
        };
      }
    } catch (dbErr) {
      console.warn('Repository getSellerProfile db error:', dbErr);
    }
  }

  // Fallback for demo/offline
  const matched = mockSellers.find(
    (s) => s.id === slug || s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug.toLowerCase()
  ) || mockSellers[0];

  if (!matched) return null;

  return {
    id: matched.id,
    slug: matched.id,
    name: matched.name,
    description: 'Local Kurdish merchant offering transparent electronics and authentic home goods.',
    location: matched.location,
    phone: matched.phone_placeholder,
    whatsapp: '+9647700000000',
    verification_status: 'unverified',
    is_demo: true,
    product_count: matched.productCount || 4,
    categories: [
      { slug: 'coffee-machines', name: 'Coffee & Espresso', count: 2 },
      { slug: 'kitchen-appliances', name: 'Kitchen & Home', count: 2 },
    ],
    info_summary: {
      with_warranty: 3,
      with_delivery_info: 4,
      with_return_policy: 2,
    },
  };
}

/**
 * Fetch seller products excluding the current product id (for "More from this seller")
 * or for the full shop grid with category filtering.
 */
export async function getSellerProducts(params: {
  sellerSlug: string;
  lang?: 'en' | 'ku' | 'ar';
  excludeProductId?: string;
  categorySlug?: string;
  limit?: number;
  offset?: number;
}): Promise<Product[]> {
  const {
    sellerSlug,
    lang = 'ku',
    excludeProductId,
    categorySlug,
    limit = 12,
    offset = 0,
  } = params;

  if (supabaseAdmin) {
    // 1. Try get_seller_products RPC
    try {
      const { data, error } = await (supabaseAdmin as any).rpc('get_seller_products', {
        p_seller_slug: sellerSlug,
        p_lang: lang,
        p_exclude_product_id: excludeProductId || undefined,
        p_category_slug: categorySlug || undefined,
        p_limit: limit,
        p_offset: offset,
      });

      if (!error && Array.isArray(data) && data.length > 0) {
        return (data as any[]).map(mapCardToProduct);
      }
    } catch (rpcErr) {
      // RPC fallback below
    }

    // 2. Direct search_products fallback
    try {
      // First get seller_id
      const { data: sellerRow } = await supabaseAdmin
        .from('sellers')
        .select('id, slug, name_en, name_ku, name_ar, phone, whatsapp, verification_status')
        .or(`slug.eq.${sellerSlug},id.eq.${sellerSlug}`)
        .maybeSingle();

      if (sellerRow) {
        const sRow = sellerRow as any;
        const { data: allProds, error: pErr } = await (supabaseAdmin as any).rpc('search_products', {
          p_category_slug: categorySlug || undefined,
          p_lang: lang,
          p_limit: 50,
        });

        if (!pErr && Array.isArray(allProds)) {
          let filtered = (allProds as any[]).filter((p) => p.seller_id === sRow.id);
          if (excludeProductId) {
            filtered = filtered.filter((p) => p.product_id !== excludeProductId && p.id !== excludeProductId);
          }
          const sliced = filtered.slice(offset, offset + limit);
          return sliced.map((p) => {
            const prod = mapCardToProduct(p);
            prod.seller_slug = sRow.slug;
            prod.seller_phone = sRow.phone || undefined;
            prod.seller_whatsapp = sRow.whatsapp || undefined;
            prod.seller_verification = sRow.verification_status as any;
            return prod;
          });
        }
      }
    } catch (dbErr) {
      console.warn('Repository getSellerProducts fallback error:', dbErr);
    }
  }

  // Offline mock fallback
  let list = mockProducts.filter((p) => {
    return excludeProductId ? p.id !== excludeProductId : true;
  });
  if (categorySlug) {
    list = list.filter((p) => p.category.toLowerCase().includes(categorySlug.toLowerCase()));
  }
  return list.slice(offset, offset + limit);
}

function mapCardToProduct(row: any): Product {
  const hasWarranty = row.warranty_applicable || row.warranty_months != null;
  const hasDelivery = row.delivery_available === true;
  const missing: string[] = [];
  if (!hasWarranty) missing.push('No warranty provided');
  if (!hasDelivery) missing.push('No delivery details');

  return {
    id: row.product_id || row.id,
    slug: row.slug,
    name: row.name || row.slug,
    description: row.description || '',
    category: row.category_name || row.category_slug || 'General',
    price: Number(row.price || 0),
    currency: (row.currency === 'USD' ? 'USD' : 'IQD') as 'IQD' | 'USD',
    location: row.location_name || 'Kurdistan',
    seller_name: row.seller_name || 'Local Seller',
    seller_id: row.seller_id,
    seller_location: row.location_name || 'Kurdistan',
    capacity: row.capacity || undefined,
    power: row.power_watts ? `${row.power_watts}W` : undefined,
    warranty: row.warranty_months ? `${row.warranty_months} Months Warranty` : hasWarranty ? 'Warranty applicable' : undefined,
    delivery_info: row.delivery_available ? 'Delivery available' : 'Pickup in store',
    is_demo: row.is_demo ?? false,
    brand: row.brand || undefined,
    image_url: row.image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    information_signals: {
      has_location: true,
      has_warranty: hasWarranty,
      has_delivery: hasDelivery,
      has_return_policy: false,
      has_specifications: !!row.capacity || !!row.power_watts,
      missing_points: missing,
    },
    ai_match: {
      score: 85,
      match_reason: 'Authentic local product from verified inventory.',
      highlights: [row.location_name || 'Kurdistan', `${Number(row.price || 0).toLocaleString()} IQD`],
      cautions: missing,
    },
  };
}
