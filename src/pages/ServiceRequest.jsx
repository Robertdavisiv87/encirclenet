import React, { useState } from 'react';
import ServiceVerticalSelector from '../components/services/ServiceVerticalSelector';
import ServiceRequestWizard from '../components/services/ServiceRequestWizard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ServiceRequest() {
  const [selectedVertical, setSelectedVertical] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (data) => {
    console.log('Service request submitted:', data);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-3xl font-bold gradient-text mb-3">Request Submitted!</h2>
          <p className="text-gray-600 mb-6">
            We're finding the best providers near you. You'll receive notifications shortly.
          </p>
          <Button onClick={() => { setSubmitted(false); setSelectedVertical(null); }} className="gradient-bg-primary text-white">
            Submit Another Request
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        {selectedVertical && (
          <Button 
            variant="ghost" 
            onClick={() => setSelectedVertical(null)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Services
          </Button>
        )}

        {!selectedVertical ? (
          <ServiceVerticalSelector onSelect={setSelectedVertical} />
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <DynamicServiceIntake 
              vertical={selectedVertical}
              onSubmit={handleSubmit}
            />
          </div>
        )}
      </div>
    </div>
  );
}