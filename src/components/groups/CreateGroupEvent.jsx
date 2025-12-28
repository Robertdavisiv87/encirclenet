import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function CreateGroupEvent({ groupId, user, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    location: '',
    max_attendees: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.title || !formData.event_date) {
      alert('Please fill in required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const event = await base44.entities.GroupEvent.create({
        group_id: groupId,
        creator_email: user.email,
        title: formData.title,
        description: formData.description,
        event_date: formData.event_date,
        location: formData.location,
        max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
        attendees: []
      });

      // Notify group members
      const members = await base44.entities.GroupMembership.filter({ group_id: groupId });
      members.forEach(member => {
        if (member.user_email !== user.email) {
          base44.functions.invoke('createNotification', {
            user_email: member.user_email,
            type: 'group_event',
            title: 'New Group Event',
            message: `${user.full_name || user.email} created an event: ${formData.title}`,
            from_user: user.email,
            from_user_name: user.full_name,
            related_id: event.id,
            related_type: 'group_event',
            link: `/viewgroup?id=${groupId}`
          }).catch(err => console.log('Notification failed:', err));
        }
      });

      onSuccess();
    } catch (error) {
      alert('Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-2 border-purple-300">
      <CardContent className="p-4 space-y-3">
        <div>
          <Label>Event Title *</Label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Weekly meetup"
          />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Event details..."
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Date & Time *</Label>
            <Input
              type="datetime-local"
              value={formData.event_date}
              onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
            />
          </div>
          <div>
            <Label>Max Attendees</Label>
            <Input
              type="number"
              value={formData.max_attendees}
              onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value })}
              placeholder="Unlimited"
            />
          </div>
        </div>
        <div>
          <Label>Location</Label>
          <Input
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Virtual or physical location"
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="gradient-bg-primary"
          >
            {isSubmitting ? 'Creating...' : 'Create Event'}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}