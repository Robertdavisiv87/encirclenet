import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Users, DollarSign, CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReferralSuccessNotification({ user }) {
  const { data: recentReferrals, isLoading } = useQuery({
    queryKey: ['recent-referrals', user?.email],
    queryFn: async () => {
      const referrals = await base44.entities.Referral.filter(
        { referrer_email: user?.email },
        '-created_date',
        5
      );
      // Only show referrals from the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return referrals.filter(ref => 
        new Date(ref.created_date) > sevenDaysAgo
      );
    },
    enabled: !!user?.email,
    staleTime: 60000,
  });

  if (isLoading || !recentReferrals || recentReferrals.length === 0) {
    return null;
  }

  const totalEarned = recentReferrals.reduce((sum, ref) => sum + (ref.commission_earned || 0), 0);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-4"
      >
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 shadow-glow">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shadow-lg animate-bounce-in">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-green-900 mb-1 flex items-center gap-2">
                  🎉 Referral Success!
                </h3>
                <p className="text-sm text-green-800 mb-2">
                  You've successfully referred <span className="font-bold">{recentReferrals.length}</span> {recentReferrals.length === 1 ? 'person' : 'people'} this week!
                </p>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-green-700" />
                    <span className="font-semibold text-green-900">
                      {recentReferrals.length} new {recentReferrals.length === 1 ? 'member' : 'members'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-green-700" />
                    <span className="font-semibold text-green-900">
                      ${totalEarned.toFixed(2)} earned
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}