import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Users, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateGroup() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    group_name: '',
    description: '',
    category: 'lifestyle',
    is_private: false
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {
        window.location.href = createPageUrl('Home');
      }
    };
    loadUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await base44.entities.CreatorGroup.create({
        ...formData,
        creator_email: user.email,
        member_count: 0
      });

      toast.success('Group created successfully!');
      navigate(createPageUrl('Community'));
    } catch (error) {
      toast.error('Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Button variant="ghost" onClick={() => navigate(createPageUrl('Community'))} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Community
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-600" />
            Create New Group
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Group Name</Label>
              <Input
                value={formData.group_name}
                onChange={(e) => setFormData({...formData, group_name: e.target.value})}
                placeholder="Enter group name"
                required
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="What's this group about?"
                rows={4}
              />
            </div>

            <div>
              <Label>Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lifestyle">Lifestyle</SelectItem>
                  <SelectItem value="tech">Tech</SelectItem>
                  <SelectItem value="art">Art</SelectItem>
                  <SelectItem value="music">Music</SelectItem>
                  <SelectItem value="wellness">Wellness</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label>Private Group (Invite Only)</Label>
              <Switch
                checked={formData.is_private}
                onCheckedChange={(checked) => setFormData({...formData, is_private: checked})}
              />
            </div>

            <Button type="submit" className="w-full gradient-bg-primary text-white" disabled={loading}>
              {loading ? 'Creating...' : 'Create Group'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}