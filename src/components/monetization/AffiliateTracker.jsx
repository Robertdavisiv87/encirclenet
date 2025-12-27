import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  Link as LinkIcon, 
  TrendingUp, 
  MousePointerClick, 
  DollarSign,
  ExternalLink,
  Copy,
  Plus,
  Eye,
  ShoppingCart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function AffiliateTracker({ userEmail }) {
  const [newProductName, setNewProductName] = useState('');
  const [newProductUrl, setNewProductUrl] = useState('');
  const [newCommission, setNewCommission] = useState(5);

  const { data: affiliateLinks = [], refetch } = useQuery({
    queryKey: ['affiliate-links', userEmail],
    queryFn: () => base44.entities.AffiliateLink.filter({ user_email: userEmail }),
    enabled: !!userEmail
  });

  const { data: userPromotions = [] } = useQuery({
    queryKey: ['user-promotions', userEmail],
    queryFn: () => base44.entities.UserAffiliatePromotion.filter({ user_email: userEmail }),
    enabled: !!userEmail
  });

  const handleAddAffiliateLink = async () => {
    if (!newProductName || !newProductUrl) {
      alert('Please enter product name and URL');
      return;
    }

    try {
      const affiliateUrl = `${newProductUrl}?ref=${userEmail.slice(0, 6)}`;
      await base44.entities.AffiliateLink.create({
        user_email: userEmail,
        product_name: newProductName,
        product_url: newProductUrl,
        affiliate_url: affiliateUrl,
        commission_rate: newCommission,
        clicks: 0,
        conversions: 0,
        earnings: 0
      });
      
      setNewProductName('');
      setNewProductUrl('');
      setNewCommission(5);
      refetch();
    } catch (e) {
      alert('Failed to add affiliate link');
    }
  };

  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
    alert('Link copied to clipboard!');
  };

  const totalClicks = affiliateLinks.reduce((sum, link) => sum + (link.clicks || 0), 0);
  const totalConversions = affiliateLinks.reduce((sum, link) => sum + (link.conversions || 0), 0);
  const totalEarnings = affiliateLinks.reduce((sum, link) => sum + (link.earnings || 0), 0);
  const conversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <MousePointerClick className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-900">{totalClicks}</p>
            <p className="text-xs text-gray-600">Total Clicks</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <ShoppingCart className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-900">{totalConversions}</p>
            <p className="text-xs text-gray-600">Conversions</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-900">{conversionRate}%</p>
            <p className="text-xs text-gray-600">Conversion Rate</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-yellow-900">${totalEarnings.toFixed(2)}</p>
            <p className="text-xs text-gray-600">Total Earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Add New Affiliate Link */}
      <Card className="bg-white border-2 border-gray-200">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Affiliate Product
          </h3>
          <div className="space-y-3">
            <Input
              placeholder="Product Name"
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
              className="bg-white border-gray-300"
            />
            <Input
              placeholder="Product URL"
              value={newProductUrl}
              onChange={(e) => setNewProductUrl(e.target.value)}
              className="bg-white border-gray-300"
            />
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Commission Rate (%)</label>
              <Input
                type="number"
                value={newCommission}
                onChange={(e) => setNewCommission(Number(e.target.value))}
                className="bg-white border-gray-300"
                min="0"
                max="100"
              />
            </div>
            <Button 
              onClick={handleAddAffiliateLink}
              className="w-full gradient-bg-primary text-white shadow-glow"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Affiliate Link
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Affiliate Links List */}
      <div className="space-y-3">
        <h3 className="text-xl font-bold text-blue-900">Your Affiliate Links</h3>
        
        {affiliateLinks.length === 0 ? (
          <Card className="bg-white border-2 border-gray-200">
            <CardContent className="p-8 text-center">
              <LinkIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No affiliate links yet</p>
              <p className="text-sm text-gray-500">Add your first affiliate product to start earning commissions</p>
            </CardContent>
          </Card>
        ) : (
          affiliateLinks.map((link) => (
            <Card key={link.id} className="bg-white border-2 border-gray-200 hover:border-purple-300 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-bold text-blue-900 mb-1">{link.product_name}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <MousePointerClick className="w-4 h-4" />
                        {link.clicks || 0} clicks
                      </span>
                      <span className="flex items-center gap-1">
                        <ShoppingCart className="w-4 h-4" />
                        {link.conversions || 0} sales
                      </span>
                      <span className="flex items-center gap-1 text-green-600 font-semibold">
                        <DollarSign className="w-4 h-4" />
                        ${(link.earnings || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                      {link.commission_rate}% commission
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-xs text-gray-600 mb-1">Your Affiliate Link:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm bg-white px-3 py-2 rounded border border-gray-200 truncate">
                      {link.affiliate_url}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyLink(link.affiliate_url)}
                      className="border-gray-300"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(link.product_url, '_blank')}
                    className="flex-1 border-gray-300"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Product
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleCopyLink(link.affiliate_url)}
                    className="flex-1 gradient-bg-primary text-white"
                  >
                    Share Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Tips Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300">
        <CardContent className="p-6">
          <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Maximize Your Affiliate Earnings
          </h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Share products you genuinely use and love
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Create valuable content around the products
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Use affiliate links in posts, stories, and bio
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Track performance and optimize your strategy
            </li>
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}