-- ==============================================================================
-- BAZARY GAWRA (بازاڕی گەورە) - Discounts, Reklam (Promotions) & Product Feedback
-- Migration: 20261009_discounts_reklam_feedback.sql
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ydspdazwbansgdtjhvrp/sql
-- ==============================================================================

-- 1. ADD DISCOUNT SUPPORT TO PRODUCTS
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS original_price NUMERIC NULL;

-- 2. CREATE PROMOTIONS (ڕیکلام / REKLAM) TABLE
CREATE TABLE IF NOT EXISTS promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title_en TEXT NOT NULL,
    title_ku TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    subtitle_en TEXT,
    subtitle_ku TEXT,
    subtitle_ar TEXT,
    badge_en TEXT DEFAULT 'Featured Offer',
    badge_ku TEXT DEFAULT 'داشکاندنی تایبەت',
    badge_ar TEXT DEFAULT 'عرض خاص',
    image_url TEXT NOT NULL,
    link_url TEXT NOT NULL,
    seller_id UUID REFERENCES sellers(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS and public read for promotions
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Promotions" ON promotions;
CREATE POLICY "Public Read Promotions" ON promotions FOR SELECT USING (is_active = true);

-- 3. CREATE PRODUCT FEEDBACK / REVIEWS TABLE
CREATE TABLE IF NOT EXISTS product_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    customer_name TEXT NOT NULL,
    customer_city TEXT DEFAULT 'Kurdistan',
    comment TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookup by product
CREATE INDEX IF NOT EXISTS idx_product_feedback_product_id ON product_feedback(product_id);

-- Enable RLS for product_feedback
ALTER TABLE product_feedback ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Product Feedback" ON product_feedback;
CREATE POLICY "Public Read Product Feedback" ON product_feedback FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Insert Product Feedback" ON product_feedback;
CREATE POLICY "Public Insert Product Feedback" ON product_feedback FOR INSERT WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 4. INITIAL SEED DATA
-- ------------------------------------------------------------------------------

-- Insert Sample Kurdish Promotional Banners (ڕیکلام)
INSERT INTO promotions (
    slug, title_en, title_ku, title_ar,
    subtitle_en, subtitle_ku, subtitle_ar,
    badge_en, badge_ku, badge_ar,
    image_url, link_url, sort_order, is_active
) VALUES
(
    'kurdish-literature-festival',
    'Kurdish Book & Heritage Season',
    'وەرزی کتێب و شاکارە ئەدەبییەکان',
    'موسم الكتاب والتراث الكردي',
    'Discover classic works like Mem û Zîn and Diwani Nali delivered to your doorstep',
    'شاکارە دەگمەنەکانی مەم و زین و دیوانی نالی بە گەیاندنی خێرا بۆ هەموو کوردستان',
    'اكتشف روائع الأدب الكردي مثل مم وزين وديوان نالي مع توصيل سريع',
    'New Category',
    'پۆلی نوێ: کتێب',
    'قسم جديد: كتب',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80',
    '/ku?category=books',
    1,
    true
),
(
    'kitchen-appliances-super-deals',
    'Autumn Kitchen & Coffee Deals',
    'داشکاندنی وەرزی بۆ ئامێرەکانی چێشتخانە و قاوە',
    'تخفيضات الخريف لأجهزة المطبخ والقهوة',
    'Save up to 25% on DeLonghi, Ninja & Philips smart kitchen devices with local warranty',
    'تا ٢٥٪ داشکاندن لەسەر ئامێرە براندەکان بە گەرەنتی فەرمی بریکار',
    'وفر حتى 25% على أجهزة المطبخ والقهوة مع ضمان رسمي معتمد',
    'Special Deals',
    'داشکاندنی گەورە',
    'عروض خاصة',
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
    '/ku?category=kitchen-home',
    2,
    true
),
(
    'pure-hawraman-honey-harvest',
    'Pure Mountain Honey Fresh Harvest',
    'بەرهەمی تازەی هەنگوینی کێوی هەورامان و پێنجوێن',
    'عسل هورامان الجبلي الطبيعي - قطفة جديدة',
    '100% Raw, Lab-tested mountain honey directly from local Kurdistan beekeepers',
    '١٠٠٪ سروشتی بە گەرەنتی پشکنینی تاقیگە و گەیاندنی بێبەرامبەر',
    'عسل طبيعي 100% مفحوص مخبرياً من مناحل كوردستان مباشرة',
    '100% Organic',
    'خۆماڵی و پاک',
    'طبيعي 100%',
    'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=1200&q=80',
    '/ku?category=local-food-honey',
    3,
    true
)
ON CONFLICT (slug) DO NOTHING;

-- Update realistic original_price on a few existing products to show active discounts
UPDATE products 
SET original_price = 215000 
WHERE slug = 'delonghi-dedica-ec685';

UPDATE products 
SET original_price = 145000 
WHERE slug = 'xiaomi-smart-air-fryer-pro-4l';

UPDATE products 
SET original_price = 25000 
WHERE slug = 'mem-u-zin-ahmad-khani';

UPDATE products 
SET original_price = 28000 
WHERE slug = 'diwani-nali-sulaymaniyah';

UPDATE products 
SET original_price = 55000 
WHERE slug = 'penjwen-wild-mountain-honey-1kg';
