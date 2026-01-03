import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MapPin, 
  Search, 
  Star, 
  Wrench, 
  Home as HomeIcon, 
  GraduationCap,
  Scissors,
  Car,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import AISuggestions from '../components/ai/AISuggestions';
import SEO from '../components/SEO';
import { createPageUrl } from '../utils';

export default function LocalServices() {
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {}
    };
    loadUser();
  }, []);

  const { data: serviceVerticals = [], isLoading } = useQuery({
    queryKey: ['service-verticals'],
    queryFn: async () => {
      const verticals = await base44.entities.ServiceVertical.list();
      return verticals.filter(v => v.is_active).slice(0, 10);
    },
    initialData: []
  });

  const categoryIcons = {
    mechanic: Car,
    cleaning: HomeIcon,
    tutoring: GraduationCap,
    beauty: Scissors,
    default: Wrench
  };

  const filteredServices = serviceVerticals.filter(service => 
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50 p-6">
      <SEO 
        title="Local Services Marketplace - Instant Booking | EncircleNet"
        description="Book trusted local services instantly. Real-time availability, automated confirmations, secure payments. From mechanics to tutors, all in one place."
      />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold gradient-text mb-2">Local Services</h1>
          <p className="text-gray-600">Instant booking • Real-time availability • Automated confirmations</p>
        </motion.div>

        {/* Search & Location */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services..."
              className="pl-10 h-12 border-2 border-purple-200"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State or ZIP"
              className="pl-10 h-12 border-2 border-purple-200"
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-100 to-cyan-100 border-2 border-blue-300">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-900">{serviceVerticals.length}</p>
              <p className="text-xs text-gray-700">Service Types</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-300">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-900">4.8★</p>
              <p className="text-xs text-gray-700">Avg Rating</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-300">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-purple-900">24h</p>
              <p className="text-xs text-gray-700">Avg Response</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Suggestions */}
        <AISuggestions
          title="Popular Near You"
          suggestions={[
            {
              type: 'trending',
              title: 'Mobile Mechanic',
              description: 'Average $75/hr in your area',
              cta: 'Book',
              action: 'mechanic'
            },
            {
              type: 'earning',
              title: 'House Cleaning',
              description: '4.9★ rated providers nearby',
              cta: 'Hire',
              action: 'cleaning'
            }
          ]}
          onAction={(suggestion) => {
            window.location.href = `${createPageUrl('ServiceRequest')}?vertical=${suggestion.action}`;
          }}
        />

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        )}

        {/* Service Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service, idx) => {
            const IconComponent = categoryIcons[service.slug] || categoryIcons.default;
            
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="hover:shadow-xl transition-all border-2 border-gray-200 hover:border-purple-300 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-blue-900 mb-1">{service.name}</h3>
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm text-gray-600">4.8 (120+)</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {service.description || 'Professional service provider ready to help you.'}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1 text-gray-600 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>Within 25 miles</span>
                      </div>
                      <div className="text-green-600 font-bold text-lg">
                        ${service.pricing_logic?.base_price || '50'}+
                      </div>
                    </div>

                    <Button 
                      onClick={() => window.location.href = `${createPageUrl('ServiceRequest')}?vertical=${service.slug}`}
                      className="w-full gradient-bg-primary text-white shadow-glow"
                    >
                      Book Now
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {!isLoading && filteredServices.length === 0 && (
          <div className="text-center py-20">
            <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-bold mb-2 text-gray-700">No services found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or location</p>
            <Button 
              onClick={() => setSearchQuery('')}
              variant="outline"
            >
              Clear Search
            </Button>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-[#4B6CB7] to-[#182848] rounded-2xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Want to Offer Services?</h2>
          <p className="text-gray-200 mb-6 max-w-2xl mx-auto">
            Join thousands earning extra income by offering your skills locally. Set your own prices and schedule.
          </p>
          <Button 
            onClick={() => window.location.href = createPageUrl('Welcome')}
            size="lg"
            className="bg-white text-[#4B6CB7] hover:bg-gray-100 shadow-lg"
          >
            Start Earning Today
          </Button>
        </div>
      </div>
    </div>
  );
}