import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Send, Copy, Check, Phone, Mail, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ContactInvite({ userEmail, referralCode }) {
  const [copied, setCopied] = useState(false);
  const [inviteMethod, setInviteMethod] = useState('link');
  const inviteUrl = `https://encirclenet.com/join?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const bonuses = [
    { amount: '$0.50', description: 'Per verified signup' },
    { amount: '$3.00', description: 'Per creator who posts' },
    { amount: '5-10%', description: 'Lifetime revenue share' }
  ];

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 realistic-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Users className="w-5 h-5 text-blue-600" />
          Invite Your Circle & Earn
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          Share EncircleNet with contacts. Earn rewards when they join and create.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bonus Breakdown */}
        <div className="grid grid-cols-3 gap-3">
          {bonuses.map((bonus, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border-2 border-blue-200 rounded-xl p-3 text-center shadow-md"
            >
              <p className="text-2xl font-bold text-blue-900">{bonus.amount}</p>
              <p className="text-xs text-gray-600 mt-1">{bonus.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Invite Methods */}
        <div className="flex gap-2">
          <Button
            variant={inviteMethod === 'link' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setInviteMethod('link')}
            className={inviteMethod === 'link' ? 'gradient-bg-primary text-white' : ''}
          >
            <LinkIcon className="w-4 h-4 mr-2" />
            Link
          </Button>
          <Button
            variant={inviteMethod === 'sms' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setInviteMethod('sms')}
            className={inviteMethod === 'sms' ? 'gradient-bg-primary text-white' : ''}
          >
            <Phone className="w-4 h-4 mr-2" />
            SMS
          </Button>
          <Button
            variant={inviteMethod === 'email' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setInviteMethod('email')}
            className={inviteMethod === 'email' ? 'gradient-bg-primary text-white' : ''}
          >
            <Mail className="w-4 h-4 mr-2" />
            Email
          </Button>
        </div>

        {/* Link Share */}
        {inviteMethod === 'link' && (
          <div className="space-y-3">
            <Label className="text-blue-900">Your Referral Link</Label>
            <div className="flex gap-2">
              <Input
                value={inviteUrl}
                readOnly
                className="bg-white border-blue-300 text-blue-900"
              />
              <Button
                variant="outline"
                onClick={handleCopy}
                className="border-blue-300"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        )}

        {/* SMS Invite */}
        {inviteMethod === 'sms' && (
          <div className="space-y-3">
            <Label className="text-blue-900">Phone Number</Label>
            <Input
              type="tel"
              placeholder="+1 (555) 123-4567"
              className="bg-white border-blue-300 text-blue-900"
            />
            <Button className="w-full gradient-bg-primary text-white shadow-glow">
              <Send className="w-4 h-4 mr-2" />
              Send SMS Invite
            </Button>
          </div>
        )}

        {/* Email Invite */}
        {inviteMethod === 'email' && (
          <div className="space-y-3">
            <Label className="text-blue-900">Email Address</Label>
            <Input
              type="email"
              placeholder="friend@example.com"
              className="bg-white border-blue-300 text-blue-900"
            />
            <Button className="w-full gradient-bg-primary text-white shadow-glow">
              <Send className="w-4 h-4 mr-2" />
              Send Email Invite
            </Button>
          </div>
        )}

        {/* Privacy Note */}
        <p className="text-xs text-gray-600 bg-white border border-gray-200 rounded-lg p-3">
          🔒 Your contacts are encrypted and never stored without permission. Learn more about our privacy policy.
        </p>
      </CardContent>
    </Card>
  );
}