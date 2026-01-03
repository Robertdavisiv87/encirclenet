import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Upload, CheckCircle, Loader2, MapPin } from 'lucide-react';

export default function JobConfirmationUpload({ serviceRequestId, user }) {
  const [photos, setPhotos] = useState([]);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [location, setLocation] = useState(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.JobConfirmation.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['job-confirmations']);
      setPhotos([]);
      setNotes('');
    }
  });

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      });
    }
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);

    const uploadedUrls = [];
    for (const file of files) {
      const result = await base44.integrations.Core.UploadFile({ file });
      uploadedUrls.push(result.file_url);
    }

    setPhotos(prev => [...prev, ...uploadedUrls]);
    setUploading(false);
  };

  const handleSubmit = () => {
    if (!location) {
      getLocation();
      setTimeout(() => {
        submitConfirmation();
      }, 1000);
    } else {
      submitConfirmation();
    }
  };

  const submitConfirmation = () => {
    uploadMutation.mutate({
      service_request_id: serviceRequestId,
      provider_email: user.email,
      customer_email: 'customer@example.com', // Should be from service request
      photo_urls: photos,
      completion_notes: notes,
      gps_location: location,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-900">
          <Camera className="w-6 h-6" />
          Job Confirmation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-700">
          Upload photos of completed work to verify service completion and protect your payment.
        </p>

        <div>
          <input
            type="file"
            multiple
            accept="image/*"
            capture="environment"
            onChange={handlePhotoUpload}
            className="hidden"
            id="job-photo-upload"
          />
          <label htmlFor="job-photo-upload">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full border-green-300" 
              disabled={uploading}
              asChild
            >
              <span>
                <Camera className="w-4 h-4 mr-2" />
                {uploading ? 'Uploading...' : 'Take Photos'}
              </span>
            </Button>
          </label>
          {photos.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {photos.map((url, i) => (
                <img key={i} src={url} alt="Job proof" className="w-full h-20 object-cover rounded-lg" />
              ))}
            </div>
          )}
        </div>

        <div>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about the completed work..."
            rows={3}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={photos.length === 0 || uploadMutation.isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          {uploadMutation.isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Submit Confirmation
            </>
          )}
        </Button>

        {location && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <MapPin className="w-3 h-3" />
            <span>Location verified</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}