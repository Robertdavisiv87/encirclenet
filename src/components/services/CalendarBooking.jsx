import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, User, DollarSign, CheckCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function CalendarBooking({ serviceRequest, provider, totalPrice, onBookingComplete }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const queryClient = useQueryClient();

  const { data: availability = [] } = useQuery({
    queryKey: ['provider-availability', provider?.email, selectedDate],
    queryFn: async () => {
      if (!selectedDate || !provider) return [];
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      return await base44.entities.ProviderAvailability.filter({
        provider_email: provider.email,
        date: dateStr,
        is_available: true
      });
    },
    enabled: !!selectedDate && !!provider,
    refetchInterval: 30000 // Auto-refresh every 30 seconds
  });

  const createBookingMutation = useMutation({
    mutationFn: async (bookingData) => {
      // Create booking
      const booking = await base44.entities.Booking.create(bookingData);
      
      // Send confirmation
      await base44.functions.invoke('sendBookingConfirmation', {
        booking_id: booking.id
      });

      return booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['provider-availability']);
      if (onBookingComplete) onBookingComplete();
    }
  });

  const timeSlots = availability[0]?.time_slots || generateDefaultTimeSlots();

  function generateDefaultTimeSlots() {
    const slots = [];
    for (let hour = 8; hour <= 18; hour++) {
      slots.push({ time: `${hour.toString().padStart(2, '0')}:00`, available: true });
      slots.push({ time: `${hour.toString().padStart(2, '0')}:30`, available: true });
    }
    return slots;
  }

  const handleBooking = () => {
    createBookingMutation.mutate({
      service_request_id: serviceRequest.id,
      customer_email: serviceRequest.customer_email,
      provider_email: provider.email,
      service_vertical: serviceRequest.service_vertical,
      scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
      scheduled_time: selectedTime,
      total_price: totalPrice,
      payment_status: 'authorized',
      booking_status: 'confirmed'
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-purple-600" />
            Select Date & Time
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Calendar */}
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date() || date.getDay() === 0}
              className="rounded-md border-2 border-purple-200"
            />
          </div>

          {/* Time Slots */}
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900">Available Times</h4>
                <Badge className="bg-green-100 text-green-800">
                  {format(selectedDate, 'MMM dd, yyyy')}
                </Badge>
              </div>
              
              <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                {timeSlots.filter(slot => slot.available).map((slot, i) => (
                  <Button
                    key={i}
                    variant={selectedTime === slot.time ? "default" : "outline"}
                    onClick={() => setSelectedTime(slot.time)}
                    className={selectedTime === slot.time ? "gradient-bg-primary text-white" : ""}
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    {slot.time}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Booking Summary */}
          {selectedDate && selectedTime && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-300"
            >
              <h4 className="font-semibold text-blue-900 mb-3">Booking Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Provider
                  </span>
                  <span className="font-semibold text-gray-900">{provider?.name || 'Auto-assigned'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    Date
                  </span>
                  <span className="font-semibold text-gray-900">{format(selectedDate, 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Time
                  </span>
                  <span className="font-semibold text-gray-900">{selectedTime}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-blue-200">
                  <span className="text-gray-700 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Total
                  </span>
                  <span className="font-bold text-green-900 text-lg">${totalPrice}</span>
                </div>
              </div>

              <Button
                onClick={handleBooking}
                disabled={createBookingMutation.isLoading}
                className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
              >
                {createBookingMutation.isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Confirm & Pay ${totalPrice}
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}