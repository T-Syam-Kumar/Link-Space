ALTER TABLE public.collections
ADD CONSTRAINT collections_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_collections_user_id 
ON public.collections(user_id);