import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Search as SearchIcon, UserPlus, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    
    try {
      // Search users by full name or email
      const allUsers = await base44.entities.User.list('-created_date', 100);
      const filtered = allUsers.filter(user => 
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setResults(filtered);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleViewProfile = (email) => {
    window.location.href = `/viewprofile?email=${email}`;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Search Users</h1>
        <p className="text-gray-600">Find and connect with other creators</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base border-2 border-purple-200 focus:border-purple-400"
            />
          </div>
          <Button 
            type="submit" 
            disabled={isSearching}
            className="gradient-bg-primary text-white shadow-glow px-6 h-12"
          >
            {isSearching ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Search'
            )}
          </Button>
        </div>
      </form>

      {/* Results */}
      {isSearching && (
        <div className="text-center py-12">
          <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-600">Searching...</p>
        </div>
      )}

      {!isSearching && hasSearched && results.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <SearchIcon className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold mb-2 text-gray-900">No users found</h3>
          <p className="text-gray-600">Try searching with a different name or email</p>
        </div>
      )}

      {!isSearching && results.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 mb-4">
            Found {results.length} user{results.length !== 1 ? 's' : ''}
          </p>
          {results.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="cursor-pointer hover:shadow-glow transition-all hover-lift">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex items-center gap-3 flex-1"
                      onClick={() => handleViewProfile(user.email)}
                    >
                      <Avatar className="w-12 h-12 ring-2 ring-purple-500/50">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback className="gradient-bg-primary text-white">
                          {user.full_name?.[0] || user.email?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-blue-900 truncate">
                          {user.full_name || 'User'}
                        </p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        {user.role === 'admin' && (
                          <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full">
                            Admin
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleViewProfile(user.email)}
                      size="sm"
                      className="gradient-bg-primary text-white"
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {!hasSearched && (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full gradient-bg-primary flex items-center justify-center shadow-glow">
            <SearchIcon className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-bold mb-2 text-gray-900">Search for Users</h3>
          <p className="text-gray-600">Enter a name or email to find other creators on Encircle Net</p>
        </div>
      )}
    </div>
  );
}