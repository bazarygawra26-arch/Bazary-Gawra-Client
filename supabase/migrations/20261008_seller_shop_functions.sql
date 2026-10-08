-- ==============================================================================
-- BAZARY GAWRA - Seller Shops & Product Functions
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/ydspdazwbansgdtjhvrp/sql
-- ==============================================================================

-- 1. Ensure no clothing category
DELETE FROM public.categories WHERE slug = 'clothing';

-- 2. Shop header data & honest disclosure stats
CREATE OR REPLACE FUNCTION public.get_seller_profile(
  p_slug text,
  p_lang public.lang_code DEFAULT 'en'
) RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT jsonb_build_object(
    'id', s.id,
    'slug', s.slug,
    'name', public.localized_text(s.name_en, s.name_ku, s.name_ar, p_lang),
    'description', public.localized_text(s.description_en, s.description_ku, s.description_ar, p_lang),
    'location', public.localized_text(l.name_en, l.name_ku, l.name_ar, p_lang),
    'address', s.address,
    'phone', s.phone,
    'whatsapp', s.whatsapp,
    'logo_url', s.logo_url,
    'verification_status', s.verification_status,
    'is_demo', s.is_demo,
    'product_count', (
      SELECT count(*) FROM public.products p
      WHERE p.seller_id = s.id AND p.status = 'active'
    ),
    'categories', (
      SELECT coalesce(
        jsonb_agg(
          jsonb_build_object('slug', x.slug, 'name', x.name, 'count', x.cnt)
          ORDER BY x.cnt DESC
        ),
        '[]'::jsonb
      )
      FROM (
        SELECT c.slug,
               public.localized_text(c.name_en, c.name_ku, c.name_ar, p_lang) AS name,
               count(*) AS cnt
        FROM public.products p
        JOIN public.categories c ON c.id = p.category_id
        WHERE p.seller_id = s.id AND p.status = 'active'
        GROUP BY c.slug, c.name_en, c.name_ku, c.name_ar
      ) x
    ),
    'info_summary', jsonb_build_object(
      'with_warranty',      (SELECT count(*) FROM public.products p WHERE p.seller_id = s.id AND p.status = 'active' AND p.warranty_months IS NOT NULL),
      'with_delivery_info', (SELECT count(*) FROM public.products p WHERE p.seller_id = s.id AND p.status = 'active' AND p.delivery_available IS NOT NULL),
      'with_return_policy', (SELECT count(*) FROM public.products p WHERE p.seller_id = s.id AND p.status = 'active' AND (p.return_policy IS NOT NULL OR p.return_days IS NOT NULL))
    )
  )
  FROM public.sellers s
  LEFT JOIN public.locations l ON l.id = s.location_id
  WHERE s.slug = p_slug AND s.is_active;
$$;

-- 3. Shop grid AND "More from this seller" (excluding current product if specified)
CREATE OR REPLACE FUNCTION public.get_seller_products(
  p_seller_slug text,
  p_lang public.lang_code DEFAULT 'en',
  p_exclude_product_id uuid DEFAULT NULL,
  p_category_slug text DEFAULT NULL,
  p_limit int DEFAULT 12,
  p_offset int DEFAULT 0
) RETURNS SETOF public.product_card LANGUAGE sql STABLE AS $$
  SELECT sp.product_id, sp.slug, sp.name, sp.description, sp.category_slug, sp.category_name,
         sp.price, sp.currency, sp.location_slug, sp.location_name, sp.seller_id, sp.seller_name,
         sp.is_demo, sp.brand, sp.capacity, sp.power_watts, sp.warranty_applicable,
         sp.warranty_months, sp.delivery_available, sp.image_url, sp.match_score,
         (count(*) OVER ())::bigint
  FROM public.search_products(NULL, p_category_slug, NULL, NULL, NULL, NULL, false, p_lang, 'newest', 100, 0) sp
  WHERE sp.seller_id = (SELECT id FROM public.sellers WHERE slug = p_seller_slug)
    AND (p_exclude_product_id IS NULL OR sp.product_id <> p_exclude_product_id)
  ORDER BY sp.name
  LIMIT least(greatest(coalesce(p_limit, 12), 1), 50)
  OFFSET greatest(coalesce(p_offset, 0), 0);
$$;

-- 4. Grant permissions
GRANT EXECUTE ON FUNCTION public.get_seller_profile(text, public.lang_code) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_seller_products(text, public.lang_code, uuid, text, int, int) TO anon, authenticated;
