import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Upload, Sparkles, Loader2 } from 'lucide-react';

export default function DisputeResolutionFlow({ serviceRequestId, isOpen, onClose, user }) {
  const [formData, setFormData] = useState({
    dispute_type: '',
    description: '',
    evidence_urls: []
  });
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const queryClient = useQueryClient();

  const createDisputeMutation = useMutation({
    mutationFn: async (data) => {
      const dispute = await base44.entities.Dispute.create(data);
      
      // Trigger AI analysis
      setAnalyzing(true);
      const analysisResult = await base44.functions.invoke('analyzeDispute', { 
        dispute_id: dispute.id 
      });
      setAnalyzing(false);
      
      return { dispute, analysis: analysisResult.data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['disputes']);
      onClose();
    }
  });

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);

    const uploadedUrls = [];
    for (const file of files) {
      const result = await base44.integrations.Core.UploadFile({ file });
      uploadedUrls.push(result.file_url);
    }

    setFormData(prev => ({
      ...prev,
      evidence_urls: [...prev.evidence_urls, ...uploadedUrls]
    }));
    setUploading(false);
  };

  const handleSubmit = () => {
    createDisputeMutation.mutate({
      service_request_id: serviceRequestId,
      filed_by: user.email,
      filed_against: 'provider_email', // Should be fetched from service request
      ...formData
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-900">
            <AlertCircle className="w-6 h-6" />
            File a Dispute
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-red-50 rounded-lg p-3 border border-red-200">
            <p className="text-sm text-red-900">
              Our AI will analyze your dispute and suggest a fair resolution. Complex cases are reviewed by our team.
            </p>
          </div>

          <div>
            <Label>Dispute Type</Label>
            <Select value={formData.dispute_type} onValueChange={(val) => setFormData({...formData, dispute_type: val})}>
              <SelectTrigger>
                <SelectValue placeholder="Select issue type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quality_issue">Quality Issue</SelectItem>
                <SelectItem value="no_show">Provider No-Show</SelectItem>
                <SelectItem value="payment_issue">Payment Issue</SelectItem>
                <SelectItem value="communication">Communication Problem</SelectItem>
                <SelectItem value="safety_concern">Safety Concern</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe the issue in detail..."
              rows={4}
            />
          </div>

          <div>
            <Label>Evidence (Photos, Screenshots)</Label>
            <div className="mt-2">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="evidence-upload"
              />
              <label htmlFor="evidence-upload">
                <Button type="button" variant="outline" className="w-full" disabled={uploading} asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload Evidence'}
                  </span>
                </Button>
              </label>
              {formData.evidence_urls.length > 0 && (
                <p className="text-sm text-gray-600 mt-2">{formData.evidence_urls.length} file(s) uploaded</p>
              )}
            </div>
          </div>

          {analyzing && (
            <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-300">
              <div className="flex items-center gap-2 text-purple-900">
                <Sparkles className="w-5 h-5 animate-pulse" />
                <span className="font-semibold">AI is analyzing your dispute...</span>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.dispute_type || !formData.description || createDisputeMutation.isLoading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {createDisputeMutation.isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Dispute'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}