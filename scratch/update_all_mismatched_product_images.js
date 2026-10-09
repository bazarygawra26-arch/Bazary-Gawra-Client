const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Mismatched products map: Product ID -> { primary, gallery }
const UPDATES = {
  // 1. Xiaomi Smart Air Fryer Pro 4L with Window (ئێر فرایەری ژیری شیاومی پرۆ ٤ لیتر بە جام)
  '95c57c73-799e-4873-ae0f-5a86cbc0cccd': {
    primary: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=1000&q=80',
    ],
  },

  // 2. Air Fryer A (ئێرفرایەری A)
  '915394ee-03d7-4983-acb3-5b20a88e9205': {
    primary: 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=1000&q=80',
    ],
  },

  // 3. Ninja Foodi DualZone Air Fryer 9.5L (ئێر فرایەری دوو بەشی نینجا فودی ٩.٥ لیتر)
  '7343839a-6360-4ba5-9257-f6e6ccffe5b5': {
    primary: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=1000&q=80',
    ],
  },

  // 4. Air Fryer B (ئێرفرایەری B)
  '9f96bf7c-6dcb-4622-a574-9032a845950b': {
    primary: 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=1000&q=80',
    ],
  },

  // 5. Philips Airfryer XXL HD9285 (قلاوەری هەوایی فیلیپس XXL مۆدێلی HD9285)
  '76b4d123-aabf-4657-91c8-68e6ee56e0e2': {
    primary: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=1000&q=80',
    ],
  },

  // 6. Braun MultiQuick 9 Hand Blender (میکسەری دەستی براون مەلتی کویک ٩ بە هێزی ١٢٠٠ وات)
  'ea6fa1a9-738c-4535-b440-0347aa855a83': {
    primary: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=1000&q=80',
    ],
  },

  // 7. Blender A (بلێندەری A)
  'ae791205-7a4f-4abc-9952-dd6f84fad318': {
    primary: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=1000&q=80',
    ],
  },

  // 8. Blender B (بلێندەری B)
  '31863cba-5992-4773-9e85-61135a885eca': {
    primary: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=1000&q=80',
    ],
  },

  // 9. Mountain Honey 1kg (هەنگوینی شاخ ١ کیلۆ - replace base64)
  '84c581be-b696-4a98-897f-ef9ed41d3536': {
    primary: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&w=1000&q=80',
    ],
  },

  // 10. Hawraman Qazwan Wood Prayer Beads (تەسبیحی داری قەزوانی هەورامان ١٠١ دانەیی - replace base64)
  '58167440-3eab-42e1-b7f0-427e26034bd3': {
    primary: 'https://images.unsplash.com/photo-1584441405886-bc91be61e56a?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1584441405886-bc91be61e56a?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1000&q=80',
    ],
  },

  // 11. DSP Turkish Coffee Maker 800W (قاوەسازی تورکی دی ئێس پی ٨٠٠ وات)
  'cbc697e6-851b-4bf9-9e05-de157aa8890e': {
    primary: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?auto=format&fit=crop&w=1000&q=80',
    ],
  },

  // 12. Kumtel 4-Tube Quartz Electric Heater (سۆپای کارەبایی کۆمتێل ٤ مۆم بە تەڕکەرەوە)
  '290ddd4f-985b-41bf-a6a8-3c9b1936bb41': {
    primary: 'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
    ],
  },

  // 13. Tefal Turbo Pro Steam Iron (ئوتووی هەڵمی تەفاڵ توربۆ پرۆ)
  '1f7fb7c5-c442-4f5a-9e73-fb24dfd8ec2d': {
    primary: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=1000&q=80',
    ],
  },

  // 14. Korkmaz Demkolik Turkish Electric Tea Maker (چایدانی کارەبایی کۆرکماز دێمیستیل تورکی - was stethoscope!)
  'd2414efd-ec94-4ce5-b012-60ae9f23cd73': {
    primary: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=1000&q=80',
    ],
  },

  // 15. Handcrafted Kurdish Copper Samovar (سەماوەری مسینی نەخشێنراوی دەستکردی کوردی)
  'f1bc764a-7b39-4218-93ef-1da960e77f67': {
    primary: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=1000&q=80',
    ],
  },

  // 16. Handmade Wool Rug (فەرشی دەستکردی خوری - replace base64)
  'e91da2f8-8a06-4b67-b826-8c5594d961b3': {
    primary: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
    ],
  },

  // 17. DeLonghi Dedica Espresso Machine (ئامێری قاوەی ئێسپرێسۆ دیلۆنگی دێدیکا)
  'ac73faa4-8601-4f5d-97b2-3403f8dcc0c7': {
    primary: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=1000&q=80',
    ],
  },

  // 18. Coffee Machine B (قاوەسازی B)
  'be8c9b6e-59fd-4ae1-b430-a5cd13eb5f03': {
    primary: 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=1000&q=80',
    ],
  },
};

(async () => {
  console.log(`Starting update for ${Object.keys(UPDATES).length} mismatched products in Supabase...`);

  for (const [productId, update] of Object.entries(UPDATES)) {
    console.log(`Processing product ${productId}...`);

    // 1. Get existing specs
    const { data: prod, error: fetchErr } = await supabase
      .from('products')
      .select('specs, slug')
      .eq('id', productId)
      .single();

    if (fetchErr) {
      console.warn(`Could not fetch product ${productId}:`, fetchErr.message);
      continue;
    }

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
      console.error(`Error updating product ${productId}:`, updErr.message);
    } else {
      console.log(`Updated products table for ${prod.slug || productId}`);
    }

    // 3. Clear and re-populate product_images table
    try {
      await supabase.from('product_images').delete().eq('product_id', productId);

      const rows = update.gallery.map((url, idx) => ({
        id: uuidv4(),
        product_id: productId,
        url: url,
        sort_order: idx + 1,
        is_primary: idx === 0,
      }));

      const { error: insErr } = await supabase.from('product_images').insert(rows);
      if (insErr) {
        console.warn(`Warning inserting into product_images for ${productId}:`, insErr.message);
      } else {
        console.log(`Inserted ${rows.length} gallery images in product_images for ${productId}`);
      }
    } catch (galErr) {
      console.warn(`Gallery table error for ${productId}:`, galErr);
    }
  }

  console.log('Finished updating all mismatched products in Supabase!');
})();
