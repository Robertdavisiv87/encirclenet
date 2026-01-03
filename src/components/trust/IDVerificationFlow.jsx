import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Upload, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function IDVerificationFlow({ isOpen, onClose, user }) {
  const [uploading, setUploading] = useState(false);

  const { data: verifications } = useQuery({
    queryKey: ['id-verifications', user?.email],
    queryFn: () => base44.entities.IDVerification.filter({ user_email: user?.email }),
    initialData: [],
    enabled: !!user
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ document_url }) => {
      const result = await base44.functions.invoke('verifyID', {
        verification_type: 'government_id',
        document_url
      });
      return result.data;
    }
  });

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const uploadResult = await base44.integrations.Core.UploadFile({ file });
    await verifyMutation.mutateAsync({ document_url: uploadResult.file_url });
    setUploading(false);
  };

  const latestVerification = verifications[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-900">
            <Shield className="w-6 h-6 text-blue-600" />
            Identity Verification
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Why verify your ID?</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✓ Build trust with customers and providers</li>
              <li>✓ Access higher-paying jobs</li>
              <li>✓ Unlock premium features</li>
              <li>✓ Faster dispute resolution</li>
            </ul>
          </div>

          {latestVerification ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  {latestVerification.status === 'verified' && (
                    <>
                      <CheckCircle className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="font-semibold text-green-900">Verified</p>
                        <p className="text-sm text-gray-600">Your ID has been verified</p>
                      </div>
                    </>
                  )}
                  {latestVerification.status === 'processing' && (
                    <>
                      <Clock className="w-8 h-8 text-yellow-600 animate-pulse" />
                      <div>
                        <p className="font-semibold text-yellow-900">Processing</p>
                        <p className="text-sm text-gray-600">Verification in progress...</p>
                      </div>
                    </>
                  )}
                  {latestVerification.status === 'rejected' && (
                    <>
                      <XCircle className="w-8 h-8 text-red-600" />
                      <div>
                        <p className="font-semibold text-red-900">Rejected</p>
                        <p className="text-sm text-gray-600">{latestVerification.rejection_reason}</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
                id="id-upload"
              />
              <label htmlFor="id-upload">
                <Button 
                  type="button" 
                  className="w-full gradient-bg-primary text-white" 
                  disabled={uploading || verifyMutation.isLoading}
                  asChild
                >
                  <span>
                    <Upload className="w-5 h-5 mr-2" />
                    {uploading || verifyMutation.isLoading ? 'Processing...' : 'Upload Government ID'}
                  </span>
                </Button>
              </label>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Accepted: Driver's License, Passport, State ID
              </p>
            </div>
          )}

          <div className="text-xs text-gray-500 text-center">
            🔒 Your information is encrypted and secure
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}