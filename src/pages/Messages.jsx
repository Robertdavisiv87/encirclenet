import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Search, Edit, Settings, Mic, Image, Send, Smile } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const mockConversations = [
  { id: 1, name: 'Alex Johnson', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', lastMessage: 'That sounds amazing! 🔥', time: '2m', unread: 2, mood: 'excited' },
  { id: 2, name: 'Sarah Miller', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', lastMessage: 'Thanks for the tip!', time: '1h', unread: 0, mood: 'happy' },
  { id: 3, name: 'Mike Davis', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', lastMessage: 'Let me think about it...', time: '3h', unread: 0, mood: 'calm' },
  { id: 4, name: 'Emma Wilson', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', lastMessage: 'Voice message 🎤', time: '1d', unread: 1, mood: 'love' },
];

const moodColors = {
  neutral: 'bg-zinc-900',
  happy: 'bg-gradient-to-br from-yellow-900/20 to-orange-900/20',
  excited: 'bg-gradient-to-br from-pink-900/20 to-red-900/20',
  calm: 'bg-gradient-to-br from-blue-900/20 to-cyan-900/20',
  love: 'bg-gradient-to-br from-pink-900/20 to-purple-900/20'
};

export default function Messages() {
  const [user, setUser] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, sender: 'other', content: 'Hey! How are you doing?', time: '10:30 AM' },
    { id: 2, sender: 'me', content: 'I\'m great! Just working on some new content.', time: '10:32 AM' },
    { id: 3, sender: 'other', content: 'That sounds amazing! 🔥', time: '10:33 AM' },
  ]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {}
    };
    loadUser();
  }, []);

  const handleSend = () => {
    if (!message.trim()) return;
    setMessages([...messages, {
      id: Date.now(),
      sender: 'me',
      content: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setMessage('');
  };

  return (
    <div className="flex h-screen">
      {/* Conversations List */}
      <div className={cn(
        "w-full md:w-96 bg-black border-r border-zinc-800 flex flex-col",
        selectedChat && "hidden md:flex"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">FlowChat</h1>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="text-zinc-400">
                <Settings className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-zinc-400">
                <Edit className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              placeholder="Search messages..."
              className="pl-10 bg-zinc-900 border-zinc-800 h-10 rounded-xl"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {mockConversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => setSelectedChat(conv)}
              className={cn(
                "w-full flex items-center gap-3 p-4 hover:bg-zinc-900/50 transition-colors",
                selectedChat?.id === conv.id && "bg-zinc-900"
              )}
            >
              <div className="relative">
                <Avatar className="w-14 h-14">
                  <AvatarImage src={conv.avatar} />
                  <AvatarFallback>{conv.name[0]}</AvatarFallback>
                </Avatar>
                {conv.unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full text-xs flex items-center justify-center">
                    {conv.unread}
                  </span>
                )}
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{conv.name}</span>
                  <span className="text-xs text-zinc-500">{conv.time}</span>
                </div>
                <p className="text-sm text-zinc-400 truncate">{conv.lastMessage}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className={cn(
        "flex-1 flex flex-col bg-black",
        !selectedChat && "hidden md:flex"
      )}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-zinc-800 flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setSelectedChat(null)}
              >
                ←
              </Button>
              <Avatar className="w-10 h-10">
                <AvatarImage src={selectedChat.avatar} />
                <AvatarFallback>{selectedChat.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{selectedChat.name}</p>
                <p className="text-xs text-zinc-500">Active now</p>
              </div>
            </div>

            {/* Messages */}
            <div className={cn(
              "flex-1 overflow-y-auto p-4 space-y-4",
              moodColors[selectedChat.mood]
            )}>
              <AnimatePresence>
                {messages.map(msg => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex",
                      msg.sender === 'me' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div className={cn(
                      "max-w-[70%] px-4 py-2 rounded-2xl",
                      msg.sender === 'me'
                        ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white"
                        : "bg-zinc-800 text-white"
                    )}>
                      <p>{msg.content}</p>
                      <p className={cn(
                        "text-xs mt-1",
                        msg.sender === 'me' ? "text-white/70" : "text-zinc-500"
                      )}>{msg.time}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-zinc-800">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-zinc-400">
                  <Smile className="w-6 h-6" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 bg-zinc-900 border-zinc-800 rounded-full"
                />
                <Button variant="ghost" size="icon" className="text-zinc-400">
                  <Mic className="w-6 h-6" />
                </Button>
                <Button variant="ghost" size="icon" className="text-zinc-400">
                  <Image className="w-6 h-6" />
                </Button>
                <Button
                  size="icon"
                  onClick={handleSend}
                  className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-full"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-500">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-zinc-900 flex items-center justify-center">
                <Edit className="w-8 h-8" />
              </div>
              <p className="font-medium">Your Messages</p>
              <p className="text-sm">Send private messages to friends</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}