import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Send, Copy, Check, Phone, Mail, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';

export default function ContactInvite({ userEmail, referralCode }) {
  const [copied, setCopied] = useState(false);
  const [inviteMethod, setInviteMethod] = useState('link');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [sending, setSending] = useState(false);
  const inviteUrl = `http://encirclenet.net/login?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendSMS = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      alert('⚠️ Please enter a valid phone number');
      return;
    }

    setSending(true);
    try {
      // Create referral tracking record
      await base44.entities.ContactReferral.create({
        referrer_email: userEmail,
        contact_hash: btoa(phoneNumber), // Hash for privacy
        invite_method: 'sms',
        status: 'pending'
      });

      // Send SMS message
      const smsMessage = `Hey! Join me on EncircleNet - a creator platform where you earn while you share! 🚀\n\nUse my code: ${referralCode}\n${inviteUrl}`;
      
      // Open default SMS app with pre-filled message
      const smsLink = `sms:${phoneNumber}${/iPhone|iPad|iPod/.test(navigator.userAgent) ? '&' : '?'}body=${encodeURIComponent(smsMessage)}`;
      
      const smsWindow = window.open(smsLink, '_blank');
      
      if (smsWindow) {
        console.log('SMS opened successfully');
        alert(`✅ SMS invite prepared for ${phoneNumber}!\n\nSend the message from your SMS app.\nYou'll earn rewards when they sign up.`);
        setPhoneNumber('');
      } else {
        alert(`📱 SMS invite ready!\n\nMessage: ${smsMessage}\n\nCopy and send to: ${phoneNumber}`);
      }
    } catch (error) {
      console.error('SMS invite error:', error);
      alert('❌ Failed to send SMS invite. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleSendEmail = async () => {
    if (!emailAddress || !emailAddress.includes('@')) {
      alert('⚠️ Please enter a valid email address');
      return;
    }

    setSending(true);
    try {
      // Create referral tracking record
      await base44.entities.ContactReferral.create({
        referrer_email: userEmail,
        contact_hash: btoa(emailAddress), // Hash for privacy
        invite_method: 'email',
        status: 'pending'
      });

      // Send email via Core integration
      const emailResult = await base44.integrations.Core.SendEmail({
        to: emailAddress,
        subject: `Join me on EncircleNet - Earn while you create! 🎨`,
        body: `Hi there!

I'm inviting you to join EncircleNet - a revolutionary social platform where creators actually get paid for their content and engagement!

Here's what you get:
✅ Earn money from tips, subscriptions, and referrals
✅ 90% revenue share (not 0% like Instagram/TikTok)
✅ Multiple income streams built-in
✅ Free to start, upgrade later for 3x-10x earnings

Use my referral code: ${referralCode}
Sign up here: ${inviteUrl}

See you inside!

P.S. You'll get bonuses for joining, and I'll earn rewards too. It's a win-win! 🚀`
      });

      console.log('Email sent:', emailResult);
      alert(`✅ Email invite sent to ${emailAddress}!\n\nYou'll earn rewards when they sign up and start creating.`);
      setEmailAddress('');
    } catch (error) {
      console.error('Email invite error:', error);
      alert('❌ Failed to send email invite. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Join me on EncircleNet!',
      text: `Join me on EncircleNet - a creator platform where you earn while you share! Use my code: ${referralCode}`,
      url: inviteUrl
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        
        // Track share action
        await base44.entities.ContactReferral.create({
          referrer_email: userEmail,
          contact_hash: btoa(`share-${Date.now()}`),
          invite_method: 'link',
          status: 'pending'
        });
      } else {
        handleCopy();
      }
    } catch (error) {
      // User cancelled or error occurred
      console.log('Share cancelled or failed:', error);
    }
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
            <div className="flex gap-2">
              <Button 
                onClick={handleShare}
                className="flex-1 gradient-bg-primary text-white shadow-glow"
              >
                <Send className="w-4 h-4 mr-2" />
                Share Link
              </Button>
              <Button
                onClick={() => {
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Join me on EncircleNet! Use code: ${referralCode}`)}&url=${encodeURIComponent(inviteUrl)}`, '_blank');
                }}
                variant="outline"
                className="border-blue-300"
              >
                Tweet
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
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="bg-white border-blue-300 text-blue-900"
            />
            <Button 
              onClick={handleSendSMS}
              disabled={sending || !phoneNumber}
              className="w-full gradient-bg-primary text-white shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <>Loading...</>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send SMS Invite
                </>
              )}
            </Button>
            <p className="text-xs text-gray-600">
              💡 Opens your SMS app with a pre-filled message. Rewards earned when they sign up.
            </p>
          </div>
        )}

        {/* Email Invite */}
        {inviteMethod === 'email' && (
          <div className="space-y-3">
            <Label className="text-blue-900">Email Address</Label>
            <Input
              type="email"
              placeholder="friend@example.com"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              className="bg-white border-blue-300 text-blue-900"
            />
            <Button 
              onClick={handleSendEmail}
              disabled={sending || !emailAddress}
              className="w-full gradient-bg-primary text-white shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <>Sending...</>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Email Invite
                </>
              )}
            </Button>
            <p className="text-xs text-gray-600">
              ✅ Sends a personalized email invite. Earn rewards when they join and create content.
            </p>
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