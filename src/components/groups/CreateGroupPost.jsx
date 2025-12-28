import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function CreateGroupPost({ groupId, user, onSuccess, onCancel }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title || !content) {
      alert('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await base44.entities.GroupPost.create({
        group_id: groupId,
        author_email: user.email,
        author_name: user.full_name || 'User',
        title,
        content
      });
      onSuccess();
    } catch (error) {
      alert('Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-2 border-purple-300">
      <CardContent className="p-4 space-y-3">
        <div>
          <Label>Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's on your mind?"
          />
        </div>
        <div>
          <Label>Content</Label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts..."
            className="min-h-[120px]"
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="gradient-bg-primary"
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}