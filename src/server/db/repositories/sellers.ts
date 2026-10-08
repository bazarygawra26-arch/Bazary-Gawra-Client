import 'server-only';
import { supabaseAdmin } from '../supabaseAdmin';
import { Seller } from '../../../types';
import { mockSellers } from '../../../data/mockData';

export async function findSellers(lang: 'en' | 'ku' | 'ar' = 'ku'): Promise<Seller[]> {
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('sellers')
        .select(`
          id,
          slug,
          name_en,
          name_ku,
          name_ar,
          description_en,
          description_ku,
          description_ar,
          address,
          phone,
          whatsapp,
          verification_status,
          is_active,
          locations (
            name_en,
            name_ku,
            name_ar
          )
        `)
        .eq('is_active', true);

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((s: any) => {
          const locObj = s.locations;
          const locName =
            lang === 'ku'
              ? (locObj?.name_ku || s.address || 'کوردستان')
              : lang === 'ar'
              ? (locObj?.name_ar || s.address || 'كوردستان')
              : (locObj?.name_en || s.address || 'Kurdistan');

          const name =
            lang === 'ku'
              ? (s.name_ku || s.name_en)
              : lang === 'ar'
              ? (s.name_ar || s.name_en)
              : s.name_en;

          return {
            id: s.slug || s.id,
            name: name,
            location: locName,
            productCount: 8,
            delivery_info: 'Local fast delivery available',
            warranty_support: 'Official local warranty support',
            return_window: '3 to 7 days replacement window',
            phone_placeholder: s.phone || s.whatsapp || '+964 770 000 0000',
            avatar_bg: 'from-amber-500 to-amber-700',
            description: lang === 'ku' ? s.description_ku : lang === 'ar' ? s.description_ar : s.description_en,
          };
        });
      }
    } catch (err) {
      console.warn('Repository findSellers error, using fallback:', err);
    }
  }

  return mockSellers;
}

export async function findSellerBySlug(slug: string, lang: 'en' | 'ku' | 'ar' = 'ku'): Promise<Seller | null> {
  const all = await findSellers(lang);
  return all.find((s) => s.id === slug || s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug.toLowerCase()) || null;
}
