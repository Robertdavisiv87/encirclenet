import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, CreditCard, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function BankAccountSetup({ isOpen, onClose, user, onSuccess }) {
  const [bankData, setBankData] = useState({
    account_holder_name: user?.full_name || '',
    routing_number: '',
    account_number: '',
    account_type: 'checking'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Update user profile with bank account info
      await base44.auth.updateMe({
        bank_account_holder: bankData.account_holder_name,
        bank_routing: bankData.routing_number,
        bank_account: bankData.account_number,
        bank_account_type: bankData.account_type,
        bank_account_linked: true
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError('Failed to link bank account. Please try again.');
    } finally {
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <p className="text-sm text-blue-900">
              Your bank information is encrypted and secure. We use industry-standard security to protect your data.
            </p>
          </div>

          <div>
            <Label>Account Holder Name</Label>
            <Input
              value={bankData.account_holder_name}
              onChange={(e) => setBankData({...bankData, account_holder_name: e.target.value})}
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <Label>Routing Number</Label>
            <Input
              value={bankData.routing_number}
              onChange={(e) => setBankData({...bankData, routing_number: e.target.value.replace(/\D/g, '')})}
              placeholder="123456789"
              maxLength={9}
              required
            />
            <p className="text-xs text-gray-500 mt-1">9-digit routing number</p>
          </div>

          <div>
            <Label>Account Number</Label>
            <Input
              value={bankData.account_number}
              onChange={(e) => setBankData({...bankData, account_number: e.target.value.replace(/\D/g, '')})}
              placeholder="1234567890"
              required
            />
          </div>

          <div>
            <Label>Account Type</Label>
            <select
              value={bankData.account_type}
              onChange={(e) => setBankData({...bankData, account_type: e.target.value})}
              className="w-full p-2 border rounded-md"
            >
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
            </select>
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
            <Button type="submit" disabled={loading} className="flex-1 gradient-bg-primary text-white">
              {loading ? 'Linking...' : 'Link Account'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}