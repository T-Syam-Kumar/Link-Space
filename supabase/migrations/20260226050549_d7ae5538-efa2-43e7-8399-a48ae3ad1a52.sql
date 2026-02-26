
-- Fix collections SELECT policies: change from RESTRICTIVE to PERMISSIVE
DROP POLICY IF EXISTS "Users can view their own collections" ON public.collections;
DROP POLICY IF EXISTS "Anyone can view shared collections" ON public.collections;

CREATE POLICY "Users can view their own collections" ON public.collections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view shared collections" ON public.collections
  FOR SELECT USING (share_token IS NOT NULL);

-- Fix cards SELECT policies too
DROP POLICY IF EXISTS "Users can view their own cards" ON public.cards;
DROP POLICY IF EXISTS "Anyone can view cards in shared collections" ON public.cards;

CREATE POLICY "Users can view their own cards" ON public.cards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view cards in shared collections" ON public.cards
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM collections
    WHERE collections.id = cards.collection_id AND collections.share_token IS NOT NULL
  ));
