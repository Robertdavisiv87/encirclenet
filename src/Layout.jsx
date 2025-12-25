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
  DollarSign
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
    { name: 'Profile', icon: User, page: 'Profile' },
  ];

  const adminItems = user?.role === 'admin' ? [
    { name: 'Admin', icon: DollarSign, page: 'Admin' }
  ] : [];

  return (
    <div className="min-h-screen bg-black text-white">
      <style>{`
        :root {
          --gradient-start: #7C3AED;
          --gradient-mid: #EC4899;
          --gradient-end: #F59E0B;
        }
        .gradient-text {
          background: linear-gradient(135deg, var(--gradient-start), var(--gradient-mid));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .gradient-bg {
          background: linear-gradient(135deg, var(--gradient-start), var(--gradient-mid));
        }
        .gradient-border {
          border-image: linear-gradient(135deg, var(--gradient-start), var(--gradient-mid)) 1;
        }
      `}</style>

      {/* Desktop Sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-black border-r border-zinc-800 flex-col p-6 z-50">
        <Link to={createPageUrl('Home')} className="mb-10">
          <h1 className="text-2xl font-bold gradient-text">CircleNet</h1>
          <p className="text-xs text-zinc-500 mt-1">Your World. Your Voice.</p>
        </Link>

        <div className="flex-1 space-y-2">
          {[...navItems, ...adminItems].map((item) => (
            <Link
              key={item.name}
              to={createPageUrl(item.page)}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200",
                currentPageName === item.page 
                  ? "bg-zinc-900 text-white" 
                  : "text-zinc-400 hover:bg-zinc-900/50 hover:text-white"
              )}
            >
              <item.icon className={cn(
                "w-6 h-6",
                currentPageName === item.page && "text-purple-500"
              )} />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </div>

        {user && (
          <div className="border-t border-zinc-800 pt-4 mt-4">
            <div className="flex items-center gap-3 px-4">
              <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center">
                <span className="text-white font-bold">
                  {user.full_name?.[0] || user.email?.[0] || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user.full_name || 'User'}</p>
                <p className="text-xs text-zinc-500 truncate">{user.email}</p>
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
          {navItems.slice(0, 5).map((item) => (
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