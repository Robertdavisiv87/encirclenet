import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, MapPin, Globe, Star } from 'lucide-react';

export default function PromoteService({ user, serviceId }) {
  const [formData, setFormData] = useState({
    promotion_type: 'local_boost',
    budget: 20,
    duration_days: 7
  });
  const queryClient = useQueryClient();

  const createPromotionMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.ServicePromotion.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['promotions']);
    }
  });

  const handleSubmit = () => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + formData.duration_days);

    createPromotionMutation.mutate({
      user_email: user.email,
      service_id: serviceId || 'default',
      promotion_type: formData.promotion_type,
      budget: formData.budget,
      start_date: new Date().toISOString(),
      end_date: endDate.toISOString()
    });
  };

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-900">
          <TrendingUp className="w-6 h-6" />
          Promote Your Service
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Promotion Type</Label>
          <Select value={formData.promotion_type} onValueChange={(val) => setFormData({...formData, promotion_type: val})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-600" />
                  Featured (Homepage)
                </div>
              </SelectItem>
              <SelectItem value="local_boost">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Local Boost
                </div>
              </SelectItem>
              <SelectItem value="national_boost">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-green-600" />
                  National Boost
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Budget ($)</Label>
          <Input
            type="number"
            value={formData.budget}
            onChange={(e) => setFormData({...formData, budget: parseInt(e.target.value)})}
            min={10}
          />
          <p className="text-xs text-gray-600 mt-1">Estimated reach: {formData.budget * 50}+ people</p>
        </div>

        <div>
          <Label>Duration (days)</Label>
          <Input
            type="number"
            value={formData.duration_days}
            onChange={(e) => setFormData({...formData, duration_days: parseInt(e.target.value)})}
            min={1}
            max={30}
          />
        </div>

        <div className="bg-orange-100 rounded-lg p-3 border border-orange-200">
          <p className="text-sm text-orange-900">
            Total: <span className="font-bold">${formData.budget}</span> for {formData.duration_days} days
          </p>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={createPromotionMutation.isLoading}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white"
        >
          Start Promotion
        </Button>
      </CardContent>
    </Card>
  );
}