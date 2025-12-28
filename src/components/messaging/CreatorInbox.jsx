import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Crown, DollarSign, Filter } from 'lucide-react';
import moment from 'moment';

export default function CreatorInbox({ creatorEmail }) {
  const [selectedThread, setSelectedThread] = useState(null);
  const [filter, setFilter] = useState('all'); // all, subscribers, top_tippers
  const [message, setMessage] = useState('');

  const { data: threads = [] } = useQuery({
    queryKey: ['creator-threads', creatorEmail],
    queryFn: async () => {
      const allThreads = await base44.entities.MessageThread.list('-last_message_date');
      return allThreads.filter(t => t.participant_emails?.includes(creatorEmail));
    },
    refetchInterval: 10000
  });

  const { data: subscribers = [] } = useQuery({
    queryKey: ['subscribers', creatorEmail],
    queryFn: () => base44.entities.CreatorSubscription.filter({ 
      creator_email: creatorEmail,
      status: 'active' 
    })
  });

  const { data: tips = [] } = useQuery({
    queryKey: ['tips-received', creatorEmail],
    queryFn: () => base44.entities.TipTransaction.filter({ to_email: creatorEmail })
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['thread-messages', selectedThread?.id],
    queryFn: () => base44.entities.DirectMessage.filter({ 
      thread_id: selectedThread?.id 
    }, '-created_date'),
    enabled: !!selectedThread
  });

  // Calculate top tippers
  const tipsByUser = tips.reduce((acc, tip) => {
    acc[tip.from_email] = (acc[tip.from_email] || 0) + tip.amount;
    return acc;
  }, {});
  const topTippers = Object.keys(tipsByUser)
    .sort((a, b) => tipsByUser[b] - tipsByUser[a])
    .slice(0, 10);

  // Filter threads
  const filteredThreads = threads.filter(thread => {
    const otherParticipant = thread.participant_emails?.find(e => e !== creatorEmail);
    if (filter === 'subscribers') {
      return subscribers.some(s => s.subscriber_email === otherParticipant);
    }
    if (filter === 'top_tippers') {
      return topTippers.includes(otherParticipant);
    }
    return true;
  });

  const handleSend = async () => {
    if (!message.trim() || !selectedThread) return;
    
    await base44.entities.DirectMessage.create({
      thread_id: selectedThread.id,
      sender_email: creatorEmail,
      sender_name: 'Creator',
      content: message,
      is_read: false
    });

    await base44.entities.MessageThread.update(selectedThread.id, {
      last_message: message,
      last_message_date: new Date().toISOString()
    });

    setMessage('');
  };

  return (
    <div className="grid md:grid-cols-3 gap-4 h-[600px]">
      {/* Thread List */}
      <Card className="md:col-span-1 border-2 border-purple-200 overflow-hidden flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="w-5 h-5 text-purple-600" />
            Inbox
          </CardTitle>
          <div className="flex gap-2 mt-2">
            <Button
              size="sm"
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'gradient-bg-primary' : ''}
            >
              All
            </Button>
            <Button
              size="sm"
              variant={filter === 'subscribers' ? 'default' : 'outline'}
              onClick={() => setFilter('subscribers')}
              className={filter === 'subscribers' ? 'gradient-bg-primary' : ''}
            >
              <Crown className="w-3 h-3 mr-1" />
              Subs
            </Button>
            <Button
              size="sm"
              variant={filter === 'top_tippers' ? 'default' : 'outline'}
              onClick={() => setFilter('top_tippers')}
              className={filter === 'top_tippers' ? 'gradient-bg-primary' : ''}
            >
              <DollarSign className="w-3 h-3 mr-1" />
              Top
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-2">
          {filteredThreads.map((thread) => {
            const otherEmail = thread.participant_emails?.find(e => e !== creatorEmail);
            const isSub = subscribers.some(s => s.subscriber_email === otherEmail);
            const isTopTipper = topTippers.includes(otherEmail);
            
            return (
              <button
                key={thread.id}
                onClick={() => setSelectedThread(thread)}
                className={`w-full text-left p-3 rounded-lg mb-2 hover:bg-purple-50 transition-colors ${
                  selectedThread?.id === thread.id ? 'bg-purple-100 border-2 border-purple-400' : 'border border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="font-medium text-sm truncate">{otherEmail}</span>
                  <div className="flex gap-1">
                    {isSub && <Crown className="w-3 h-3 text-purple-600" />}
                    {isTopTipper && <DollarSign className="w-3 h-3 text-green-600" />}
                  </div>
                </div>
                <p className="text-xs text-gray-600 truncate">{thread.last_message}</p>
                <span className="text-xs text-gray-500">
                  {moment(thread.last_message_date).fromNow()}
                </span>
              </button>
            );
          })}
        </CardContent>
      </Card>

      {/* Messages */}
      <Card className="md:col-span-2 border-2 border-purple-200 flex flex-col">
        {selectedThread ? (
          <>
            <CardHeader className="border-b">
              <CardTitle className="text-lg">
                {selectedThread.participant_emails?.find(e => e !== creatorEmail)}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_email === creatorEmail ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.sender_email === creatorEmail
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <span className="text-xs opacity-70">
                        {moment(msg.created_date).format('h:mm A')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <Button onClick={handleSend} className="gradient-bg-primary">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Select a conversation to start messaging</p>
          </div>
        )}
      </Card>
    </div>
  );
}