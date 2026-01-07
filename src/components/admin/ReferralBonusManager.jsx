import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Gift, TrendingUp, Zap, Target } from 'lucide-react';
import { toast } from 'sonner';

export default function ReferralBonusManager() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({
    rule_name: '',
    rule_type: 'milestone',
    trigger_condition: {},
    bonus_amount: 0,
    bonus_percentage: 0,
    is_active: true,
    is_recurring: false,
    priority: 0,
    description: ''
  });

  const queryClient = useQueryClient();

  const { data: bonusRules = [] } = useQuery({
    queryKey: ['bonus-rules'],
    queryFn: () => base44.entities.ReferralBonusRule.list('-priority'),
    initialData: []
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ReferralBonusRule.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['bonus-rules']);
      toast.success('Bonus rule created!');
      setShowDialog(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ReferralBonusRule.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['bonus-rules']);
      toast.success('Bonus rule updated!');
      setShowDialog(false);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ReferralBonusRule.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['bonus-rules']);
      toast.success('Bonus rule deleted!');
    }
  });

  const resetForm = () => {
    setFormData({
      rule_name: '',
      rule_type: 'milestone',
      trigger_condition: {},
      bonus_amount: 0,
      bonus_percentage: 0,
      is_active: true,
      is_recurring: false,
      priority: 0,
      description: ''
    });
    setEditingRule(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingRule) {
      updateMutation.mutate({ id: editingRule.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setFormData({
      rule_name: rule.rule_name,
      rule_type: rule.rule_type,
      trigger_condition: rule.trigger_condition || {},
      bonus_amount: rule.bonus_amount || 0,
      bonus_percentage: rule.bonus_percentage || 0,
      is_active: rule.is_active ?? true,
      is_recurring: rule.is_recurring ?? false,
      priority: rule.priority || 0,
      description: rule.description || ''
    });
    setShowDialog(true);
  };

  const getRuleIcon = (type) => {
    switch (type) {
      case 'milestone': return Target;
      case 'activity_based': return TrendingUp;
      case 'streak': return Zap;
      case 'percentage_boost': return Gift;
      default: return Gift;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-purple-600" />
            Referral Bonus Rules
          </CardTitle>
          <Button onClick={() => setShowDialog(true)} className="gradient-bg-primary text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Bonus Rule
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {bonusRules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Gift className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No bonus rules configured yet</p>
              <p className="text-sm mt-1">Create your first bonus rule to reward referrers</p>
            </div>
          ) : (
            bonusRules.map((rule) => {
              const Icon = getRuleIcon(rule.rule_type);
              return (
                <div key={rule.id} className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-blue-900">{rule.rule_name}</h4>
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full font-semibold">
                            {rule.rule_type.replace('_', ' ').toUpperCase()}
                          </span>
                          {!rule.is_active && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                              INACTIVE
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{rule.description}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                          {rule.trigger_condition?.min_referrals && (
                            <span className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              {rule.trigger_condition.min_referrals}+ referrals
                            </span>
                          )}
                          {rule.bonus_amount > 0 && (
                            <span className="font-bold text-green-900">
                              +${rule.bonus_amount} bonus
                            </span>
                          )}
                          {rule.bonus_percentage > 0 && (
                            <span className="font-bold text-green-900">
                              +{(rule.bonus_percentage * 100).toFixed(0)}% boost
                            </span>
                          )}
                          {rule.is_recurring && (
                            <span className="text-purple-600 font-semibold">Recurring</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEdit(rule)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => {
                          if (confirm('Delete this bonus rule?')) {
                            deleteMutation.mutate(rule.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>

      <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRule ? 'Edit' : 'Create'} Bonus Rule</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Rule Name</Label>
              <Input
                value={formData.rule_name}
                onChange={(e) => setFormData({ ...formData, rule_name: e.target.value })}
                placeholder="e.g., 10 Referrals Milestone"
                required
              />
            </div>

            <div>
              <Label>Rule Type</Label>
              <Select value={formData.rule_type} onValueChange={(v) => setFormData({ ...formData, rule_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="milestone">Milestone (Hit X referrals)</SelectItem>
                  <SelectItem value="activity_based">Activity Based (Referred user activity)</SelectItem>
                  <SelectItem value="streak">Streak (Consecutive days)</SelectItem>
                  <SelectItem value="percentage_boost">Percentage Boost</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe when this bonus is earned"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Minimum Referrals</Label>
                <Input
                  type="number"
                  value={formData.trigger_condition?.min_referrals || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    trigger_condition: { ...formData.trigger_condition, min_referrals: parseInt(e.target.value) || 0 }
                  })}
                  placeholder="e.g., 10"
                />
              </div>
              <div>
                <Label>Maximum Referrals (optional)</Label>
                <Input
                  type="number"
                  value={formData.trigger_condition?.max_referrals || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    trigger_condition: { ...formData.trigger_condition, max_referrals: parseInt(e.target.value) || 0 }
                  })}
                  placeholder="Leave empty for no max"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Bonus Amount ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.bonus_amount}
                  onChange={(e) => setFormData({ ...formData, bonus_amount: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g., 25.00"
                />
              </div>
              <div>
                <Label>Bonus Percentage (0-1)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.bonus_percentage}
                  onChange={(e) => setFormData({ ...formData, bonus_percentage: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g., 0.5 for 50%"
                />
              </div>
            </div>

            <div>
              <Label>Priority (higher = applied first)</Label>
              <Input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                />
                <Label>Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_recurring}
                  onCheckedChange={(v) => setFormData({ ...formData, is_recurring: v })}
                />
                <Label>Recurring (can be earned multiple times)</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowDialog(false); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit" className="gradient-bg-primary text-white">
                {editingRule ? 'Update' : 'Create'} Rule
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}