import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function ReferralConfigManager() {
  const queryClient = useQueryClient();

  const { data: configs = [], isLoading } = useQuery({
    queryKey: ['referral-config'],
    queryFn: () => base44.entities.ReferralConfig.list('-created_date', 1),
    initialData: []
  });

  const config = configs[0] || {
    enabled: true,
    referrer_reward_type: 'fixed',
    referrer_reward_value: 10,
    referred_discount_type: 'percentage',
    referred_discount_value: 10,
    minimum_purchase_amount: 0,
    expiration_days: 0,
    max_uses_per_code: 0
  };

  const [formData, setFormData] = useState(config);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      if (configs.length > 0) {
        return base44.entities.ReferralConfig.update(configs[0].id, data);
      } else {
        return base44.entities.ReferralConfig.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['referral-config']);
      toast.success('Configuration saved!');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-purple-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-600" />
          Stripe Referral Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* System Enable/Disable */}
        <div className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div>
            <Label className="text-base font-semibold">Referral System</Label>
            <p className="text-sm text-gray-600">Enable or disable the entire referral system</p>
          </div>
          <Switch
            checked={formData.enabled}
            onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
          />
        </div>

        {/* Referrer Reward Settings */}
        <div className="space-y-4">
          <h3 className="font-semibold text-blue-900">Referrer Reward Settings</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Reward Type</Label>
              <Select
                value={formData.referrer_reward_type}
                onValueChange={(value) => setFormData({ ...formData, referrer_reward_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>
                Reward Value {formData.referrer_reward_type === 'percentage' ? '(%)' : '($)'}
              </Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.referrer_reward_value}
                onChange={(e) => setFormData({ ...formData, referrer_reward_value: parseFloat(e.target.value) })}
              />
            </div>
          </div>
        </div>

        {/* Referred User Discount Settings */}
        <div className="space-y-4">
          <h3 className="font-semibold text-blue-900">Referred User Discount Settings</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Discount Type</Label>
              <Select
                value={formData.referred_discount_type}
                onValueChange={(value) => setFormData({ ...formData, referred_discount_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>
                Discount Value {formData.referred_discount_type === 'percentage' ? '(%)' : '($)'}
              </Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.referred_discount_value}
                onChange={(e) => setFormData({ ...formData, referred_discount_value: parseFloat(e.target.value) })}
              />
            </div>
          </div>
        </div>

        {/* Additional Rules */}
        <div className="space-y-4">
          <h3 className="font-semibold text-blue-900">Additional Rules</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Minimum Purchase ($)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.minimum_purchase_amount}
                onChange={(e) => setFormData({ ...formData, minimum_purchase_amount: parseFloat(e.target.value) })}
              />
              <p className="text-xs text-gray-600 mt-1">Minimum amount to trigger reward (0 = no minimum)</p>
            </div>
            <div>
              <Label>Expiration (Days)</Label>
              <Input
                type="number"
                min="0"
                value={formData.expiration_days}
                onChange={(e) => setFormData({ ...formData, expiration_days: parseInt(e.target.value) })}
              />
              <p className="text-xs text-gray-600 mt-1">Days until code expires (0 = never)</p>
            </div>
            <div>
              <Label>Max Uses Per Code</Label>
              <Input
                type="number"
                min="0"
                value={formData.max_uses_per_code}
                onChange={(e) => setFormData({ ...formData, max_uses_per_code: parseInt(e.target.value) })}
              />
              <p className="text-xs text-gray-600 mt-1">Max redemptions (0 = unlimited)</p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="gradient-bg-primary text-white w-full"
          >
            {updateMutation.isPending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Configuration
              </>
            )}
          </Button>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> Changes will apply to new referral codes. Existing Stripe promotion codes 
            won't be affected. Rewards are automatically distributed via Stripe Customer Balance Credits.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}