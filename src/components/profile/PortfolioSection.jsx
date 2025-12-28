import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, ExternalLink, Eye, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import AddPortfolioModal from './AddPortfolioModal';

export default function PortfolioSection({ userEmail, isOwner, currentUser }) {
  const [showAddModal, setShowAddModal] = React.useState(false);
  const { data: portfolioItems = [], refetch } = useQuery({
    queryKey: ['portfolio', userEmail],
    queryFn: () => base44.entities.Portfolio.filter({ freelancer_email: userEmail }),
    enabled: !!userEmail,
    refetchInterval: 60000
  });

  const handleSave = () => {
    refetch();
  };

  if (portfolioItems.length === 0 && !isOwner) return null;

  return (
    <Card className="bg-white border-2 border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-purple-600" />
            Portfolio
          </CardTitle>
          {isOwner && (
            <Button 
              size="sm" 
              onClick={() => setShowAddModal(true)}
              className="gradient-bg-primary text-white"
            >
              Add Project
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {portfolioItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No portfolio items yet</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {portfolioItems.slice(0, 6).map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-glow transition-all cursor-pointer"
              >
                {item.images?.[0] && (
                  <img 
                    src={item.images[0]} 
                    alt={item.title}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-4">
                  <h4 className="font-bold text-blue-900 mb-1">{item.title}</h4>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {item.views_count || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {item.likes_count || 0}
                      </span>
                    </div>
                    {item.live_url && (
                      <a href={item.live_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 text-purple-600" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
      
      {isOwner && (
        <AddPortfolioModal
          show={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleSave}
          currentUser={currentUser}
        />
      )}
    </Card>
  );
}