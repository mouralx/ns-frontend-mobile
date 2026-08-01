import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import { useState } from 'react';
import { useBookingStore } from '@/stores';

export default function BookingDateScreen() {
  const [selectedDate, setSelectedDate] = useState('');
  const { selectedService, setDate } = useBookingStore();

  const handleDateSelect = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
  };

  const handleContinue = () => {
    if (selectedDate && selectedService) {
      // TODO: Get therapist_id from service or selection
      setDate(selectedDate, 'therapist-placeholder');
      router.push('/client/booking-slots');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={{ padding: 16, paddingTop: 56 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#0f172a', marginBottom: 4 }}>
          Select Date
        </Text>
        <Text style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
          Pick a date for your {selectedService?.name}
        </Text>
      </View>

      <View style={{ padding: 16 }}>
        <Calendar
          onDayPress={handleDateSelect}
          markedDates={
            selectedDate
              ? {
                  [selectedDate]: {
                    selected: true,
                    selectedColor: '#059669',
                  },
                }
              : {}
          }
          theme={{
            todayTextColor: '#059669',
            arrowColor: '#059669',
            selectedDayBackgroundColor: '#059669',
          }}
          minDate={new Date().toISOString().split('T')[0]}
        />
      </View>

      <View style={{ padding: 16, marginTop: 'auto' }}>
        <TouchableOpacity
          onPress={handleContinue}
          disabled={!selectedDate}
          style={{
            backgroundColor: selectedDate ? '#059669' : '#d1d5db',
            padding: 14,
            borderRadius: 10,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}