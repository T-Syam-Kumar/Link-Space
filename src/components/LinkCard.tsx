import { motion } from 'framer-motion';
import { ExternalLink, MoreVertical, Trash2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Card {
  id: string;
  name: string;
  url: string;
  favicon_url: string | null;
}

interface LinkCardProps {
  card: Card;
  index: number;
  onDelete: (id: string) => void;
}

const LinkCard = ({ card, index, onDelete }: LinkCardProps) => {
  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      return null;
    }
  };

  const faviconSrc = card.favicon_url || getFaviconUrl(card.url);

  const handleOpenLink = () => {
    window.open(card.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      whileHover={{ scale: 1.02 }}
      className="group bg-card rounded-xl border border-border shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer"
      onClick={handleOpenLink}
    >
      <div className="p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
          {faviconSrc ? (
            <img
              src={faviconSrc}
              alt={card.name}
              className="w-7 h-7 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <Globe className={`h-6 w-6 text-muted-foreground ${faviconSrc ? 'hidden' : ''}`} />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground truncate">{card.name}</h4>
          <p className="text-sm text-muted-foreground truncate">{card.url}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenLink();
            }}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
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
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onDelete(card.id); }}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
};

export default LinkCard;
