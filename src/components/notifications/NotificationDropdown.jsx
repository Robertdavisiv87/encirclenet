import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Heart, DollarSign, Users, MessageCircle, X, Calendar, MessageSquare, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import moment from 'moment';
import { createPageUrl } from '../../utils';

const notificationIcons = {
  new_follower: Users,
  new_message: MessageCircle,
  group_post: MessageSquare,
  group_event: Calendar,
  mention: MessageCircle,
  reply: MessageCircle,
  like: Heart,
  tip: DollarSign,
  subscription: Crown
};

const notificationColors = {
  new_follower: 'text-blue-500',
  new_message: 'text-purple-500',
  group_post: 'text-green-500',
  group_event: 'text-orange-500',
  mention: 'text-pink-500',
  reply: 'text-indigo-500',
  like: 'text-red-500',
  tip: 'text-yellow-500',
  subscription: 'text-purple-600'
};

export default function NotificationDropdown({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: () => base44.entities.Notification.filter({
      user_email: user?.email
    }, '-created_date', 50),
    enabled: !!user?.email,
    refetchInterval: 15000
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId) => base44.entities.Notification.update(notificationId, {
      is_read: true
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    }
  });

  const handleNotificationClick = (notif) => {
    markAsReadMutation.mutate(notif.id);
    if (notif.link) {
      window.location.href = notif.link;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const hasUnread = unreadCount > 0;

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
          hasUnread ? "text-purple-600" : "text-gray-600"
        )} />
        <AnimatePresence>
          {hasUnread && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full border-2 border-white flex items-center justify-center"
            >
              <span className="text-[10px] font-bold text-white">{unreadCount}</span>
            </motion.span>
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
                      You'll be notified of followers, messages, group activity & more
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notif) => {
                      const Icon = notificationIcons[notif.type] || Bell;
                      const color = notificationColors[notif.type] || 'text-gray-500';
                      return (
                        <motion.div
                          key={notif.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          onClick={() => handleNotificationClick(notif)}
                          className={cn(
                            "p-4 hover:bg-gray-50 transition-colors cursor-pointer",
                            !notif.is_read && "bg-purple-50"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                              notif.is_read ? "bg-gradient-to-br from-gray-100 to-gray-200" : "bg-gradient-to-br from-purple-100 to-pink-100"
                            )}>
                              <Icon className={cn("w-5 h-5", color)} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                "text-sm mb-1",
                                notif.is_read ? "text-gray-700" : "text-blue-900 font-semibold"
                              )}>
                                {notif.title}
                              </p>
                              <p className="text-xs text-gray-600 mb-1">
                                {notif.message}
                              </p>
                              <p className="text-xs text-gray-500">
                                {moment(notif.created_date).fromNow()}
                              </p>
                            </div>
                            {!notif.is_read && (
                              <div className="w-2 h-2 rounded-full bg-purple-600 flex-shrink-0 mt-1" />
                            )}
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