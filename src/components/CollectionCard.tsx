import { motion } from 'framer-motion';
import { Folder, MoreVertical, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Collection {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  cardCount?: number;
}

interface CollectionCardProps {
  collection: Collection;
  index: number;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}

const CollectionCard = ({ collection, index, onOpen, onDelete }: CollectionCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="group bg-card rounded-xl border border-border shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer"
      onClick={() => onOpen(collection.id)}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
            <Folder className="h-6 w-6 text-primary-foreground" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onOpen(collection.id); }}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onDelete(collection.id); }}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <h3 className="font-display font-semibold text-lg text-foreground mb-1 truncate">
          {collection.name}
        </h3>
        {collection.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {collection.description}
          </p>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{collection.cardCount ?? 0} links</span>
          <span>•</span>
          <span>{new Date(collection.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default CollectionCard;
