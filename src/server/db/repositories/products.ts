import 'server-only';
import { supabaseAdmin } from '../supabaseAdmin';
import { Product } from '../../../types';
import { mockProducts } from '../../../data/mockData';

export async function findProducts(filters?: {
  category?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}): Promise<Product[]> {
  if (supabaseAdmin) {
    try {
      let query = supabaseAdmin.from('products').select('*');

      if (filters?.category) {
        query = query.ilike('category', `%${filters.category}%`);
      }
      if (filters?.city) {
        query = query.or(`location.ilike.%${filters.city}%,seller_location.ilike.%${filters.city}%`);
      }
      if (filters?.minPrice) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters?.maxPrice) {
        query = query.lte('price', filters.maxPrice);
      }
      if (filters?.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,name_ckb.ilike.%${filters.search}%,name_ar.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as Product[];
      }
    } catch (err) {
      console.warn('Repository findProducts error, falling back to local dataset:', err);
    }
  }

  // Local verified fallback
  let result = [...mockProducts];
  if (filters?.category) {
    result = result.filter((p) => p.category.toLowerCase().includes(filters.category!.toLowerCase()));
  }
  if (filters?.city) {
    result = result.filter(
      (p) =>
        p.location.toLowerCase().includes(filters.city!.toLowerCase()) ||
        p.seller_location.toLowerCase().includes(filters.city!.toLowerCase())
    );
  }
  if (filters?.maxPrice) {
    result = result.filter((p) => p.price <= filters.maxPrice!);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.name_ckb && p.name_ckb.includes(q)) ||
        (p.name_ar && p.name_ar.includes(q))
    );
  }

  return result;
}

export async function findProductById(id: string): Promise<Product | null> {
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin.from('products').select('*').eq('id', id).single();
      if (!error && data) return data as Product;
    } catch (err) {
      console.warn('Repository findProductById error:', err);
    }
  }

  return mockProducts.find((p) => p.id === id) || null;
}

export async function findProductBySlug(slug: string): Promise<Product | null> {
  const all = await findProducts();
  return (
    all.find(
      (p) =>
        p.id === slug ||
        p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug.toLowerCase()
    ) || null
  );
}
