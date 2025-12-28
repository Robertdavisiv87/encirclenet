import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, ShoppingCart, Eye, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DigitalProductCard({ product, onPurchase }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <Card className="overflow-hidden border-2 border-gray-200 hover:border-purple-400 transition-all hover:shadow-glow cursor-pointer">
        <div className="relative aspect-video bg-gradient-to-br from-purple-100 to-pink-100">
          {product.images?.[0] ? (
            <img 
              src={product.images[0]} 
              alt={product.product_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Download className="w-16 h-16 text-purple-400" />
            </div>
          )}
          {product.is_digital && (
            <Badge className="absolute top-2 right-2 bg-blue-500 text-white">
              Digital
            </Badge>
          )}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <Button
              size="sm"
              onClick={() => onPurchase(product)}
              className="gradient-bg-primary text-white shadow-glow"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Buy Now
            </Button>
          </div>
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-bold text-blue-900 mb-1 line-clamp-1">
            {product.product_name}
          </h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-purple-600">
                ${product.price}
              </span>
              {product.currency && product.currency !== 'USD' && (
                <span className="text-sm text-gray-500 ml-1">{product.currency}</span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {product.views_count || 0}
              </span>
              <span className="flex items-center gap-1">
                <ShoppingCart className="w-3 h-3" />
                {product.sales_count || 0}
              </span>
            </div>
          </div>

          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {product.tags.slice(0, 3).map((tag, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}