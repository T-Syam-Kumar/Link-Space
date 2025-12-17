import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, FolderPlus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import CollectionCard from '@/components/CollectionCard';
import CollectionView from '@/components/CollectionView';
import CreateCollectionDialog from '@/components/CreateCollectionDialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Collection {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  cardCount?: number;
  share_token?: string | null;
}

const Dashboard = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    setLoading(true);
    const { data: collectionsData, error: collectionsError } = await supabase
      .from('collections')
      .select('*')
      .order('created_at', { ascending: false });

    if (collectionsError) {
      toast.error('Failed to load collections');
      setLoading(false);
      return;
    }

    // Get card counts for each collection
    const collectionsWithCounts = await Promise.all(
      (collectionsData || []).map(async (collection) => {
        const { count } = await supabase
          .from('cards')
          .select('*', { count: 'exact', head: true })
          .eq('collection_id', collection.id);
        return { ...collection, cardCount: count || 0 };
      })
    );

    setCollections(collectionsWithCounts);
    setLoading(false);
  };

  const filteredCollections = useMemo(() => {
    if (!searchQuery.trim()) return collections;
    const query = searchQuery.toLowerCase();
    return collections.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query)
    );
  }, [collections, searchQuery]);

  const handleCreateCollection = async (name: string, description: string) => {
    if (!user) return;

    const { error } = await supabase.from('collections').insert({
      user_id: user.id,
      name,
      description: description || null,
    });

    if (error) {
      toast.error('Failed to create collection');
    } else {
      toast.success('Collection created!');
      fetchCollections();
    }
  };

  const handleDeleteCollection = async (id: string) => {
    const { error } = await supabase.from('collections').delete().eq('id', id);

    if (error) {
      toast.error('Failed to delete collection');
    } else {
      toast.success('Collection deleted');
      setCollections(collections.filter((c) => c.id !== id));
    }
  };

  const handleOpenCollection = (id: string) => {
    const collection = collections.find((c) => c.id === id);
    if (collection) {
      setSelectedCollection(collection);
    }
  };

  if (selectedCollection) {
    return (
      <CollectionView
        collection={selectedCollection}
        onBack={() => {
          setSelectedCollection(null);
          fetchCollections();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onCreateCollection={() => setShowCreateDialog(true)} />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="font-display font-bold text-3xl text-foreground mb-2">
            Your Collections
          </h2>
          <p className="text-muted-foreground">
            Organize and access your favorite links
          </p>
        </motion.div>

        {!loading && collections.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search collections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : collections.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-secondary rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <FolderPlus className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="font-display font-semibold text-xl text-foreground mb-2">
              No collections yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Create your first collection to start organizing links
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <FolderPlus className="h-4 w-4" />
              Create Collection
            </Button>
          </motion.div>
        ) : filteredCollections.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <p className="text-muted-foreground">No collections match your search.</p>
          </motion.div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence>
              {filteredCollections.map((collection, index) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  index={index}
                  onOpen={handleOpenCollection}
                  onDelete={handleDeleteCollection}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <CreateCollectionDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateCollection}
      />
    </div>
  );
};

export default Dashboard;
