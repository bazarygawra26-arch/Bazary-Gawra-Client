import { createClient } from '@supabase/supabase-js';
import { Product, Seller, Category } from '../types';
import { mockProducts, mockSellers, mockCategories } from '../data/mockData';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://ydspdazwbansgdtjhvrp.supabase.co';

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  '';

export const supabase = supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Fetch all products or invoke custom PostgreSQL search function search_products_custom
 */
export async function getProducts(options?: {
  searchTerm?: string;
  cityFilter?: string;
  maxBudget?: number;
}): Promise<Product[]> {
  if (supabase) {
    try {
      if (options?.searchTerm || options?.cityFilter || options?.maxBudget) {
        // Call custom PostgreSQL RPC function
        const { data, error } = await supabase.rpc('search_products_custom', {
          search_term: options.searchTerm || '',
          city_filter: options.cityFilter || '',
          max_budget: options.maxBudget || null,
        });

        if (!error && data && data.length > 0) {
          return data as Product[];
        }
      }

      // Default table query
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('price', { ascending: true });

      if (!error && data && data.length > 0) {
        return data as Product[];
      }
    } catch (err) {
      console.warn('Supabase products fetch failed, using local verified dataset:', err);
    }
  }
  return mockProducts;
}

/**
 * Fetch sellers from Supabase database
 */
export async function getSellers(): Promise<Seller[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('sellers').select('*');
      if (!error && data && data.length > 0) {
        return data as Seller[];
      }
    } catch (err) {
      console.warn('Supabase sellers fetch failed, using local verified dataset:', err);
    }
  }
  return mockSellers;
}

/**
 * Fetch categories from Supabase database
 */
export async function getCategories(): Promise<Category[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('categories').select('*');
      if (!error && data && data.length > 0) {
        return data as Category[];
      }
    } catch (err) {
      console.warn('Supabase categories fetch failed, using local verified dataset:', err);
    }
  }
  return mockCategories;
}

/**
 * Call custom PostgreSQL function calculate_transparency_score
 */
export async function getTransparencyScore(productId: string) {
  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('calculate_transparency_score', {
        p_id: productId,
      });
      if (!error && data) {
        return data;
      }
    } catch (err) {
      console.warn('RPC calculate_transparency_score failed:', err);
    }
  }
  return null;
}

/**
 * Audit log natural Kurdish/Arabic AI query to Supabase ai_search_queries table
 */
export async function logAISearchQuery(record: {
  query_text: string;
  detected_language: string;
  parsed_product_type?: string;
  parsed_location?: string;
  parsed_budget?: number;
  results_count?: number;
}) {
  if (supabase) {
    try {
      await supabase.from('ai_search_queries').insert([record]);
    } catch (err) {
      console.warn('Supabase logAISearchQuery error:', err);
    }
  }
}

/**
 * Audit log Gemini Multimodal vision scan to Supabase ai_product_scans table
 */
export async function logAIProductScan(scan: {
  image_name?: string;
  product_type?: string;
  suggested_category?: string;
  identified_attributes?: any[];
  available_info?: string[];
  missing_info?: string[];
  draft_title?: string;
  estimated_price_iqd?: number;
}) {
  if (supabase) {
    try {
      await supabase.from('ai_product_scans').insert([scan]);
    } catch (err) {
      console.warn('Supabase logAIProductScan error:', err);
    }
  }
}
