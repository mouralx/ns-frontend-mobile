import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useServices, useBookAppointment } from '@/hooks';
import { Calendar } from 'react-native-calendars';
import { format } from 'date-fns';

const walkinSchema = z.object({
  clientName: z.string().min(2, 'Client name is required'),
  clientPhone: z.string().min(10, 'Valid phone number required'),
  clientEmail: z.string().email('Valid email required'),
  notes: z.string().optional(),
});

type WalkinFormData = z.infer<typeof walkinSchema>;

export default function WalkinScreen() {
  const { data: services } = useServices();
  const bookAppointment = useBookAppointment();
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isBooking, setIsBooking] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<WalkinFormData>({
    resolver: zodResolver(walkinSchema),
    defaultValues: { clientName: '', clientPhone: '', clientEmail: '', notes: '' },
  });

  const onSubmit = async (data: WalkinFormData) => {
    if (!selectedService || !selectedDate || !selectedTime) {
      Alert.alert('Missing Info', 'Please select a service, date, and time.');
      return;
    }

    setIsBooking(true);
    try {
      await bookAppointment.mutateAsync({
        service_type_id: selectedService,
        therapist_id: 'self', // Walk-in is always for the current therapist
        scheduled_at: `${selectedDate}T${selectedTime}:00Z`,
        notes: `[Walk-in] ${data.clientName} - ${data.clientPhone}\n${data.notes ?? ''}`,
      });

      Alert.alert('Walk-in Booked!', 'The appointment has been added to your schedule.');
    } catch (error) {
      Alert.alert('Error', 'Could not book walk-in appointment.');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f8fafc' }} contentContainerStyle={{ padding: 16 }}>
      <View style={{ paddingTop: 40, marginBottom: 24 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#0f172a', marginBottom: 4 }}>
          Walk-in Booking
        </Text>
        <Text style={{ fontSize: 13, color: '#64748b' }}>
          Quickly add a walk-in client appointment
        </Text>
      </View>

      {/* Client Info */}
      <View style={{ gap: 14, marginBottom: 20 }}>
        <View>
          <Text style={{ fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 }}>
            Client Name
          </Text>
          <Controller
            control={control}
            name="clientName"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder="Full name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                style={{ borderWidth: 1, borderColor: errors.clientName ? '#ef4444' : '#e5e7eb', borderRadius: 10, padding: 12, fontSize: 16 }}
              />
            )}
          />
          {errors.clientName && <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.clientName.message}</Text>}
        </View>

        <View>
          <Text style={{ fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 }}>Phone</Text>
          <Controller
            control={control}
            name="clientPhone"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder="Phone number"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="phone-pad"
                style={{ borderWidth: 1, borderColor: errors.clientPhone ? '#ef4444' : '#e5e7eb', borderRadius: 10, padding: 12, fontSize: 16 }}
              />
            )}
          />
        </View>

        <View>
          <Text style={{ fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 }}>Email</Text>
          <Controller
            control={control}
            name="clientEmail"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder="Email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="email-address"
                autoCapitalize="none"
                style={{ borderWidth: 1, borderColor: errors.clientEmail ? '#ef4444' : '#e5e7eb', borderRadius: 10, padding: 12, fontSize: 16 }}
              />
            )}
          />
        </View>
      </View>

      {/* Service Selection */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 8 }}>Service</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {(services ?? []).map((service) => (
            <TouchableOpacity
              key={service.id}
              onPress={() => setSelectedService(service.id)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: selectedService === service.id ? '#059669' : '#e5e7eb',
                backgroundColor: selectedService === service.id ? '#ecfdf5' : 'white',
              }}
            >
              <Text style={{ fontSize: 13, color: selectedService === service.id ? '#059669' : '#374151' }}>
                {service.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Date Picker */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 8 }}>Date</Text>
        <Calendar
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={selectedDate ? { [selectedDate]: { selected: true, selectedColor: '#059669' } } : {}}
          minDate={new Date().toISOString().split('T')[0]}
          theme={{ todayTextColor: '#059669', arrowColor: '#059669' }}
        />
      </View>

      {/* Time Slots */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 8 }}>Time</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].map((time) => (
            <TouchableOpacity
              key={time}
              onPress={() => setSelectedTime(time)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: selectedTime === time ? '#059669' : '#e5e7eb',
                backgroundColor: selectedTime === time ? '#ecfdf5' : 'white',
              }}
            >
              <Text style={{ fontSize: 14, color: selectedTime === time ? '#059669' : '#374151' }}>
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Submit */}
      <TouchableOpacity
        onPress={handleSubmit(onSubmit)}
        disabled={isBooking}
        style={{ backgroundColor: isBooking ? '#86efac' : '#059669', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 }}
      >
        {isBooking ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Book Walk-in</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}