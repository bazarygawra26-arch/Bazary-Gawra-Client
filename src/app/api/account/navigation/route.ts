import { NextRequest, NextResponse } from 'next/server';
import { authorizeRequest } from '../../../../server/auth/authorization';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const authorization = await authorizeRequest(request);
  if (!authorization.ok) {
    return NextResponse.json(
      { error: authorization.message },
      { status: authorization.status }
    );
  }

  const [sellerResult, supplierResult] = await Promise.all([
    authorization.client
      .from('sellers')
      .select('id, slug, name_en, verification_status, is_active')
      .eq('owner_id', authorization.id)
      .maybeSingle(),
    authorization.client
      .from('suppliers')
      .select('id, business_name, verification_status, is_active')
      .eq('owner_id', authorization.id)
      .maybeSingle(),
  ]);

  const supplierSchemaUnavailable =
    supplierResult.error?.code === 'PGRST205' ||
    supplierResult.error?.code === '42P01';

  if (sellerResult.error || (supplierResult.error && !supplierSchemaUnavailable)) {
    console.error('Failed to load account navigation permissions:', {
      sellerError: sellerResult.error,
      supplierError: supplierResult.error,
    });
    return NextResponse.json(
      { error: 'Account permissions could not be loaded.' },
      { status: 503 }
    );
  }
  if (supplierSchemaUnavailable) {
    console.warn('Supplier navigation is unavailable until the supplier schema migration is applied.');
  }

  const roles = new Set([authorization.role]);
  if (sellerResult.data) roles.add('seller');
  if (supplierResult.data && !supplierSchemaUnavailable) roles.add('supplier');
  const { data: userData, error: userError } = await authorization.client.auth.getUser();
  if (userError || !userData.user) {
    console.error('Failed to load account identity for navigation:', userError);
    return NextResponse.json({ error: 'Account identity could not be loaded.' }, { status: 503 });
  }

  return NextResponse.json(
    {
      email: userData.user.email || '',
      roles: [...roles].filter((role) => role !== 'admin'),
      seller: sellerResult.data,
      supplier: supplierSchemaUnavailable ? null : supplierResult.data,
      supplierAvailable: !supplierSchemaUnavailable,
    },
    { headers: { 'Cache-Control': 'private, no-store' } }
  );
}
