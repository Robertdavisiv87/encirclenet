import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign, Heart, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

const SUGGESTED_AMOUNTS = [1, 5, 10, 20, 50];

export default function TipProfileButton({ creatorEmail, creatorName, currentUser }) {
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();

  const tipMutation = useMutation({
    mutationFn: async (data) => {
      const result = await base44.functions.invoke('processTip', data);
      return result.data;
    },
    onSuccess: () => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      // Create notification
      base44.functions.invoke('createNotification', {
        user_email: creatorEmail,
        type: 'tip',
        title: 'New Tip!',
        message: `${currentUser.full_name || currentUser.email} sent you $${amount}${message ? ` with a message: "${message}"` : ''}`,
        from_user: currentUser.email,
        from_user_name: currentUser.full_name,
        link: `/profile`
      }).catch(err => console.log('Notification failed:', err));

      queryClient.invalidateQueries(['creator-earnings']);
      setShowModal(false);
      setAmount('');
      setMessage('');
      alert(`✅ $${amount} tip sent to ${creatorName}!`);
    }
  });

  const handleTip = () => {
    if (!currentUser) {
      base44.auth.redirectToLogin();
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    tipMutation.mutate({
      from_email: currentUser.email,
      to_email: creatorEmail,
      amount: parseFloat(amount),
      message: message,
      post_id: null
    });
  };

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        variant="outline"
        className="border-2 border-yellow-400 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 font-semibold"
      >
        <Heart className="w-4 h-4 mr-2 fill-yellow-400" />
        Tip Creator
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-yellow-500" />
              Tip {creatorName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Amount ($)</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="mt-2"
              />
              <div className="flex gap-2 mt-2">
                {SUGGESTED_AMOUNTS.map((amt) => (
                  <Button
                    key={amt}
                    size="sm"
                    variant="outline"
                    onClick={() => setAmount(amt.toString())}
                    className="flex-1"
                  >
                    ${amt}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label>Message (Optional)</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Say something nice..."
                className="mt-2"
              />
            </div>

            <Button
              onClick={handleTip}
              disabled={tipMutation.isPending}
              className="w-full gradient-bg-primary text-white shadow-glow"
            >
              {tipMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 mr-2" />
                  Send ${amount || '0'} Tip
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}