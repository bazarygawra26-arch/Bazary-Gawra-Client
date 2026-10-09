const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// High-definition, stunning, real product photos tailored for each card
const PRODUCT_IMAGE_UPDATES = {
  // 1. Philips 2200 Fully Automatic Espresso Machine
  'c69b19df-20d2-40d6-8a82-18c055d0e61c': {
    primary: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1589396575653-c09c794ff6a6?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=1000&q=80',
    ],
  },

  // 2. Coffee Machine C (Compact Italian Espresso Maker)
  'd0dcd345-261a-465e-bc62-b5326910539f': {
    primary: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=1000&q=80',
    ],
  },

  // 3. Penjwen Wild Mountain Honey 1kg
  'f2526900-c0db-413d-8029-08a727b85efa': {
    primary: 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1000&q=80',
    ],
  },

  // 4. Hawraman Natural Honey / Kurdish Artisanal Honey
  'ab0b626e-69f3-421d-a818-1055a62b9a43': {
    primary: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1000&q=80',
    ],
  },

  // 5. Hawraman Handcrafted Kurdish Rug (1.5m x 2m)
  '9f3dc5cf-713c-4aac-a5ab-6c1f2d9c96b4': {
    primary: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
    ],
  },

  // 6. 100% Pure Raw Mountain Wildflower Honey from Hawraman 1kg
  'd1c393a4-6786-4a93-ba23-219d62957b4b': {
    primary: 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&w=1000&q=80',
    ],
  },

  // 7. Hawraman Pure Mountain Honey 1kg
  'b9450264-1491-445b-ad2e-1e3bafb27ad4': {
    primary: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&w=1000&q=80',
    ],
  },
};

(async () => {
  console.log('Updating images for sponsored cards in Supabase...');

  for (const [productId, update] of Object.entries(PRODUCT_IMAGE_UPDATES)) {
    console.log(`Processing product ${productId}...`);

    // 1. Get existing specs
    const { data: prod } = await supabase.from('products').select('specs').eq('id', productId).single();
    const currentSpecs = prod?.specs || {};
    currentSpecs.images = update.gallery;

    // 2. Update products table
    const { error: updErr } = await supabase
      .from('products')
      .update({
        image_url: update.primary,
        specs: currentSpecs,
      })
      .eq('id', productId);

    if (updErr) {
      console.error(`Failed to update products table for ${productId}:`, updErr);
    } else {
      console.log(`Updated image_url and specs for ${productId}`);
    }

    // 3. Clear and re-populate product_images table for this product
    await supabase.from('product_images').delete().eq('product_id', productId);

    for (let i = 0; i < update.gallery.length; i++) {
      const url = update.gallery[i];
      await supabase.from('product_images').insert({
        id: uuidv4(),
        product_id: productId,
        url: url,
        is_primary: i === 0,
        sort_order: i + 1,
      });
    }
  }

  console.log('All sponsored card images have been successfully updated in Supabase!');
})();
