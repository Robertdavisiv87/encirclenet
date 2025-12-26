import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { 
  Home, 
  Search, 
  PlusSquare, 
  Heart, 
  User, 
  Users,
  MessageCircle,
  Compass,
  DollarSign,
  TrendingUp,
  Trophy,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ADMIN_EMAIL = 'robertdavisiv87@gmail.com';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {
        // User not logged in
      }
    };
    loadUser();
  }, []);

  const navItems = [
    { name: 'Home', icon: Home, page: 'Home' },
    { name: 'Explore', icon: Compass, page: 'Explore' },
    { name: 'Create', icon: PlusSquare, page: 'Create' },
    { name: 'Messages', icon: MessageCircle, page: 'Messages' },
    { name: 'Economy', icon: DollarSign, page: 'CreatorEconomy' },
    { name: 'Referrals', icon: Users, page: 'Referrals' },
    { name: 'Rewards', icon: Trophy, page: 'Gamification' },
    { name: 'Profile', icon: User, page: 'Profile' },
  ];

  // Only show admin items to robertdavisiv87@gmail.com
  const adminItems = user?.email === ADMIN_EMAIL ? [
    { name: 'Admin', icon: Shield, page: 'Admin' },
    { name: 'Revenue', icon: DollarSign, page: 'AdminRevenue' }
  ] : [];

  return (
    <HelmetProvider>
      <div className="min-h-screen bg-white text-blue-900">
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex-col p-6 z-50 shadow-lg">
        <Link to={createPageUrl('Home')} className="mb-10 group">
          <h1 className="text-2xl font-bold gradient-text hover-scale flex items-center gap-2">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694d8134627c7c1962086e4b/90c7b04a9_logo.jpg" 
              alt="Encircle Net" 
              className="w-8 h-8 rounded-full shadow-glow"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            Encircle Net
          </h1>
          <p className="text-xs text-gray-500 mt-1">Your World • Your Voice • Your Value</p>
        </Link>

        <div className="flex-1 space-y-2">
          {[...navItems, ...adminItems].map((item) => (
            <Link
              key={item.name}
              to={createPageUrl(item.page)}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 hover-lift",
                currentPageName === item.page 
                  ? "gradient-bg-primary text-white shadow-glow" 
                  : "text-blue-700 hover:bg-gray-100 hover:text-blue-900"
              )}
            >
              <item.icon className={cn(
                "w-6 h-6 transition-transform",
                currentPageName === item.page && "text-purple-600 scale-110"
              )} />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </div>

        {user && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex items-center gap-3 px-4 hover-lift cursor-pointer rounded-xl p-2">
              <div className="w-10 h-10 rounded-full gradient-bg-primary flex items-center justify-center shadow-glow">
                <span className="text-white font-bold">
                  {user.full_name?.[0] || user.email?.[0] || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate text-blue-900">{user.full_name || 'User'}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="md:ml-64 min-h-screen pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
        <div className="flex justify-around items-center h-16">
          {[navItems[0], navItems[1], navItems[2], navItems[5], navItems[7]].map((item) => (
            <Link
              key={item.name}
              to={createPageUrl(item.page)}
              className={cn(
                "flex flex-col items-center justify-center p-2",
                currentPageName === item.page ? "text-blue-900" : "text-gray-400"
              )}
            >
              <item.icon className={cn(
                "w-6 h-6",
                currentPageName === item.page && "text-purple-600"
              )} />
            </Link>
          ))}
        </div>
      </nav>
      </div>
    </HelmetProvider>
  );
}