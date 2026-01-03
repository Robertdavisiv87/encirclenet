import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Sparkles, Zap, DollarSign, TrendingUp, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

export default function GlobalAIAssistant({ user, currentPage = 'Home' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    // Initialize with contextual greeting
    const greeting = getContextualGreeting(currentPage);
    setMessages([{ role: 'assistant', content: greeting }]);
  }, [currentPage]);

  const getContextualGreeting = (page) => {
    const greetings = {
      Home: "👋 Hi! I'm your AI guide. Need help earning money, discovering content, or navigating the app?",
      Discover: "🔍 Ready to explore? I can help you find trending content and success stories!",
      Services: "💼 Looking for services or want to offer yours? I can guide you through the process!",
      Create: "🎨 Ready to create? I'll help you publish content, list gigs, or schedule events!",
      Community: "👥 Want to connect? I can help you find groups, challenges, and events!",
      Economy: "💰 Let's maximize your earnings! Ask me about payouts, referrals, or income streams!",
      Profile: "👤 Customize your profile and manage your settings with my help!",
      Challenges: "🏆 Ready to compete? I'll guide you through challenges and leaderboards!",
      Admin: "⚙️ Admin tools at your service. I can help with moderation, analytics, and system health."
    };
    return greetings[page] || "👋 Hi! How can I help you today?";
  };

  const getQuickActions = (page) => {
    const actions = {
      Home: [
        { label: "Start Earning Money", icon: DollarSign, prompt: "How do I start earning money on EncircleNet?" },
        { label: "Watch Success Stories", icon: TrendingUp, prompt: "Show me trending success stories" },
        { label: "Find Local Services", icon: Briefcase, prompt: "How do I find services near me?" }
      ],
      Discover: [
        { label: "Find Trending Content", icon: TrendingUp, prompt: "Show me what's trending right now" },
        { label: "Learn from Creators", icon: Sparkles, prompt: "How can I learn from top creators?" }
      ],
      Services: [
        { label: "Book a Service", icon: Briefcase, prompt: "How do I book a service?" },
        { label: "Offer My Services", icon: DollarSign, prompt: "How do I start offering services?" }
      ],
      Economy: [
        { label: "Request Payout", icon: DollarSign, prompt: "How do I cash out my earnings?" },
        { label: "Increase Earnings", icon: TrendingUp, prompt: "How can I make more money?" },
        { label: "Track Referrals", icon: Zap, prompt: "Show me my referral earnings" }
      ]
    };
    return actions[page] || [];
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsThinking(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are the EncircleNet AI Assistant. Current page: ${currentPage}. User context: ${user?.full_name || 'Guest'}. 
        
        User question: ${userMessage}
        
        Provide a helpful, actionable response focused on:
        - How to earn money (tips, referrals, services, content)
        - How to use app features
        - Step-by-step guidance
        - Quick wins and opportunities
        
        Be concise, friendly, and action-oriented. Include emojis.`,
        add_context_from_internet: false
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "⚠️ I'm having trouble connecting. Try asking again or check the help center!" 
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleQuickAction = (prompt) => {
    setInput(prompt);
    setTimeout(() => handleSend(), 100);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full shadow-glow flex items-center justify-center",
          "bg-gradient-to-br from-purple-600 to-pink-500 text-white",
          isOpen && "hidden"
        )}
      >
        <Sparkles className="w-7 h-7 animate-pulse" />
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border-2 border-purple-300 flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <div>
                  <h3 className="font-bold">AI Assistant</h3>
                  <p className="text-xs opacity-90">{currentPage} Page Guide</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Quick Actions */}
            {getQuickActions(currentPage).length > 0 && (
              <div className="p-3 bg-purple-50 border-b border-purple-200">
                <p className="text-xs font-semibold text-gray-700 mb-2">Quick Actions:</p>
                <div className="flex flex-wrap gap-2">
                  {getQuickActions(currentPage).map((action, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickAction(action.prompt)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-lg border border-purple-300 text-xs font-medium text-purple-900 hover:bg-purple-100 transition-colors"
                    >
                      <action.icon className="w-3 h-3" />
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                    msg.role === 'user' 
                      ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white" 
                      : "bg-gray-100 text-gray-900"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isThinking && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl px-4 py-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-200">
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask me anything..."
                  className="min-h-[60px] resize-none"
                />
                <Button 
                  onClick={handleSend}
                  disabled={!input.trim() || isThinking}
                  className="gradient-bg-primary text-white self-end"
                >
                  <Zap className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}