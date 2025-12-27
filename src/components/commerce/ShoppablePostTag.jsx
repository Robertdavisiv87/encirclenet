import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ShoppingBag, Tag, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function ShoppablePostTag({ postId, products = [] }) {
  const [showProducts, setShowProducts] = useState(false);
  const [productDetails, setProductDetails] = useState([]);

  useEffect(() => {
    if (products.length > 0) {
      loadProducts();
    }
  }, [products]);

  const loadProducts = async () => {
    try {
      const loaded = await Promise.all(
        products.map(pid => base44.entities.ShoppableProduct.filter({ id: pid }))
      );
      setProductDetails(loaded.flat());
    } catch (e) {
      console.error('Failed to load products');
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="relative">
      {/* Shopping Tag Button */}
      <button
        onClick={() => setShowProducts(!showProducts)}
        className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:scale-110 transition-transform"
      >
        <ShoppingBag className="w-5 h-5 text-purple-600" />
        {products.length > 1 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {products.length}
          </span>
        )}
      </button>

      {/* Product Cards */}
      <AnimatePresence>
        {showProducts && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute top-16 right-4 z-20 bg-white rounded-xl shadow-2xl p-4 w-80 max-h-96 overflow-y-auto"
          >
            <div className="flex items-center gap-2 mb-3 pb-3 border-b">
              <Tag className="w-4 h-4 text-purple-600" />
              <h3 className="font-semibold text-sm">Products in this post</h3>
            </div>

            <div className="space-y-3">
              {productDetails.map(product => (
                <div key={product.id} className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  {product.images?.[0] && (
                    <img src={product.images[0]} alt={product.product_name} className="w-16 h-16 rounded-lg object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.product_name}</p>
                    <p className="text-lg font-bold text-purple-600">${product.price}</p>
                    <Button
                      size="sm"
                      className="mt-1 w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white"
                      onClick={() => window.location.href = `/product?id=${product.id}`}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}