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
import { Trophy, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateChallenge() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rules: '',
    challenge_type: 'photo',
    start_date: '',
    end_date: '',
    prize_pool: 0,
    sponsor: ''
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
      await base44.entities.CommunityChallenge.create({
        ...formData,
        creator_email: user.email,
        status: 'upcoming'
      });

      toast.success('Challenge created successfully!');
      navigate(createPageUrl('Community'));
    } catch (error) {
      toast.error('Failed to create challenge');
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
            <Trophy className="w-6 h-6 text-yellow-600" />
            Create Community Challenge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Challenge Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Enter challenge title"
                required
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="What is this challenge about?"
                rows={3}
              />
            </div>

            <div>
              <Label>Rules</Label>
              <Textarea
                value={formData.rules}
                onChange={(e) => setFormData({...formData, rules: e.target.value})}
                placeholder="Challenge rules and guidelines"
                rows={3}
              />
            </div>

            <div>
              <Label>Challenge Type</Label>
              <Select value={formData.challenge_type} onValueChange={(value) => setFormData({...formData, challenge_type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="photo">Photo</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="fitness">Fitness</SelectItem>
                  <SelectItem value="writing">Writing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Prize Pool ($)</Label>
                <Input
                  type="number"
                  value={formData.prize_pool}
                  onChange={(e) => setFormData({...formData, prize_pool: parseFloat(e.target.value)})}
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <Label>Sponsor (Optional)</Label>
                <Input
                  value={formData.sponsor}
                  onChange={(e) => setFormData({...formData, sponsor: e.target.value})}
                  placeholder="Sponsor name"
                />
              </div>
            </div>

            <Button type="submit" className="w-full gradient-bg-primary text-white" disabled={loading}>
              {loading ? 'Creating...' : 'Create Challenge'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}