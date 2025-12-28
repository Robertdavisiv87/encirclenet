import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Users, X, Search, Check } from 'lucide-react';

export default function CollaboratorSelector({ selectedCollaborators, onCollaboratorsChange }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const { data: users = [] } = useQuery({
    queryKey: ['search-collaborators', searchQuery],
    queryFn: async () => {
      if (searchQuery.length < 2) return [];
      const allUsers = await base44.entities.User.list();
      return allUsers.filter(user => 
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8);
    },
    enabled: searchQuery.length >= 2
  });

  const addCollaborator = (user) => {
    if (!selectedCollaborators.find(c => c.email === user.email)) {
      onCollaboratorsChange([...selectedCollaborators, { 
        email: user.email, 
        name: user.full_name || user.email 
      }]);
    }
    setSearchQuery('');
    setShowSearch(false);
  };

  const removeCollaborator = (email) => {
    onCollaboratorsChange(selectedCollaborators.filter(c => c.email !== email));
  };

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        <Users className="w-4 h-4" />
        Tag Collaborators
      </Label>

      {/* Selected Collaborators */}
      {selectedCollaborators.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCollaborators.map((collab) => (
            <Badge key={collab.email} className="bg-purple-100 text-purple-700 pr-1">
              {collab.name}
              <button
                onClick={() => removeCollaborator(collab.email)}
                className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
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
          <Users className="w-4 h-4 mr-2" />
          Add Collaborator
        </Button>
      ) : (
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Search Results */}
          {users.length > 0 && (
            <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto bg-white">
              {users.map((user) => {
                const isSelected = selectedCollaborators.find(c => c.email === user.email);
                return (
                  <button
                    key={user.email}
                    type="button"
                    onClick={() => !isSelected && addCollaborator(user)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                    disabled={isSelected}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
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