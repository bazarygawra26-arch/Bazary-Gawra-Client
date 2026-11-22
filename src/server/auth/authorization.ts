import 'server-only';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';
import { env } from '../../config/env';
import { Database, MarketplaceRole } from '../../types/database';

type AuthorizationFailure = {
  ok: false;
  status: 401 | 403 | 500 | 503;
  message: string;
};

type AuthenticatedUser = {
  id: string;
  role: MarketplaceRole;
  client: SupabaseClient<Database>;
};

type AuthorizationResult =
  | ({ ok: true } & AuthenticatedUser)
  | AuthorizationFailure;

const publicRoles: readonly MarketplaceRole[] = [
  'buyer',
  'seller',
  'retailer',
  'supplier',
  'admin',
];

export async function authorizeRequest(
  request: NextRequest,
  allowedRoles?: readonly MarketplaceRole[]
): Promise<AuthorizationResult> {
  const authorization = request.headers.get('authorization');
  const [scheme, token, ...extra] = authorization?.trim().split(/\s+/) || [];

  if (scheme?.toLowerCase() !== 'bearer' || !token || extra.length > 0) {
    return { ok: false, status: 401, message: 'Authentication required.' };
  }

  const url = env.SUPABASE_URL;
  const anonKey = env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    console.error('Cannot authorize request: Supabase URL or public key is not configured.');
    return { ok: false, status: 503, message: 'Authentication is temporarily unavailable.' };
  }

  const client = createClient<Database>(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userError } = await client.auth.getUser(token);
  if (userError || !userData.user) {
    return { ok: false, status: 401, message: 'Invalid or expired session.' };
  }

  const { data: profile, error: profileError } = await client
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .maybeSingle();

  if (profileError) {
    console.error('Failed to load the authenticated profile role:', profileError);
    return { ok: false, status: 503, message: 'Account authorization is temporarily unavailable.' };
  }

  if (!profile || !publicRoles.includes(profile.role)) {
    return { ok: false, status: 403, message: 'A marketplace profile is required.' };
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return { ok: false, status: 403, message: 'You do not have permission to perform this action.' };
  }

  return { ok: true, id: userData.user.id, role: profile.role, client };
}

export async function authorizeSellerRequest(
  request: NextRequest,
  requestedSellerId?: string | null
): Promise<AuthorizationResult & { sellerId?: string }> {
  const authorization = await authorizeRequest(request, ['seller']);
  if (!authorization.ok) return authorization;

  let query = authorization.client
    .from('sellers')
    .select('id')
    .eq('owner_id', authorization.id);

  if (requestedSellerId) {
    query = query.eq('id', requestedSellerId);
  }

  const { data: seller, error } = await query.limit(1).maybeSingle();
  if (error) {
    console.error('Failed to verify seller ownership:', error);
    return { ok: false, status: 503, message: 'Seller authorization is temporarily unavailable.' };
  }

  if (!seller) {
    return { ok: false, status: 403, message: 'You do not own this seller account.' };
  }

  return { ...authorization, sellerId: seller.id };
}
