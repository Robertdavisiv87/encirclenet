import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Lock, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateCircle() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    circle_name: '',
    description: '',
    tiers: [
      { name: 'Free', price: 0, perks: ['Access to community'], content_access: 'basic' },
      { name: 'Bronze', price: 5, perks: ['Early access', 'Exclusive posts'], content_access: 'standard' }
    ]
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

  const addTier = () => {
    setFormData({
      ...formData,
      tiers: [...formData.tiers, { name: '', price: 0, perks: [''], content_access: 'premium' }]
    });
  };

  const updateTier = (index, field, value) => {
    const newTiers = [...formData.tiers];
    newTiers[index][field] = value;
    setFormData({...formData, tiers: newTiers});
  };

  const removeTier = (index) => {
    const newTiers = formData.tiers.filter((_, i) => i !== index);
    setFormData({...formData, tiers: newTiers});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await base44.entities.ContentCircle.create({
        ...formData,
        creator_email: user.email,
        member_count: 0
      });

      toast.success('Content Circle created successfully!');
      navigate(createPageUrl('Community'));
    } catch (error) {
      toast.error('Failed to create circle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Button variant="ghost" onClick={() => navigate(createPageUrl('Community'))} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Community
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-6 h-6 text-purple-600" />
            Create Exclusive Content Circle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label>Circle Name</Label>
              <Input
                value={formData.circle_name}
                onChange={(e) => setFormData({...formData, circle_name: e.target.value})}
                placeholder="Enter circle name"
                required
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="What exclusive content will you provide?"
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-bold">Membership Tiers</Label>
                <Button type="button" size="sm" onClick={addTier}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tier
                </Button>
              </div>

              {formData.tiers.map((tier, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold">Tier {index + 1}</h4>
                    {index > 1 && (
                      <Button type="button" size="sm" variant="ghost" onClick={() => removeTier(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Tier Name</Label>
                        <Input
                          value={tier.name}
                          onChange={(e) => updateTier(index, 'name', e.target.value)}
                          placeholder="e.g., Gold"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Price/Month ($)</Label>
                        <Input
                          type="number"
                          value={tier.price}
                          onChange={(e) => updateTier(index, 'price', parseFloat(e.target.value))}
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Button type="submit" className="w-full gradient-bg-primary text-white" disabled={loading}>
              {loading ? 'Creating...' : 'Create Content Circle'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}