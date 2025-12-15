import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Folder, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LinkCard from '@/components/LinkCard';
import AddCardDialog from '@/components/AddCardDialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

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

interface CollectionViewProps {
  collection: Collection;
  onBack: () => void;
}

const CollectionView = ({ collection, onBack }: CollectionViewProps) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchCards();
  }, [collection.id]);

  const fetchCards = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('collection_id', collection.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load cards');
    } else {
      setCards(data || []);
    }
    setLoading(false);
  };

  const handleAddCard = async (name: string, url: string) => {
    if (!user) return;

    const { error } = await supabase.from('cards').insert({
      collection_id: collection.id,
      user_id: user.id,
      name,
      url,
    });

    if (error) {
      toast.error('Failed to add card');
    } else {
      toast.success('Link added!');
      fetchCards();
    }
  };

  const handleDeleteCard = async (id: string) => {
    const { error } = await supabase.from('cards').delete().eq('id', id);

    if (error) {
      toast.error('Failed to delete card');
    } else {
      toast.success('Link deleted');
      setCards(cards.filter((c) => c.id !== id));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen bg-background"
    >
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                  <Folder className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="font-display font-bold text-xl text-foreground">
                    {collection.name}
                  </h1>
                  {collection.description && (
                    <p className="text-sm text-muted-foreground">{collection.description}</p>
                  )}
                </div>
              </div>
            </div>

            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4" />
              Add Link
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : cards.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-secondary rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Plus className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="font-display font-semibold text-xl text-foreground mb-2">
              No links yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Add your first link to this collection
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4" />
              Add Link
            </Button>
          </motion.div>
        ) : (
          <div className="grid gap-3">
            <AnimatePresence>
              {cards.map((card, index) => (
                <LinkCard
                  key={card.id}
                  card={card}
                  index={index}
                  onDelete={handleDeleteCard}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <AddCardDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={handleAddCard}
      />
    </motion.div>
  );
};

export default CollectionView;
