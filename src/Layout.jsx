import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { 
  Home, 
  Search, 
  PlusSquare, 
  Heart, 
  User, 
  MessageCircle,
  Compass,
  DollarSign,
  TrendingUp,
  Trophy
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
    { name: 'Earnings', icon: DollarSign, page: 'Earnings' },
    { name: 'Rewards', icon: Trophy, page: 'Gamification' },
    { name: 'Analytics', icon: TrendingUp, page: 'Analytics' },
    { name: 'Profile', icon: User, page: 'Profile' },
  ];

  const adminItems = user?.role === 'admin' ? [
    { name: 'Admin', icon: DollarSign, page: 'Admin' }
  ] : [];

  return (
    <div className="min-h-screen bg-black text-white"

      {/* Desktop Sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-black border-r border-zinc-800 flex-col p-6 z-50">
        <Link to={createPageUrl('Home')} className="mb-10 group">
          <h1 className="text-2xl font-bold gradient-text hover-scale">EncircleNet</h1>
          <p className="text-xs text-zinc-400 mt-1">Your World • Your Voice • Your Value</p>
        </Link>

        <div className="flex-1 space-y-2">
          {[...navItems, ...adminItems].map((item) => (
            <Link
              key={item.name}
              to={createPageUrl(item.page)}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 hover-lift",
                currentPageName === item.page 
                  ? "gradient-bg-card text-white border border-purple-500/30 shadow-glow" 
                  : "text-zinc-400 hover:bg-zinc-900/50 hover:text-white"
              )}
            >
              <item.icon className={cn(
                "w-6 h-6 transition-transform",
                currentPageName === item.page && "text-purple-400 scale-110"
              )} />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </div>

        {user && (
          <div className="border-t border-zinc-800 pt-4 mt-4">
            <div className="flex items-center gap-3 px-4 hover-lift cursor-pointer rounded-xl p-2">
              <div className="w-10 h-10 rounded-full gradient-bg-primary flex items-center justify-center shadow-glow">
                <span className="text-white font-bold">
                  {user.full_name?.[0] || user.email?.[0] || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{user.full_name || 'User'}</p>
                <p className="text-xs text-zinc-400 truncate">{user.email}</p>
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-800 z-50">
        <div className="flex justify-around items-center h-16">
          {[navItems[0], navItems[1], navItems[2], navItems[5], navItems[7]].map((item) => (
            <Link
              key={item.name}
              to={createPageUrl(item.page)}
              className={cn(
                "flex flex-col items-center justify-center p-2",
                currentPageName === item.page ? "text-white" : "text-zinc-500"
              )}
            >
              <item.icon className={cn(
                "w-6 h-6",
                currentPageName === item.page && "text-purple-500"
              )} />
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}