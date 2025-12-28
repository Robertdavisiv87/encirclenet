import React from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Check } from 'lucide-react';
import moment from 'moment';

export default function GroupEventCard({ event, currentUser }) {
  const queryClient = useQueryClient();
  const isAttending = event.attendees?.includes(currentUser?.email);

  const attendMutation = useMutation({
    mutationFn: async () => {
      const newAttendees = isAttending
        ? event.attendees.filter(e => e !== currentUser.email)
        : [...(event.attendees || []), currentUser.email];
      
      await base44.entities.GroupEvent.update(event.id, {
        attendees: newAttendees
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['group-events']);
    }
  });

  return (
    <Card className="border-2 border-gray-200 hover:shadow-lg transition-all">
      <CardContent className="p-4">
        <h3 className="font-bold text-lg text-blue-900 mb-2">{event.title}</h3>
        <p className="text-gray-700 text-sm mb-4">{event.description}</p>

        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-600" />
            <span>{moment(event.event_date).format('MMM D, YYYY [at] h:mm A')}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-600" />
              <span>{event.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-600" />
            <span>{event.attendees?.length || 0} attending</span>
            {event.max_attendees && <span>/ {event.max_attendees} max</span>}
          </div>
        </div>

        {currentUser && (
          <Button
            onClick={() => attendMutation.mutate()}
            disabled={attendMutation.isPending}
            className={isAttending ? "bg-green-600 hover:bg-green-700" : "gradient-bg-primary"}
            size="sm"
          >
            {isAttending && <Check className="w-4 h-4 mr-1" />}
            {isAttending ? 'Attending' : 'Attend'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}