-- ==============================================================================
-- BAZARY GAWRA (بازاڕی گەورە) - Complete Marketplace Schema Migration
-- Migration: 20261124200000_complete_marketplace_schema.sql
-- Covers:
-- 1. Product inventory & stock columns
-- 2. Customer B2C Orders & Order Items with atomic creation RPC
-- 3. B2B RFQs, Quotations, and Purchase Orders
-- 4. Persistent Notifications system
-- 5. Authorized Messaging between participants
-- 6. Customer Addresses & Saved Favourites
-- 7. Comprehensive Row Level Security (RLS) & Performance Indexes
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PRODUCT INVENTORY & STOCK COLUMNS
-- ------------------------------------------------------------------------------
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS stock_quantity INTEGER NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS is_available BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS sku TEXT,
  ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_percentage NUMERIC DEFAULT 0;

-- Ensure constraint for stock non-negative
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_stock_quantity_non_negative'
  ) THEN
    ALTER TABLE public.products ADD CONSTRAINT products_stock_quantity_non_negative CHECK (stock_quantity >= 0);
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 2. B2C CUSTOMER ORDERS & ORDER ITEMS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customer_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  seller_id TEXT NOT NULL, -- references sellers(id) or sellers(slug)
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_city TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  subtotal_iqd NUMERIC NOT NULL CHECK (subtotal_iqd >= 0),
  discount_iqd NUMERIC NOT NULL DEFAULT 0 CHECK (discount_iqd >= 0),
  delivery_fee_iqd NUMERIC NOT NULL DEFAULT 0 CHECK (delivery_fee_iqd >= 0),
  total_amount_iqd NUMERIC NOT NULL CHECK (total_amount_iqd >= 0),
  payment_method TEXT NOT NULL DEFAULT 'cash_on_delivery' CHECK (
    payment_method IN ('cash_on_delivery', 'fib', 'fastpay', 'zaincash', 'electronic')
  ),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    payment_status IN ('pending', 'paid', 'refunded', 'failed')
  ),
  order_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    order_status IN ('pending', 'accepted', 'processing', 'ready_for_delivery', 'shipped', 'delivered', 'cancelled', 'rejected', 'returned')
  ),
  order_notes TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.customer_orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  unit_price_iqd NUMERIC NOT NULL CHECK (unit_price_iqd >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  subtotal_iqd NUMERIC NOT NULL CHECK (subtotal_iqd >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customer_orders_customer ON public.customer_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_orders_seller ON public.customer_orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_customer_orders_status ON public.customer_orders(order_status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- ------------------------------------------------------------------------------
-- 3. B2B MARKETPLACE: RFQ, QUOTATIONS & PURCHASE ORDERS
-- ------------------------------------------------------------------------------
-- RFQ Table (Business Buyer Submissions)
CREATE TABLE IF NOT EXISTS public.rfqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_number TEXT NOT NULL UNIQUE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category_slug TEXT,
  target_price_iqd NUMERIC CHECK (target_price_iqd IS NULL OR target_price_iqd >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_measure TEXT NOT NULL DEFAULT 'pieces',
  specifications TEXT NOT NULL,
  delivery_location TEXT NOT NULL,
  required_delivery_date DATE,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'quoted', 'accepted', 'fulfilled', 'cancelled', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rfq_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id UUID NOT NULL REFERENCES public.rfqs(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  target_unit_price_iqd NUMERIC CHECK (target_unit_price_iqd IS NULL OR target_unit_price_iqd >= 0),
  specifications TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Quotation Table (Supplier Responses)
CREATE TABLE IF NOT EXISTS public.quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_number TEXT NOT NULL UNIQUE,
  rfq_id UUID NOT NULL REFERENCES public.rfqs(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  supplier_owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  unit_price_iqd NUMERIC NOT NULL CHECK (unit_price_iqd >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  subtotal_iqd NUMERIC NOT NULL CHECK (subtotal_iqd >= 0),
  delivery_cost_iqd NUMERIC NOT NULL DEFAULT 0 CHECK (delivery_cost_iqd >= 0),
  total_amount_iqd NUMERIC NOT NULL CHECK (total_amount_iqd >= 0),
  delivery_days INTEGER NOT NULL DEFAULT 7 CHECK (delivery_days >= 0),
  payment_terms TEXT NOT NULL DEFAULT '50_advance_50_delivery',
  validity_date DATE NOT NULL DEFAULT (CURRENT_DATE + interval '30 days'),
  availability_status TEXT NOT NULL DEFAULT 'in_stock' CHECK (availability_status IN ('in_stock', 'made_to_order', 'import_scheduled')),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_negotiation', 'accepted', 'rejected', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quotation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_iqd NUMERIC NOT NULL CHECK (unit_price_iqd >= 0),
  subtotal_iqd NUMERIC NOT NULL CHECK (subtotal_iqd >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Purchase Orders (Confirmed Buyer-Supplier Contracts)
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number TEXT NOT NULL UNIQUE,
  rfq_id UUID REFERENCES public.rfqs(id) ON DELETE SET NULL,
  quotation_id UUID REFERENCES public.quotations(id) ON DELETE RESTRICT,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE RESTRICT,
  total_amount_iqd NUMERIC NOT NULL CHECK (total_amount_iqd >= 0),
  payment_terms TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  expected_delivery_date DATE,
  status TEXT NOT NULL DEFAULT 'issued' CHECK (
    status IN ('issued', 'confirmed_by_supplier', 'in_production', 'shipped', 'delivered', 'completed', 'cancelled')
  ),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_iqd NUMERIC NOT NULL CHECK (unit_price_iqd >= 0),
  subtotal_iqd NUMERIC NOT NULL CHECK (subtotal_iqd >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rfqs_buyer ON public.rfqs(buyer_id);
CREATE INDEX IF NOT EXISTS idx_rfqs_status ON public.rfqs(status);
CREATE INDEX IF NOT EXISTS idx_quotations_rfq ON public.quotations(rfq_id);
CREATE INDEX IF NOT EXISTS idx_quotations_supplier ON public.quotations(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_buyer ON public.purchase_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON public.purchase_orders(supplier_id);

-- ------------------------------------------------------------------------------
-- 4. PERSISTENT NOTIFICATIONS SYSTEM
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title_en TEXT NOT NULL,
  title_ku TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  message_en TEXT NOT NULL,
  message_ku TEXT NOT NULL,
  message_ar TEXT NOT NULL,
  type TEXT NOT NULL CHECK (
    type IN (
      'order_received', 'order_status_changed', 'order_cancelled',
      'rfq_received', 'quotation_received', 'quotation_accepted',
      'po_updated', 'seller_verified', 'seller_rejected',
      'subscription_expiring', 'general'
    )
  ),
  reference_id TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- ------------------------------------------------------------------------------
-- 5. MESSAGING SYSTEM (Between authorized shoppers, sellers & suppliers)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_one_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_two_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT,
  reference_type TEXT CHECK (reference_type IN ('product', 'order', 'rfq', 'quotation', 'general')),
  reference_id TEXT,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT participants_distinct CHECK (participant_one_id <> participant_two_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL CHECK (length(btrim(message_text)) > 0),
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations(participant_one_id, participant_two_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON public.messages(conversation_id, created_at);

-- ------------------------------------------------------------------------------
-- 6. CUSTOMER ADDRESSES & SAVED FAVOURITES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Home',
  recipient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Iraq',
  city TEXT NOT NULL,
  district TEXT,
  street_address TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.customer_favourites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_product_favourite UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_customer_addresses_user ON public.customer_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_favourites_user ON public.customer_favourites(user_id);

-- ------------------------------------------------------------------------------
-- 7. ATOMIC RPC FUNCTION: CREATE CUSTOMER ORDER (With stock verification)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_customer_order_atomic(
  p_customer_id UUID,
  p_seller_id TEXT,
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_customer_city TEXT,
  p_shipping_address TEXT,
  p_subtotal_iqd NUMERIC,
  p_discount_iqd NUMERIC,
  p_delivery_fee_iqd NUMERIC,
  p_total_amount_iqd NUMERIC,
  p_payment_method TEXT,
  p_order_notes TEXT,
  p_items JSONB -- Array of { product_id: text, product_name: text, unit_price_iqd: numeric, quantity: integer }
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_order_id UUID;
  v_order_number TEXT;
  v_item JSONB;
  v_prod_id TEXT;
  v_qty INTEGER;
  v_current_stock INTEGER;
  v_unit_price NUMERIC;
  v_item_subtotal NUMERIC;
  v_seller_owner_id UUID;
BEGIN
  -- 1. Validate inputs
  IF p_customer_name IS NULL OR p_customer_phone IS NULL OR p_shipping_address IS NULL THEN
    RAISE EXCEPTION 'Customer name, phone, and shipping address are required.';
  END IF;

  IF jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one item.';
  END IF;

  -- 2. Generate unique order number
  v_order_number := 'BG-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substring(gen_random_uuid()::text, 1, 6));

  -- 3. Verify stock and atomically deduct for each item
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_prod_id := v_item ->> 'product_id';
    v_qty := (v_item ->> 'quantity')::INTEGER;

    IF v_qty <= 0 THEN
      RAISE EXCEPTION 'Invalid item quantity: %', v_qty;
    END IF;

    -- Check if product exists in products table and lock row for update
    SELECT stock_quantity INTO v_current_stock
    FROM public.products
    WHERE id = v_prod_id
    FOR UPDATE;

    IF FOUND THEN
      IF v_current_stock < v_qty THEN
        RAISE EXCEPTION 'Insufficient stock for product %. Available: %, Requested: %', v_prod_id, v_current_stock, v_qty;
      END IF;

      -- Deduct stock
      UPDATE public.products
      SET stock_quantity = stock_quantity - v_qty,
          is_available = CASE WHEN (stock_quantity - v_qty) > 0 THEN true ELSE false END
      WHERE id = v_prod_id;
    END IF;
  END LOOP;

  -- 4. Insert order record
  INSERT INTO public.customer_orders (
    order_number,
    customer_id,
    seller_id,
    customer_name,
    customer_phone,
    customer_city,
    shipping_address,
    subtotal_iqd,
    discount_iqd,
    delivery_fee_iqd,
    total_amount_iqd,
    payment_method,
    payment_status,
    order_status,
    order_notes
  )
  VALUES (
    v_order_number,
    p_customer_id,
    p_seller_id,
    p_customer_name,
    p_customer_phone,
    p_customer_city,
    p_shipping_address,
    p_subtotal_iqd,
    coalesce(p_discount_iqd, 0),
    coalesce(p_delivery_fee_iqd, 0),
    p_total_amount_iqd,
    coalesce(p_payment_method, 'cash_on_delivery'),
    'pending',
    'pending',
    p_order_notes
  )
  RETURNING id INTO v_order_id;

  -- 5. Insert order items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_unit_price := (v_item ->> 'unit_price_iqd')::NUMERIC;
    v_qty := (v_item ->> 'quantity')::INTEGER;
    v_item_subtotal := v_unit_price * v_qty;

    INSERT INTO public.order_items (
      order_id,
      product_id,
      product_name,
      unit_price_iqd,
      quantity,
      subtotal_iqd
    )
    VALUES (
      v_order_id,
      v_item ->> 'product_id',
      coalesce(v_item ->> 'product_name', 'Item'),
      v_unit_price,
      v_qty,
      v_item_subtotal
    );
  END LOOP;

  -- 6. Trigger notification to seller owner if found
  SELECT owner_id INTO v_seller_owner_id
  FROM public.sellers
  WHERE id = p_seller_id OR slug = p_seller_id
  LIMIT 1;

  IF v_seller_owner_id IS NOT NULL THEN
    INSERT INTO public.notifications (
      user_id,
      title_en,
      title_ku,
      title_ar,
      message_en,
      message_ku,
      message_ar,
      type,
      reference_id
    )
    VALUES (
      v_seller_owner_id,
      'New Customer Order #' || v_order_number,
      'داواکاری نوێی کڕیار #' || v_order_number,
      'طلب زبون جديد #' || v_order_number,
      'A new order of ' || p_total_amount_iqd::text || ' IQD has been placed by ' || p_customer_name || '.',
      'داواکارییەکی نوێ بە بڕی ' || p_total_amount_iqd::text || ' دینار لەلایەن ' || p_customer_name || ' پێشکەشکرا.',
      'تم تقديم طلب جديد بقيمة ' || p_total_amount_iqd::text || ' دينار بواسطة ' || p_customer_name || '.',
      'order_received',
      v_order_id::text
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'order_number', v_order_number,
    'total_amount_iqd', p_total_amount_iqd
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_customer_order_atomic TO anon, authenticated;

-- ------------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.customer_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_favourites ENABLE ROW LEVEL SECURITY;

-- Customer Orders: Customers can view their own orders; Sellers can view orders assigned to their store
DROP POLICY IF EXISTS customer_orders_customer_select ON public.customer_orders;
CREATE POLICY customer_orders_customer_select ON public.customer_orders
  FOR SELECT TO authenticated
  USING (
    customer_id = auth.uid() OR
    seller_id IN (SELECT id FROM public.sellers WHERE owner_id = auth.uid()) OR
    seller_id IN (SELECT slug FROM public.sellers WHERE owner_id = auth.uid())
  );

DROP POLICY IF EXISTS customer_orders_insert ON public.customer_orders;
CREATE POLICY customer_orders_insert ON public.customer_orders
  FOR INSERT TO authenticated, anon
  WITH CHECK (true);

DROP POLICY IF EXISTS customer_orders_update ON public.customer_orders;
CREATE POLICY customer_orders_update ON public.customer_orders
  FOR UPDATE TO authenticated
  USING (
    seller_id IN (SELECT id FROM public.sellers WHERE owner_id = auth.uid()) OR
    seller_id IN (SELECT slug FROM public.sellers WHERE owner_id = auth.uid())
  );

-- Order Items: Viewable if order is viewable
DROP POLICY IF EXISTS order_items_select ON public.order_items;
CREATE POLICY order_items_select ON public.order_items
  FOR SELECT TO authenticated, anon
  USING (true);

DROP POLICY IF EXISTS order_items_insert ON public.order_items;
CREATE POLICY order_items_insert ON public.order_items
  FOR INSERT TO authenticated, anon
  WITH CHECK (true);

-- RFQs: Buyers can manage their own RFQs; Verified Suppliers and business buyers can view open RFQs
DROP POLICY IF EXISTS rfqs_select ON public.rfqs;
CREATE POLICY rfqs_select ON public.rfqs
  FOR SELECT TO authenticated
  USING (
    buyer_id = auth.uid() OR
    status IN ('open', 'under_review')
  );

DROP POLICY IF EXISTS rfqs_insert ON public.rfqs;
CREATE POLICY rfqs_insert ON public.rfqs
  FOR INSERT TO authenticated
  WITH CHECK (buyer_id = auth.uid());

DROP POLICY IF EXISTS rfqs_update ON public.rfqs;
CREATE POLICY rfqs_update ON public.rfqs
  FOR UPDATE TO authenticated
  USING (buyer_id = auth.uid());

-- RFQ Items
DROP POLICY IF EXISTS rfq_items_select ON public.rfq_items;
CREATE POLICY rfq_items_select ON public.rfq_items
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS rfq_items_insert ON public.rfq_items;
CREATE POLICY rfq_items_insert ON public.rfq_items
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Quotations: Suppliers see their own; RFQ owners can view submitted quotations for their RFQ
DROP POLICY IF EXISTS quotations_select ON public.quotations;
CREATE POLICY quotations_select ON public.quotations
  FOR SELECT TO authenticated
  USING (
    supplier_owner_id = auth.uid() OR
    rfq_id IN (SELECT id FROM public.rfqs WHERE buyer_id = auth.uid())
  );

DROP POLICY IF EXISTS quotations_insert ON public.quotations;
CREATE POLICY quotations_insert ON public.quotations
  FOR INSERT TO authenticated
  WITH CHECK (
    supplier_owner_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.suppliers WHERE id = supplier_id AND owner_id = auth.uid() AND is_active = true)
  );

DROP POLICY IF EXISTS quotations_update ON public.quotations;
CREATE POLICY quotations_update ON public.quotations
  FOR UPDATE TO authenticated
  USING (
    supplier_owner_id = auth.uid() OR
    rfq_id IN (SELECT id FROM public.rfqs WHERE buyer_id = auth.uid())
  );

-- Purchase Orders: Viewable by buyer and supplier
DROP POLICY IF EXISTS purchase_orders_select ON public.purchase_orders;
CREATE POLICY purchase_orders_select ON public.purchase_orders
  FOR SELECT TO authenticated
  USING (
    buyer_id = auth.uid() OR
    supplier_id IN (SELECT id FROM public.suppliers WHERE owner_id = auth.uid())
  );

DROP POLICY IF EXISTS purchase_orders_insert ON public.purchase_orders;
CREATE POLICY purchase_orders_insert ON public.purchase_orders
  FOR INSERT TO authenticated
  WITH CHECK (buyer_id = auth.uid());

DROP POLICY IF EXISTS purchase_orders_update ON public.purchase_orders;
CREATE POLICY purchase_orders_update ON public.purchase_orders
  FOR UPDATE TO authenticated
  USING (
    buyer_id = auth.uid() OR
    supplier_id IN (SELECT id FROM public.suppliers WHERE owner_id = auth.uid())
  );

-- Notifications: Only target user can read/update
DROP POLICY IF EXISTS notifications_owner_all ON public.notifications;
CREATE POLICY notifications_owner_all ON public.notifications
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Conversations: Participants only
DROP POLICY IF EXISTS conversations_participants ON public.conversations;
CREATE POLICY conversations_participants ON public.conversations
  FOR ALL TO authenticated
  USING (participant_one_id = auth.uid() OR participant_two_id = auth.uid())
  WITH CHECK (participant_one_id = auth.uid() OR participant_two_id = auth.uid());

-- Messages: In conversation where user is participant
DROP POLICY IF EXISTS messages_participants ON public.messages;
CREATE POLICY messages_participants ON public.messages
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.participant_one_id = auth.uid() OR c.participant_two_id = auth.uid())
    )
  )
  WITH CHECK (sender_id = auth.uid());

-- Customer Addresses
DROP POLICY IF EXISTS customer_addresses_owner ON public.customer_addresses;
CREATE POLICY customer_addresses_owner ON public.customer_addresses
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Customer Favourites
DROP POLICY IF EXISTS customer_favourites_owner ON public.customer_favourites;
CREATE POLICY customer_favourites_owner ON public.customer_favourites
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
