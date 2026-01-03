import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import ServiceVerticalSelector from '../components/services/ServiceVerticalSelector';
import ServiceRequestWizard from '../components/services/ServiceRequestWizard';

export default function ServiceRequest() {
  const [selectedVertical, setSelectedVertical] = useState(null);
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        {!selectedVertical ? (
          <ServiceVerticalSelector onSelect={setSelectedVertical} />
        ) : (
          <ServiceRequestWizard 
            vertical={selectedVertical}
            isOpen={!!selectedVertical}
            onClose={() => setSelectedVertical(null)}
            user={user}
          />
        )}
      </div>
    </div>
  );
}