import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Flag } from 'lucide-react';

export default function ReportButton({ contentType, contentId, reportedUserEmail, currentUser }) {
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState('spam');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reasons = [
    { value: 'spam', label: 'Spam or misleading' },
    { value: 'harassment', label: 'Harassment or bullying' },
    { value: 'hate_speech', label: 'Hate speech' },
    { value: 'violence', label: 'Violence or dangerous behavior' },
    { value: 'nudity', label: 'Nudity or sexual content' },
    { value: 'misinformation', label: 'False information' },
    { value: 'other', label: 'Other' }
  ];

  const handleSubmit = async () => {
    if (!currentUser) {
      alert('Please login to report content');
      return;
    }

    setSubmitting(true);
    try {
      await base44.entities.ContentReport.create({
        reporter_email: currentUser.email,
        reported_user_email: reportedUserEmail,
        content_type: contentType,
        content_id: contentId,
        reason,
        description
      });

      alert('✅ Report submitted. Our team will review it shortly.');
      setShowModal(false);
      setDescription('');
    } catch (error) {
      alert('Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setShowModal(true)} className="text-red-600">
        <Flag className="w-4 h-4 mr-1" />
        Report
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Report Content</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Why are you reporting this?</Label>
              <div className="space-y-2 mt-2">
                {reasons.map(r => (
                  <div key={r.value} className="flex items-center gap-2">
                    <input
                      type="radio"
                      id={r.value}
                      checked={reason === r.value}
                      onChange={() => setReason(r.value)}
                      className="w-4 h-4"
                    />
                    <Label htmlFor={r.value} className="cursor-pointer">{r.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Additional details (optional)</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide more context..."
                rows={3}
              />
            </div>

            <Button 
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-red-600 text-white hover:bg-red-700"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}