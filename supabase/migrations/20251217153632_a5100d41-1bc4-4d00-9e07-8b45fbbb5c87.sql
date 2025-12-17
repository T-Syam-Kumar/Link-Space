-- Add share_token to collections for shareable links
ALTER TABLE public.collections ADD COLUMN share_token uuid DEFAULT NULL;

-- Create index for faster lookups
CREATE INDEX idx_collections_share_token ON public.collections(share_token) WHERE share_token IS NOT NULL;

-- Allow public viewing of shared collections (when share_token matches)
CREATE POLICY "Anyone can view shared collections"
ON public.collections
FOR SELECT
USING (share_token IS NOT NULL);

-- Allow public viewing of cards in shared collections
CREATE POLICY "Anyone can view cards in shared collections"
ON public.cards
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.collections 
    WHERE collections.id = cards.collection_id 
    AND collections.share_token IS NOT NULL
  )
);