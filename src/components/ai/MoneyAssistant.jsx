import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Send, Loader2, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MoneyAssistant({ user, mission }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hey ${user?.full_name || 'there'}! 👋 I'm here to help you start earning. No pressure, no complicated stuff — just real opportunities. What sounds interesting to you?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const context = `User role: ${mission?.role_selected || 'new user'}
Location: ${mission?.location?.city || 'Not set'}, ${mission?.location?.state || ''}
Mission Step: ${mission?.mission_step || 1}
Services Activated: ${mission?.services_activated?.length || 0}
Available Now: ${mission?.available_now ? 'Yes' : 'No'}
First Dollar Earned: ${mission?.first_dollar_earned ? 'Yes' : 'No'}`;

      const prompt = `You are an AI Money Assistant for Encircle Net, a service marketplace platform. Help users make their first dollar in 24 hours.

${context}

User's message: ${input}

Provide actionable, specific advice to help them earn money quickly. Suggest:
- Next immediate action steps
- Outreach scripts if needed
- Service activation tips
- Pricing suggestions
- Local opportunities

Be encouraging, direct, and results-focused.`;

      const result = await base44.integrations.Core.InvokeLLM({ prompt });

      setMessages(prev => [...prev, { role: 'assistant', content: result }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I had trouble processing that. Try asking me something else!' 
      }]);
    }
    setLoading(false);
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <Sparkles className="w-6 h-6 text-purple-600" />
          AI Money Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white rounded-lg p-4 max-h-80 overflow-y-auto space-y-3">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Ask me anything... (e.g., 'How do I get my first customer?')"
            rows={2}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="gradient-bg-primary text-white"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInput('What should I do first to make money?')}
            className="text-xs"
          >
            💡 First steps
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInput('Write me an outreach message')}
            className="text-xs"
          >
            ✉️ Outreach help
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}