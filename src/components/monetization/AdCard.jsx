import React from 'react';
import { ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

export default function AdCard({ ad, userTier, onAdClick }) {
  const handleClick = async () => {
    try {
      await base44.entities.AdClick.create({
        user_email: (await base44.auth.me()).email,
        ad_id: ad.id,
        ad_type: ad.type,
        click_value: ad.value || 0.5
      });
      onAdClick && onAdClick(ad);
      window.open(ad.url, '_blank');
    } catch (e) {}
  };

  if (userTier === 'elite') return null;

  return (
    <div className={cn(
      "bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 mb-4",
      userTier === 'free' && "border-purple-500/30"
    )}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-zinc-500 uppercase tracking-wider">Sponsored</span>
        <ExternalLink className="w-4 h-4 text-zinc-500" />
      </div>
      
      <div className="flex gap-4">
        {ad.image && (
          <img 
            src={ad.image} 
            alt={ad.title}
            className="w-20 h-20 rounded-lg object-cover"
          />
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">{ad.title}</h3>
          <p className="text-xs text-zinc-400 mb-3">{ad.description}</p>
          <button
            onClick={handleClick}
            className="text-xs bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {ad.cta || 'Learn More'}
          </button>
        </div>
      </div>
    </div>
  );
}