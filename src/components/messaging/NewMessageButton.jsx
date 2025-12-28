import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send } from 'lucide-react';

export default function NewMessageButton({ currentUser, recipientEmail, recipientName }) {
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    
    setSending(true);
    try {
      // Check privacy settings
      const privacySettings = await base44.entities.UserPrivacySettings.filter({ 
        user_email: recipientEmail 
      });
      
      if (privacySettings.length > 0 && privacySettings[0].allow_messages_from === 'nobody') {
        alert('This user has disabled direct messages');
        return;
      }

      // Create or get thread
      let thread = await base44.entities.MessageThread.filter({});
      thread = thread.find(t => 
        t.participant_emails?.includes(currentUser.email) && 
        t.participant_emails?.includes(recipientEmail)
      );

      if (!thread) {
        thread = await base44.entities.MessageThread.create({
          participant_emails: [currentUser.email, recipientEmail],
          last_message: message,
          last_message_date: new Date().toISOString()
        });
      }

      // Send message
      await base44.entities.DirectMessage.create({
        thread_id: thread.id,
        sender_email: currentUser.email,
        sender_name: currentUser.full_name,
        content: message
      });

      alert('✅ Message sent!');
      setShowModal(false);
      setMessage('');
    } catch (error) {
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Button onClick={() => setShowModal(true)} className="gradient-bg-primary text-white">
        <MessageSquare className="w-4 h-4 mr-2" />
        Message
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message to {recipientName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              rows={5}
            />
            <Button 
              onClick={handleSend}
              disabled={sending || !message.trim()}
              className="w-full gradient-bg-primary text-white"
            >
              {sending ? 'Sending...' : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}