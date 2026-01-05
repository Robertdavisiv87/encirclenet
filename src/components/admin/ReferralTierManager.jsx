import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Edit, Trash2, Award, TrendingUp, DollarSign } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';

const DEFAULT_TIERS = [
  {
    tier_name: 'Bronze',
    tier_level: 1,
    min_referrals: 0,
    min_commission: 0,
    commission_rate: 0.1,
    bonus_per_referral: 5,
    tier_bonus: 0,
    badge_color: '#CD7F32',
    badge_icon: 'Award',
    perks: ['$5 per referral', '10% recurring commission']
  },
  {
    tier_name: 'Silver',
    tier_level: 2,
    min_referrals: 5,
    min_commission: 25,
    commission_rate: 0.12,
    bonus_per_referral: 7,
    tier_bonus: 25,
    badge_color: '#C0C0C0',
    badge_icon: 'Award',
    perks: ['$7 per referral', '12% recurring commission', '$25 tier bonus']
  },
  {
    tier_name: 'Gold',
    tier_level: 3,
    min_referrals: 10,
    min_commission: 75,
    commission_rate: 0.15,
    bonus_per_referral: 10,
    tier_bonus: 50,
    badge_color: '#FFD700',
    badge_icon: 'Award',
    perks: ['$10 per referral', '15% recurring commission', '$50 tier bonus', 'Priority support']
  },
  {
    tier_name: 'Platinum',
    tier_level: 4,
    min_referrals: 25,
    min_commission: 250,
    commission_rate: 0.2,
    bonus_per_referral: 15,
    tier_bonus: 100,
    badge_color: '#E5E4E2',
    badge_icon: 'Award',
    perks: ['$15 per referral', '20% recurring commission', '$100 tier bonus', 'VIP support', 'Early feature access']
  }
];

export default function ReferralTierManager() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  const [formData, setFormData] = useState({
    tier_name: '',
    tier_level: 1,
    min_referrals: 0,
    min_commission: 0,
    commission_rate: 0.1,
    bonus_per_referral: 5,
    tier_bonus: 0,
    badge_color: '#CD7F32',
    badge_icon: 'Award',
    perks: []
  });
  const [perkInput, setPerkInput] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tiers = [], isLoading } = useQuery({
    queryKey: ['referral-tiers'],
    queryFn: () => base44.entities.ReferralTier.filter({ is_active: true })
  });

  const createTierMutation = useMutation({
    mutationFn: (data) => base44.entities.ReferralTier.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['referral-tiers']);
      setShowDialog(false);
      resetForm();
      toast({ title: 'Tier created successfully' });
    }
  });

  const updateTierMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ReferralTier.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['referral-tiers']);
      setShowDialog(false);
      resetForm();
      toast({ title: 'Tier updated successfully' });
    }
  });

  const deleteTierMutation = useMutation({
    mutationFn: (id) => base44.entities.ReferralTier.update(id, { is_active: false }),
    onSuccess: () => {
      queryClient.invalidateQueries(['referral-tiers']);
      toast({ title: 'Tier deleted successfully' });
    }
  });

  const initializeDefaultTiers = async () => {
    try {
      for (const tier of DEFAULT_TIERS) {
        await base44.entities.ReferralTier.create(tier);
      }
      queryClient.invalidateQueries(['referral-tiers']);
      toast({ title: '✅ Default tiers initialized' });
    } catch (error) {
      toast({ title: 'Error initializing tiers', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({
      tier_name: '',
      tier_level: 1,
      min_referrals: 0,
      min_commission: 0,
      commission_rate: 0.1,
      bonus_per_referral: 5,
      tier_bonus: 0,
      badge_color: '#CD7F32',
      badge_icon: 'Award',
      perks: []
    });
    setEditingTier(null);
    setPerkInput('');
  };

  const handleEdit = (tier) => {
    setEditingTier(tier);
    setFormData({
      tier_name: tier.tier_name,
      tier_level: tier.tier_level,
      min_referrals: tier.min_referrals,
      min_commission: tier.min_commission || 0,
      commission_rate: tier.commission_rate,
      bonus_per_referral: tier.bonus_per_referral,
      tier_bonus: tier.tier_bonus || 0,
      badge_color: tier.badge_color,
      badge_icon: tier.badge_icon,
      perks: tier.perks || []
    });
    setShowDialog(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTier) {
      updateTierMutation.mutate({ id: editingTier.id, data: formData });
    } else {
      createTierMutation.mutate(formData);
    }
  };

  const addPerk = () => {
    if (perkInput.trim()) {
      setFormData({ ...formData, perks: [...formData.perks, perkInput.trim()] });
      setPerkInput('');
    }
  };

  const removePerk = (index) => {
    setFormData({ 
      ...formData, 
      perks: formData.perks.filter((_, i) => i !== index) 
    });
  };

  const sortedTiers = [...tiers].sort((a, b) => a.tier_level - b.tier_level);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">Referral Tiers</h2>
          <p className="text-gray-600">Configure tiered rewards for referrers</p>
        </div>
        <div className="flex gap-2">
          {tiers.length === 0 && (
            <Button onClick={initializeDefaultTiers} variant="outline">
              Initialize Default Tiers
            </Button>
          )}
          <Button onClick={() => setShowDialog(true)} className="gradient-bg-primary text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Tier
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p>Loading tiers...</p>
      ) : sortedTiers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Award className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">No tiers configured yet</p>
            <Button onClick={initializeDefaultTiers}>
              Initialize Default Tiers
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sortedTiers.map((tier) => (
            <Card key={tier.id} className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: tier.badge_color }}
                    >
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{tier.tier_name}</CardTitle>
                      <Badge variant="outline">Level {tier.tier_level}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(tier)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => deleteTierMutation.mutate(tier.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Min Referrals</p>
                    <p className="text-lg font-bold text-blue-900">{tier.min_referrals}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Min Commission</p>
                    <p className="text-lg font-bold text-green-900">${tier.min_commission || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Bonus/Referral</p>
                    <p className="text-lg font-bold text-purple-900">${tier.bonus_per_referral}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tier Bonus</p>
                    <p className="text-lg font-bold text-orange-900">${tier.tier_bonus || 0}</p>
                  </div>
                </div>
                {tier.perks && tier.perks.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Perks:</p>
                    <div className="flex flex-wrap gap-2">
                      {tier.perks.map((perk, i) => (
                        <Badge key={i} variant="secondary">{perk}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTier ? 'Edit Tier' : 'Create New Tier'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tier Name</Label>
                <Input 
                  value={formData.tier_name}
                  onChange={(e) => setFormData({...formData, tier_name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>Tier Level</Label>
                <Input 
                  type="number"
                  value={formData.tier_level}
                  onChange={(e) => setFormData({...formData, tier_level: parseInt(e.target.value)})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min Referrals Required</Label>
                <Input 
                  type="number"
                  value={formData.min_referrals}
                  onChange={(e) => setFormData({...formData, min_referrals: parseInt(e.target.value)})}
                  required
                />
              </div>
              <div>
                <Label>Min Commission Required ($)</Label>
                <Input 
                  type="number"
                  step="0.01"
                  value={formData.min_commission}
                  onChange={(e) => setFormData({...formData, min_commission: parseFloat(e.target.value)})}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Bonus per Referral ($)</Label>
                <Input 
                  type="number"
                  step="0.01"
                  value={formData.bonus_per_referral}
                  onChange={(e) => setFormData({...formData, bonus_per_referral: parseFloat(e.target.value)})}
                  required
                />
              </div>
              <div>
                <Label>Commission Rate (%)</Label>
                <Input 
                  type="number"
                  step="0.01"
                  value={formData.commission_rate * 100}
                  onChange={(e) => setFormData({...formData, commission_rate: parseFloat(e.target.value) / 100})}
                  required
                />
              </div>
              <div>
                <Label>Tier Achievement Bonus ($)</Label>
                <Input 
                  type="number"
                  step="0.01"
                  value={formData.tier_bonus}
                  onChange={(e) => setFormData({...formData, tier_bonus: parseFloat(e.target.value)})}
                />
              </div>
            </div>

            <div>
              <Label>Badge Color</Label>
              <Input 
                type="color"
                value={formData.badge_color}
                onChange={(e) => setFormData({...formData, badge_color: e.target.value})}
              />
            </div>

            <div>
              <Label>Perks</Label>
              <div className="flex gap-2 mb-2">
                <Input 
                  value={perkInput}
                  onChange={(e) => setPerkInput(e.target.value)}
                  placeholder="Add a perk..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPerk())}
                />
                <Button type="button" onClick={addPerk}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.perks.map((perk, i) => (
                  <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => removePerk(i)}>
                    {perk} ×
                  </Badge>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="gradient-bg-primary text-white">
                {editingTier ? 'Update' : 'Create'} Tier
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}