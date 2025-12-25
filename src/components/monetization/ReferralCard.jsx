import React, { useState } from 'react';
import { Copy, Check, Users, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function ReferralCard({ user, referralStats }) {
  const [copied, setCopied] = useState(false);
  
  const referralCode = user?.email ? 
    `CIRCLE${user.email.substring(0, 5).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}` 
    : 'LOADING';
  
  const referralLink = `${window.location.origin}?ref=${referralCode}`;
  
  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          Referral Program
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-zinc-300">
          Earn commission from every user you refer. More referrals = higher tier bonuses!
        </p>
        
        <div className="flex gap-2">
          <Input 
            value={referralLink}
            readOnly
            className="bg-black/50 border-zinc-700"
          />
          <Button 
            onClick={handleCopy}
            variant="outline"
            className="border-purple-500/50"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/30 rounded-lg p-3">
            <p className="text-xs text-zinc-500 mb-1">Referrals</p>
            <p className="text-2xl font-bold">{referralStats?.count || 0}</p>
          </div>
          <div className="bg-black/30 rounded-lg p-3">
            <p className="text-xs text-zinc-500 mb-1">Earned</p>
            <p className="text-2xl font-bold text-green-400">
              ${(referralStats?.earnings || 0).toFixed(2)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}