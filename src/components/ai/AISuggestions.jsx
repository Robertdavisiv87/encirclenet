import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Users, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AISuggestions({ suggestions = [], title = "AI Suggestions", onAction }) {
  if (!suggestions || suggestions.length === 0) return null;

  const iconMap = {
    trending: TrendingUp,
    earning: DollarSign,
    community: Users,
    default: Sparkles
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-purple-900">{title}</h3>
          </div>
          <div className="space-y-2">
            {suggestions.slice(0, 3).map((suggestion, idx) => {
              const Icon = iconMap[suggestion.type] || iconMap.default;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-lg p-3 flex items-center justify-between hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-blue-900">{suggestion.title}</p>
                      <p className="text-xs text-gray-600 line-clamp-1">{suggestion.description}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onAction && onAction(suggestion)}
                    className="gradient-bg-primary text-white"
                  >
                    {suggestion.cta || 'Try It'}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}