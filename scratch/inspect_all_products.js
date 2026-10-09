const fs = require('fs');

async function dump() {
  const res = await fetch('http://localhost:3000/api/products?limit=100&lang=ku');
  const data = await res.json();
  const list = Array.isArray(data) ? data : data.products;
  const simplified = list.map((p, i) => ({
    index: i + 1,
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    image_url: p.image_url,
    images: p.images
  }));
  fs.writeFileSync('scratch/all_products_dump.json', JSON.stringify(simplified, null, 2), 'utf-8');
  console.log('Successfully dumped', simplified.length, 'products to scratch/all_products_dump.json');
}

dump();
