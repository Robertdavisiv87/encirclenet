import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function ProviderCalendarManager({ serviceVertical, user }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState(generateTimeSlots());
  const queryClient = useQueryClient();

  function generateTimeSlots() {
    const slots = [];
    for (let hour = 8; hour <= 18; hour++) {
      slots.push({ time: `${hour.toString().padStart(2, '0')}:00`, available: true, booked_by: null });
      slots.push({ time: `${hour.toString().padStart(2, '0')}:30`, available: true, booked_by: null });
    }
    return slots;
  }

  const { data: availability } = useQuery({
    queryKey: ['my-availability', selectedDate],
    queryFn: async () => {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const avail = await base44.entities.ProviderAvailability.filter({
        provider_email: user?.email,
        date: dateStr
      });
      if (avail.length > 0 && avail[0].time_slots) {
        setTimeSlots(avail[0].time_slots);
        return avail[0];
      }
      return null;
    },
    enabled: !!user && !!selectedDate
  });

  const updateAvailabilityMutation = useMutation({
    mutationFn: async () => {
      return await base44.functions.invoke('autoUpdateAvailability', {
        date: format(selectedDate, 'yyyy-MM-dd'),
        time_slots: timeSlots,
        service_vertical: serviceVertical
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-availability']);
    }
  });

  const toggleSlot = (index) => {
    setTimeSlots(prev => {
      const updated = [...prev];
      if (!updated[index].booked_by) {
        updated[index].available = !updated[index].available;
      }
      return updated;
    });
  };

  const setAllAvailable = (available) => {
    setTimeSlots(prev => prev.map(slot => 
      slot.booked_by ? slot : { ...slot, available }
    ));
  };

  return (
    <Card className="border-2 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-purple-600" />
          Manage Your Availability
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Calendar */}
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => date < new Date()}
            className="rounded-md border-2 border-purple-200"
          />
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setAllAvailable(true)}
            className="flex-1"
          >
            All Available
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setAllAvailable(false)}
            className="flex-1"
          >
            All Unavailable
          </Button>
        </div>

        {/* Time Slots Grid */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">
            {format(selectedDate, 'EEEE, MMMM dd, yyyy')}
          </h4>
          
          <div className="grid grid-cols-4 gap-2 max-h-96 overflow-y-auto p-2">
            {timeSlots.map((slot, i) => (
              <Button
                key={i}
                variant={slot.available ? "default" : "outline"}
                onClick={() => toggleSlot(i)}
                disabled={!!slot.booked_by}
                className={`text-xs ${
                  slot.booked_by ? 'bg-red-100 text-red-800 cursor-not-allowed' :
                  slot.available ? 'gradient-bg-primary text-white' : 
                  'bg-gray-100'
                }`}
              >
                <Clock className="w-3 h-3 mr-1" />
                {slot.time}
                {slot.booked_by && '🔒'}
              </Button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <Button
          onClick={() => updateAvailabilityMutation.mutate()}
          disabled={updateAvailabilityMutation.isLoading}
          className="w-full gradient-bg-primary text-white shadow-glow"
        >
          {updateAvailabilityMutation.isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <CheckCircle className="w-4 h-4 mr-2" />
          )}
          Save Availability
        </Button>
      </CardContent>
    </Card>
  );
}