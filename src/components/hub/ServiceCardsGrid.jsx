import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, DollarSign, Clock } from 'lucide-react';
import { createPageUrl } from '../../utils';

export default function ServiceCardsGrid({ services }) {
  if (services.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No services found. Try adjusting your search or category.</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      {services.map((service, i) => (
        <motion.div
          key={service.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
        >
          <Card className="hover:shadow-xl transition-all border-2 border-gray-200 hover:border-purple-300 h-full">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{service.icon || '🔧'}</span>
                  <div>
                    <h3 className="font-bold text-blue-900 text-sm">{service.name}</h3>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="text-xs text-gray-600">4.8</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                {service.description || 'Professional service provider'}
              </p>

              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-gray-600">
                    <MapPin className="w-3 h-3" />
                    Within 25mi
                  </span>
                  <span className="flex items-center gap-1 text-gray-600">
                    <Clock className="w-3 h-3" />
                    Same day
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    Available Now
                  </Badge>
                  <span className="text-green-600 font-bold text-sm">
                    ${service.pricing_logic?.base_price || 50}+
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={() => window.location.href = `${createPageUrl('ServiceRequest')}?vertical=${service.slug}`}
                  size="sm"
                  className="gradient-bg-primary text-white text-xs"
                >
                  Book Now
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => alert('View details coming soon')}
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}