import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, ExternalLink, DollarSign, TrendingUp, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function InfoCard({ post, onClose, userTier }) {
  const [showAffiliate, setShowAffiliate] = useState(false);

  const affiliateProducts = [
    { name: 'Premium Fitness App', price: 49.99, commission: 15, url: 'https://example.com' },
    { name: 'Smart Scale', price: 79.99, commission: 20, url: 'https://example.com' },
    { name: 'Meal Prep Guide', price: 24.99, commission: 40, url: 'https://example.com' },
  ];

  const canMonetize = userTier === 'pro' || userTier === 'elite';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
          className="w-full max-w-2xl max-h-[80vh] overflow-y-auto custom-scrollbar"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold mb-2">{post.caption}</h3>
                  <div className="flex items-center gap-4 text-sm text-zinc-400">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {post.likes_count} likes
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {post.comments_count} comments
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Expert Tips Section */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-purple-400">Expert Tips</h4>
                <div className="bg-zinc-800 rounded-lg p-4">
                  <ul className="space-y-2 text-sm text-zinc-300">
                    <li>✓ Start with proper warm-up to prevent injuries</li>
                    <li>✓ Focus on form over weight for better results</li>
                    <li>✓ Stay consistent with your routine</li>
                    <li>✓ Track your progress weekly</li>
                  </ul>
                </div>
              </div>

              {/* Affiliate Products */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-purple-400">Recommended Products</h4>
                  {canMonetize && (
                    <span className="text-xs text-green-400 font-semibold">
                      Earn 50-70% commission
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  {affiliateProducts.map((product, index) => (
                    <div
                      key={index}
                      className="bg-zinc-800 rounded-lg p-4 hover:bg-zinc-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold mb-1">{product.name}</p>
                          <p className="text-sm text-zinc-400">${product.price}</p>
                          {canMonetize && (
                            <p className="text-xs text-green-400 mt-1">
                              Your commission: ${(product.price * product.commission / 100).toFixed(2)}
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-purple-600 to-pink-500"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Posts */}
              <div>
                <h4 className="font-semibold mb-3 text-purple-400">Related Trending Posts</h4>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="aspect-square bg-zinc-800 rounded-lg hover:opacity-70 transition-opacity cursor-pointer"
                    >
                      <img
                        src={`https://images.unsplash.com/photo-${['1571019613454-1cb2f99b2d8b', '1541534741688-6078c6bfb5c5', '1517836357463-d25dfeac3438'][i - 1]}?w=200&h=200&fit=crop`}
                        alt=""
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}