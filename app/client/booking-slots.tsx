import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useSlots } from '@/hooks';
import { useBookingStore } from '@/stores';
import type { TimeSlot } from '@/types';
import { format } from 'date-fns';

export default function BookingSlotsScreen() {
  const { selectedDate, selectedService, therapistId, setSlot } = useBookingStore();

  const { data: slotsData, isLoading, refetch, isRefetching } = useSlots({
    therapist_id: therapistId ?? '',
    service_type_id: selectedService?.id ?? '',
    date: selectedDate ?? '',
  });

  const handleSelectSlot = (slot: TimeSlot) => {
    setSlot(slot);
    router.push('/client/booking-confirm');
  };

  const renderSlot = ({ item }: { item: TimeSlot }) => {
    const startTime = format(new Date(item.start), 'HH:mm');
    const endTime = format(new Date(item.end), 'HH:mm');

    return (
      <TouchableOpacity
        onPress={() => handleSelectSlot(item)}
        disabled={!item.available}
        style={{
          backgroundColor: item.available ? 'white' : '#f3f4f6',
          padding: 16,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: item.available ? '#e5e7eb' : '#e5e7eb',
          opacity: item.available ? 1 : 0.5,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: item.available ? '#0f172a' : '#9ca3af',
          }}
        >
          {startTime} - {endTime}
        </Text>
        <Text style={{ fontSize: 12, color: item.available ? '#059669' : '#9ca3af', marginTop: 2 }}>
          {item.available ? 'Available' : 'Booked'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={{ padding: 16, paddingTop: 56 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#0f172a', marginBottom: 4 }}>
          Available Times
        </Text>
        <Text style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
          {selectedDate && format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
        </Text>
      </View>

      <FlatList
        data={slotsData?.slots ?? []}
        keyExtractor={(item) => item.start}
        renderItem={renderSlot}
        numColumns={2}
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
        contentContainerStyle={{ padding: 16, paddingTop: 0, gap: 12 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={{ alignItems: 'center', padding: 40 }}>
              <Text style={{ fontSize: 14, color: '#64748b' }}>No available slots for this date</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}