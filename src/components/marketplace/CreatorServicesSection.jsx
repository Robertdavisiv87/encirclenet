import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Briefcase, Clock, DollarSign, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export default function CreatorServicesSection({ creatorEmail, isOwner, currentUser }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceData, setServiceData] = useState({
    service_name: '',
    description: '',
    category: 'consulting',
    price: '',
    duration: '',
    delivery_time: ''
  });
  const queryClient = useQueryClient();

  const { data: services = [] } = useQuery({
    queryKey: ['creator-services', creatorEmail],
    queryFn: () => base44.entities.CreatorService.filter({ 
      creator_email: creatorEmail,
      is_active: true 
    })
  });

  const createServiceMutation = useMutation({
    mutationFn: (data) => base44.entities.CreatorService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['creator-services']);
      setShowAddModal(false);
      setServiceData({
        service_name: '',
        description: '',
        category: 'consulting',
        price: '',
        duration: '',
        delivery_time: ''
      });
      alert('✅ Service added!');
    }
  });

  const bookServiceMutation = useMutation({
    mutationFn: async (service) => {
      const result = await base44.functions.invoke('processServiceOrder', {
        service_id: service.id,
        buyer_email: currentUser.email,
        seller_email: creatorEmail,
        amount: service.price
      });
      
      await base44.entities.CreatorService.update(service.id, {
        sales_count: (service.sales_count || 0) + 1,
        total_revenue: (service.total_revenue || 0) + service.price
      });

      return result.data;
    },
    onSuccess: (data, service) => {
      queryClient.invalidateQueries(['creator-services']);
      
      base44.functions.invoke('createNotification', {
        user_email: creatorEmail,
        type: 'tip',
        title: 'Service Booked!',
        message: `${currentUser.full_name || currentUser.email} booked "${service.service_name}" for $${service.price}`,
        from_user: currentUser.email,
        from_user_name: currentUser.full_name
      }).catch(err => console.log('Notification failed:', err));

      setShowBookModal(false);
      alert('✅ Service booked! The creator will contact you soon.');
    }
  });

  const handleAddService = () => {
    if (!serviceData.service_name || !serviceData.price) {
      alert('Please fill in required fields');
      return;
    }
    createServiceMutation.mutate({
      creator_email: creatorEmail,
      ...serviceData,
      price: parseFloat(serviceData.price),
      is_active: true,
      sales_count: 0,
      total_revenue: 0
    });
  };

  const handleBook = (service) => {
    if (!currentUser) {
      base44.auth.redirectToLogin();
      return;
    }
    setSelectedService(service);
    setShowBookModal(true);
  };

  if (services.length === 0 && !isOwner) return null;

  const categoryIcons = {
    consulting: '💼',
    coaching: '🎯',
    design: '🎨',
    development: '💻',
    marketing: '📈',
    content_creation: '📹',
    other: '✨'
  };

  return (
    <Card className="bg-white border-2 border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            Services
          </CardTitle>
          {isOwner && (
            <Button 
              size="sm" 
              onClick={() => setShowAddModal(true)}
              className="gradient-bg-primary text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {services.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No services yet</p>
            {isOwner && <p className="text-sm">Offer services to your audience</p>}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-2 border-gray-200 hover:border-blue-400 transition-all hover:shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center text-2xl">
                        {categoryIcons[service.category] || '✨'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-blue-900 line-clamp-1">{service.service_name}</h4>
                        <Badge variant="outline" className="text-xs mt-1">
                          {service.category}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{service.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        {service.duration || 'Custom duration'}
                      </div>
                      {service.delivery_time && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <DollarSign className="w-4 h-4" />
                          Delivery: {service.delivery_time}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-blue-600">${service.price}</span>
                      {!isOwner && (
                        <Button
                          size="sm"
                          onClick={() => handleBook(service)}
                          className="gradient-bg-primary text-white"
                        >
                          Book Now
                        </Button>
                      )}
                      {isOwner && (
                        <span className="text-xs text-gray-500">
                          {service.sales_count || 0} sales
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Add Service Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Service</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Service Name *</Label>
              <Input
                value={serviceData.service_name}
                onChange={(e) => setServiceData({ ...serviceData, service_name: e.target.value })}
                placeholder="e.g., 1-on-1 Coaching Session"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={serviceData.description}
                onChange={(e) => setServiceData({ ...serviceData, description: e.target.value })}
                placeholder="Describe your service..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <Select
                  value={serviceData.category}
                  onValueChange={(value) => setServiceData({ ...serviceData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consulting">Consulting</SelectItem>
                    <SelectItem value="coaching">Coaching</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="content_creation">Content Creation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Price ($) *</Label>
                <Input
                  type="number"
                  value={serviceData.price}
                  onChange={(e) => setServiceData({ ...serviceData, price: e.target.value })}
                  placeholder="99"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Duration</Label>
                <Input
                  value={serviceData.duration}
                  onChange={(e) => setServiceData({ ...serviceData, duration: e.target.value })}
                  placeholder="1 hour"
                />
              </div>
              <div>
                <Label>Delivery Time</Label>
                <Input
                  value={serviceData.delivery_time}
                  onChange={(e) => setServiceData({ ...serviceData, delivery_time: e.target.value })}
                  placeholder="2-3 days"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleAddService}
                disabled={createServiceMutation.isPending}
                className="gradient-bg-primary flex-1"
              >
                {createServiceMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Adding...</>
                ) : 'Add Service'}
              </Button>
              <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Book Service Modal */}
      <Dialog open={showBookModal} onOpenChange={setShowBookModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Service</DialogTitle>
          </DialogHeader>
          {selectedService && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-bold text-blue-900 mb-2">{selectedService.service_name}</h3>
                <p className="text-sm text-gray-600 mb-3">{selectedService.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">${selectedService.price}</span>
                  <Badge>{selectedService.category}</Badge>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                The creator will be notified and will reach out to you shortly to coordinate.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => bookServiceMutation.mutate(selectedService)}
                  disabled={bookServiceMutation.isPending}
                  className="flex-1 gradient-bg-primary text-white"
                >
                  {bookServiceMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
                  ) : `Book for $${selectedService.price}`}
                </Button>
                <Button variant="outline" onClick={() => setShowBookModal(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}