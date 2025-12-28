import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { UserPlus, X, Search, Check } from 'lucide-react';

export default function CoHostSelector({ groupId, selectedCoHosts, onCoHostsChange }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const { data: groupMembers = [] } = useQuery({
    queryKey: ['group-members-cohosts', groupId, searchQuery],
    queryFn: async () => {
      if (!groupId) return [];
      const memberships = await base44.entities.GroupMembership.filter({ group_id: groupId });
      const memberEmails = memberships.map(m => m.user_email);
      
      if (memberEmails.length === 0) return [];
      
      const allUsers = await base44.entities.User.list();
      let members = allUsers.filter(u => memberEmails.includes(u.email));
      
      if (searchQuery.length >= 2) {
        members = members.filter(user =>
          user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      return members.slice(0, 10);
    },
    enabled: !!groupId && showSearch
  });

  const addCoHost = (user) => {
    if (!selectedCoHosts.find(c => c.email === user.email)) {
      onCoHostsChange([...selectedCoHosts, { 
        email: user.email, 
        name: user.full_name || user.email 
      }]);
    }
    setSearchQuery('');
  };

  const removeCoHost = (email) => {
    onCoHostsChange(selectedCoHosts.filter(c => c.email !== email));
  };

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        <UserPlus className="w-4 h-4" />
        Co-Hosts (Optional)
      </Label>

      {/* Selected Co-Hosts */}
      {selectedCoHosts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCoHosts.map((cohost) => (
            <Badge key={cohost.email} className="bg-blue-100 text-blue-700 pr-1">
              {cohost.name}
              <button
                onClick={() => removeCoHost(cohost.email)}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search Toggle */}
      {!showSearch ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowSearch(true)}
          className="w-full"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Co-Host
        </Button>
      ) : (
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search group members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Search Results */}
          {groupMembers.length > 0 ? (
            <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto bg-white">
              {groupMembers.map((user) => {
                const isSelected = selectedCoHosts.find(c => c.email === user.email);
                return (
                  <button
                    key={user.email}
                    type="button"
                    onClick={() => !isSelected && addCoHost(user)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                    disabled={isSelected}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                      {user.full_name?.[0] || user.email?.[0] || 'U'}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm">{user.full_name || 'User'}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-green-600" />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              {searchQuery ? 'No members found' : 'Type to search...'}
            </p>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowSearch(false);
              setSearchQuery('');
            }}
            className="w-full"
          >
            Done
          </Button>
        </div>
      )}
    </div>
  );
}