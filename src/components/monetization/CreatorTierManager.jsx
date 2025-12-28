import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Crown } from 'lucide-react';

export default function CreatorTierManager({ creatorEmail }) {
  const [showForm, setShowForm] = useState(false);
  const [tierData, setTierData] = useState({
    tier_name: '',
    tier_price: '',
    perks: ['']
  });
  const queryClient = useQueryClient();

  const { data: tiers } = useQuery({
    queryKey: ['creator-tiers-manage', creatorEmail],
    queryFn: () => base44.entities.CreatorTier.filter({ creator_email: creatorEmail }),
    initialData: []
  });

  const createTierMutation = useMutation({
    mutationFn: (data) => base44.entities.CreatorTier.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['creator-tiers-manage']);
      setShowForm(false);
      setTierData({ tier_name: '', tier_price: '', perks: [''] });
      alert('✅ Tier created!');
    }
  });

  const deleteTierMutation = useMutation({
    mutationFn: (id) => base44.entities.CreatorTier.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['creator-tiers-manage']);
      alert('✅ Tier deleted!');
    }
  });

  const handleSubmit = () => {
    const perks = tierData.perks.filter(p => p.trim() !== '');
    if (!tierData.tier_name || !tierData.tier_price || perks.length === 0) {
      alert('Please fill all fields');
      return;
    }

    createTierMutation.mutate({
      creator_email: creatorEmail,
      tier_name: tierData.tier_name,
      tier_price: parseFloat(tierData.tier_price),
      perks: perks,
      subscriber_count: 0,
      is_active: true
    });
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-purple-600" />
            Subscription Tiers
          </span>
          <Button
            size="sm"
            onClick={() => setShowForm(!showForm)}
            className="gradient-bg-primary"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Tier
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {showForm && (
          <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
            <div className="space-y-3">
              <div>
                <Label>Tier Name</Label>
                <Input
                  value={tierData.tier_name}
                  onChange={(e) => setTierData({ ...tierData, tier_name: e.target.value })}
                  placeholder="e.g., Premium"
                />
              </div>
              <div>
                <Label>Monthly Price ($)</Label>
                <Input
                  type="number"
                  value={tierData.tier_price}
                  onChange={(e) => setTierData({ ...tierData, tier_price: e.target.value })}
                  placeholder="9.99"
                />
              </div>
              <div>
                <Label>Perks</Label>
                {tierData.perks.map((perk, i) => (
                  <Input
                    key={i}
                    value={perk}
                    onChange={(e) => {
                      const newPerks = [...tierData.perks];
                      newPerks[i] = e.target.value;
                      setTierData({ ...tierData, perks: newPerks });
                    }}
                    placeholder="e.g., Exclusive content"
                    className="mb-2"
                  />
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setTierData({ ...tierData, perks: [...tierData.perks, ''] })}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Perk
                </Button>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSubmit} className="gradient-bg-primary">
                  Create Tier
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {tiers.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No subscription tiers yet. Create one to start earning recurring revenue!
            </p>
          ) : (
            tiers.map((tier) => (
              <div key={tier.id} className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold text-blue-900">{tier.tier_name}</h4>
                    <p className="text-purple-600 font-semibold">${tier.tier_price}/month</p>
                    <div className="mt-2 space-y-1">
                      {tier.perks?.map((perk, i) => (
                        <p key={i} className="text-sm text-gray-600">• {perk}</p>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {tier.subscriber_count || 0} subscribers
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteTierMutation.mutate(tier.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}