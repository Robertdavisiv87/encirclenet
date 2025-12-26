import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Bell, Heart, DollarSign, Users, MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import moment from 'moment';

export default function NotificationDropdown({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNew, setHasNew] = useState(false);

  const { data: likes = [] } = useQuery({
    queryKey: ['notification-likes', user?.email],
    queryFn: async () => {
      const myPosts = await base44.entities.Post.filter({ created_by: user?.email });
      const postIds = myPosts.map(p => p.id);
      if (postIds.length === 0) return [];
      const allLikes = await base44.entities.Like.list('-created_date', 50);
      return allLikes.filter(l => postIds.includes(l.post_id));
    },
    enabled: !!user?.email,
    refetchInterval: 30000
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['notification-transactions', user?.email],
    queryFn: () => base44.entities.Transaction.filter({
      to_email: user?.email
    }, '-created_date', 20),
    enabled: !!user?.email,
    refetchInterval: 30000
  });

  const { data: followers = [] } = useQuery({
    queryKey: ['notification-followers', user?.email],
    queryFn: () => base44.entities.Follow.filter({
      following_email: user?.email
    }, '-created_date', 20),
    enabled: !!user?.email,
    refetchInterval: 30000
  });

  const notifications = [
    ...likes.slice(0, 10).map(l => ({
      id: `like-${l.id}`,
      type: 'like',
      icon: Heart,
      color: 'text-red-500',
      message: `${l.user_email} liked your post`,
      time: l.created_date
    })),
    ...transactions.slice(0, 10).map(t => ({
      id: `transaction-${t.id}`,
      type: 'transaction',
      icon: DollarSign,
      color: 'text-green-500',
      message: `You received $${t.amount} from ${t.from_email}`,
      time: t.created_date
    })),
    ...followers.slice(0, 10).map(f => ({
      id: `follow-${f.id}`,
      type: 'follow',
      icon: Users,
      color: 'text-blue-500',
      message: `${f.follower_email} started following you`,
      time: f.created_date
    }))
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 15);

  useEffect(() => {
    setHasNew(notifications.length > 0);
  }, [notifications.length]);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative hover-scale"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className={cn(
          "w-5 h-5",
          hasNew ? "text-purple-600" : "text-gray-600"
        )} />
        <AnimatePresence>
          {hasNew && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"
            />
          )}
        </AnimatePresence>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-blue-900">Notifications</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-white/50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-gray-600 font-medium">No notifications yet</p>
                    <p className="text-sm text-gray-500 mt-1">
                      You'll see likes, tips, and followers here
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notif) => {
                      const Icon = notif.icon;
                      return (
                        <motion.div
                          key={notif.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center",
                              "bg-gradient-to-br from-gray-100 to-gray-200"
                            )}>
                              <Icon className={cn("w-5 h-5", notif.color)} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-blue-900 font-medium mb-1">
                                {notif.message}
                              </p>
                              <p className="text-xs text-gray-500">
                                {moment(notif.time).fromNow()}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-200 bg-gray-50">
                  <Button 
                    variant="ghost" 
                    className="w-full text-purple-600 hover:text-purple-700 font-semibold"
                    onClick={() => {
                      setIsOpen(false);
                      // Could navigate to full notifications page
                    }}
                  >
                    View All Notifications
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}