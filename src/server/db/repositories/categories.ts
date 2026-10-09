import 'server-only';
import { supabaseAdmin } from '../supabaseAdmin';
import { Category, SubCategory } from '../../../types';
import { localizeCategory } from '../../../lib/i18nData';

const defaultCategoryImages: Record<string, string> = {
  'kitchen-home': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
  'home-appliances': 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=600&q=80',
  'electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=600&q=80',
  'handmade-crafts': 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=600&q=80',
  'beauty-personal-care': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
  'local-food-honey': 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=600&q=80',
  'books': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
  'other': 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
};

const defaultCategoryIcons: Record<string, string> = {
  'kitchen-home': 'UtensilsCrossed',
  'home-appliances': 'Zap',
  'electronics': 'Laptop',
  'handmade-crafts': 'HeartHandshake',
  'beauty-personal-care': 'Sparkles',
  'beauty': 'Sparkles',
  'local-food-honey': 'Sparkles',
  'books': 'BookOpen',
  'other': 'Layers',
};

export async function findCategories(lang: 'en' | 'ku' | 'ar' = 'ku'): Promise<Category[]> {
  if (supabaseAdmin) {
    try {
      const [catResult, prodResult] = await Promise.all([
        supabaseAdmin
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true }),
        supabaseAdmin
          .from('products')
          .select('id, category_id, status')
          .eq('status', 'active'),
      ]);

      const catRows = catResult.data as any[] | null;
      const prodRows: any[] = Array.isArray(prodResult.data) ? (prodResult.data as any[]) : [];

      if (!catResult.error && Array.isArray(catRows)) {
        // Tally products per category ID
        const countsByCatId: Record<string, number> = {};
        for (const p of prodRows) {
          if (p.category_id) {
            countsByCatId[p.category_id] = (countsByCatId[p.category_id] || 0) + 1;
          }
        }

        // Separate top-level and subcategories
        const topLevelRows = catRows.filter(
          (c: any) =>
            !c.parent_id &&
            c.slug !== 'clothing' &&
            c.slug !== 'food-honey' &&
            c.slug !== 'local-products' &&
            c.slug !== 'handmade' &&
            c.slug !== 'beauty' &&
            c.slug !== 'beauty-personal-care' &&
            !c.slug.includes('beauty')
        );

        const subCategoryRows = catRows.filter((c: any) => !!c.parent_id);

        return topLevelRows.map((c: any) => {
          const directCount = countsByCatId[c.id] || 0;

          // Find direct subcategories belonging to this top-level category
          const childSubs: SubCategory[] = subCategoryRows
            .filter((sub: any) => sub.parent_id === c.id)
            .map((sub: any) => {
              const subCount = countsByCatId[sub.id] || 0;
              const subEnName = sub.name_en || sub.name || sub.slug;
              const subCkbName = sub.name_ku || sub.name_ckb || localizeCategory(sub.slug, 'ku');
              const subArName = sub.name_ar || localizeCategory(sub.slug, 'ar');
              const subActiveName = lang === 'ku' ? subCkbName : lang === 'ar' ? subArName : subEnName;
              return {
                id: sub.id,
                name: subActiveName,
                name_en: subEnName,
                name_ckb: subCkbName,
                name_ar: subArName,
                slug: sub.slug,
                iconName: sub.icon || 'Tag',
                image: sub.image_url || defaultCategoryImages[sub.slug],
                itemCount: subCount,
              };
            });

          // Compute total count including subcategory products
          const totalCount =
            directCount + childSubs.reduce((acc, sub) => acc + (sub.itemCount || 0), 0);

          const enName = c.name_en || c.name || c.slug;
          const ckbName = c.name_ku || c.name_ckb || localizeCategory(c.slug, 'ku');
          const arName = c.name_ar || localizeCategory(c.slug, 'ar');
          const activeName = lang === 'ku' ? ckbName : lang === 'ar' ? arName : enName;

          return {
            id: c.id,
            name: activeName,
            name_en: enName,
            name_ckb: ckbName,
            name_ar: arName,
            slug: c.slug,
            iconName: c.icon || defaultCategoryIcons[c.slug] || 'Layers',
            image:
              c.image_url ||
              defaultCategoryImages[c.slug] ||
              'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
            itemCount: totalCount,
            subcategories: childSubs.length > 0 ? childSubs : undefined,
          };
        });
      }
    } catch (err) {
      console.warn('Repository findCategories error:', err);
    }
  }

  return [];
}

export async function findCategoryBySlug(slug: string, lang: 'en' | 'ku' | 'ar' = 'ku'): Promise<Category | null> {
  const cats = await findCategories(lang);

  // Exact match on top-level
  const direct = cats.find((c) => c.slug === slug || c.id === slug);
  if (direct) return direct;

  // Match on alias
  const aliasMap: Record<string, string> = {
    'beauty-personal-care': 'beauty',
    'beauty': 'beauty-personal-care',
    'kitchen-appliances': 'kitchen-home',
    'traditional-crafts': 'handmade-crafts',
    'handmade': 'handmade-crafts',
    'food-honey': 'local-food-honey',
    'local-products': 'local-food-honey',
  };
  const mappedSlug = aliasMap[slug];
  if (mappedSlug) {
    const aliased = cats.find((c) => c.slug === mappedSlug || c.id === mappedSlug);
    if (aliased) return aliased;
  }

  // Check if it matches a subcategory, and return a synthesized Category representation
  for (const parent of cats) {
    if (parent.subcategories) {
      const sub = parent.subcategories.find((s) => s.slug === slug || s.id === slug);
      if (sub) {
        return {
          id: sub.id,
          name: sub.name,
          name_ckb: sub.name_ckb,
          name_ar: sub.name_ar,
          slug: sub.slug,
          iconName: sub.iconName || parent.iconName,
          image: sub.image || parent.image,
          itemCount: sub.itemCount || 0,
        };
      }
    }
  }

  return null;
}
