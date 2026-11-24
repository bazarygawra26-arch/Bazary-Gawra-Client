-- ==============================================================================
-- BAZARY GAWRA - AI Limits, Product Moderation, Approval Workflow
-- Migration: 20261124220000_ai_limits_moderation_approval.sql
-- Covers:
-- 1. AI prompt quota (10 per user, server-enforced)
-- 2. AI prompt logging with consent & language metadata
-- 3. Product publication moderation (Draft → Pending Review → Published)
-- 4. Seller/Supplier application approval status
-- 5. Seller/Supplier profiles: make document upload optional
-- 6. Admin audit log
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. AI PROMPT QUOTA TABLE
--    One row per user; tracks usage count with optimistic locking via version.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_prompt_quotas (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  used_count    INTEGER NOT NULL DEFAULT 0 CHECK (used_count >= 0),
  quota_limit   INTEGER NOT NULL DEFAULT 10 CHECK (quota_limit > 0),
  reset_at      TIMESTAMPTZ,                        -- future: for quota renewal
  version       INTEGER NOT NULL DEFAULT 1,         -- optimistic locking
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ai_prompt_quotas_user_unique UNIQUE (user_id)
);

-- Index for fast user look-ups
CREATE INDEX IF NOT EXISTS idx_ai_prompt_quotas_user ON public.ai_prompt_quotas(user_id);

-- Enable RLS
ALTER TABLE public.ai_prompt_quotas ENABLE ROW LEVEL SECURITY;

-- Users can read their own quota
CREATE POLICY IF NOT EXISTS "ai_quota_user_read"
  ON public.ai_prompt_quotas FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert / update quota records
-- (enforced via supabaseAdmin in server code; no direct client writes)
CREATE POLICY IF NOT EXISTS "ai_quota_service_all"
  ON public.ai_prompt_quotas FOR ALL
  USING (auth.role() = 'service_role');

-- RPC: atomically increment quota and return new count or raise if limit reached
-- Uses row-level locking (FOR UPDATE) to prevent parallel bypass.
CREATE OR REPLACE FUNCTION public.increment_ai_quota(p_user_id UUID)
RETURNS TABLE(used_count INTEGER, quota_limit INTEGER, allowed BOOLEAN)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_row public.ai_prompt_quotas;
BEGIN
  -- Upsert: create row for new users
  INSERT INTO public.ai_prompt_quotas (user_id, used_count, quota_limit)
    VALUES (p_user_id, 0, 10)
    ON CONFLICT (user_id) DO NOTHING;

  -- Lock row for this transaction
  SELECT * INTO v_row FROM public.ai_prompt_quotas WHERE user_id = p_user_id FOR UPDATE;

  IF v_row.used_count >= v_row.quota_limit THEN
    -- Quota exhausted: return without incrementing
    RETURN QUERY SELECT v_row.used_count, v_row.quota_limit, FALSE;
    RETURN;
  END IF;

  -- Increment
  UPDATE public.ai_prompt_quotas
    SET used_count = used_count + 1,
        version = version + 1,
        updated_at = now()
    WHERE user_id = p_user_id;

  RETURN QUERY SELECT v_row.used_count + 1, v_row.quota_limit, TRUE;
END;
$$;

-- RPC: get quota without modifying
CREATE OR REPLACE FUNCTION public.get_ai_quota(p_user_id UUID)
RETURNS TABLE(used_count INTEGER, quota_limit INTEGER, remaining INTEGER)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_row public.ai_prompt_quotas;
BEGIN
  -- Upsert: ensure row exists
  INSERT INTO public.ai_prompt_quotas (user_id, used_count, quota_limit)
    VALUES (p_user_id, 0, 10)
    ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO v_row FROM public.ai_prompt_quotas WHERE user_id = p_user_id;

  RETURN QUERY SELECT v_row.used_count,
                      v_row.quota_limit,
                      GREATEST(0, v_row.quota_limit - v_row.used_count);
END;
$$;

-- ------------------------------------------------------------------------------
-- 2. AI PROMPT LOG TABLE (extends existing ai_training_data if present)
--    Records every AI request with language, feature, status, consent metadata.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_prompt_logs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  feature             TEXT NOT NULL CHECK (feature IN (
                        'search', 'scanner', 'assistant', 'compare',
                        'listing_draft', 'translation', 'voice_search')),
  original_prompt     TEXT,
  detected_language   TEXT CHECK (detected_language IN ('en', 'ku', 'ar', 'ckb')),
  model_id            TEXT,
  status              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'success', 'error', 'quota_exceeded', 'blocked')),
  processing_ms       INTEGER,
  structured_intent   JSONB,
  error_message       TEXT,
  training_consent    BOOLEAN NOT NULL DEFAULT FALSE, -- explicit opt-in required
  consent_version     TEXT,
  consent_given_at    TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_prompt_logs_user     ON public.ai_prompt_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_prompt_logs_feature  ON public.ai_prompt_logs(feature);
CREATE INDEX IF NOT EXISTS idx_ai_prompt_logs_status   ON public.ai_prompt_logs(status);
CREATE INDEX IF NOT EXISTS idx_ai_prompt_logs_created  ON public.ai_prompt_logs(created_at DESC);

ALTER TABLE public.ai_prompt_logs ENABLE ROW LEVEL SECURITY;

-- Users can read only their own logs; admins read all via service role
CREATE POLICY IF NOT EXISTS "ai_logs_user_read"
  ON public.ai_prompt_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "ai_logs_service_all"
  ON public.ai_prompt_logs FOR ALL
  USING (auth.role() = 'service_role');

-- ------------------------------------------------------------------------------
-- 3. PRODUCT MODERATION STATUS
--    Adds publication_status column to products table.
--    Draft → pending_review → approved → published
--    Also: rejected, suspended, archived
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'publication_status'
  ) THEN
    ALTER TABLE public.products
      ADD COLUMN publication_status TEXT NOT NULL DEFAULT 'draft'
        CHECK (publication_status IN (
          'draft', 'pending_review', 'approved', 'published',
          'rejected', 'suspended', 'archived'));
    -- Existing active products become 'published' (they were already live)
    UPDATE public.products SET publication_status = 'published' WHERE status = 'active';
    UPDATE public.products SET publication_status = 'draft' WHERE status = 'pending';
  END IF;
END $$;

-- Moderation notes/reasons
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'moderation_note'
  ) THEN
    ALTER TABLE public.products
      ADD COLUMN moderation_note TEXT,
      ADD COLUMN moderated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      ADD COLUMN moderated_at TIMESTAMPTZ;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_products_publication_status ON public.products(publication_status);

-- Public product queries must only return published products.
-- Drop existing permissive policy if it allows non-published products.
-- (We add a filtered policy; existing RLS policies remain unless they conflict.)
DROP POLICY IF EXISTS "products_public_read_published" ON public.products;
CREATE POLICY "products_public_read_published"
  ON public.products FOR SELECT
  USING (
    publication_status = 'published'
    OR auth.uid() IN (
      -- Seller can see own products in any status
      SELECT user_id FROM public.sellers WHERE id::text = seller_id::text
    )
    OR auth.role() = 'service_role'
  );

-- Sellers can only update their own products
DROP POLICY IF EXISTS "products_seller_update" ON public.products;
CREATE POLICY "products_seller_update"
  ON public.products FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.sellers WHERE id::text = seller_id::text
    )
    OR auth.role() = 'service_role'
  )
  WITH CHECK (
    -- Sellers cannot directly set publication_status to published/approved
    publication_status IN ('draft', 'pending_review')
    OR auth.role() = 'service_role'
  );

-- ------------------------------------------------------------------------------
-- 4. PRODUCT MODERATION LOG
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_moderation_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      TEXT NOT NULL,
  admin_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  previous_status TEXT,
  new_status      TEXT NOT NULL,
  note            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_mod_log_product ON public.product_moderation_log(product_id);
ALTER TABLE public.product_moderation_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "product_mod_log_service_all"
  ON public.product_moderation_log FOR ALL USING (auth.role() = 'service_role');

-- ------------------------------------------------------------------------------
-- 5. SELLER APPLICATION STATUS
--    Add approval_status to sellers table if not present.
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'sellers' AND column_name = 'approval_status'
  ) THEN
    ALTER TABLE public.sellers
      ADD COLUMN approval_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (approval_status IN ('pending', 'approved', 'rejected', 'suspended'));
    -- Existing verified sellers → approved
    UPDATE public.sellers SET approval_status = 'approved' WHERE verification_status = 'verified';
    UPDATE public.sellers SET approval_status = 'pending'  WHERE verification_status != 'verified';
  END IF;
END $$;

-- Document-upload columns: make nullable (safe for testing phase)
DO $$
BEGIN
  ALTER TABLE public.sellers
    ALTER COLUMN business_registration_number DROP NOT NULL;
EXCEPTION WHEN undefined_column OR others THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.sellers
    ALTER COLUMN tax_number DROP NOT NULL;
EXCEPTION WHEN undefined_column OR others THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_sellers_approval_status ON public.sellers(approval_status);

-- RLS: sellers can read own row; public can read approved+verified only
DROP POLICY IF EXISTS "sellers_public_read" ON public.sellers;
CREATE POLICY "sellers_public_read"
  ON public.sellers FOR SELECT
  USING (
    approval_status = 'approved'
    OR user_id = auth.uid()
    OR auth.role() = 'service_role'
  );

-- ------------------------------------------------------------------------------
-- 6. SUPPLIER PROFILES: make document columns nullable
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  ALTER TABLE public.supplier_profiles
    ALTER COLUMN business_registration_url DROP NOT NULL;
EXCEPTION WHEN undefined_column OR others THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.supplier_profiles
    ALTER COLUMN tax_certificate_url DROP NOT NULL;
EXCEPTION WHEN undefined_column OR others THEN NULL;
END $$;

-- Add approval_status to supplier_profiles if not present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'supplier_profiles' AND column_name = 'approval_status'
  ) THEN
    ALTER TABLE public.supplier_profiles
      ADD COLUMN approval_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (approval_status IN ('pending', 'approved', 'rejected', 'suspended'));
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 7. ADMIN AUDIT LOG
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action          TEXT NOT NULL,
  target_type     TEXT NOT NULL CHECK (target_type IN (
                    'seller', 'supplier', 'buyer', 'product', 'user', 'order', 'ai_quota')),
  target_id       TEXT NOT NULL,
  previous_value  JSONB,
  new_value       JSONB,
  note            TEXT,
  ip_address      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin    ON public.admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_target   ON public.admin_audit_log(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created  ON public.admin_audit_log(created_at DESC);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "admin_audit_service_all"
  ON public.admin_audit_log FOR ALL USING (auth.role() = 'service_role');

-- ------------------------------------------------------------------------------
-- 8. AI TRAINING CONSENT on profiles
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'ai_training_consent'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN ai_training_consent BOOLEAN NOT NULL DEFAULT FALSE,
      ADD COLUMN ai_training_consent_at TIMESTAMPTZ,
      ADD COLUMN ai_training_consent_version TEXT;
  END IF;
END $$;
