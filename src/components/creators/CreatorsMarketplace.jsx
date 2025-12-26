import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Briefcase, Star, Clock, ExternalLink, Loader2, Plus, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import PostServiceModal from './PostServiceModal';

export default function CreatorsMarketplace() {
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPostModal, setShowPostModal] = useState(false);
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {}
    };
    loadUser();
  }, []);

  // Fetch user's own services
  const { data: userServices } = useQuery({
    queryKey: ['user-services', user?.email],
    queryFn: () => base44.entities.FreelanceService.filter({ freelancer_email: user?.email }),
    enabled: !!user?.email,
    initialData: []
  });

  // Fetch aggregated services
  const { data: externalServicesData, isLoading: loadingExternal } = useQuery({
    queryKey: ['external-services', category],
    queryFn: async () => {
      const response = await base44.functions.invoke('fetchFreelanceServices', { category });
      return response.data;
    },
    staleTime: 1000 * 60 * 30,
  });

  // Fetch all platform services
  const { data: platformServices, isLoading: loadingPlatform } = useQuery({
    queryKey: ['platform-services'],
    queryFn: () => base44.entities.FreelanceService.list('-created_date', 100),
    initialData: []
  });

  const externalServices = externalServicesData?.services || [];
  const allServices = [...platformServices, ...externalServices];

  const filteredServices = allServices.filter(service => {
    const matchesCategory = category === 'all' || service.category === category;
    const matchesSearch = !searchQuery || 
      service.service_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { value: 'all', label: 'All Services' },
    { value: 'graphic_design', label: 'Graphic Design' },
    { value: 'logo_design', label: 'Logo Design' },
    { value: 'web_design', label: 'Web Design' },
    { value: 'uiux_design', label: 'UI/UX Design' },
    { value: 'mobile_app_dev', label: 'Mobile App Dev' },
    { value: 'wordpress_dev', label: 'WordPress' },
    { value: 'shopify_dev', label: 'Shopify' },
    { value: 'seo', label: 'SEO' },
    { value: 'content_writing', label: 'Content Writing' },
    { value: 'video_editing', label: 'Video Editing' },
    { value: 'social_media_mgmt', label: 'Social Media' },
    { value: 'virtual_assistant', label: 'Virtual Assistant' },
    { value: 'ai_automation', label: 'AI & Automation' }
  ];

  const isLoading = loadingExternal || loadingPlatform;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text flex items-center gap-2">
            <Briefcase className="w-7 h-7" />
            Creators Marketplace
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Hire freelancers or offer your services
          </p>
        </div>
        {user && (
          <Button 
            onClick={() => setShowPostModal(true)}
            className="gradient-bg-primary text-white shadow-glow"
          >
            <Plus className="w-4 h-4 mr-2" />
            Post Service
          </Button>
        )}
      </div>

      {/* My Services */}
      {userServices.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4">
          <h3 className="font-semibold text-blue-900 mb-3">My Services ({userServices.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {userServices.map(service => (
              <div key={service.id} className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="font-semibold text-sm mb-1">{service.service_title}</p>
                <div className="flex items-center justify-between">
                  <span className="text-purple-600 font-bold">${service.price_starting}</span>
                  <Badge variant="outline">{service.orders_completed || 0} orders</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full md:w-64">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      )}

      {/* Services Grid */}
      {!isLoading && filteredServices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service, index) => (
            <motion.div
              key={service.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="bg-white rounded-xl overflow-hidden border-2 border-gray-200 hover:border-purple-400 transition-all shadow-md hover:shadow-xl"
            >
              {/* Service Image/Portfolio */}
              <div className="relative h-40 bg-gradient-to-br from-purple-100 to-pink-100">
                {service.images?.[0] ? (
                  <img 
                    src={service.images[0]} 
                    alt={service.service_title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Briefcase className="w-12 h-12 text-purple-400" />
                  </div>
                )}
                {service.platform_source && (
                  <Badge className="absolute top-2 right-2 bg-blue-500 text-white text-xs">
                    {service.platform_source}
                  </Badge>
                )}
              </div>

              {/* Freelancer Info */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={service.freelancer_avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-500 text-white text-xs">
                      {service.freelancer_name?.[0] || 'F'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">
                      {service.freelancer_name}
                    </p>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-semibold">{service.rating || 5}</span>
                      <span className="text-xs text-gray-500">({service.reviews_count || 0})</span>
                    </div>
                  </div>
                </div>

                {/* Service Title */}
                <h3 className="font-bold text-blue-900 text-sm mb-2 line-clamp-2">
                  {service.service_title}
                </h3>

                {/* Description */}
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                  {service.description}
                </p>

                {/* Tags */}
                {service.tags && service.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {service.tags.slice(0, 3).map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {service.delivery_days} days
                  </div>
                  <div>
                    {service.orders_completed || 0} orders
                  </div>
                </div>

                {/* Price & Action */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-500">Starting at</span>
                    <p className="text-lg font-bold text-purple-600">
                      ${service.price_starting}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="gradient-bg-primary text-white"
                    onClick={() => {
                      if (service.external_url) {
                        window.open(service.external_url, '_blank');
                      } else {
                        alert('Contact freelancer: ' + service.freelancer_email);
                      }
                    }}
                  >
                    {service.external_url ? (
                      <>
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View
                      </>
                    ) : (
                      'Order'
                    )}
                  </Button>
                </div>

                {/* Commission Info */}
                <p className="text-xs text-green-600 mt-2 text-center">
                  💰 Platform earns 10% commission on all orders
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredServices.length === 0 && (
        <div className="text-center py-20">
          <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 font-medium">No services found</p>
          <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
        </div>
      )}

      {/* Platforms Info */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4">
        <p className="text-xs text-gray-600 text-center">
          🎯 Services from Fiverr, Upwork, Freelancer.com, Toptal & more | 💼 Post your own services and earn
        </p>
      </div>

      {/* Post Service Modal */}
      <PostServiceModal 
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        user={user}
        onSuccess={() => {
          queryClient.invalidateQueries(['user-services']);
          queryClient.invalidateQueries(['platform-services']);
        }}
      />
    </div>
  );
}