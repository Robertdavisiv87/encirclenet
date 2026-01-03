import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ServiceVerticalSelector({ onSelect }) {
  const { data: verticals, isLoading } = useQuery({
    queryKey: ['service-verticals-active'],
    queryFn: () => base44.entities.ServiceVertical.filter({ is_active: true }),
    initialData: []
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading services...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold gradient-text mb-2">What service do you need?</h2>
        <p className="text-gray-600">Select a service category to get started</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {verticals.map((vertical, index) => (
          <motion.div
            key={vertical.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className="cursor-pointer hover-lift realistic-shadow bg-white"
              onClick={() => onSelect(vertical)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="text-4xl">{vertical.icon || '🔧'}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{vertical.name}</span>
                      {vertical.pricing_logic?.ai_enabled && (
                        <Sparkles className="w-4 h-4 text-purple-600" />
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{vertical.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {vertical.provider_requirements?.slice(0, 3).map((req, i) => (
                    <span key={i} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {req}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}