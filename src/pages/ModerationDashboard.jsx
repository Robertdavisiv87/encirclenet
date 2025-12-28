import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import ModerationPanel from '../components/moderation/ModerationPanel';
import { Shield } from 'lucide-react';

export default function ModerationDashboard() {
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

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
      <div className="mb-6">
        <h1 className="text-4xl font-bold gradient-text mb-2 flex items-center gap-2">
          <Shield className="w-10 h-10" />
          Moderation Dashboard
        </h1>
        <p className="text-gray-600">Manage content moderation and community safety</p>
      </div>

      {user && <ModerationPanel user={user} />}
    </div>
  );
}