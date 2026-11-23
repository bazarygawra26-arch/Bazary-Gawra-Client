import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { env } from '../../../../config/env';
import { validateLocation } from '../../../../server/locations';
import { supabaseAdmin } from '../../../../server/db/supabaseAdmin';
import { Database } from '../../../../types/database';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const commonFields = {
  email: z.email().max(254),
  password: z.string().min(8).max(128).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
    'Password must include uppercase, lowercase, and numeric characters.'
  ),
  full_name: z.string().trim().min(2).max(160),
  phone: z.string().trim().min(5).max(24).regex(/^[0-9().\s-]+$/),
  country_code: z.string().regex(/^[A-Z]{2}$/),
  governorate_code: z.string().trim().max(10).default(''),
  city: z.string().trim().min(2).max(100),
};

const businessBuyerTypes = [
  'retail_store',
  'retail_chain',
  'supermarket',
  'distributor',
  'other_business',
] as const;
const supplierTypes = ['manufacturer', 'wholesaler', 'distributor', 'importer', 'supplier'] as const;
const categorySlugsSchema = z.array(z.string().trim().min(1).max(100)).max(100).default([]);
const registrationSchema = z.discriminatedUnion('role', [
  z.object({ ...commonFields, role: z.literal('buyer') }),
  z.object({
    ...commonFields,
    role: z.literal('seller'),
    store_name: z.string().trim().min(2).max(160),
    store_address: z.string().trim().min(2).max(300),
    store_description: z.string().trim().min(2).max(2000),
    store_category_slug: z.string().trim().min(1).max(100),
    store_website: z.url().optional().or(z.literal('')).default(''),
  }),
  z.object({
    ...commonFields,
    role: z.literal('retailer'),
    business_name: z.string().trim().min(2).max(160),
    business_type: z.enum(businessBuyerTypes),
    business_address: z.string().trim().min(2).max(300),
    business_description: z.string().trim().min(2).max(2000),
    buyer_category_slugs: categorySlugsSchema,
  }),
  z.object({
    ...commonFields,
    role: z.literal('supplier'),
    business_name: z.string().trim().min(2).max(160),
    business_type: z.enum(supplierTypes),
    business_address: z.string().trim().min(2).max(300),
    supplier_category_slugs: z.array(z.string().trim().min(1).max(100)).min(1).max(100),
  }),
]);

function getCategorySlugs(registration: z.infer<typeof registrationSchema>) {
  if (registration.role === 'seller') return [registration.store_category_slug];
  if (registration.role === 'retailer') return registration.buyer_category_slugs;
  if (registration.role === 'supplier') return registration.supplier_category_slugs;
  return [];
}

function getRegistrationMetadata(
  registration: z.infer<typeof registrationSchema>,
  location: NonNullable<ReturnType<typeof validateLocation>>,
  phone: string,
  categorySlugs: string[]
) {
  const common = {
    role: registration.role,
    full_name: registration.full_name,
    phone,
    country: location.country,
    country_code: location.countryCode,
    governorate: location.governorate,
    governorate_code: location.governorateCode,
    city: location.city,
  };

  if (registration.role === 'seller') {
    return {
      ...common,
      store_name: registration.store_name,
      store_address: registration.store_address,
      store_description: registration.store_description,
      store_category_slug: categorySlugs[0],
      store_website: registration.store_website,
    };
  }
  if (registration.role === 'retailer') {
    return {
      ...common,
      business_name: registration.business_name,
      business_type: registration.business_type,
      business_address: registration.business_address,
      business_description: registration.business_description,
      buyer_category_slugs: categorySlugs,
    };
  }
  if (registration.role === 'supplier') {
    return {
      ...common,
      business_name: registration.business_name,
      business_type: registration.business_type,
      business_address: registration.business_address,
      supplier_category_slugs: categorySlugs,
    };
  }
  return common;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Invalid registration details.' },
      { status: 400 }
    );
  }

  const registration = parsed.data;
  const location = validateLocation(
    registration.country_code,
    registration.governorate_code,
    registration.city
  );
  if (!location) {
    return NextResponse.json(
      { error: 'Choose a country, governorate, and city from the available options.' },
      { status: 400 }
    );
  }

  const nationalPhoneDigits = registration.phone.replace(/\D/g, '').replace(/^0+/, '');
  const fullPhone = `+${location.phoneCode}${nationalPhoneDigits}`;
  if (fullPhone.replace(/\D/g, '').length < 7 || fullPhone.replace(/\D/g, '').length > 15) {
    return NextResponse.json({ error: 'Enter a valid phone number.' }, { status: 400 });
  }

  const categorySlugs = [...new Set(getCategorySlugs(registration))];
  if (categorySlugs.length > 0) {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Category validation is temporarily unavailable.' }, { status: 503 });
    }

    const { data: activeCategories, error: categoryError } = await supabaseAdmin
      .from('categories')
      .select('slug')
      .in('slug', categorySlugs)
      .eq('is_active', true);
    if (categoryError) {
      console.error('Failed to validate registration categories:', categoryError);
      return NextResponse.json({ error: 'Category validation is temporarily unavailable.' }, { status: 503 });
    }
    if ((activeCategories || []).length !== categorySlugs.length) {
      return NextResponse.json({ error: 'Choose active categories from the available options.' }, { status: 400 });
    }
  }

  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: 'Registration is temporarily unavailable.' }, { status: 503 });
  }

  const authClient = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await authClient.auth.signUp({
    email: registration.email.trim(),
    password: registration.password,
    options: {
      data: getRegistrationMetadata(registration, location, fullPhone, categorySlugs),
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!data.user) {
    console.error('Supabase signup returned no user for an accepted registration.');
    return NextResponse.json({ error: 'Registration could not be completed.' }, { status: 502 });
  }

  return NextResponse.json(
    {
      session: data.session
        ? {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          }
        : null,
    },
    { status: 201, headers: { 'Cache-Control': 'no-store' } }
  );
}
