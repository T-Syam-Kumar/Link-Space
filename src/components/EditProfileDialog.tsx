import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const urlSchema = z
  .string()
  .trim()
  .refine(
    (val) => val === '' || /^https?:\/\/.+/.test(val),
    { message: 'URL must start with http:// or https://' }
  );

const profileSchema = z.object({
  name: z.string().trim().max(100, 'Name must be less than 100 characters'),
  contact: z.string().trim().max(50, 'Contact must be less than 50 characters'),
  email: z.string().trim().refine(
    (val) => val === '' || z.string().email().safeParse(val).success,
    { message: 'Invalid email address' }
  ),
  bio: z.string().trim().max(500, 'Bio must be less than 500 characters'),
  linkedin_url: urlSchema,
  github_url: urlSchema,
  website_url: urlSchema,
});

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

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile;
  onSave: () => void;
}

const EditProfileDialog = ({ open, onOpenChange, profile, onSave }: EditProfileDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: profile.name || '',
    contact: profile.contact || '',
    email: profile.email || '',
    bio: profile.bio || '',
    linkedin_url: profile.linkedin_url || '',
    github_url: profile.github_url || '',
    website_url: profile.website_url || '',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = profileSchema.safeParse(formData);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) errors[err.path[0] as string] = err.message;
      });
      setValidationErrors(errors);
      return;
    }
    setValidationErrors({});
    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        name: formData.name || null,
        contact: formData.contact || null,
        email: formData.email || null,
        bio: formData.bio || null,
        linkedin_url: formData.linkedin_url || null,
        github_url: formData.github_url || null,
        website_url: formData.website_url || null,
      })
      .eq('id', profile.id);

    setLoading(false);

    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated!');
      onSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">Contact Number</Label>
            <Input
              id="contact"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              placeholder="+1 234 567 8900"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn URL</Label>
            <Input
              id="linkedin"
              value={formData.linkedin_url}
              onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
              placeholder="https://linkedin.com/in/username"
            />
            {validationErrors.linkedin_url && (
              <p className="text-sm text-destructive">{validationErrors.linkedin_url}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="github">GitHub URL</Label>
            <Input
              id="github"
              value={formData.github_url}
              onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
              placeholder="https://github.com/username"
            />
            {validationErrors.github_url && (
              <p className="text-sm text-destructive">{validationErrors.github_url}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website URL</Label>
            <Input
              id="website"
              value={formData.website_url}
              onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
              placeholder="https://yourwebsite.com"
            />
            {validationErrors.website_url && (
              <p className="text-sm text-destructive">{validationErrors.website_url}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;