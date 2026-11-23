ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS bazary_sellers_owner_select ON public.sellers;
CREATE POLICY bazary_sellers_owner_select
  ON public.sellers
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());
