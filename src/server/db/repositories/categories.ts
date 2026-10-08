import 'server-only';
import { supabaseAdmin } from '../supabaseAdmin';
import { Category } from '../../../types';
import { mockCategories } from '../../../data/mockData';

export async function findCategories(lang: 'en' | 'ku' | 'ar' = 'ku'): Promise<Category[]> {
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((c: any) => ({
          id: c.id,
          name: c.name_en || c.name || c.slug,
          name_ckb: c.name_ku || c.name_ckb || c.name_en,
          name_ar: c.name_ar || c.name_en,
          slug: c.slug,
          iconName: c.icon || 'tag',
          image: c.image_url || 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80',
          itemCount: 10,
        }));
      }
    } catch (err) {
      console.warn('Repository findCategories error:', err);
    }
  }

  return mockCategories;
}

export async function findCategoryBySlug(slug: string, lang: 'en' | 'ku' | 'ar' = 'ku'): Promise<Category | null> {
  const cats = await findCategories(lang);
  return cats.find((c) => c.slug === slug || c.id === slug) || null;
}
