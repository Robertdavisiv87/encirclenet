import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationBell({ user }) {
  const [hasNew, setHasNew] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) return;

    const checkNotifications = async () => {
      try {
        // Check for new likes
        const recentLikes = await base44.entities.Like.filter({}, '-created_date', 5);
        
        // Check for new transactions
        const recentTransactions = await base44.entities.Transaction.filter({
          to_email: user.email
        }, '-created_date', 5);

        const totalNew = recentLikes.length + recentTransactions.length;
        setHasNew(totalNew > 0);
        
        const notifs = [
          ...recentLikes.map(l => ({ type: 'like', data: l })),
          ...recentTransactions.map(t => ({ type: 'transaction', data: t }))
        ].slice(0, 5);
        
        setNotifications(notifs);
      } catch (e) {
        console.error('Failed to load notifications:', e);
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 30000); // Check every 30s

    return () => clearInterval(interval);
  }, [user]);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => {
          // Navigate to notifications page when implemented
          console.log('Notifications:', notifications);
        }}
      >
        <Bell className="w-5 h-5 text-gray-600" />
        <AnimatePresence>
          {hasNew && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"
            />
          )}
        </AnimatePresence>
      </Button>
    </div>
  );
}