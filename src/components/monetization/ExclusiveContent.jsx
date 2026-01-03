import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lock, Upload, DollarSign, Eye } from 'lucide-react';

export default function ExclusiveContent({ user }) {
  const [formData, setFormData] = useState({
    content_type: 'exclusive_post',
    title: '',
    description: '',
    price: 5
  });
  const queryClient = useQueryClient();

  const { data: content } = useQuery({
    queryKey: ['content-monetization', user?.email],
    queryFn: () => base44.entities.ContentMonetization.filter({ creator_email: user?.email }),
    initialData: [],
    enabled: !!user
  });

  const createContentMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.ContentMonetization.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['content-monetization']);
      setFormData({
        content_type: 'exclusive_post',
        title: '',
        description: '',
        price: 5
      });
    }
  });

  const handleSubmit = () => {
    createContentMutation.mutate({
      creator_email: user.email,
      ...formData
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-900">
            <Lock className="w-6 h-6" />
            Exclusive Content
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Content Type</Label>
            <Select value={formData.content_type} onValueChange={(val) => setFormData({...formData, content_type: val})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="exclusive_post">Exclusive Post</SelectItem>
                <SelectItem value="premium_story">Premium Story</SelectItem>
                <SelectItem value="tutorial">Tutorial</SelectItem>
                <SelectItem value="course">Course</SelectItem>
                <SelectItem value="digital_product">Digital Product</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Title</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Give your content a catchy title"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="What will buyers get?"
              rows={3}
            />
          </div>

          <div>
            <Label>Price ($)</Label>
            <Input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
              min={1}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!formData.title || createContentMutation.isLoading}
            className="w-full gradient-bg-primary text-white"
          >
            Create Exclusive Content
          </Button>
        </CardContent>
      </Card>

      {content.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {content.map((item) => (
                <div key={item.id} className="p-3 border rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-600">{item.purchases_count} purchases • ${item.total_revenue} earned</p>
                  </div>
                  <span className="text-green-600 font-bold">${item.price}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}