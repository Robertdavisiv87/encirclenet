import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link as LinkIcon, Copy, Check, ExternalLink, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AffiliateTracker({ userEmail }) {
  const [productUrl, setProductUrl] = useState('');
  const [productName, setProductName] = useState('');
  const [copied, setCopied] = useState(false);

  // Mock affiliate links
  const affiliateLinks = [
    {
      id: 1,
      product: 'Premium Fitness Program',
      url: 'https://example.com/fitness',
      clicks: 847,
      conversions: 23,
      earnings: 345.50,
      rate: 15
    },
    {
      id: 2,
      product: 'Tech Course Bundle',
      url: 'https://example.com/tech',
      clicks: 1203,
      conversions: 41,
      earnings: 615.30,
      rate: 20
    }
  ];

  const handleCopy = (url) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Add New Affiliate Link */}
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 realistic-shadow">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <LinkIcon className="w-5 h-5" />
            Add Affiliate Link
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-blue-900">Product Name</Label>
            <Input
              placeholder="Enter product name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="bg-white border-blue-300"
            />
          </div>
          <div>
            <Label className="text-blue-900">Affiliate URL</Label>
            <Input
              placeholder="https://affiliate-link.com/..."
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              className="bg-white border-blue-300"
            />
          </div>
          <Button className="w-full gradient-bg-primary text-white shadow-glow">
            Generate Tracking Link
          </Button>
        </CardContent>
      </Card>

      {/* Active Affiliate Links */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          Active Affiliate Links
        </h3>
        {affiliateLinks.map((link) => (
          <motion.div
            key={link.id}
            whileHover={{ scale: 1.02 }}
            className="bg-white border-2 border-gray-200 rounded-2xl p-6 realistic-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-bold text-blue-900 mb-1">{link.product}</h4>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  {link.url}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleCopy(link.url)}
                  >
                    {copied ? (
                      <Check className="w-3 h-3 text-green-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </p>
              </div>
              <Badge className="bg-green-100 text-green-700 border-green-300">
                {link.rate}% commission
              </Badge>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-2xl font-bold text-blue-900">{link.clicks}</p>
                <p className="text-xs text-gray-600">Clicks</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-xl border border-green-200">
                <p className="text-2xl font-bold text-green-900">{link.conversions}</p>
                <p className="text-xs text-gray-600">Sales</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-xl border border-purple-200">
                <p className="text-2xl font-bold text-purple-900">${link.earnings}</p>
                <p className="text-xs text-gray-600">Earned</p>
              </div>
            </div>

            {/* Conversion Rate */}
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-600">Conversion Rate</span>
              <span className="font-bold text-green-600">
                {((link.conversions / link.clicks) * 100).toFixed(2)}%
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}