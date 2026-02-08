
-- Remove overly permissive INSERT/UPDATE policies
-- Edge function uses service role which bypasses RLS
DROP POLICY "Service role can insert sentiment analyses" ON public.sentiment_analyses;
DROP POLICY "Service role can update sentiment analyses" ON public.sentiment_analyses;
