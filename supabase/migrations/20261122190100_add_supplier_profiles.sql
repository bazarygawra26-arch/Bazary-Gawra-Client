CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL CHECK (
    business_type IN ('manufacturer', 'wholesaler', 'distributor', 'importer', 'supplier')
  ),
  contact_person TEXT,
  email TEXT,
  phone TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  description TEXT,
  category_slugs TEXT[] NOT NULL DEFAULT '{}',
  website TEXT,
  logo_url TEXT,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    verification_status IN ('pending', 'verified', 'rejected', 'suspended')
  ),
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS suppliers_verification_status_idx
  ON public.suppliers (verification_status, is_active);

CREATE INDEX IF NOT EXISTS suppliers_country_city_idx
  ON public.suppliers (country, city);

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS suppliers_public_or_owner_select ON public.suppliers;
CREATE POLICY suppliers_public_or_owner_select
  ON public.suppliers
  FOR SELECT
  TO anon, authenticated
  USING (
    (is_active AND verification_status = 'verified')
    OR owner_id = auth.uid()
  );

GRANT SELECT ON public.suppliers TO anon, authenticated;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS bazary_profiles_select_self ON public.profiles;
CREATE POLICY bazary_profiles_select_self
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

GRANT SELECT ON public.profiles TO authenticated;

CREATE OR REPLACE FUNCTION public.create_marketplace_profile_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  requested_role TEXT := lower(coalesce(NEW.raw_user_meta_data ->> 'role', 'buyer'));
  profile_role public.user_role;
  full_name TEXT := coalesce(
    nullif(btrim(NEW.raw_user_meta_data ->> 'full_name'), ''),
    'New user'
  );
  business_name TEXT := coalesce(
    nullif(btrim(NEW.raw_user_meta_data ->> 'business_name'), ''),
    full_name
  );
  business_slug TEXT;
  seller_location_id UUID;
BEGIN
  profile_role := CASE requested_role
    WHEN 'seller' THEN 'seller'::public.user_role
    WHEN 'retailer' THEN 'retailer'::public.user_role
    WHEN 'supplier' THEN 'supplier'::public.user_role
    ELSE 'buyer'::public.user_role
  END;

  INSERT INTO public.profiles (id, full_name, role)
  VALUES (NEW.id, full_name, profile_role)
  ON CONFLICT (id) DO UPDATE
    SET full_name = coalesce(nullif(public.profiles.full_name, ''), EXCLUDED.full_name),
        role = CASE
          WHEN public.profiles.role = 'buyer'::public.user_role THEN EXCLUDED.role
          ELSE public.profiles.role
        END,
        updated_at = now();

  IF profile_role = 'seller'::public.user_role
     AND NOT EXISTS (SELECT 1 FROM public.sellers WHERE owner_id = NEW.id) THEN
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
      is_active
    )
    VALUES (
      NEW.id,
      business_slug,
      business_name,
      nullif(btrim(NEW.raw_user_meta_data ->> 'description'), ''),
      seller_location_id,
      nullif(btrim(NEW.raw_user_meta_data ->> 'address'), ''),
      nullif(btrim(NEW.raw_user_meta_data ->> 'phone'), ''),
      'pending',
      false,
      false
    );
  ELSIF profile_role = 'supplier'::public.user_role
     AND NOT EXISTS (SELECT 1 FROM public.suppliers WHERE owner_id = NEW.id) THEN
    INSERT INTO public.suppliers (
      owner_id,
      business_name,
      business_type,
      contact_person,
      email,
      phone,
      country,
      city,
      address,
      description,
      website
    )
    VALUES (
      NEW.id,
      business_name,
      CASE
        WHEN NEW.raw_user_meta_data ->> 'business_type'
          IN ('manufacturer', 'wholesaler', 'distributor', 'importer', 'supplier')
        THEN NEW.raw_user_meta_data ->> 'business_type'
        ELSE 'supplier'
      END,
      full_name,
      NEW.email,
      coalesce(nullif(btrim(NEW.raw_user_meta_data ->> 'phone'), ''), ''),
      coalesce(nullif(btrim(NEW.raw_user_meta_data ->> 'country'), ''), ''),
      coalesce(nullif(btrim(NEW.raw_user_meta_data ->> 'city'), ''), ''),
      nullif(btrim(NEW.raw_user_meta_data ->> 'address'), ''),
      nullif(btrim(NEW.raw_user_meta_data ->> 'description'), ''),
      nullif(btrim(NEW.raw_user_meta_data ->> 'website'), '')
    );
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.create_marketplace_profile_on_signup() FROM PUBLIC, anon, authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'on_auth_user_created_marketplace_profile'
      AND tgrelid = 'auth.users'::regclass
      AND NOT tgisinternal
  ) THEN
    CREATE TRIGGER on_auth_user_created_marketplace_profile
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.create_marketplace_profile_on_signup();
  END IF;
END;
$$;
