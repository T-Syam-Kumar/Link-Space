import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, ExternalLink, Loader2, LinkIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ThemeToggle } from '@/components/ThemeToggle';

interface Card {
  id: string;
  name: string;
  url: string;
  favicon_url: string | null;
}

interface Collection {
  id: string;
  name: string;
  description: string | null;
}

const SharedCollection = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (shareToken) {
      fetchSharedCollection();
    }
  }, [shareToken]);

  const fetchSharedCollection = async () => {
    setLoading(true);
    
    // Fetch collection by share token
    const { data: collectionData, error: collectionError } = await supabase
      .from('collections')
      .select('*')
      .eq('share_token', shareToken)
      .maybeSingle();

    if (collectionError || !collectionData) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setCollection(collectionData);

    // Fetch cards for this collection
    const { data: cardsData } = await supabase
      .from('cards')
      .select('*')
      .eq('collection_id', collectionData.id)
      .order('created_at', { ascending: false });

    setCards(cardsData || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-secondary rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <LinkIcon className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="font-display font-bold text-2xl text-foreground mb-2">
            Collection Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            This collection doesn't exist or is no longer shared.
          </p>
          <Link 
            to="/" 
            className="text-primary hover:underline font-medium"
          >
            Go to LinkCollect
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                <Folder className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display font-bold text-xl text-foreground">
                  {collection?.name}
                </h1>
                {collection?.description && (
                  <p className="text-sm text-muted-foreground">{collection.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link
                to="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Create your own
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {cards.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <p className="text-muted-foreground">This collection is empty.</p>
          </motion.div>
        ) : (
          <div className="grid gap-3">
            <AnimatePresence>
              {cards.map((card, index) => (
                <motion.a
                  key={card.id}
                  href={card.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/50 hover:shadow-card-hover transition-all"
                >
                  <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {card.favicon_url ? (
                      <img
                        src={card.favicon_url}
                        alt=""
                        className="w-6 h-6 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {card.name}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">{card.url}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </motion.a>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
};

export default SharedCollection;
