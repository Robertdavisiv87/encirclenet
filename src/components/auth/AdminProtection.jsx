import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Lock, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const ADMIN_EMAIL = 'robertdavisiv87@gmail.com';

export default function AdminProtection({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {
        window.location.href = '/';
      } finally {
        setLoading(false);
      }
    };
    checkAdmin();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Shield className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full bg-zinc-900 border-red-500/50">
          <CardContent className="p-8 text-center">
            <Lock className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold mb-2 text-red-400">Access Denied</h2>
            <p className="text-zinc-400 mb-4">
              This area is restricted to authorized administrators only.
            </p>
            <p className="text-xs text-zinc-600">
              If you believe this is an error, please contact support.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

export { ADMIN_EMAIL };