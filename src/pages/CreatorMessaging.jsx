import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import CreatorInbox from '../components/messaging/CreatorInbox';
import SEO from '../components/SEO';
import { MessageCircle } from 'lucide-react';

export default function CreatorMessaging() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {
        window.location.href = '/';
      }
    };
    loadUser();
  }, []);

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
      <SEO 
        title="Creator Messaging - Connect with Subscribers & Fans"
        description="Message your subscribers and top fans directly"
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2 flex items-center gap-2">
          <MessageCircle className="w-8 h-8" />
          Creator Messaging
        </h1>
        <p className="text-gray-600">Connect directly with your subscribers and top supporters</p>
      </div>

      <CreatorInbox creatorEmail={user.email} />
    </div>
  );
}