import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit, Github, Linkedin, Globe, Mail, Phone, Users, UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import EditProfileDialog from '@/components/EditProfileDialog';
import { ThemeToggle } from '@/components/ThemeToggle';

interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  contact: string | null;
  email: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  website_url: string | null;
  bio: string | null;
  avatar_url: string | null;
}

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const profileUserId = userId || user?.id;
  const isOwnProfile = user?.id === profileUserId;

  useEffect(() => {
    if (profileUserId) {
      fetchProfile();
      fetchFollowStats();
      if (user && !isOwnProfile) {
        checkIfFollowing();
      }
    }
  }, [profileUserId, user]);

  const fetchProfile = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', profileUserId!)
      .maybeSingle();

    if (error) {
      toast.error('Failed to load profile');
    } else if (!data) {
      // Create profile if it doesn't exist for own profile
      if (isOwnProfile && user) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({ user_id: user.id, email: user.email })
          .select()
          .single();
        
        if (!createError) {
          setProfile(newProfile);
        }
      }
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

  const fetchFollowStats = async () => {
    const [followersRes, followingRes] = await Promise.all([
      supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', profileUserId!),
      supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', profileUserId!),
    ]);

    setFollowersCount(followersRes.count || 0);
    setFollowingCount(followingRes.count || 0);
  };

  const checkIfFollowing = async () => {
    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user!.id)
      .eq('following_id', profileUserId!)
      .maybeSingle();

    setIsFollowing(!!data);
  };

  const handleFollow = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setFollowLoading(true);
    if (isFollowing) {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', profileUserId!);

      if (error) {
        toast.error('Failed to unfollow');
      } else {
        setIsFollowing(false);
        setFollowersCount((c) => c - 1);
        toast.success('Unfollowed');
      }
    } else {
      const { error } = await supabase
        .from('follows')
        .insert({ follower_id: user.id, following_id: profileUserId! });

      if (error) {
        toast.error('Failed to follow');
      } else {
        setIsFollowing(true);
        setFollowersCount((c) => c + 1);
        toast.success('Following!');
      }
    }
    setFollowLoading(false);
  };

  const handleProfileUpdate = () => {
    fetchProfile();
    setShowEditDialog(false);
  };

  const getInitials = (name: string | null, email: string | null) => {
    if (name) {
      return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email?.slice(0, 2).toUpperCase() || 'U';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border p-8"
        >
          <div className="flex flex-col items-center text-center mb-8">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                {getInitials(profile?.name, profile?.email)}
              </AvatarFallback>
            </Avatar>
            
            <h1 className="font-display font-bold text-2xl text-foreground">
              {profile?.name || 'Anonymous User'}
            </h1>
            
            {profile?.bio && (
              <p className="text-muted-foreground mt-2 max-w-md">{profile.bio}</p>
            )}

            <div className="flex gap-6 mt-4">
              <div className="text-center">
                <p className="font-bold text-foreground">{followersCount}</p>
                <p className="text-sm text-muted-foreground">Followers</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-foreground">{followingCount}</p>
                <p className="text-sm text-muted-foreground">Following</p>
              </div>
            </div>

            <div className="mt-6">
              {isOwnProfile ? (
                <Button onClick={() => setShowEditDialog(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <Button 
                  onClick={handleFollow} 
                  variant={isFollowing ? 'outline' : 'default'}
                  disabled={followLoading}
                >
                  {followLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isFollowing ? (
                    <>
                      <UserMinus className="h-4 w-4 mr-2" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Follow
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {profile?.email && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-5 w-5" />
                <a href={`mailto:${profile.email}`} className="hover:text-primary transition-colors">
                  {profile.email}
                </a>
              </div>
            )}
            
            {profile?.contact && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="h-5 w-5" />
                <span>{profile.contact}</span>
              </div>
            )}

            {profile?.linkedin_url && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Linkedin className="h-5 w-5" />
                <a 
                  href={profile.linkedin_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  LinkedIn
                </a>
              </div>
            )}

            {profile?.github_url && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Github className="h-5 w-5" />
                <a 
                  href={profile.github_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  GitHub
                </a>
              </div>
            )}

            {profile?.website_url && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Globe className="h-5 w-5" />
                <a 
                  href={profile.website_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  Website
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      {profile && (
        <EditProfileDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          profile={profile}
          onSave={handleProfileUpdate}
        />
      )}
    </div>
  );
};

export default Profile;