import { LogOut, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';

interface HeaderProps {
  onCreateCollection: () => void;
}

const Header = ({ onCreateCollection }: HeaderProps) => {
  const { user, signOut } = useAuth();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-hero rounded-xl flex items-center justify-center">
              <span className="text-lg font-display font-bold text-primary-foreground">LC</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-foreground">LinkCollect</h1>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={onCreateCollection} size="sm">
              <Plus className="h-4 w-4" />
              New Collection
            </Button>
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
