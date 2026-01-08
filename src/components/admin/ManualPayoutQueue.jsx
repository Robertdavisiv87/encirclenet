import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DollarSign, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ManualPayoutQueue() {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const queryClient = useQueryClient();

  const { data: payoutRequests, isLoading } = useQuery({
    queryKey: ['manual-payout-requests'],
    queryFn: () => base44.entities.PayoutRequest.list('-created_date', 100),
    initialData: []
  });

  const approveMutation = useMutation({
    mutationFn: async ({ payout_request_id, action, admin_notes }) => {
      const result = await base44.functions.invoke('approvePayout', {
        payout_request_id,
        action,
        admin_notes
      });
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manual-payout-requests'] });
      setSelectedRequest(null);
      setAdminNotes('');
    }
  });

  const markPaidMutation = useMutation({
    mutationFn: async ({ payout_request_id, transaction_reference }) => {
      const result = await base44.functions.invoke('markPayoutPaid', {
        payout_request_id,
        transaction_reference
      });
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manual-payout-requests'] });
      setSelectedRequest(null);
      setTransactionRef('');
    }
  });

  const handleApprove = (requestId) => {
    if (!confirm('Approve this payout request?')) return;
    approveMutation.mutate({
      payout_request_id: requestId,
      action: 'approve',
      admin_notes: adminNotes
    });
  };

  const handleReject = (requestId) => {
    if (!confirm('Reject this payout request? The amount will be refunded to the user.')) return;
    if (!adminNotes.trim()) {
      alert('Please provide a reason for rejection in the admin notes.');
      return;
    }
    approveMutation.mutate({
      payout_request_id: requestId,
      action: 'reject',
      admin_notes: adminNotes
    });
  };

  const handleMarkPaid = (requestId) => {
    if (!confirm('Mark this payout as paid? This confirms you have sent the payment.')) return;
    markPaidMutation.mutate({
      payout_request_id: requestId,
      transaction_reference: transactionRef
    });
  };

  const pendingRequests = payoutRequests.filter(r => r.status === 'pending');
  const approvedRequests = payoutRequests.filter(r => r.status === 'approved');
  const paidRequests = payoutRequests.filter(r => r.status === 'paid');
  const rejectedRequests = payoutRequests.filter(r => r.status === 'rejected');

  const getStatusBadge = (status) => {
    const config = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      paid: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle }
    };
    const { color, icon: Icon } = config[status] || config.pending;
    return (
      <Badge className={color}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Loading payout requests...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Manual Payout Requests
        </CardTitle>
        <p className="text-sm text-gray-600">
          Pending: {pendingRequests.length} | Approved: {approvedRequests.length} | Paid: {paidRequests.length} | Rejected: {rejectedRequests.length}
        </p>
      </CardHeader>
      <CardContent>
        {payoutRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No payout requests found
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  Pending Approval ({pendingRequests.length})
                </h3>
                <div className="space-y-3">
                  {pendingRequests.map((request) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-yellow-200 rounded-lg p-4 bg-yellow-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-semibold text-blue-900">{request.user_email}</p>
                            {getStatusBadge(request.status)}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                            <p><strong>Amount:</strong> ${request.amount.toFixed(2)}</p>
                            <p><strong>Method:</strong> {request.payout_method}</p>
                            <p><strong>Details:</strong> {request.payout_details}</p>
                            <p><strong>Requested:</strong> {new Date(request.created_date).toLocaleDateString()}</p>
                          </div>
                          
                          {selectedRequest === request.id && (
                            <div className="mt-3 space-y-2">
                              <Textarea
                                placeholder="Admin notes (required for rejection)"
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                className="text-sm"
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          {selectedRequest === request.id ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApprove(request.id)}
                                disabled={approveMutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(request.id)}
                                disabled={approveMutation.isPending}
                              >
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedRequest(null);
                                  setAdminNotes('');
                                }}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedRequest(request.id)}
                            >
                              Review
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Approved Requests */}
            {approvedRequests.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  Approved - Awaiting Payment ({approvedRequests.length})
                </h3>
                <div className="space-y-3">
                  {approvedRequests.map((request) => (
                    <div key={request.id} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-semibold text-blue-900">{request.user_email}</p>
                            {getStatusBadge(request.status)}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                            <p><strong>Amount:</strong> ${request.amount.toFixed(2)}</p>
                            <p><strong>Method:</strong> {request.payout_method}</p>
                            <p><strong>Details:</strong> {request.payout_details}</p>
                            <p><strong>Approved:</strong> {new Date(request.processed_date).toLocaleDateString()}</p>
                          </div>
                          {request.admin_notes && (
                            <p className="text-xs text-gray-600 mt-2"><strong>Notes:</strong> {request.admin_notes}</p>
                          )}
                          
                          {selectedRequest === request.id && (
                            <div className="mt-3">
                              <Input
                                placeholder="Transaction reference (optional)"
                                value={transactionRef}
                                onChange={(e) => setTransactionRef(e.target.value)}
                                className="text-sm"
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          {selectedRequest === request.id ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleMarkPaid(request.id)}
                                disabled={markPaidMutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Mark Paid
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedRequest(null);
                                  setTransactionRef('');
                                }}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedRequest(request.id)}
                            >
                              Mark as Paid
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Paid/Rejected */}
            {(paidRequests.length > 0 || rejectedRequests.length > 0) && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent History</h3>
                <div className="space-y-2">
                  {[...paidRequests, ...rejectedRequests].slice(0, 10).map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50 text-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{request.user_email}</p>
                          <p className="text-xs text-gray-600">${request.amount.toFixed(2)} via {request.payout_method}</p>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                      {request.admin_notes && (
                        <p className="text-xs text-gray-600 mt-2">{request.admin_notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}