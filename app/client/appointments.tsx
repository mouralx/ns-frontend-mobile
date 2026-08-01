import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useAppointments } from '@/hooks';
import { format } from 'date-fns';
import type { Appointment, AppointmentStatus } from '@/types';

const STATUS_COLORS: Record<AppointmentStatus, { bg: string; text: string }> = {
  scheduled: { bg: '#dbeafe', text: '#1d4ed8' },
  confirmed: { bg: '#dcfce7', text: '#16a34a' },
  completed: { bg: '#f3f4f6', text: '#6b7280' },
  cancelled: { bg: '#fee2e2', text: '#dc2626' },
  no_show: { bg: '#fff7ed', text: '#ea580c' },
};

export default function AppointmentsScreen() {
  const { data, isLoading, refetch, isRefetching } = useAppointments();

  const renderAppointment = ({ item }: { item: Appointment }) => {
    const colors = STATUS_COLORS[item.status];
    const dateStr = format(new Date(item.scheduled_at), 'MMM d, yyyy');
    const timeStr = format(new Date(item.scheduled_at), 'HH:mm');

    return (
      <TouchableOpacity
        onPress={() => router.push(`/client/appointment-detail?id=${item.id}`)}
        style={{
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: '#f1f5f9',
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#0f172a' }}>
              {item.service?.name ?? 'Massage'}
            </Text>
            <Text style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
              {dateStr} at {timeStr}
            </Text>
            {item.therapist && (
              <Text style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                with {item.therapist.name}
              </Text>
            )}
          </View>
          <View
            style={{
              backgroundColor: colors.bg,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '600', color: colors.text, textTransform: 'capitalize' }}>
              {item.status.replace('_', ' ')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={{ padding: 16, paddingTop: 56 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#0f172a', marginBottom: 4 }}>
          My Appointments
        </Text>
        <Text style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
          View and manage your bookings
        </Text>
      </View>

      <FlatList
        data={data?.items ?? []}
        keyExtractor={(item) => item.id}
        renderItem={renderAppointment}
        contentContainerStyle={{ padding: 16, paddingTop: 0 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={{ alignItems: 'center', padding: 40 }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>📅</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#0f172a' }}>
                No appointments yet
              </Text>
              <Text style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                Book your first massage appointment
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}