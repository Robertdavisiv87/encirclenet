import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Plus, Trash2, Zap } from 'lucide-react';

export default function AutomatedPerksManager({ creatorEmail }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    automation_type: 'tip_thank_you',
    message: '',
    trigger_condition: { min_amount: 5 }
  });
  const queryClient = useQueryClient();

  const { data: automations = [] } = useQuery({
    queryKey: ['automations', creatorEmail],
    queryFn: () => base44.entities.CreatorAutomation.filter({ creator_email: creatorEmail })
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CreatorAutomation.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['automations']);
      setShowForm(false);
      setFormData({ automation_type: 'tip_thank_you', message: '', trigger_condition: { min_amount: 5 } });
      alert('✅ Automation created!');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CreatorAutomation.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['automations']);
      alert('✅ Automation deleted!');
    }
  });

  const handleSubmit = () => {
    if (!formData.message) {
      alert('Please enter a message');
      return;
    }

    createMutation.mutate({
      creator_email: creatorEmail,
      automation_type: formData.automation_type,
      message: formData.message,
      trigger_condition: formData.trigger_condition,
      is_active: true
    });
  };

  const automationTypes = {
    subscriber_welcome: { label: 'Subscriber Welcome', icon: '👋', color: 'purple' },
    tip_thank_you: { label: 'Tip Thank You', icon: '💰', color: 'yellow' },
    milestone_reward: { label: 'Milestone Reward', icon: '🎉', color: 'blue' }
  };

  return (
    <Card className="border-2 border-purple-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            Automated Perks & Messages
          </CardTitle>
          <Button
            size="sm"
            onClick={() => setShowForm(!showForm)}
            className="gradient-bg-primary"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Automation
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <div className="bg-white border-2 border-gray-200 rounded-xl p-4 mb-4">
            <div className="space-y-4">
              <div>
                <Label>Automation Type</Label>
                <Select
                  value={formData.automation_type}
                  onValueChange={(value) => setFormData({ ...formData, automation_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="subscriber_welcome">👋 Subscriber Welcome</SelectItem>
                    <SelectItem value="tip_thank_you">💰 Tip Thank You</SelectItem>
                    <SelectItem value="milestone_reward">🎉 Milestone Reward</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.automation_type === 'tip_thank_you' && (
                <div>
                  <Label>Minimum Tip Amount ($)</Label>
                  <Input
                    type="number"
                    value={formData.trigger_condition.min_amount}
                    onChange={(e) => setFormData({
                      ...formData,
                      trigger_condition: { min_amount: parseFloat(e.target.value) }
                    })}
                    placeholder="5"
                  />
                </div>
              )}

              <div>
                <Label>Message</Label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Thank you so much for your support! 🙏"
                  className="min-h-[100px]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use {'{name}'} for subscriber/tipper name, {'{amount}'} for tip amount
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSubmit} className="gradient-bg-primary">
                  Create Automation
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {automations.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No automations yet. Create one to automatically thank supporters!
            </p>
          ) : (
            automations.map((auto) => {
              const type = automationTypes[auto.automation_type];
              return (
                <div key={auto.id} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{type.icon}</span>
                        <h4 className="font-bold text-blue-900">{type.label}</h4>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">"{auto.message}"</p>
                      {auto.trigger_condition?.min_amount && (
                        <p className="text-xs text-gray-600">
                          Triggers for tips ≥ ${auto.trigger_condition.min_amount}
                        </p>
                      )}
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(auto.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}