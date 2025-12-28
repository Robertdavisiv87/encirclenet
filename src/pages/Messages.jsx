import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Search, Settings, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import moment from 'moment';

export default function Messages() {
  const [user, setUser] = useState(null);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messageText, setMessageText] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {
        window.location.href = '/';
      }
    };
    loadUser();
  }, []);

  const { data: threads = [] } = useQuery({
    queryKey: ['message-threads', user?.email],
    queryFn: async () => {
      const allThreads = await base44.entities.MessageThread.list('-last_message_date', 50);
      return allThreads.filter(t => t.participant_emails?.includes(user?.email));
    },
    enabled: !!user?.email,
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', selectedThread?.id],
    queryFn: () => base44.entities.DirectMessage.filter({ thread_id: selectedThread?.id }, '-created_date'),
    enabled: !!selectedThread?.id,
    refetchInterval: 3000 // Refresh every 3 seconds
  });

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      // Create message
      const newMessage = await base44.entities.DirectMessage.create({
        thread_id: selectedThread.id,
        sender_email: user.email,
        sender_name: user.full_name,
        content: messageText
      });

      // Update thread
      await base44.entities.MessageThread.update(selectedThread.id, {
        last_message: messageText,
        last_message_date: new Date().toISOString()
      });

      return newMessage;
    },
    onSuccess: () => {
      setMessageText('');
      queryClient.invalidateQueries(['messages']);
      queryClient.invalidateQueries(['message-threads']);
    }
  });

  const handleSend = () => {
    if (messageText.trim()) {
      sendMessageMutation.mutate();
    }
  };

  const otherParticipant = (thread) => {
    return thread.participant_emails?.find(email => email !== user?.email) || 'Unknown';
  };

  return (
    <div className="max-w-6xl mx-auto h-screen flex flex-col bg-white">
      <div className="border-b border-gray-200 p-4">
        <h1 className="text-2xl font-bold gradient-text">Messages</h1>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Threads List */}
        <div className="w-80 border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search messages..." className="pl-10" />
            </div>
          </div>

          {threads.length === 0 ? (
            <div className="text-center py-12 px-4">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600 text-sm">No messages yet</p>
            </div>
          ) : (
            threads.map(thread => (
              <div
                key={thread.id}
                onClick={() => setSelectedThread(thread)}
                className={`p-4 cursor-pointer hover:bg-purple-50 transition-all border-l-4 ${
                  selectedThread?.id === thread.id ? 'bg-purple-50 border-purple-500' : 'border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="gradient-bg-primary text-white">
                      {otherParticipant(thread)[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-blue-900 truncate">{otherParticipant(thread)}</p>
                    <p className="text-xs text-gray-600 truncate">{thread.last_message}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {moment(thread.last_message_date).fromNow()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {selectedThread ? (
            <>
              {/* Thread Header */}
              <div className="border-b border-gray-200 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="gradient-bg-primary text-white">
                      {otherParticipant(selectedThread)[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-blue-900">{otherParticipant(selectedThread)}</p>
                    <p className="text-xs text-gray-500">Active now</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <Settings className="w-5 h-5" />
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => {
                  const isMine = msg.sender_email === user?.email;
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${isMine ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-900'} rounded-2xl px-4 py-2`}>
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${isMine ? 'text-purple-200' : 'text-gray-500'}`}>
                          {moment(msg.created_date).format('h:mm A')}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
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
    </div>
  );
}