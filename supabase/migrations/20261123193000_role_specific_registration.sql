ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS country_code TEXT,
  ADD COLUMN IF NOT EXISTS governorate TEXT,
  ADD COLUMN IF NOT EXISTS governorate_code TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT;

ALTER TABLE public.sellers
  ADD COLUMN IF NOT EXISTS store_category_slug TEXT,
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS country_code TEXT,
  ADD COLUMN IF NOT EXISTS governorate TEXT,
  ADD COLUMN IF NOT EXISTS governorate_code TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT;

ALTER TABLE public.suppliers
  ADD COLUMN IF NOT EXISTS country_code TEXT,
  ADD COLUMN IF NOT EXISTS governorate TEXT,
  ADD COLUMN IF NOT EXISTS governorate_code TEXT;

CREATE TABLE IF NOT EXISTS public.business_buyer_profiles (
  owner_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL CHECK (
    business_type IN (
      'retail_store', 'retail_chain', 'shop', 'supermarket', 'distributor', 'other_business'
    )
  ),
  business_address TEXT NOT NULL,
  description TEXT,
  website TEXT,
  category_slugs TEXT[] NOT NULL DEFAULT '{}',
  country TEXT,
  country_code TEXT,
  governorate TEXT,
  governorate_code TEXT,
  city TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.business_buyer_profiles
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS country_code TEXT,
  ADD COLUMN IF NOT EXISTS governorate TEXT,
  ADD COLUMN IF NOT EXISTS governorate_code TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS category_slugs TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE public.business_buyer_profiles
  DROP CONSTRAINT IF EXISTS business_buyer_profiles_business_type_check;
ALTER TABLE public.business_buyer_profiles
  ADD CONSTRAINT business_buyer_profiles_business_type_check
  CHECK (business_type IN (
    'retail_store', 'retail_chain', 'shop', 'supermarket', 'distributor', 'other_business'
  ));

ALTER TABLE public.business_buyer_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS business_buyer_profiles_owner_select
  ON public.business_buyer_profiles;
CREATE POLICY business_buyer_profiles_owner_select
  ON public.business_buyer_profiles
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

GRANT SELECT ON public.business_buyer_profiles TO authenticated;

CREATE OR REPLACE FUNCTION public.create_marketplace_profile_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  requested_role TEXT := lower(coalesce(NEW.raw_user_meta_data ->> 'role', 'buyer'));
  profile_role public.user_role;
  full_name TEXT := nullif(btrim(NEW.raw_user_meta_data ->> 'full_name'), '');
  contact_phone TEXT := nullif(btrim(NEW.raw_user_meta_data ->> 'phone'), '');
  country_name TEXT := nullif(btrim(NEW.raw_user_meta_data ->> 'country'), '');
  country_code TEXT := nullif(btrim(NEW.raw_user_meta_data ->> 'country_code'), '');
  governorate_name TEXT := nullif(btrim(NEW.raw_user_meta_data ->> 'governorate'), '');
  governorate_code TEXT := nullif(btrim(NEW.raw_user_meta_data ->> 'governorate_code'), '');
  city_name TEXT := nullif(btrim(NEW.raw_user_meta_data ->> 'city'), '');
  business_name TEXT := nullif(btrim(NEW.raw_user_meta_data ->> 'business_name'), '');
  business_slug TEXT;
  seller_location_id UUID;
  store_category_slug TEXT;
  category_slugs TEXT[];
  requested_category_count INTEGER;
  supplier_type TEXT;
  retailer_type TEXT;
BEGIN
  IF full_name IS NULL THEN
    RAISE EXCEPTION 'Full name is required.';
  END IF;
  IF contact_phone IS NULL OR country_name IS NULL OR country_code IS NULL OR city_name IS NULL THEN
    RAISE EXCEPTION 'Phone, country, and city are required.';
  END IF;
  IF contact_phone !~ '^[+()0-9.[:space:]-]+$'
     OR length(regexp_replace(contact_phone, '[^0-9]', '', 'g')) NOT BETWEEN 7 AND 15
     OR length(contact_phone) > 40
     OR length(country_name) > 100
     OR country_code !~ '^[A-Z]{2}$'
     OR length(governorate_code) > 10
     OR length(governorate_name) > 100
     OR length(city_name) > 100 THEN
    RAISE EXCEPTION 'Enter valid contact and location information.';
  END IF;

  profile_role := CASE requested_role
    WHEN 'seller' THEN 'seller'::public.user_role
    WHEN 'retailer' THEN 'retailer'::public.user_role
    WHEN 'supplier' THEN 'supplier'::public.user_role
    ELSE 'buyer'::public.user_role
  END;

  INSERT INTO public.profiles (
    id, full_name, phone, country, country_code, governorate,
    governorate_code, city, role
  )
  VALUES (
    NEW.id,
    full_name,
    contact_phone,
    country_name,
    country_code,
    governorate_name,
    governorate_code,
    city_name,
    profile_role
  )
  ON CONFLICT (id) DO UPDATE
    SET full_name = coalesce(nullif(public.profiles.full_name, ''), EXCLUDED.full_name),
        phone = coalesce(public.profiles.phone, EXCLUDED.phone),
        country = coalesce(public.profiles.country, EXCLUDED.country),
        country_code = coalesce(public.profiles.country_code, EXCLUDED.country_code),
        governorate = coalesce(public.profiles.governorate, EXCLUDED.governorate),
        governorate_code = coalesce(public.profiles.governorate_code, EXCLUDED.governorate_code),
        city = coalesce(public.profiles.city, EXCLUDED.city),
        role = CASE
          WHEN public.profiles.role = 'buyer'::public.user_role THEN EXCLUDED.role
          ELSE public.profiles.role
        END,
        updated_at = now();

  IF profile_role = 'seller'::public.user_role THEN
    business_name := coalesce(
      nullif(btrim(NEW.raw_user_meta_data ->> 'store_name'), ''),
      business_name
    );
    store_category_slug := nullif(
      btrim(NEW.raw_user_meta_data ->> 'store_category_slug'),
      ''
    );

    IF business_name IS NULL OR
       nullif(btrim(NEW.raw_user_meta_data ->> 'store_address'), '') IS NULL OR
       store_category_slug IS NULL OR
       nullif(btrim(NEW.raw_user_meta_data ->> 'store_description'), '') IS NULL THEN
      RAISE EXCEPTION 'Store name, address, category, and description are required.';
    END IF;

    SELECT c.slug INTO store_category_slug
    FROM public.categories AS c
    WHERE c.slug = store_category_slug
      AND c.is_active
    LIMIT 1;

    IF store_category_slug IS NULL THEN
      RAISE EXCEPTION 'Choose an active store category.';
    END IF;

    business_slug := nullif(
      trim(both '-' from regexp_replace(lower(business_name), '[^a-z0-9]+', '-', 'g')),
      ''
    );
    business_slug := coalesce(business_slug, 'seller') || '-' || left(NEW.id::text, 8);

    SELECT id INTO seller_location_id
    FROM public.locations
    WHERE slug = lower(regexp_replace(coalesce(NEW.raw_user_meta_data ->> 'city', ''), '[^a-z0-9]+', '-', 'g'))
       OR lower(name_en) = lower(coalesce(NEW.raw_user_meta_data ->> 'city', ''))
    LIMIT 1;

    IF NOT EXISTS (
      SELECT 1 FROM public.sellers WHERE owner_id = NEW.id
    ) THEN
      INSERT INTO public.sellers (
        owner_id,
        slug,
        name_en,
        description_en,
        location_id,
        address,
        phone,
        verification_status,
        is_demo,
        is_active,
        store_category_slug,
        website_url,
        country,
        country_code,
        governorate,
        governorate_code,
        city
      )
      VALUES (
        NEW.id,
        business_slug,
        business_name,
        nullif(btrim(NEW.raw_user_meta_data ->> 'store_description'), ''),
        seller_location_id,
        nullif(btrim(NEW.raw_user_meta_data ->> 'store_address'), ''),
        contact_phone,
        'pending',
        false,
        false,
        store_category_slug,
        nullif(btrim(NEW.raw_user_meta_data ->> 'store_website'), ''),
        country_name,
        country_code,
        governorate_name,
        governorate_code,
        city_name
      );
    END IF;

  ELSIF profile_role = 'supplier'::public.user_role THEN
    supplier_type := lower(coalesce(NEW.raw_user_meta_data ->> 'business_type', ''));
    IF supplier_type NOT IN ('manufacturer', 'wholesaler', 'distributor', 'importer', 'supplier') THEN
      RAISE EXCEPTION 'Choose a valid supplier business type.';
    END IF;
    IF business_name IS NULL OR
       nullif(btrim(NEW.raw_user_meta_data ->> 'business_address'), '') IS NULL THEN
      RAISE EXCEPTION 'Business name and address are required.';
    END IF;

    SELECT count(DISTINCT requested.slug)::INTEGER
    INTO requested_category_count
    FROM jsonb_array_elements_text(
      CASE
        WHEN jsonb_typeof(NEW.raw_user_meta_data -> 'supplier_category_slugs') = 'array'
          THEN NEW.raw_user_meta_data -> 'supplier_category_slugs'
        ELSE '[]'::JSONB
      END
    ) AS requested(slug);

    SELECT coalesce(array_agg(DISTINCT c.slug), ARRAY[]::TEXT[])
    INTO category_slugs
    FROM jsonb_array_elements_text(
      CASE
        WHEN jsonb_typeof(NEW.raw_user_meta_data -> 'supplier_category_slugs') = 'array'
          THEN NEW.raw_user_meta_data -> 'supplier_category_slugs'
        ELSE '[]'::JSONB
      END
    ) AS requested(slug)
    JOIN public.categories AS c
      ON c.slug = requested.slug
     AND c.is_active;

    IF coalesce(cardinality(category_slugs), 0) = 0
       OR cardinality(category_slugs) <> coalesce(requested_category_count, 0) THEN
      RAISE EXCEPTION 'Choose at least one active supplier product category.';
    END IF;

    INSERT INTO public.suppliers (
      owner_id,
      business_name,
      business_type,
      contact_person,
      email,
      phone,
      country,
      country_code,
      governorate,
      governorate_code,
      city,
      address,
      description,
      category_slugs,
      website,
      verification_status,
      is_active
    )
    VALUES (
      NEW.id,
      business_name,
      supplier_type,
      full_name,
      NEW.email,
      contact_phone,
      country_name,
      country_code,
      governorate_name,
      governorate_code,
      city_name,
      nullif(btrim(NEW.raw_user_meta_data ->> 'business_address'), ''),
      nullif(btrim(NEW.raw_user_meta_data ->> 'business_description'), ''),
      category_slugs,
      nullif(btrim(NEW.raw_user_meta_data ->> 'website'), ''),
      'pending',
      false
    )
    ON CONFLICT (owner_id) DO NOTHING;

  ELSIF profile_role = 'retailer'::public.user_role THEN
    retailer_type := lower(coalesce(NEW.raw_user_meta_data ->> 'business_type', ''));
    IF retailer_type NOT IN (
      'retail_store', 'retail_chain', 'shop', 'supermarket', 'distributor', 'other_business'
    ) THEN
      RAISE EXCEPTION 'Choose a valid business buyer type.';
    END IF;
    IF business_name IS NULL OR
       nullif(btrim(NEW.raw_user_meta_data ->> 'business_address'), '') IS NULL OR
       nullif(btrim(NEW.raw_user_meta_data ->> 'business_description'), '') IS NULL THEN
      RAISE EXCEPTION 'Business name, address, and details are required.';
    END IF;

    SELECT count(DISTINCT requested.slug)::INTEGER
    INTO requested_category_count
    FROM jsonb_array_elements_text(
      CASE
        WHEN jsonb_typeof(NEW.raw_user_meta_data -> 'buyer_category_slugs') = 'array'
          THEN NEW.raw_user_meta_data -> 'buyer_category_slugs'
        ELSE '[]'::JSONB
      END
    ) AS requested(slug);

    SELECT coalesce(array_agg(DISTINCT c.slug), ARRAY[]::TEXT[])
    INTO category_slugs
    FROM jsonb_array_elements_text(
      CASE
        WHEN jsonb_typeof(NEW.raw_user_meta_data -> 'buyer_category_slugs') = 'array'
          THEN NEW.raw_user_meta_data -> 'buyer_category_slugs'
        ELSE '[]'::JSONB
      END
    ) AS requested(slug)
    JOIN public.categories AS c
      ON c.slug = requested.slug
     AND c.is_active;

    IF coalesce(cardinality(category_slugs), 0) <> coalesce(requested_category_count, 0) THEN
      RAISE EXCEPTION 'Choose active business buyer product categories.';
    END IF;

    INSERT INTO public.business_buyer_profiles (
      owner_id,
      business_name,
      business_type,
      business_address,
      description,
      country,
      country_code,
      governorate,
      governorate_code,
      city,
      category_slugs
    )
    VALUES (
      NEW.id,
      business_name,
      retailer_type,
      nullif(btrim(NEW.raw_user_meta_data ->> 'business_address'), ''),
      nullif(btrim(NEW.raw_user_meta_data ->> 'business_description'), ''),
      country_name,
      country_code,
      governorate_name,
      governorate_code,
      city_name,
      category_slugs
    )
    ON CONFLICT (owner_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.create_marketplace_profile_on_signup()
  FROM PUBLIC, anon, authenticated;
