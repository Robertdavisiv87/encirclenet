import React, { useState } from 'react';
import { X, Users, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function FollowersModal({ isOpen, onClose, followers, following, currentUser }) {
  const [activeTab, setActiveTab] = useState('followers');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl w-full max-w-md border-2 border-gray-200 shadow-glow overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-blue-900">{currentUser?.full_name || 'User'}</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full bg-gray-100 rounded-none">
              <TabsTrigger value="followers" className="flex-1">
                <Users className="w-4 h-4 mr-2" />
                Followers ({followers.length})
              </TabsTrigger>
              <TabsTrigger value="following" className="flex-1">
                <UserCheck className="w-4 h-4 mr-2" />
                Following ({following.length})
              </TabsTrigger>
            </TabsList>

            {/* Followers List */}
            <TabsContent value="followers" className="mt-0">
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {followers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-gray-600 font-medium">No followers yet</p>
                    <p className="text-sm text-gray-500 mt-1">Share your profile to grow your circle</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {followers.map((follower) => (
                      <div 
                        key={follower.id}
                        className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => window.location.href = `/viewprofile?email=${follower.follower_email}`}
                      >
                        <Avatar className="w-12 h-12 ring-2 ring-purple-500/30">
                          <AvatarImage src={follower.follower_avatar} />
                          <AvatarFallback className="gradient-bg-primary text-white">
                            {follower.follower_name?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold text-blue-900">{follower.follower_name}</p>
                          <p className="text-sm text-gray-600">{follower.follower_email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Following List */}
            <TabsContent value="following" className="mt-0">
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {following.length === 0 ? (
                  <div className="text-center py-12">
                    <UserCheck className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-gray-600 font-medium">Not following anyone yet</p>
                    <p className="text-sm text-gray-500 mt-1">Discover creators to follow</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {following.map((follow) => (
                      <div 
                        key={follow.id}
                        className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => window.location.href = `/viewprofile?email=${follow.following_email}`}
                      >
                        <Avatar className="w-12 h-12 ring-2 ring-purple-500/30">
                          <AvatarImage src={follow.following_avatar} />
                          <AvatarFallback className="gradient-bg-primary text-white">
                            {follow.following_name?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold text-blue-900">{follow.following_name}</p>
                          <p className="text-sm text-gray-600">{follow.following_email}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-purple-500 text-purple-600 hover:bg-purple-50"
                        >
                          Following
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}