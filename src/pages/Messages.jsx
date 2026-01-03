import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Search, Settings, MessageCircle, Users, Plus, Image as ImageIcon, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

export default function Messages() {
  const [user, setUser] = useState(null);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    let mounted = true;
    
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (mounted) {
          setUser(currentUser);
        }
      } catch (e) {
        console.error('Failed to load user:', e);
        if (mounted) {
          base44.auth.redirectToLogin();
        }
      }
    };
    
    loadUser();
    
    return () => {
      mounted = false;
    };
  }, []);

  const { data: threads = [] } = useQuery({
    queryKey: ['message-threads', user?.email],
    queryFn: async () => {
      const allThreads = await base44.entities.MessageThread.list('-last_message_date', 50);
      return allThreads.filter(t => t.participant_emails?.includes(user?.email));
    },
    enabled: !!user?.email,
    refetchInterval: 3000 // Refresh every 3 seconds for real-time feel
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      try {
        return await base44.asServiceRole.entities.User.list();
      } catch (error) {
        return [];
      }
    },
    enabled: showNewGroupModal
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', selectedThread?.id],
    queryFn: async () => {
      const msgs = await base44.entities.DirectMessage.filter({ thread_id: selectedThread?.id }, 'created_date');
      
      // Mark messages as read
      const unreadMessages = msgs.filter(m => 
        m.sender_email !== user?.email && 
        (!m.read_by || !m.read_by.includes(user?.email))
      );
      
      for (const msg of unreadMessages) {
        const readBy = msg.read_by || [];
        if (!readBy.includes(user?.email)) {
          await base44.entities.DirectMessage.update(msg.id, {
            is_read: true,
            read_by: [...readBy, user?.email]
          });
        }
      }
      
      return msgs;
    },
    enabled: !!selectedThread?.id && !!user?.email,
    refetchInterval: 2000 // Refresh every 2 seconds for real-time messages
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages?.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages?.length]);

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      const newMessage = await base44.entities.DirectMessage.create({
        thread_id: selectedThread.id,
        sender_email: user.email,
        sender_name: user.full_name,
        content: messageText,
        is_read: false,
        read_by: [user.email]
      });

      await base44.entities.MessageThread.update(selectedThread.id, {
        last_message: messageText,
        last_message_date: new Date().toISOString()
      });

      // Send notifications to other participants
      const otherParticipants = selectedThread.participant_emails.filter(email => email !== user.email);
      for (const participantEmail of otherParticipants) {
        base44.functions.invoke('createNotification', {
          user_email: participantEmail,
          type: 'new_message',
          title: 'New Message',
          message: `${user.full_name} sent you a message`,
          from_user: user.email,
          from_user_name: user.full_name,
          link: '/messages'
        }).catch(err => console.log('Notification failed'));
      }

      return newMessage;
    },
    onSuccess: () => {
      setMessageText('');
      queryClient.invalidateQueries(['messages']);
      queryClient.invalidateQueries(['message-threads']);
    }
  });

  const createGroupChatMutation = useMutation({
    mutationFn: async () => {
      const participantEmails = [user.email, ...selectedUsers.map(u => u.email)];
      
      const thread = await base44.entities.MessageThread.create({
        participant_emails: participantEmails,
        last_message: `${user.full_name} created a group chat`,
        last_message_date: new Date().toISOString()
      });

      await base44.entities.DirectMessage.create({
        thread_id: thread.id,
        sender_email: user.email,
        sender_name: user.full_name,
        content: `${user.full_name} created a group: ${groupName || 'Group Chat'}`
      });

      return thread;
    },
    onSuccess: (newThread) => {
      queryClient.invalidateQueries(['message-threads']);
      setShowNewGroupModal(false);
      setSelectedUsers([]);
      setGroupName('');
      setSelectedThread(newThread);
    }
  });

  const handleSend = () => {
    if (messageText.trim()) {
      sendMessageMutation.mutate();
    }
  };

  const getThreadName = (thread) => {
    const others = thread.participant_emails?.filter(email => email !== user?.email) || [];
    if (others.length === 0) return 'Unknown';
    if (others.length === 1) return others[0];
    return `Group (${others.length + 1})`;
  };

  const getThreadAvatar = (thread) => {
    const others = thread.participant_emails?.filter(email => email !== user?.email) || [];
    if (others.length === 0) return '?';
    return others[0][0]?.toUpperCase();
  };

  const isGroupChat = (thread) => {
    return thread.participant_emails?.length > 2;
  };

  const getUnreadCount = (thread) => {
    return thread.unread_count?.[user?.email] || 0;
  };

  const filteredThreads = threads.filter(thread => {
    const name = getThreadName(thread).toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-purple-600 animate-pulse" />
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto h-screen flex flex-col bg-white">
      <div className="border-b border-gray-200 p-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold gradient-text">Messages</h1>
        <Button 
          onClick={() => setShowNewGroupModal(true)}
          className="gradient-bg-primary text-white"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Group
        </Button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Threads List */}
        <div className="w-80 border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search messages..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {filteredThreads.length === 0 ? (
            <div className="text-center py-12 px-4">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600 text-sm">
                {searchQuery ? 'No conversations found' : 'No messages yet'}
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredThreads.map(thread => {
                const unreadCount = getUnreadCount(thread);
                return (
                  <motion.div
                    key={thread.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onClick={() => setSelectedThread(thread)}
                    className={`p-4 cursor-pointer hover:bg-purple-50 transition-all border-l-4 ${
                      selectedThread?.id === thread.id ? 'bg-purple-50 border-purple-500' : 'border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="gradient-bg-primary text-white">
                            {getThreadAvatar(thread)}
                          </AvatarFallback>
                        </Avatar>
                        {isGroupChat(thread) && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                            <Users className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-blue-900 truncate">
                            {getThreadName(thread)}
                          </p>
                          {isGroupChat(thread) && (
                            <Badge variant="secondary" className="text-xs">
                              {thread.participant_emails.length}
                            </Badge>
                          )}
                        </div>
                        <p className={`text-xs truncate ${unreadCount > 0 ? 'text-blue-900 font-semibold' : 'text-gray-600'}`}>
                          {thread.last_message}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-gray-500">
                          {moment(thread.last_message_date).fromNow(true)}
                        </span>
                        {unreadCount > 0 && (
                          <Badge className="gradient-bg-primary text-white h-5 min-w-5 flex items-center justify-center text-xs">
                            {unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {selectedThread ? (
            <>
              {/* Thread Header */}
              <div className="border-b border-gray-200 p-4 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="gradient-bg-primary text-white">
                        {getThreadAvatar(selectedThread)}
                      </AvatarFallback>
                    </Avatar>
                    {isGroupChat(selectedThread) && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                        <Users className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900 flex items-center gap-2">
                      {getThreadName(selectedThread)}
                      {isGroupChat(selectedThread) && (
                        <Badge variant="secondary" className="text-xs">
                          {selectedThread.participant_emails.length} members
                        </Badge>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      {isGroupChat(selectedThread) 
                        ? selectedThread.participant_emails.filter(e => e !== user?.email).join(', ')
                        : 'Online'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                <AnimatePresence>
                  {messages.map((msg, index) => {
                    const isMine = msg.sender_email === user?.email;
                    const showSender = isGroupChat(selectedThread) && !isMine;
                    const isRead = msg.read_by && msg.read_by.length > 1;
                    
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(index * 0.02, 0.3) }}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                          {showSender && (
                            <p className="text-xs text-gray-600 mb-1 px-2">{msg.sender_name}</p>
                          )}
                          <div className={`${isMine ? 'bg-purple-600 text-white' : 'bg-white text-gray-900'} rounded-2xl px-4 py-2 shadow-sm`}>
                            <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                            <div className={`flex items-center gap-1 mt-1 text-xs ${isMine ? 'text-purple-200' : 'text-gray-500'}`}>
                              <span>{moment(msg.created_date).format('h:mm A')}</span>
                              {isMine && (
                                <CheckCheck className={`w-3 h-3 ${isRead ? 'text-blue-400' : 'text-purple-300'}`} />
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex gap-3">
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message..."
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSend}
                    disabled={!messageText.trim() || sendMessageMutation.isPending}
                    className="gradient-bg-primary text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Group Chat Modal */}
      <Dialog open={showNewGroupModal} onOpenChange={setShowNewGroupModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Group Chat</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Group name (optional)"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            
            <div>
              <p className="text-sm text-gray-600 mb-2">Select members ({selectedUsers.length})</p>
              <div className="max-h-64 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-2">
                {allUsers
                  .filter(u => u.email !== user?.email)
                  .map(u => (
                    <div
                      key={u.email}
                      onClick={() => {
                        if (selectedUsers.find(su => su.email === u.email)) {
                          setSelectedUsers(selectedUsers.filter(su => su.email !== u.email));
                        } else {
                          setSelectedUsers([...selectedUsers, u]);
                        }
                      }}
                      className={`p-3 rounded-lg cursor-pointer transition-all flex items-center gap-3 ${
                        selectedUsers.find(su => su.email === u.email)
                          ? 'bg-purple-100 border-2 border-purple-500'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={u.avatar} />
                        <AvatarFallback className="gradient-bg-primary text-white text-xs">
                          {u.full_name?.[0] || u.email?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-blue-900 truncate">
                          {u.full_name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{u.email}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <Button
              onClick={() => createGroupChatMutation.mutate()}
              disabled={selectedUsers.length < 1 || createGroupChatMutation.isPending}
              className="w-full gradient-bg-primary text-white"
            >
              {createGroupChatMutation.isPending ? 'Creating...' : `Create Group (${selectedUsers.length + 1})`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}