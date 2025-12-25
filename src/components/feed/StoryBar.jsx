import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const mockStories = [
  { id: 1, name: 'Your Story', avatar: null, isOwn: true },
  { id: 2, name: 'alex_j', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', hasNew: true },
  { id: 3, name: 'sarah_m', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', hasNew: true },
  { id: 4, name: 'mike_d', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', hasNew: false },
  { id: 5, name: 'emma_w', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', hasNew: true },
  { id: 6, name: 'james_k', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop', hasNew: false },
];

export default function StoryBar({ currentUser }) {
  return (
    <div className="flex gap-4 overflow-x-auto py-4 px-2 scrollbar-hide">
      {mockStories.map((story, index) => (
        <div key={story.id} className="flex flex-col items-center gap-1 flex-shrink-0">
          <div className={cn(
            "relative p-[2px] rounded-full",
            story.hasNew && !story.isOwn && "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400"
          )}>
            <Avatar className={cn(
              "w-16 h-16 border-2 border-black",
              story.isOwn && "opacity-70"
            )}>
              <AvatarImage src={story.isOwn ? currentUser?.avatar : story.avatar} />
              <AvatarFallback className="bg-zinc-800 text-zinc-400">
                {story.isOwn ? (currentUser?.full_name?.[0] || 'Y') : story.name[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {story.isOwn && (
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-black">
                <Plus className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <span className="text-xs text-zinc-400 truncate w-16 text-center">
            {story.isOwn ? 'Your Story' : story.name}
          </span>
        </div>
      ))}
    </div>
  );
}