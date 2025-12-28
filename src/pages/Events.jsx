import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Clock, MapPin, Plus, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import moment from 'moment';

export default function Events() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {}
    };
    loadUser();
  }, []);

  const { data: upcomingEvents = [] } = useQuery({
    queryKey: ['events-upcoming'],
    queryFn: async () => {
      const events = await base44.entities.Event.filter({ status: 'scheduled' });
      return events.filter(e => new Date(e.scheduled_date) > new Date());
    }
  });

  const { data: myRSVPs = [] } = useQuery({
    queryKey: ['my-rsvps', user?.email],
    queryFn: () => base44.entities.RSVP.filter({ user_email: user?.email }),
    enabled: !!user?.email
  });

  const rsvpMutation = useMutation({
    mutationFn: async ({ eventId, status }) => {
      const existing = await base44.entities.RSVP.filter({ 
        event_id: eventId, 
        user_email: user.email 
      });

      if (existing.length > 0) {
        return await base44.entities.RSVP.update(existing[0].id, { status });
      } else {
        const event = await base44.entities.Event.filter({ id: eventId });
        await base44.entities.Event.update(eventId, { 
          rsvp_count: (event[0].rsvp_count || 0) + 1 
        });
        return await base44.entities.RSVP.create({
          event_id: eventId,
          user_email: user.email,
          user_name: user.full_name,
          status
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['events-upcoming']);
      queryClient.invalidateQueries(['my-rsvps']);
    }
  });

  const isRSVPd = (eventId) => myRSVPs.some(r => r.event_id === eventId && r.status === 'confirmed');

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Events & Live Sessions</h1>
            <p className="text-gray-600">Discover and join creator events</p>
          </div>
          <Button className="gradient-bg-primary text-white shadow-glow">
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </div>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList className="w-full bg-white border-2 border-gray-200 mb-6">
          <TabsTrigger value="upcoming" className="flex-1 data-[state=active]:gradient-bg-primary data-[state=active]:text-white">
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="my-events" className="flex-1 data-[state=active]:gradient-bg-primary data-[state=active]:text-white">
            My RSVPs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-white border-2 border-gray-200 hover:shadow-glow transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-blue-900 mb-2">{event.title}</CardTitle>
                      <p className="text-sm text-gray-600">{event.description}</p>
                    </div>
                    {event.cover_image && (
                      <img src={event.cover_image} alt="" className="w-24 h-24 rounded-lg object-cover" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      {moment(event.scheduled_date).format('MMM D, YYYY')}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Clock className="w-4 h-4 text-blue-600" />
                      {event.duration_minutes} minutes
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Users className="w-4 h-4 text-green-600" />
                      {event.rsvp_count} attending
                    </div>
                  </div>

                  {event.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <MapPin className="w-4 h-4" />
                      {event.location}
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => rsvpMutation.mutate({ eventId: event.id, status: 'confirmed' })}
                      disabled={rsvpMutation.isPending || isRSVPd(event.id)}
                      className={isRSVPd(event.id) ? "bg-green-500 text-white" : "gradient-bg-primary text-white"}
                    >
                      {isRSVPd(event.id) ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          RSVP'd
                        </>
                      ) : 'RSVP Now'}
                    </Button>
                    {event.is_paid && (
                      <span className="text-sm font-semibold text-green-600">
                        ${event.ticket_price}
                      </span>
                    )}
                    <span className="text-xs text-gray-500 ml-auto">
                      {event.event_type.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="my-events" className="space-y-4">
          {upcomingEvents.filter(e => isRSVPd(e.id)).map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300">
                <CardHeader>
                  <CardTitle className="text-blue-900">{event.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-gray-700 mb-3">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    {moment(event.scheduled_date).format('MMM D, YYYY h:mm A')}
                  </div>
                  <Button size="sm" variant="outline">
                    Add to Calendar
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}