-- ==============================================================================
-- BAZARY GAWRA (بازاڕی گەورە) - Business Model & Monetization System
-- Migration: 20261009_monetization_seller_plans.sql
-- Run in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ydspdazwbansgdtjhvrp/sql
-- ==============================================================================

-- 1. SELLER PLANS TABLE
CREATE TABLE IF NOT EXISTS seller_plans (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name_en TEXT NOT NULL,
    name_ku TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    price_iqd NUMERIC NOT NULL DEFAULT 0,
    billing_period TEXT NOT NULL DEFAULT 'monthly',
    max_products INTEGER NOT NULL DEFAULT 5,
    can_promote_products BOOLEAN NOT NULL DEFAULT false,
    analytics_tier TEXT NOT NULL DEFAULT 'basic',
    features_en JSONB DEFAULT '[]'::jsonb,
    features_ku JSONB DEFAULT '[]'::jsonb,
    features_ar JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for seller_plans (everyone can view plans)
ALTER TABLE seller_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Plans" ON seller_plans;
CREATE POLICY "Public Read Plans" ON seller_plans FOR SELECT USING (is_active = true);

-- Insert Initial Plans (Free & Pro Seller)
INSERT INTO seller_plans (
    id, slug, name_en, name_ku, name_ar,
    price_iqd, billing_period, max_products, can_promote_products, analytics_tier,
    features_en, features_ku, features_ar, is_active
) VALUES 
(
    'plan_free',
    'free',
    'Free Starter',
    'پلانی بێبەرامبەر (دەستپێک)',
    'البداية المجانية',
    0,
    'monthly',
    5,
    false,
    'basic',
    '["List up to 5 active products", "Basic product listing management", "Standard marketplace visibility", "Basic product view stats"]'::jsonb,
    '["دانانی تا ٥ کاڵای چالاک", "بەڕێوەبردنی سەرەتایی کاڵاکان", "دەرکەوتنی ئاسایی لە بازاڕدا", "ئاماری سەرەتایی بینینەکان"]'::jsonb,
    '["إضافة حتى 5 منتجات نشطة", "إدارة أساسية للمنتجات", "ظهور قياسي في السوق", "إحصائيات مشاهدة أساسية"]'::jsonb,
    true
),
(
    'plan_pro',
    'pro',
    'Pro Merchant',
    'فرۆشیاری پێشکەوتوو (Pro)',
    'التاجر المحترف (Pro)',
    25000,
    'monthly',
    50,
    true,
    'advanced',
    '["List up to 50 active products", "Enhanced seller dashboard and product analytics", "Eligibility to promote and sponsor products", "Additional listing-management and AI tools", "Clear plan status and priority support"]'::jsonb,
    '["دانانی تا ٥٠ کاڵای چالاک", "داشبۆردی پێشکەوتوو و شیکاری بینەران", "مافی سپۆنسەرکردنی کاڵاکان (Promoted)", "ئامرازە پێشکەوتووەکانی ژیری دەستکرد", "پشتگیری خێرا و نوێکردنەوەی مانگانە"]'::jsonb,
    '["إضافة حتى 50 منتجاً نشطاً", "لوحة تحكم متقدمة وتحليلات للمنتجات", "إمكانية ترويج ورعاية المنتجات المميزة", "أدوات الذكاء الاصطناعي المتقدمة", "دعم أولوية وتجديد شهري مرن"]'::jsonb,
    true
)
ON CONFLICT (id) DO UPDATE SET
    price_iqd = EXCLUDED.price_iqd,
    max_products = EXCLUDED.max_products,
    can_promote_products = EXCLUDED.can_promote_products,
    features_en = EXCLUDED.features_en,
    features_ku = EXCLUDED.features_ku,
    features_ar = EXCLUDED.features_ar;

-- 2. SELLER SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS seller_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL REFERENCES seller_plans(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trial', 'past_due', 'canceled', 'expired')),
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
    current_period_end TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
    renewal_date TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
    is_demo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_seller_subscription UNIQUE (seller_id)
);

CREATE INDEX IF NOT EXISTS idx_seller_subscriptions_seller_id ON seller_subscriptions(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_subscriptions_status ON seller_subscriptions(status);

ALTER TABLE seller_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Subscriptions" ON seller_subscriptions;
CREATE POLICY "Public Read Subscriptions" ON seller_subscriptions FOR SELECT USING (true);

-- 3. PRODUCT PROMOTIONS (SPONSORED PRODUCTS) TABLE
CREATE TABLE IF NOT EXISTS product_promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
    promotion_type TEXT NOT NULL DEFAULT 'sponsored_listing',
    price_iqd NUMERIC NOT NULL DEFAULT 5000,
    duration_days INTEGER NOT NULL DEFAULT 7,
    starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ends_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'expired', 'canceled')),
    badge_label_ku TEXT NOT NULL DEFAULT 'بە سپۆنسەر',
    badge_label_en TEXT NOT NULL DEFAULT 'Sponsored',
    badge_label_ar TEXT NOT NULL DEFAULT 'برعاية',
    is_demo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_promotions_product_id ON product_promotions(product_id);
CREATE INDEX IF NOT EXISTS idx_product_promotions_seller_id ON product_promotions(seller_id);
CREATE INDEX IF NOT EXISTS idx_product_promotions_status_ends_at ON product_promotions(status, ends_at);

ALTER TABLE product_promotions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Active Promotions" ON product_promotions;
CREATE POLICY "Public Read Active Promotions" ON product_promotions FOR SELECT USING (status = 'active' AND ends_at > now());

-- 4. MONETIZATION PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS monetization_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES seller_subscriptions(id) ON DELETE SET NULL,
    promotion_id UUID REFERENCES product_promotions(id) ON DELETE SET NULL,
    amount_iqd NUMERIC NOT NULL,
    currency TEXT NOT NULL DEFAULT 'IQD',
    payment_method TEXT NOT NULL DEFAULT 'demo_checkout' CHECK (payment_method IN ('demo_checkout', 'fib', 'fastpay', 'zaincash', 'cash_voucher', 'bank_transfer')),
    payment_status TEXT NOT NULL DEFAULT 'demo_verified' CHECK (payment_status IN ('pending', 'completed', 'demo_verified', 'failed')),
    transaction_reference TEXT,
    notes TEXT,
    verified_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_monetization_payments_seller ON monetization_payments(seller_id);

ALTER TABLE monetization_payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Payments" ON monetization_payments;
CREATE POLICY "Public Read Payments" ON monetization_payments FOR SELECT USING (true);

-- 5. ADD PROMOTION COLUMNS TO PRODUCTS
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_promoted BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS promotion_expires_at TIMESTAMPTZ NULL;

-- 6. SEED DEMO SUBSCRIPTIONS FOR EXISTING MERCHANTS
-- Shop 1 (Sulaymaniyah Home Tech): Pro Plan with Active Promoted Product
DO $$
DECLARE
    v_seller_id UUID;
    v_prod_id UUID;
BEGIN
    SELECT id INTO v_seller_id FROM sellers WHERE slug = 'sulaymaniyah-home-tech' OR name_en ILIKE '%Sulaymaniyah%' LIMIT 1;
    IF v_seller_id IS NOT NULL THEN
        INSERT INTO seller_subscriptions (seller_id, plan_id, status, current_period_start, current_period_end, renewal_date, is_demo)
        VALUES (v_seller_id, 'plan_pro', 'active', now(), now() + interval '30 days', now() + interval '30 days', true)
        ON CONFLICT (seller_id) DO UPDATE SET plan_id = 'plan_pro', status = 'active';

        -- Pick one product of this seller to promote
        SELECT id INTO v_prod_id FROM products WHERE seller_id = v_seller_id LIMIT 1;
        IF v_prod_id IS NOT NULL THEN
            UPDATE products SET is_promoted = true, promotion_expires_at = (now() + interval '7 days') WHERE id = v_prod_id;
            
            INSERT INTO product_promotions (product_id, seller_id, promotion_type, price_iqd, duration_days, starts_at, ends_at, status, is_demo)
            VALUES (v_prod_id, v_seller_id, 'sponsored_listing', 5000, 7, now(), now() + interval '7 days', 'active', true)
            ON CONFLICT DO NOTHING;

            INSERT INTO monetization_payments (seller_id, promotion_id, amount_iqd, payment_method, payment_status, notes)
            VALUES (v_seller_id, (SELECT id FROM product_promotions WHERE product_id = v_prod_id LIMIT 1), 5000, 'demo_checkout', 'demo_verified', 'Initial hackathon demonstration promotion payment');
        END IF;

        -- Also record subscription payment
        INSERT INTO monetization_payments (seller_id, subscription_id, amount_iqd, payment_method, payment_status, notes)
        VALUES (v_seller_id, (SELECT id FROM seller_subscriptions WHERE seller_id = v_seller_id LIMIT 1), 25000, 'demo_checkout', 'demo_verified', 'Pro Merchant Monthly Subscription (Demo)');
    END IF;

    -- Shop 2 (Erbil Modern Appliances): Free Plan
    SELECT id INTO v_seller_id FROM sellers WHERE slug = 'erbil-modern-appliances' OR name_en ILIKE '%Erbil%' LIMIT 1;
    IF v_seller_id IS NOT NULL THEN
        INSERT INTO seller_subscriptions (seller_id, plan_id, status, current_period_start, current_period_end, renewal_date, is_demo)
        VALUES (v_seller_id, 'plan_free', 'active', now(), now() + interval '30 days', now() + interval '30 days', true)
        ON CONFLICT (seller_id) DO UPDATE SET plan_id = 'plan_free', status = 'active';
    END IF;
END $$;
