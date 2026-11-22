import 'server-only';
import { supabaseAdmin } from '../supabaseAdmin';
import { Product, PaginatedProductsResult } from '../../../types';
import { localizeProduct } from '../../../lib/i18nData';

function finiteNumberOrUndefined(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

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

  let warrantyText = typeof row.warranty === 'string' ? row.warranty : (row.warranty?.details || undefined);
  const months = row.warranty_months || (typeof row.warranty === 'object' ? row.warranty?.months : undefined);
  if (months) {
    if (lang === 'ku') warrantyText = `${months} مانگ گەرەنتی فەرمی ناوخۆیی`;
    else if (lang === 'ar') warrantyText = `${months} شهراً ضمان رسمي محلي`;
    else warrantyText = `${months} Months Official Warranty`;
  }

  let deliveryText = typeof row.delivery_info === 'string' ? row.delivery_info : (row.delivery?.info ?? undefined);
  if (!deliveryText && (row.delivery_available || row.delivery?.available)) {
    if (lang === 'ku') deliveryText = 'گەیاندنی خێرا بەردەستە بۆ هەموو شارەکان';
    else if (lang === 'ar') deliveryText = 'توصيل سريع متوفر لكافة المدن';
    else deliveryText = 'Local delivery available';
  }

  let returnText = typeof row.return_policy === 'string' ? row.return_policy : (row.return_policy?.details ?? undefined);
  const days = row.return_days || (typeof row.return_policy === 'object' ? row.return_policy?.days : undefined);
  if (!returnText && days) {
    if (lang === 'ku') returnText = `ماوەی ${days} ڕۆژ بۆ گەڕاندنەوە یان گۆڕین`;
    else if (lang === 'ar') returnText = `فترة استرجاع أو استبدال ${days} أيام`;
    else returnText = `${days} days return / exchange policy`;
  }

  const price = Number(row.price || 0);
  const origPrice = row.original_price ? Number(row.original_price) : (row.specs?.original_price ? Number(row.specs.original_price) : undefined);
  const discountPercent = origPrice && origPrice > price ? Math.round(((origPrice - price) / origPrice) * 100) : undefined;

  const rawImageList: string[] = [];
  if (row.image_url) rawImageList.push(row.image_url);
  if (row.primary_image) rawImageList.push(row.primary_image);
  if (Array.isArray(row.images)) rawImageList.push(...row.images);
  if (Array.isArray(row.specs?.images)) rawImageList.push(...row.specs.images);
  if (row.specs?.image_url) rawImageList.push(row.specs.image_url);

  const seenImgs = new Set<string>();
  const uniqueImages: string[] = [];
  for (const img of rawImageList) {
    if (typeof img === 'string' && img.trim()) {
      const trimmed = img.trim();
      if (!seenImgs.has(trimmed)) {
        seenImgs.add(trimmed);
        uniqueImages.push(trimmed);
      }
    }
  }

  const finalImages = uniqueImages.length > 0
    ? uniqueImages
    : ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'];

  return {
    id: id,
    slug: slug,
    name: name,
    name_ckb: row.name_ckb || (row.name_ku ?? name),
    name_ar: row.name_ar || name,
    category: row.category_name || (row.category?.name ?? (row.category_slug || 'General')),
    price: price,
    original_price: origPrice,
    discount_percent: discountPercent,
    rating: finiteNumberOrUndefined(row.rating),
    review_count: finiteNumberOrUndefined(row.review_count),
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
    image_url: finalImages[0],
    images: finalImages,
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
    is_promoted: Boolean(row.is_promoted || row.specs?.is_promoted || row.is_sponsored || row.specs?.is_sponsored),
    is_sponsored: Boolean(row.is_sponsored || row.specs?.is_sponsored || row.is_promoted || row.specs?.is_promoted),
    promotion_expires_at: row.promotion_expires_at || row.specs?.promotion_expires_at,
    view_count: finiteNumberOrUndefined(row.view_count ?? row.specs?.view_count),
  };
}

export async function findProductsPaginated(filters?: {
  category?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  hasWarranty?: boolean;
  hasDelivery?: boolean;
  search?: string;
  sort?: string;
  lang?: 'en' | 'ku' | 'ar' | 'ckb';
  page?: number;
  limit?: number;
  offset?: number;
}): Promise<PaginatedProductsResult> {
  const activeLang: 'en' | 'ku' | 'ar' = (filters?.lang === 'ckb' ? 'ku' : filters?.lang) || 'ku';
  const page = Math.max(1, Number(filters?.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(filters?.limit) || 12));
  const offset = filters?.offset !== undefined ? Number(filters.offset) : (page - 1) * limit;

  if (supabaseAdmin) {
    try {
      const { data, error } = await (supabaseAdmin as any).rpc('search_products', {
        p_query: filters?.search || undefined,
        p_category_slug: filters?.category || undefined,
        p_location_slug: filters?.city || undefined,
        p_min_price: filters?.minPrice || undefined,
        p_max_price: filters?.maxPrice || undefined,
        p_delivery_only: filters?.hasDelivery ? true : undefined,
        p_min_warranty_months: filters?.hasWarranty ? 1 : undefined,
        p_sort: filters?.sort || undefined,
        p_lang: activeLang,
        p_limit: limit,
        p_offset: offset,
      });

      if (!error && Array.isArray(data)) {
        const total = (data[0] && Number(data[0].total_count)) || data.length || 0;
        const productIds = data.map((r: any) => r.product_id || r.id).filter(Boolean);
        let productsExtraMap: Record<string, { specs?: any; image_url?: string; images?: string[] }> = {};

        if (productIds.length > 0) {
          try {
            const [productsRes, imagesRes] = await Promise.all([
              supabaseAdmin.from('products').select('id, specs, image_url').in('id', productIds),
              supabaseAdmin
                .from('product_images')
                .select('product_id, url, sort_order, is_primary')
                .in('product_id', productIds)
                .order('sort_order', { ascending: true })
            ]);

            if (productsRes.data) {
              productsRes.data.forEach((p: any) => {
                productsExtraMap[p.id] = { specs: p.specs, image_url: p.image_url };
              });
            }

            if (imagesRes.data && imagesRes.data.length > 0) {
              imagesRes.data.forEach((img: any) => {
                if (!productsExtraMap[img.product_id]) {
                  productsExtraMap[img.product_id] = {};
                }
                if (!productsExtraMap[img.product_id].images) {
                  productsExtraMap[img.product_id].images = [];
                }
                productsExtraMap[img.product_id].images!.push(img.url);
              });
            }
          } catch (enrichErr) {
            console.warn('[findProductsPaginated] image enrichment warning:', enrichErr);
          }
        }

        const domainProducts = (data as any[]).map((row) => {
          const extra = productsExtraMap[row.product_id || row.id];
          const mergedRow = {
            ...row,
            specs: extra?.specs || row.specs,
            image_url: extra?.image_url || row.image_url,
            images: extra?.images || (Array.isArray(extra?.specs?.images) ? extra.specs.images : row.images)
          };
          return mapDbProductToDomain(mergedRow, activeLang);
        });

        const totalPages = Math.max(1, Math.ceil(total / limit));
        return {
          products: domainProducts,
          total,
          page,
          limit,
          totalPages,
          hasMore: page < totalPages,
        };
      }

      // If RPC is unavailable, perform direct table query from Supabase
      let query = supabaseAdmin.from('products').select('*', { count: 'exact' }).eq('status', 'active');
      if (filters?.category) {
        query = query.ilike('category_slug', `%${filters.category}%`);
      }
      if (filters?.minPrice) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters?.maxPrice) {
        query = query.lte('price', filters.maxPrice);
      }
      if (filters?.search) {
        query = query.ilike('search_text', `%${filters.search}%`);
      }

      const { data: tableData, error: tableErr, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (!tableErr && Array.isArray(tableData)) {
        const total = count || tableData.length || 0;
        const totalPages = Math.max(1, Math.ceil(total / limit));
        return {
          products: tableData.map((row) => mapDbProductToDomain(row, activeLang)),
          total,
          page,
          limit,
          totalPages,
          hasMore: page < totalPages,
        };
      }
    } catch (err) {
      console.warn('Repository findProductsPaginated error:', err);
    }
  }

  return {
    products: [],
    total: 0,
    page,
    limit,
    totalPages: 1,
    hasMore: false,
  };
}

export async function findProducts(filters?: {
  category?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  lang?: 'en' | 'ku' | 'ar' | 'ckb';
  page?: number;
  limit?: number;
}): Promise<Product[]> {
  const result = await findProductsPaginated({
    ...filters,
    limit: filters?.limit || 50,
  });
  return result.products;
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
        // Ensure image_url is populated dynamically from products table if RPC did not return it
        if (!data.image_url || !data.images?.length) {
          const { data: pRow } = await (supabaseAdmin as any)
            .from('products')
            .select('image_url, specs')
            .eq('id', id)
            .maybeSingle();
          const rowData = pRow as any;
          if (rowData) {
            const dynamicImg = rowData.image_url || (Array.isArray(rowData.specs?.images) && rowData.specs.images[0]);
            if (dynamicImg) {
              prod.image_url = dynamicImg;
              prod.images = Array.isArray(rowData.specs?.images) && rowData.specs.images.length > 0
                ? rowData.specs.images
                : [dynamicImg];
            }
          }
        }
        try {
          const { data: pImages } = await (supabaseAdmin as any)
            .from('product_images')
            .select('url')
            .eq('product_id', id)
            .order('sort_order', { ascending: true });
          if (pImages && pImages.length > 0) {
            const galleryUrls = pImages.map((pi: any) => pi.url);
            prod.images = Array.from(new Set([...galleryUrls, ...(prod.images || [])]));
            if (prod.images.length > 0) prod.image_url = prod.images[0];
          }
        } catch {}
        await enrichProductWithSellerSlug(prod);
        return localizeProduct(prod, lang);
      }

      // Direct table lookup fallback
      const { data: directData } = await supabaseAdmin
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('status', 'active')
        .maybeSingle();

      if (directData) {
        const prod = mapDbProductToDomain(directData, lang);
        try {
          const { data: pImages } = await (supabaseAdmin as any)
            .from('product_images')
            .select('url')
            .eq('product_id', id)
            .order('sort_order', { ascending: true });
          if (pImages && pImages.length > 0) {
            const galleryUrls = pImages.map((pi: any) => pi.url);
            prod.images = Array.from(new Set([...galleryUrls, ...(prod.images || [])]));
            if (prod.images.length > 0) prod.image_url = prod.images[0];
          }
        } catch {}
        await enrichProductWithSellerSlug(prod);
        return localizeProduct(prod, lang);
      }
    } catch (err) {
      console.warn('Repository findProductById error:', err);
    }
  }

  return null;
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
        // Ensure image_url is populated dynamically from products table if RPC did not return it
        if (!data.image_url || !data.images?.length) {
          const { data: pRow } = await (supabaseAdmin as any)
            .from('products')
            .select('image_url, specs')
            .eq('id', prod.id)
            .maybeSingle();
          const rowData = pRow as any;
          if (rowData) {
            const dynamicImg = rowData.image_url || (Array.isArray(rowData.specs?.images) && rowData.specs.images[0]);
            if (dynamicImg) {
              prod.image_url = dynamicImg;
              prod.images = Array.isArray(rowData.specs?.images) && rowData.specs.images.length > 0
                ? rowData.specs.images
                : [dynamicImg];
            }
          }
        }
        try {
          const { data: pImages } = await (supabaseAdmin as any)
            .from('product_images')
            .select('url')
            .eq('product_id', prod.id)
            .order('sort_order', { ascending: true });
          if (pImages && pImages.length > 0) {
            const galleryUrls = pImages.map((pi: any) => pi.url);
            prod.images = Array.from(new Set([...galleryUrls, ...(prod.images || [])]));
            if (prod.images.length > 0) prod.image_url = prod.images[0];
          }
        } catch {}
        await enrichProductWithSellerSlug(prod);
        return localizeProduct(prod, lang);
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
    return localizeProduct(matched, lang);
  }
  return null;
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

export interface CreateProductInput {
  name: string;
  name_ckb?: string;
  name_ar?: string;
  category: string;
  price: number;
  original_price?: number;
  image_url: string;
  images: string[];
  seller_id: string;
  warranty?: string;
  delivery_info?: string;
  return_policy?: string;
  capacity?: string;
  power?: string;
  brand?: string;
  description?: string;
}

export async function createProduct(
  input: CreateProductInput,
  options: { publish: boolean }
): Promise<Product> {
  if (!supabaseAdmin) {
    throw new Error('Product storage is not configured.');
  }

  const [{ data: seller, error: sellerError }, { data: category, error: categoryError }] =
    await Promise.all([
      supabaseAdmin
        .from('sellers')
        .select('id, slug, name_en, name_ku, name_ar, address, phone, whatsapp')
        .eq('id', input.seller_id)
        .maybeSingle(),
      supabaseAdmin
        .from('categories')
        .select('id, slug')
        .eq('slug', input.category)
        .maybeSingle(),
    ]);

  if (sellerError) throw new Error(`Could not load the seller: ${sellerError.message}`);
  if (!seller) throw new Error('Seller profile was not found.');
  if (categoryError) throw new Error(`Could not load the category: ${categoryError.message}`);
  if (!category) throw new Error('Selected category was not found.');

  const name = input.name.trim();
  const price = input.price;
  const originalPrice = input.original_price;
  const slugBase = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'product';
  const slug = `${slugBase}-${crypto.randomUUID().slice(0, 8)}`;
  const images = Array.from(new Set([input.image_url, ...input.images]));
  const description = input.description?.trim() || null;
  const powerWatts = input.power
    ? Number.parseInt(input.power.replace(/[^0-9]/g, ''), 10) || null
    : null;

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from('products')
    .insert({
      slug,
      category_id: category.id,
      seller_id: seller.id,
      price,
      original_price: originalPrice ?? null,
      currency: 'IQD',
      brand: input.brand?.trim() || null,
      capacity: input.capacity?.trim() || null,
      power_watts: powerWatts,
      warranty_applicable: Boolean(input.warranty?.trim()),
      warranty_details: input.warranty?.trim() || null,
      delivery_available: Boolean(input.delivery_info?.trim()),
      delivery_info: input.delivery_info?.trim() || null,
      return_policy: input.return_policy?.trim() || null,
      image_url: input.image_url,
      status: options.publish ? 'active' : 'pending',
      is_demo: false,
    })
    .select('id, created_at')
    .single();

  if (insertError || !inserted) {
    throw new Error(`Could not create product: ${insertError?.message || 'No product returned.'}`);
  }

  const translations = await supabaseAdmin.from('product_translations').insert([
    { product_id: inserted.id, lang: 'en', name, description },
    { product_id: inserted.id, lang: 'ku', name: input.name_ckb?.trim() || name, description },
    { product_id: inserted.id, lang: 'ar', name: input.name_ar?.trim() || name, description },
  ]);
  if (translations.error) {
    const { error: cleanupError } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', inserted.id);
    if (cleanupError) console.error('Failed to clean up product after translation error:', cleanupError);
    throw new Error(`Could not save product translations: ${translations.error.message}`);
  }

  const imageRows = images.map((url, sort_order) => ({
    product_id: inserted.id,
    url,
    sort_order,
    is_primary: url === input.image_url,
  }));
  const imageInsert = await supabaseAdmin.from('product_images').insert(imageRows);
  if (imageInsert.error) {
    const { error: cleanupError } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', inserted.id);
    if (cleanupError) console.error('Failed to clean up product after image error:', cleanupError);
    throw new Error(`Could not save product images: ${imageInsert.error.message}`);
  }

  const discountPercent =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : undefined;

  return {
    id: inserted.id,
    slug,
    name,
    name_ckb: input.name_ckb?.trim() || name,
    name_ar: input.name_ar?.trim() || name,
    category: category.slug,
    price,
    currency: 'IQD',
    location: seller.address || '',
    seller_name: seller.name_en || seller.name_ku || '',
    seller_location: seller.address || '',
    seller_id: seller.id,
    seller_slug: seller.slug,
    status: options.publish ? 'active' : 'pending',
    seller_phone: seller.phone || undefined,
    seller_whatsapp: seller.whatsapp || undefined,
    warranty: input.warranty?.trim() || undefined,
    delivery_info: input.delivery_info?.trim() || undefined,
    return_policy: input.return_policy?.trim() || undefined,
    capacity: input.capacity?.trim() || undefined,
    power: input.power?.trim() || undefined,
    brand: input.brand?.trim() || undefined,
    description: description || '',
    original_price: originalPrice,
    discount_percent: discountPercent,
    image_url: input.image_url,
    images,
    created_at: inserted.created_at,
    is_demo: false,
  };
}
