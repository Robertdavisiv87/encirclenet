import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Briefcase, Send } from 'lucide-react';

export default function HireMeButton({ creator }) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: '',
    budget: '',
    message: ''
  });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);

    try {
      await base44.integrations.Core.SendEmail({
        to: creator.email,
        subject: `New Project Inquiry from ${formData.name}`,
        body: `You have a new project inquiry!

From: ${formData.name} (${formData.email})
Service Needed: ${formData.service}
Budget: $${formData.budget}

Message:
${formData.message}

---
This inquiry was sent via EncircleNet's Hire Me feature.`
      });

      alert('✅ Your inquiry has been sent! The creator will contact you soon.');
      setShowModal(false);
      setFormData({ name: '', email: '', service: '', budget: '', message: '' });
    } catch (error) {
      alert('Failed to send inquiry. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (!creator.services_offered || creator.services_offered.length === 0) {
    return null;
  }

  return (
    <>
      <Button 
        onClick={() => setShowModal(true)}
        className="gradient-bg-primary text-white shadow-glow w-full"
      >
        <Briefcase className="w-4 h-4 mr-2" />
        Hire Me
        {creator.hourly_rate > 0 && (
          <span className="ml-2 text-xs opacity-90">from ${creator.hourly_rate}/hr</span>
        )}
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Hire {creator.full_name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Your Name</Label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Your Email</Label>
              <Input 
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Service Needed</Label>
              <Input 
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                placeholder="e.g., Logo Design, Video Editing"
                required
              />
            </div>
            <div>
              <Label>Budget ($)</Label>
              <Input 
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="Your budget"
              />
            </div>
            <div>
              <Label>Project Details</Label>
              <Textarea 
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Describe your project..."
                rows={4}
                required
              />
            </div>
            <Button type="submit" disabled={sending} className="w-full gradient-bg-primary text-white">
              {sending ? 'Sending...' : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Inquiry
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}