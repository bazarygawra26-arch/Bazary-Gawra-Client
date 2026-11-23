import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authorizeRequest } from '../../../../server/auth/authorization';
import { supabaseAdmin } from '../../../../server/db/supabaseAdmin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supplierApplicationSchema = z.object({
  business_name: z.string().trim().min(2).max(160),
  business_type: z.enum(['manufacturer', 'wholesaler', 'distributor', 'importer', 'supplier']),
  contact_person: z.string().trim().min(2).max(160),
  phone: z.string().trim().min(5).max(40),
  country: z.string().trim().min(2).max(100),
  city: z.string().trim().min(2).max(100),
  address: z.string().trim().max(300).optional(),
  description: z.string().trim().max(2000).optional(),
  website: z.url().optional().or(z.literal('')),
});

export async function GET(request: NextRequest) {
  const authorization = await authorizeRequest(request, ['buyer', 'seller', 'retailer', 'supplier']);
  if (!authorization.ok) {
    return NextResponse.json({ error: authorization.message }, { status: authorization.status });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supplier profile storage is not configured.' }, { status: 503 });
  }

  const { data: supplier, error } = await supabaseAdmin
    .from('suppliers')
    .select('*')
    .eq('owner_id', authorization.id)
    .maybeSingle();

  if (error) {
    console.error('Failed to load the authenticated supplier profile:', error);
    return NextResponse.json({ error: 'Supplier profile could not be loaded.' }, { status: 503 });
  }

  return NextResponse.json(
    { supplier },
    { headers: { 'Cache-Control': 'private, no-store' } }
  );
}

export async function POST(request: NextRequest) {
  const authorization = await authorizeRequest(request, ['buyer', 'seller', 'retailer', 'supplier']);
  if (!authorization.ok) {
    return NextResponse.json({ error: authorization.message }, { status: authorization.status });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supplier profile storage is not configured.' }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }
  const parsed = supplierApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Invalid supplier application.' },
      { status: 400 }
    );
  }

  const { data: existing, error: lookupError } = await supabaseAdmin
    .from('suppliers')
    .select('id')
    .eq('owner_id', authorization.id)
    .maybeSingle();
  if (lookupError) {
    console.error('Failed to check for an existing supplier application:', lookupError);
    return NextResponse.json({ error: 'Supplier application could not be checked.' }, { status: 503 });
  }
  if (existing) {
    return NextResponse.json(
      { error: 'A supplier application already exists for this account.' },
      { status: 409 }
    );
  }

  const { data: supplier, error: insertError } = await supabaseAdmin
    .from('suppliers')
    .insert({
      ...parsed.data,
      owner_id: authorization.id,
      verification_status: 'pending',
      is_active: false,
    })
    .select('*')
    .single();

  if (insertError || !supplier) {
    console.error('Failed to submit supplier application:', insertError);
    return NextResponse.json({ error: 'Supplier application could not be submitted.' }, { status: 503 });
  }

  return NextResponse.json({ supplier }, { status: 201 });
}
