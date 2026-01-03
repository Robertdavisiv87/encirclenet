import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Building2, AlertCircle, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function BankAccountSetup({ isOpen, onClose, user, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStripeConnect = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await base44.functions.invoke('createStripeConnectAccount', {});
      
      if (response.data.onboarding_url) {
        // Redirect to Stripe onboarding
        window.location.href = response.data.onboarding_url;
      } else if (response.data.account_id) {
        // Already setup
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError('Failed to connect with Stripe. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 gradient-text">
            <Building2 className="w-6 h-6" />
            Link Bank Account
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300 rounded-lg p-6">
            <div className="flex items-start gap-3 mb-4">
              <Building2 className="w-8 h-8 text-purple-600" />
              <div>
                <h3 className="font-bold text-blue-900 mb-2">Secure Stripe Connect</h3>
                <p className="text-sm text-gray-700">
                  We use Stripe Connect for secure payouts. Your banking information is encrypted and never stored on our servers.
                </p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-gray-700 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span>Bank-level security and encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span>Payouts arrive in 1-2 business days</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span>No fees for standard transfers</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <p className="text-sm text-blue-900">
              You'll be redirected to Stripe to securely connect your bank account. This takes about 2 minutes.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3 text-sm text-red-900">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleStripeConnect} 
              disabled={loading} 
              className="flex-1 gradient-bg-primary text-white shadow-glow"
            >
              {loading ? 'Connecting...' : (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Connect with Stripe
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}