const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Curated high-resolution fallback gallery images by theme/keywords
const THEMATIC_GALLERIES = {
  coffee: [
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1589396575653-c09c794ff6a6?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=800&q=80',
  ],
  airfryer: [
    'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=800&q=80',
  ],
  tea: [
    'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=800&q=80',
  ],
  honey: [
    'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&w=800&q=80',
  ],
  audio: [
    'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
  ],
  rug: [
    'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  ],
  craft: [
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80',
  ],
  produce: [
    'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
  ],
  heater: [
    'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?auto=format&fit=crop&w=800&q=80',
  ],
  book: [
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
  ],
  default: [
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
  ],
};

function pickGalleryForProduct(slug, searchText) {
  const text = (slug + ' ' + (searchText || '')).toLowerCase();
  if (text.includes('honey') || text.includes('هەنگوین') || text.includes('عسل')) return THEMATIC_GALLERIES.honey;
  if (text.includes('coffee') || text.includes('espresso') || text.includes('jazwa') || text.includes('جەزوە') || text.includes('قاوە')) return THEMATIC_GALLERIES.coffee;
  if (text.includes('airfryer') || text.includes('قلاوەر') || text.includes('fryer')) return THEMATIC_GALLERIES.airfryer;
  if (text.includes('tea') || text.includes('چای') || text.includes('شاي') || text.includes('korkmaz')) return THEMATIC_GALLERIES.tea;
  if (text.includes('speaker') || text.includes('audio') || text.includes('jbl') || text.includes('airpods') || text.includes('headphone')) return THEMATIC_GALLERIES.audio;
  if (text.includes('rug') || text.includes('carpet') || text.includes('kelim') || text.includes('بەرمای') || text.includes('سجاد')) return THEMATIC_GALLERIES.rug;
  if (text.includes('heater') || text.includes('سۆپا') || text.includes('iron') || text.includes('ئوتوو') || text.includes('vacuum') || text.includes('گسک')) return THEMATIC_GALLERIES.heater;
  if (text.includes('walnut') || text.includes('molasses') || text.includes('sumac') || text.includes('soap') || text.includes('دۆشاو') || text.includes('سماق') || text.includes('گوێز')) return THEMATIC_GALLERIES.produce;
  if (text.includes('book') || text.includes('کتێب') || text.includes('پەرتووک') || text.includes('nali') || text.includes('khani')) return THEMATIC_GALLERIES.book;
  if (text.includes('bowl') || text.includes('beads') || text.includes('samovar') || text.includes('تەسبیح') || text.includes('دەستکرد')) return THEMATIC_GALLERIES.craft;
  return THEMATIC_GALLERIES.default;
}

(async () => {
  console.log('Fetching all products from Supabase...');
  const { data: products, error } = await supabase.from('products').select('id, slug, image_url, search_text, specs');
  if (error || !products) {
    console.error('Failed to load products:', error);
    return;
  }
  console.log(`Found ${products.length} products in database.`);

  let totalInserted = 0;
  for (const p of products) {
    const existingImgs = [];
    if (p.image_url) existingImgs.push(p.image_url);
    if (Array.isArray(p.specs?.images)) {
      p.specs.images.forEach(img => {
        if (img && !existingImgs.includes(img)) existingImgs.push(img);
      });
    }

    const themeImages = pickGalleryForProduct(p.slug, p.search_text);
    const combinedGallery = [...existingImgs];
    for (const tImg of themeImages) {
      if (!combinedGallery.includes(tImg) && combinedGallery.length < 4) {
        combinedGallery.push(tImg);
      }
    }

    // Insert into product_images table
    for (let i = 0; i < combinedGallery.length; i++) {
      const imgUrl = combinedGallery[i];
      const isPrimary = i === 0;

      // Check if already in product_images
      const { data: existingRow } = await supabase
        .from('product_images')
        .select('id')
        .eq('product_id', p.id)
        .eq('url', imgUrl)
        .maybeSingle();

      if (!existingRow) {
        const { error: insErr } = await supabase.from('product_images').insert({
          id: uuidv4(),
          product_id: p.id,
          url: imgUrl,
          is_primary: isPrimary,
          sort_order: i + 1,
        });
        if (!insErr) totalInserted++;
      }
    }

    // Also update specs.images so it stays in sync
    const currentSpecs = p.specs || {};
    currentSpecs.images = combinedGallery;
    await supabase.from('products').update({ specs: currentSpecs }).eq('id', p.id);
  }

  console.log(`Finished! Inserted ${totalInserted} gallery records into product_images table and updated specs.images.`);
})();
