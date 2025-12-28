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
import { Video, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function ScheduleQA() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduled_date: '',
    duration_minutes: 60,
    access_tier: 'all'
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
      await base44.entities.LiveQA.create({
        ...formData,
        creator_email: user.email,
        status: 'scheduled'
      });

      toast.success('Live Q&A scheduled successfully!');
      navigate(createPageUrl('Community'));
    } catch (error) {
      toast.error('Failed to schedule Q&A');
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
            <Video className="w-6 h-6 text-red-600" />
            Schedule Live Q&A Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Session Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Enter session title"
                required
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="What will you discuss?"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({...formData, duration_minutes: parseInt(e.target.value)})}
                  min="15"
                  max="180"
                />
              </div>
            </div>

            <div>
              <Label>Access Level</Label>
              <Select value={formData.access_tier} onValueChange={(value) => setFormData({...formData, access_tier: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Members</SelectItem>
                  <SelectItem value="bronze">Bronze & Above</SelectItem>
                  <SelectItem value="silver">Silver & Above</SelectItem>
                  <SelectItem value="gold">Gold & Above</SelectItem>
                  <SelectItem value="platinum">Platinum Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full gradient-bg-primary text-white" disabled={loading}>
              {loading ? 'Scheduling...' : 'Schedule Q&A'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}