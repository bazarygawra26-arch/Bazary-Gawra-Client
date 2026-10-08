import 'server-only';
import { supabaseAdmin } from '../supabaseAdmin';
import { Category } from '../../../types';
import { mockCategories } from '../../../data/mockData';

export async function findCategories(): Promise<Category[]> {
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin.from('categories').select('*');
      if (!error && data && data.length > 0) {
        return data as unknown as Category[];
      }
    } catch (err) {
      console.warn('Repository findCategories error:', err);
    }
  }

  return mockCategories;
}

export async function findCategoryBySlug(slug: string): Promise<Category | null> {
  const cats = await findCategories();
  return cats.find((c) => c.slug === slug || c.id === slug) || null;
}
