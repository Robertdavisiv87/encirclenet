import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Crown, Shield } from 'lucide-react';

export default function GroupMembersList({ members, groupId, isOwner }) {
  const { data: users } = useQuery({
    queryKey: ['group-users', groupId],
    queryFn: async () => {
      const emails = members.map(m => m.user_email);
      if (emails.length === 0) return [];
      const allUsers = await base44.entities.User.list();
      return allUsers.filter(u => emails.includes(u.email));
    },
    enabled: members.length > 0,
    initialData: []
  });

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {members.map(member => {
        const userData = users.find(u => u.email === member.user_email);
        
        return (
          <Card key={member.id} className="border-2 border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={userData?.avatar} />
                  <AvatarFallback>
                    {userData?.full_name?.[0] || member.user_email[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-blue-900">
                      {userData?.full_name || member.user_email}
                    </p>
                    {member.role === 'admin' && (
                      <Crown className="w-4 h-4 text-yellow-600" />
                    )}
                    {member.role === 'moderator' && (
                      <Shield className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}