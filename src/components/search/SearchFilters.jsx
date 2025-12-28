import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, FileText, Calendar, Filter } from 'lucide-react';

const contentTypes = [
  { value: 'all', label: 'All', icon: '🌐' },
  { value: 'posts', label: 'Posts', icon: '📝' },
  { value: 'users', label: 'Users', icon: '👤' },
  { value: 'groups', label: 'Groups', icon: '👥' },
  { value: 'events', label: 'Events', icon: '📅' }
];

const sortOptions = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'date', label: 'Most Recent' },
  { value: 'popularity', label: 'Most Popular' },
  { value: 'trending', label: 'Trending' }
];

export default function SearchFilters({ 
  contentType, 
  onContentTypeChange, 
  sortBy, 
  onSortChange 
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {contentTypes.map(type => (
          <Button
            key={type.value}
            variant={contentType === type.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onContentTypeChange(type.value)}
            className={contentType === type.value ? 'gradient-bg-primary' : ''}
          >
            <span className="mr-1">{type.icon}</span>
            {type.label}
          </Button>
        ))}
      </div>

      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-[180px]">
          <Filter className="w-4 h-4 mr-2" />
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}