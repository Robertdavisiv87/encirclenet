import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Smartphone, Laptop, Tablet, Watch, Headphones, Camera, Gamepad2, Usb, Star, TrendingUp, Share2, ShoppingCart, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

const categoryIcons = {
  smartphones: Smartphone,
  laptops: Laptop,
  tablets: Tablet,
  smartwatches: Watch,
  headphones: Headphones,
  cameras: Camera,
  gaming: Gamepad2,
  accessories: Usb
};

export default function TechProductsSection() {
  const [category, setCategory] = useState('all');
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

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['tech-products', category],
    queryFn: async () => {
      const existingProducts = await base44.entities.TechProduct.list('-created_date', 50);
      if (existingProducts.length > 0) {
        return existingProducts;
      }
      // Fetch new products if none exist
      const response = await base44.functions.invoke('fetchTechProducts', { category });
      return response.data.products || [];
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
    retryDelay: 1000
  });

  const createAffiliatePromotion = useMutation({
    mutationFn: async (productId) => {
      const uniqueLink = `${window.location.origin}/shop/product/${productId}?ref=${user.email.split('@')[0]}_${Date.now()}`;
      return await base44.entities.UserAffiliatePromotion.create({
        user_email: user.email,
        product_id: productId,
        product_type: 'tech_product',
        unique_link: uniqueLink
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['affiliate-promotions']);
      alert('Affiliate link created! Share it to earn commissions.');
    }
  });

  const trackProductClick = async (product) => {
    // Track admin commission for click
    await base44.entities.AdminCommission.create({
      transaction_type: 'ppc',
      user_email: user?.email || 'anonymous',
      transaction_id: product.id,
      transaction_amount: 0.1,
      commission_rate: 100,
      commission_amount: 0.1,
      status: 'completed',
      metadata: { product_name: product.product_name }
    });

    // Update product sales count
    await base44.entities.TechProduct.update(product.id, {
      sales_count: (product.sales_count || 0) + 1
    });

    window.open(product.affiliate_url || product.product_url, '_blank');
  };

  const categories = [
    { value: 'all', label: 'All Products' },
    { value: 'smartphones', label: 'Smartphones' },
    { value: 'laptops', label: 'Laptops' },
    { value: 'tablets', label: 'Tablets' },
    { value: 'smartwatches', label: 'Smartwatches' },
    { value: 'headphones', label: 'Headphones' },
    { value: 'cameras', label: 'Cameras' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'accessories', label: 'Accessories' }
  ];

  const filteredProducts = category === 'all' 
    ? products 
    : products?.filter(p => p.category === category);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text flex items-center gap-2">
            <Smartphone className="w-7 h-7" />
            Tech Products Shop
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Shop trending tech & earn commissions as affiliate
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full md:w-64 bg-white">
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
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-purple-500 mx-auto mb-3" />
            <p className="text-blue-900 font-medium">Loading tech products...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-3xl">⚠️</span>
          </div>
          <h3 className="text-xl font-bold mb-2 text-blue-900">Error Loading Products</h3>
          <p className="text-gray-600 mb-4">We couldn't load products right now.</p>
          <Button onClick={() => window.location.reload()} className="gradient-bg-primary text-white shadow-glow">
            <Loader2 className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      )}

      {/* Products Grid */}
      {!isLoading && filteredProducts && filteredProducts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product, index) => {
            const CategoryIcon = categoryIcons[product.category] || Smartphone;
            const discount = product.original_price 
              ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
              : 0;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl overflow-hidden border-2 border-gray-200 hover:border-purple-400 transition-all shadow-md hover:shadow-xl"
              >
                {/* Product Image */}
                <div className="relative h-48 bg-gray-100">
                  <img 
                    src={product.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop'} 
                    alt={product.product_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop';
                    }}
                  />
                  {product.is_trending && (
                    <Badge className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-red-500 text-white">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Trending
                    </Badge>
                  )}
                  {discount > 0 && (
                    <Badge className="absolute top-2 right-2 bg-green-500 text-white">
                      {discount}% OFF
                    </Badge>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <CategoryIcon className="w-5 h-5 text-purple-600 mt-1" />
                    <h3 className="font-bold text-blue-900 text-sm line-clamp-2 flex-1">
                      {product.product_name}
                    </h3>
                  </div>

                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Rating */}
                  {product.rating && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold">{product.rating}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        ({product.reviews_count} reviews)
                      </span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-end gap-2 mb-4">
                    <span className="text-2xl font-bold text-purple-600">
                      ${product.price}
                    </span>
                    {product.original_price && (
                      <span className="text-sm text-gray-500 line-through mb-1">
                        ${product.original_price}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mb-3">
                    Sold by: {product.platform}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 gradient-bg-primary text-white shadow-glow hover-lift"
                      onClick={() => trackProductClick(product)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Buy Now
                    </Button>
                    {user && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => createAffiliatePromotion.mutate(product.id)}
                        title="Get affiliate link"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* Affiliate Info */}
                  <p className="text-xs text-green-600 mt-2 text-center">
                    💰 Earn {product.affiliate_commission_rate}% commission by promoting
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 mt-6">
        <p className="text-xs text-gray-600 text-center mb-2">
          🛍️ Products from Amazon, Best Buy, Newegg & more | 💸 Earn commissions by promoting
        </p>
        <p className="text-xs text-purple-600 text-center font-semibold">
          Platform earns 2% admin commission on all sales
        </p>
      </div>
    </div>
  );
}