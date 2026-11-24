import 'server-only';
import { supabaseAdmin } from '../supabaseAdmin';
import { CustomerAddress, CustomerFavourite, Product } from '../../../types';
import { findProductById } from './products';

const addressesFallbackStore: CustomerAddress[] = [];
const favouritesFallbackStore: CustomerFavourite[] = [];

// ==============================================================================
// CUSTOMER ADDRESSES
// ==============================================================================
export async function getCustomerAddresses(userId: string): Promise<CustomerAddress[]> {
  if (supabaseAdmin) {
    try {
      const { data, error } = await (supabaseAdmin as any)
        .from('customer_addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        return data as CustomerAddress[];
      }
    } catch (err) {
      console.warn('getCustomerAddresses DB error:', err);
    }
  }

  return addressesFallbackStore.filter((a) => a.user_id === userId);
}

export async function addCustomerAddress(
  userId: string,
  input: Omit<CustomerAddress, 'id' | 'user_id' | 'created_at'>
): Promise<CustomerAddress> {
  if (supabaseAdmin) {
    try {
      if (input.is_default) {
        // Unset other defaults
        await (supabaseAdmin as any)
          .from('customer_addresses')
          .update({ is_default: false })
          .eq('user_id', userId);
      }

      const { data, error } = await (supabaseAdmin as any)
        .from('customer_addresses')
        .insert({
          user_id: userId,
          label: input.label || 'Home',
          recipient_name: input.recipient_name,
          phone: input.phone,
          country: input.country || 'Iraq',
          city: input.city,
          district: input.district || null,
          street_address: input.street_address,
          is_default: Boolean(input.is_default),
        })
        .select('*')
        .maybeSingle();

      if (!error && data) {
        return data as CustomerAddress;
      }
    } catch (err) {
      console.warn('addCustomerAddress DB error:', err);
    }
  }

  const fallbackAddress: CustomerAddress = {
    id: `addr-${Date.now()}`,
    user_id: userId,
    ...input,
    created_at: new Date().toISOString(),
  };

  if (input.is_default) {
    addressesFallbackStore.forEach((a) => {
      if (a.user_id === userId) a.is_default = false;
    });
  }

  addressesFallbackStore.unshift(fallbackAddress);
  return fallbackAddress;
}

export async function deleteCustomerAddress(userId: string, addressId: string): Promise<boolean> {
  if (supabaseAdmin) {
    try {
      const { error } = await (supabaseAdmin as any)
        .from('customer_addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', userId);

      if (!error) return true;
    } catch (err) {
      console.warn('deleteCustomerAddress DB error:', err);
    }
  }

  const idx = addressesFallbackStore.findIndex((a) => a.id === addressId && a.user_id === userId);
  if (idx !== -1) {
    addressesFallbackStore.splice(idx, 1);
    return true;
  }
  return false;
}

// ==============================================================================
// CUSTOMER FAVOURITES
// ==============================================================================
export async function getCustomerFavourites(userId: string): Promise<CustomerFavourite[]> {
  if (supabaseAdmin) {
    try {
      const { data, error } = await (supabaseAdmin as any)
        .from('customer_favourites')
        .select('id, user_id, product_id, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        // Enrich with product data
        const enriched = await Promise.all(
          data.map(async (fav: any) => {
            const prod = await findProductById(fav.product_id);
            return {
              id: fav.id,
              user_id: fav.user_id,
              product_id: fav.product_id,
              product: prod || undefined,
              created_at: fav.created_at,
            };
          })
        );
        return enriched;
      }
    } catch (err) {
      console.warn('getCustomerFavourites DB error:', err);
    }
  }

  return favouritesFallbackStore.filter((f) => f.user_id === userId);
}

export async function toggleCustomerFavourite(
  userId: string,
  productId: string
): Promise<{ is_favourite: boolean }> {
  if (supabaseAdmin) {
    try {
      const { data: existing } = await (supabaseAdmin as any)
        .from('customer_favourites')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .maybeSingle();

      if (existing) {
        await (supabaseAdmin as any)
          .from('customer_favourites')
          .delete()
          .eq('id', existing.id);
        return { is_favourite: false };
      } else {
        await (supabaseAdmin as any)
          .from('customer_favourites')
          .insert({ user_id: userId, product_id: productId });
        return { is_favourite: true };
      }
    } catch (err) {
      console.warn('toggleCustomerFavourite DB error:', err);
    }
  }

  const idx = favouritesFallbackStore.findIndex((f) => f.user_id === userId && f.product_id === productId);
  if (idx !== -1) {
    favouritesFallbackStore.splice(idx, 1);
    return { is_favourite: false };
  } else {
    favouritesFallbackStore.push({
      id: `fav-${Date.now()}`,
      user_id: userId,
      product_id: productId,
      created_at: new Date().toISOString(),
    });
    return { is_favourite: true };
  }
}
