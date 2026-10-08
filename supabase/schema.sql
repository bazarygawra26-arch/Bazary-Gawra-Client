-- ==============================================================================
-- BAZARY GAWRA (بازاڕی گەورە) - Custom Supabase Database Schema & Functions
-- Project Ref: ydspdazwbansgdtjhvrp
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 2. TABLE: categories
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_ckb TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    icon_name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    item_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. TABLE: sellers
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sellers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    delivery_info TEXT,
    warranty_support TEXT,
    return_window TEXT,
    phone_placeholder TEXT,
    avatar_bg TEXT,
    product_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. TABLE: products
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_ckb TEXT,
    name_ar TEXT,
    category TEXT NOT NULL,
    price NUMERIC NOT NULL,
    currency TEXT DEFAULT 'IQD',
    location TEXT NOT NULL,
    seller_name TEXT NOT NULL,
    seller_location TEXT,
    capacity TEXT,
    power TEXT,
    warranty TEXT,
    delivery_info TEXT,
    return_policy TEXT,
    origin TEXT,
    description TEXT,
    image_url TEXT NOT NULL,
    information_signals JSONB DEFAULT '{}'::jsonb,
    ai_match JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. TABLE: ai_search_queries (Audit trail for natural Kurdish/Arabic AI queries)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_search_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_text TEXT NOT NULL,
    detected_language TEXT,
    parsed_product_type TEXT,
    parsed_location TEXT,
    parsed_budget NUMERIC,
    results_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. TABLE: ai_product_scans (Multimodal Gemini Vision uploads & audits)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_product_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_name TEXT,
    product_type TEXT,
    suggested_category TEXT,
    identified_attributes JSONB DEFAULT '[]'::jsonb,
    available_info JSONB DEFAULT '[]'::jsonb,
    missing_info JSONB DEFAULT '[]'::jsonb,
    draft_title TEXT,
    estimated_price_iqd NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. CUSTOM POSTGRESQL FUNCTIONS
-- ------------------------------------------------------------------------------

-- Function 1: Custom search filtering across English, Kurdish, Arabic & Cities
CREATE OR REPLACE FUNCTION search_products_custom(
    search_term TEXT DEFAULT '',
    city_filter TEXT DEFAULT '',
    max_budget NUMERIC DEFAULT NULL
)
RETURNS SETOF products
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM products
    WHERE (
        search_term = '' 
        OR name ILIKE '%' || search_term || '%'
        OR COALESCE(name_ckb, '') ILIKE '%' || search_term || '%'
        OR COALESCE(name_ar, '') ILIKE '%' || search_term || '%'
        OR category ILIKE '%' || search_term || '%'
        OR description ILIKE '%' || search_term || '%'
    )
    AND (
        city_filter = '' 
        OR location ILIKE '%' || city_filter || '%'
        OR seller_location ILIKE '%' || city_filter || '%'
    )
    AND (
        max_budget IS NULL 
        OR price <= max_budget
    )
    ORDER BY price ASC;
END;
$$;

-- Function 2: Calculate Transparency Score based on merchant disclosures
CREATE OR REPLACE FUNCTION calculate_transparency_score(p_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    p_rec RECORD;
    v_score INTEGER := 0;
    v_missing TEXT[] := ARRAY[]::TEXT[];
BEGIN
    SELECT * INTO p_rec FROM products WHERE id = p_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Product not found');
    END IF;

    -- Check location disclosure
    IF p_rec.seller_location IS NOT NULL AND p_rec.seller_location <> '' THEN
        v_score := v_score + 20;
    ELSE
        v_missing := array_append(v_missing, 'Physical store location not disclosed');
    END IF;

    -- Check warranty disclosure
    IF p_rec.warranty IS NOT NULL AND p_rec.warranty <> 'Information unavailable' THEN
        v_score := v_score + 25;
    ELSE
        v_missing := array_append(v_missing, 'Warranty coverage omitted');
    END IF;

    -- Check delivery options
    IF p_rec.delivery_info IS NOT NULL AND p_rec.delivery_info <> '' THEN
        v_score := v_score + 20;
    ELSE
        v_missing := array_append(v_missing, 'Delivery terms not specified');
    END IF;

    -- Check return policy
    IF p_rec.return_policy IS NOT NULL AND p_rec.return_policy <> 'Not provided' THEN
        v_score := v_score + 20;
    ELSE
        v_missing := array_append(v_missing, 'Return window and refund policy missing');
    END IF;

    -- Check technical specs
    IF (p_rec.capacity IS NOT NULL AND p_rec.capacity <> '') OR (p_rec.power IS NOT NULL AND p_rec.power <> '') THEN
        v_score := v_score + 15;
    ELSE
        v_missing := array_append(v_missing, 'Technical specs incomplete');
    END IF;

    RETURN jsonb_build_object(
        'product_id', p_id,
        'transparency_score', v_score,
        'missing_attributes', to_jsonb(v_missing)
    );
END;
$$;

-- ------------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_search_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_product_scans ENABLE ROW LEVEL SECURITY;

-- Allow public read access to catalog
CREATE POLICY "Public Read Categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public Read Sellers" ON sellers FOR SELECT USING (true);
CREATE POLICY "Public Read Products" ON products FOR SELECT USING (true);
CREATE POLICY "Public Insert AI Queries" ON ai_search_queries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert AI Scans" ON ai_product_scans FOR INSERT WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 9. INITIAL SEED DATA (Curated Kurdistan Products & Verified Merchants)
-- ------------------------------------------------------------------------------

-- Insert Categories
INSERT INTO categories (id, name, name_ckb, name_ar, slug, icon_name, image_url, item_count)
VALUES
('cat-kitchen', 'Kitchen & Home', 'چێشتخانە و ماڵ', 'المطبخ والمنزل', 'kitchen-home', 'UtensilsCrossed', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80', 42),
('cat-coffee', 'Coffee & Espresso', 'قاوە و قاوەساز', 'القهوة والإسبريسو', 'coffee-machines', 'Coffee', 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=600&q=80', 18),
('cat-appliances', 'Home Appliances', 'ئامێرەکانی ناوماڵ', 'الأجهزة المنزلية', 'home-appliances', 'Zap', 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80', 35),
('cat-local-food', 'Local Food & Honey', 'هەنگوین و بەرهەمی خۆماڵی', 'العسل والمنتجات المحلية', 'local-food-honey', 'Sparkles', 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=600&q=80', 29),
('cat-handmade', 'Handmade & Crafts', 'دەستکرد و کەلەپوور', 'الأعمال اليدوية والحرف', 'handmade-crafts', 'HeartHandshake', 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=600&q=80', 24),
('cat-electronics', 'Electronics', 'ئەلیکترۆنیات', 'الإلكترونيات', 'electronics', 'Laptop', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=600&q=80', 50)
ON CONFLICT (id) DO NOTHING;

-- Insert Sellers
INSERT INTO sellers (id, name, location, delivery_info, warranty_support, return_window, phone_placeholder, avatar_bg, product_count)
VALUES
('seller-1', 'Kurdistan Espresso Hub', 'Sulaymaniyah (Mawlawi St)', 'Same-day Sulaymaniyah, 48h Erbil/Duhok', '1 Year Official Local Warranty', '3 Days testing return', '+964 770 123 4567', 'bg-amber-100 text-amber-900', 8),
('seller-2', 'Hawler Tech & Home', 'Erbil (Gulan St)', 'Next-day Erbil delivery, 3,000 IQD', '6 Months Store Warranty', '24 Hours defective replacement', '+964 750 987 6543', 'bg-emerald-100 text-emerald-900', 14),
('seller-3', 'Chrka Home Appliances', 'Sulaymaniyah (Salim St)', 'Free delivery over 150,000 IQD', '2 Years Agency Warranty', '7 Days return policy', '+964 771 456 7890', 'bg-blue-100 text-blue-900', 22),
('seller-4', 'Duhok Roastery & Tools', 'Duhok (KRO District)', 'Duhok local courier, 2,000 IQD', '1 Year Certified Warranty', '3 Days return window', '+964 750 234 5678', 'bg-purple-100 text-purple-900', 6)
ON CONFLICT (id) DO NOTHING;

-- Insert Products
INSERT INTO products (
    id, name, name_ckb, name_ar, category, price, currency, location, 
    seller_name, seller_location, capacity, power, warranty, delivery_info, 
    return_policy, origin, description, image_url, information_signals, ai_match
)
VALUES
(
    'prod-1',
    'DeLonghi Dedica EC685 Espresso Machine',
    'ئامێری قاوەی دێلۆنگی دیدیکا EC685',
    'ماكينة قهوة ديلونجي ديديكا EC685',
    'Coffee & Espresso',
    185000,
    'IQD',
    'Sulaymaniyah (Mawlawi St)',
    'Kurdistan Espresso Hub',
    'Sulaymaniyah, Mawlawi Street, Shop 14',
    '1.1L Water Tank',
    '1350 Watts',
    '1 Year Official Agency Warranty',
    'Same-day delivery across Sulaymaniyah (5,000 IQD)',
    '3-Day replacement if defective',
    'Italy / Made in China',
    'Compact, high-performance pump espresso machine with 15 bar pressure, stainless steel casing, and professional steam wand.',
    'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=600&q=80',
    '{"has_location": true, "has_warranty": true, "has_delivery": true, "has_return_policy": true, "has_specifications": true, "missing_points": []}'::jsonb,
    '{"score": 96, "match_reason": "Matches Sulaymaniyah inventory under 200,000 IQD budget with verified official warranty and same-day delivery.", "highlights": ["Official 1-Year Local Warranty", "Under 200k IQD threshold", "Same-day Sulaymaniyah local delivery"], "cautions": []}'::jsonb
),
(
    'prod-2',
    'Breville Bambino Plus Espresso Maker',
    'ئامێری قاوەی برێڤیڵ بامبینۆ پڵەس',
    'ماكينة قهوة بريفيل بامبينو بلس',
    'Coffee & Espresso',
    345000,
    'IQD',
    'Erbil (Gulan St)',
    'Hawler Tech & Home',
    'Erbil, Gulan Park Plaza',
    '1.9L Water Tank',
    '1560 Watts',
    'Information unavailable',
    'Next-day delivery to Erbil & Sulaymaniyah',
    'Not provided',
    'Australia / EU Spec',
    'Commercial grade 54mm portafilter, 3 second heat up time with ThermoJet system, and automatic microfoam milk texturing.',
    'https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?auto=format&fit=crop&w=600&q=80',
    '{"has_location": true, "has_warranty": false, "has_delivery": true, "has_return_policy": false, "has_specifications": true, "missing_points": ["Warranty terms omitted by merchant", "Return policy not stated"]}'::jsonb,
    '{"score": 84, "match_reason": "High-end thermal performance but exceeds typical budget and lacks verified local warranty documentation.", "highlights": ["ThermoJet 3-second rapid heating", "High capacity 1.9L tank"], "cautions": ["No warranty provided in listing", "Return policy missing"]}'::jsonb
),
(
    'prod-3',
    'Philips Series 2200 Fully Automatic Espresso',
    'ئامێری قاوەی فیلیپس زنجیرەی ٢٢٠٠ ئۆتۆماتیک',
    'ماكينة اسبريسو فيليبس سلسلة 2200 أوتوماتيكية بالكامل',
    'Coffee & Espresso',
    490000,
    'IQD',
    'Sulaymaniyah (Salim St)',
    'Chrka Home Appliances',
    'Sulaymaniyah, Salim Street near Saholaka',
    '1.8L Tank / 275g Bean Hopper',
    '1500 Watts',
    '2 Years Philips Agency Warranty',
    'Free delivery across Kurdistan Region',
    '7 Days refund or replace',
    'Netherlands / Romania Assembly',
    'Intuitive touch display, 12-step ceramic grinder adjustments, AquaClean water filter, and classic milk frother.',
    'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80',
    '{"has_location": true, "has_warranty": true, "has_delivery": true, "has_return_policy": true, "has_specifications": true, "missing_points": []}'::jsonb,
    '{"score": 91, "match_reason": "Complete specification disclosure and 2-year warranty, ideal if full automation is desired.", "highlights": ["2 Years Agency Warranty", "100% Ceramic Grinders", "Free nationwide delivery"], "cautions": ["Higher price bracket"]}'::jsonb
),
(
    'prod-4',
    'Xiaomi Smart Air Fryer Pro 4L',
    'قلاوەرسی هەوایی زیرەکی شیاومی ٤ لیتر',
    'قلاية هوائية ذكية شاومي برو 4 لتر',
    'Home Appliances',
    89000,
    'IQD',
    'Sulaymaniyah (Salim St)',
    'Chrka Home Appliances',
    'Sulaymaniyah, Salim Street',
    '4.0 Liters',
    '1600 Watts',
    '1 Year Official Xiaomi Warranty',
    'Free delivery in Sulaymaniyah, 4,000 IQD Erbil/Duhok',
    '7 Days exchange',
    'China',
    'Transparent window design, 360 degree heated air circulation, 40 to 200 degree celsius temperature control, and OLED screen.',
    'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80',
    '{"has_location": true, "has_warranty": true, "has_delivery": true, "has_return_policy": true, "has_specifications": true, "missing_points": []}'::jsonb,
    '{"score": 94, "match_reason": "Exceptional value under 100k IQD with full warranty and local repair backing.", "highlights": ["Official 1-Year Local Warranty", "Transparent window view", "Sulaymaniyah local pickup"], "cautions": []}'::jsonb
),
(
    'prod-5',
    'Tefal Easy Fry & Grill XXL 6.5L',
    'قلاوەرسی تيفال XXL بە هێزی ٦.٥ لیتر',
    'قلاية وشواية تيفال إيزي فراي XXL سعة 6.5 لتر',
    'Home Appliances',
    155000,
    'IQD',
    'Erbil (Gulan St)',
    'Hawler Tech & Home',
    'Erbil, Gulan Park Plaza',
    '6.5 Liters',
    '1800 Watts',
    'Information unavailable',
    'Delivery available across Erbil (3,000 IQD)',
    'Not provided',
    'France / Assembly China',
    '2-in-1 digital air fryer and die-cast grill with 8 automatic programs, synchronization mode, and XXL capacity for families.',
    'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80',
    '{"has_location": true, "has_warranty": false, "has_delivery": true, "has_return_policy": false, "has_specifications": true, "missing_points": ["Warranty terms missing", "Return policy missing"]}'::jsonb,
    '{"score": 82, "match_reason": "Large family capacity, but warranty and returns are not verified by merchant.", "highlights": ["XXL 6.5L capacity", "Die-cast aluminum grill plate"], "cautions": ["Warranty terms not provided", "No stated return policy"]}'::jsonb
),
(
    'prod-6',
    'Organic Mount Halgurd Wild Honey (1KG)',
    'هەنگوینی شاخی هەڵگورد کێوی (١ کیلۆ)',
    'عسل جبل هلكورد البري الطبيعي (1 كغم)',
    'Local Food & Honey',
    45000,
    'IQD',
    'Duhok (KRO District)',
    'Duhok Roastery & Tools',
    'Duhok, KRO District',
    '1 KG Jar',
    '100% Raw Wild Mountain',
    'Lab Tested Purity Certificate Included',
    '2-Day refrigerated shipping Kurdistan',
    '100% money-back if purity test fails',
    'Kurdistan (Mount Halgurd & Choman)',
    '100% pure wild polyfloral mountain honey harvested from the pristine high-altitude meadows of Mount Halgurd. Lab tested for zero added sugar.',
    'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=600&q=80',
    '{"has_location": true, "has_warranty": true, "has_delivery": true, "has_return_policy": true, "has_specifications": true, "missing_points": []}'::jsonb,
    '{"score": 98, "match_reason": "Authentic regional mountain honey with lab purity guarantee and unconditional refund policy.", "highlights": ["100% Natural Raw Honey", "Lab Tested Certificate", "Money-back guarantee"], "cautions": []}'::jsonb
)
ON CONFLICT (id) DO NOTHING;
