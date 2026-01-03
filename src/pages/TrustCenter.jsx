import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertCircle, CheckCircle, Camera } from 'lucide-react';
import IDVerificationFlow from '../components/trust/IDVerificationFlow';
import DisputeResolutionFlow from '../components/trust/DisputeResolutionFlow';

export default function TrustCenter() {
  const [user, setUser] = useState(null);
  const [showIDVerification, setShowIDVerification] = useState(false);
  const [showDispute, setShowDispute] = useState(false);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: verifications } = useQuery({
    queryKey: ['verifications', user?.email],
    queryFn: () => base44.entities.IDVerification.filter({ user_email: user?.email }),
    initialData: [],
    enabled: !!user
  });

  const { data: disputes } = useQuery({
    queryKey: ['disputes', user?.email],
    queryFn: () => base44.entities.Dispute.filter({ filed_by: user?.email }),
    initialData: [],
    enabled: !!user
  });

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gradient-to-b from-purple-50 to-white min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">Trust & Safety Center</h1>
        <p className="text-gray-600">Protect yourself and build trust on Encircle Net</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white realistic-shadow hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Shield className="w-6 h-6 text-blue-600" />
              ID Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Verify your identity to build trust and unlock premium features.
            </p>
            <Button 
              onClick={() => setShowIDVerification(true)}
              variant={verifications[0]?.status === 'verified' ? 'outline' : 'default'}
              className={verifications[0]?.status === 'verified' ? '' : 'gradient-bg-primary text-white'}
            >
              {verifications[0]?.status === 'verified' ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  Verified
                </>
              ) : (
                'Get Verified'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white realistic-shadow hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertCircle className="w-6 h-6 text-red-600" />
              Dispute Resolution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              AI-powered dispute resolution with fair outcomes for all.
            </p>
            <Button 
              onClick={() => setShowDispute(true)}
              variant="outline"
              className="text-red-600 border-red-300"
            >
              File a Dispute
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white realistic-shadow hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <Camera className="w-6 h-6 text-green-600" />
              Job Confirmation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Upload proof of completed work to protect your payments.
            </p>
            <Button variant="outline" className="text-green-600 border-green-300">
              Upload Photos
            </Button>
          </CardContent>
        </Card>
      </div>

      {disputes.length > 0 && (
        <Card className="bg-white realistic-shadow mb-6">
          <CardHeader>
            <CardTitle>Your Disputes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {disputes.map((dispute) => (
                <div key={dispute.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">{dispute.dispute_type.replace('_', ' ')}</p>
                      <p className="text-sm text-gray-600">{dispute.description}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      dispute.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {dispute.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <IDVerificationFlow
        isOpen={showIDVerification}
        onClose={() => setShowIDVerification(false)}
        user={user}
      />

      <DisputeResolutionFlow
        serviceRequestId="test-123"
        isOpen={showDispute}
        onClose={() => setShowDispute(false)}
        user={user}
      />
    </div>
  );
}