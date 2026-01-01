import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, XCircle, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function PayoutApprovalQueue() {
  const [selectedRevenue, setSelectedRevenue] = useState(null);
  const [notes, setNotes] = useState('');
  const queryClient = useQueryClient();

  const { data: pendingPayouts = [], isLoading } = useQuery({
    queryKey: ['pending-payouts'],
    queryFn: async () => {
      return await base44.asServiceRole.entities.Revenue.filter({
        status: 'pending'
      }, '-created_date');
    }
  });

  const approveMutation = useMutation({
    mutationFn: async ({ revenue_id, action, notes }) => {
      const { data } = await base44.functions.invoke('approvePayout', {
        revenue_id,
        action,
        notes
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-payouts']);
      setSelectedRevenue(null);
      setNotes('');
      toast.success('Payout processed successfully');
    },
    onError: (error) => {
      toast.error('Failed to process payout: ' + error.message);
    }
  });

  const handleApprove = (revenue) => {
    if (confirm(`Approve payout of $${revenue.amount} to ${revenue.user_email}?`)) {
      approveMutation.mutate({
        revenue_id: revenue.id,
        action: 'approve',
        notes: notes || 'Approved by admin'
      });
    }
  };

  const handleReject = (revenue) => {
    if (!notes.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    if (confirm(`Reject payout of $${revenue.amount} to ${revenue.user_email}?`)) {
      approveMutation.mutate({
        revenue_id: revenue.id,
        action: 'reject',
        notes
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Clock className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading pending payouts...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Payout Approval Queue ({pendingPayouts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pendingPayouts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No pending payouts</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingPayouts.map((payout) => (
              <div 
                key={payout.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{payout.user_email}</p>
                    <p className="text-sm text-gray-600">
                      Source: <span className="capitalize">{payout.source}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(payout.transaction_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      ${payout.amount.toFixed(2)}
                    </p>
                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                      Pending
                    </span>
                  </div>
                </div>

                {selectedRevenue?.id === payout.id && (
                  <div className="mb-3">
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes (required for rejection)..."
                      className="mb-2"
                      rows={2}
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedRevenue(payout);
                      handleApprove(payout);
                    }}
                    disabled={approveMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setSelectedRevenue(payout);
                      setTimeout(() => handleReject(payout), 100);
                    }}
                    disabled={approveMutation.isPending}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                  {selectedRevenue?.id !== payout.id && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedRevenue(payout)}
                    >
                      Add Notes
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}