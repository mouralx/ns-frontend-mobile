import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { useBookingStore } from '@/stores';
import { useBookAppointment } from '@/hooks';
import { format } from 'date-fns';

export default function BookingConfirmScreen() {
  const { selectedService, selectedDate, selectedSlot, notes, setNotes, reset } = useBookingStore();
  const bookAppointment = useBookAppointment();
  const [isBooking, setIsBooking] = useState(false);

  const handleConfirm = async () => {
    if (!selectedService || !selectedSlot) return;

    setIsBooking(true);
    try {
      await bookAppointment.mutateAsync({
        service_type_id: selectedService.id,
        therapist_id: 'therapist-placeholder', // TODO: from selection
        scheduled_at: selectedSlot.start,
        notes: notes || undefined,
      });

      Alert.alert('Booking Confirmed!', 'Your appointment has been booked. Check your notifications for confirmation.', [
        {
          text: 'View Appointments',
          onPress: () => {
            reset();
            router.replace('/client/appointments');
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Booking Failed', 'Could not book appointment. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  if (!selectedService || !selectedSlot) {
    router.replace('/client');
    return null;
  }

  const startTime = format(new Date(selectedSlot.start), 'HH:mm');
  const endTime = format(new Date(selectedSlot.end), 'HH:mm');
  const dateStr = selectedDate ? format(new Date(selectedDate), 'EEEE, MMMM d, yyyy') : '';

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc', padding: 16 }}>
      <View style={{ paddingTop: 40 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#0f172a', marginBottom: 4 }}>
          Review & Confirm
        </Text>
        <Text style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>
          Please review your booking details
        </Text>
      </View>

      {/* Booking Summary Card */}
      <View
        style={{
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 20,
          borderWidth: 1,
          borderColor: '#e2e8f0',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <View
            style={{
              width: 48,
              height: 48,
              backgroundColor: '#ecfdf5',
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 24 }}>💆</Text>
          </View>
          <View>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#0f172a' }}>
              {selectedService.name}
            </Text>
            <Text style={{ fontSize: 13, color: '#64748b' }}>
              {selectedService.duration_min} min
            </Text>
          </View>
        </View>

        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 14, color: '#64748b' }}>Date</Text>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#0f172a' }}>{dateStr}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 14, color: '#64748b' }}>Time</Text>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#0f172a' }}>
              {startTime} - {endTime}
            </Text>
          </View>
        </View>
      </View>

      {/* Notes */}
      <View style={{ marginTop: 20 }}>
        <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
          Notes (optional)
        </Text>
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: 10,
            borderWidth: 1,
            borderColor: '#e5e7eb',
            padding: 12,
          }}
        >
          <Text
            style={{ fontSize: 14, color: '#64748b' }}
            onPress={() => {
              // Simple text input workaround for notes
              Alert.prompt?.('Notes', 'Any special requests?', (text) => setNotes(text ?? ''));
            }}
          >
            {notes || 'Tap to add notes...'}
          </Text>
        </View>
      </View>

      {/* Confirm Button */}
      <View style={{ marginTop: 'auto', paddingVertical: 16 }}>
        <TouchableOpacity
          onPress={handleConfirm}
          disabled={isBooking}
          style={{
            backgroundColor: isBooking ? '#86efac' : '#059669',
            padding: 14,
            borderRadius: 10,
            alignItems: 'center',
          }}
        >
          {isBooking ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
              Confirm Booking
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}