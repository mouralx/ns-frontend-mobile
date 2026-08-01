import { View, Text, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useDashboardAtRisk, useCancelAppointment } from '@/hooks';
import { format } from 'date-fns';
import type { Appointment } from '@/types';

interface AtRiskAppointment extends Appointment {
  hours_until: number;
  client_name: string;
  service_name: string;
}

export default function AtRiskScreen() {
  const { data, isLoading, refetch, isRefetching } = useDashboardAtRisk();
  const cancelAppointment = useCancelAppointment();

  const handleCancel = (appointment: AtRiskAppointment) => {
    Alert.alert(
      'Cancel Appointment',
      `Cancel appointment with ${appointment.client_name}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            cancelAppointment.mutate(
              { id: appointment.id, reason: 'Cancelled by therapist (at-risk)' },
              {
                onSuccess: () => Alert.alert('Cancelled', 'Appointment has been cancelled.'),
              }
            );
          },
        },
      ]
    );
  };

  const renderAtRisk = ({ item }: { item: AtRiskAppointment }) => {
    const timeStr = format(new Date(item.scheduled_at), 'HH:mm');
    const urgencyColor = item.hours_until <= 2 ? '#dc2626' : '#f59e0b';

    return (
      <View
        style={{
          backgroundColor: '#fffbeb',
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: '#fde68a',
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#92400e' }}>
              {item.client_name}
            </Text>
            <Text style={{ fontSize: 13, color: '#b45309', marginTop: 2 }}>
              {item.service_name} · {timeStr}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: urgencyColor }} />
              <Text style={{ fontSize: 12, color: urgencyColor, fontWeight: '500' }}>
                {item.hours_until}h until appointment · No confirmation
              </Text>
            </View>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: '#f59e0b', padding: 10, borderRadius: 8, alignItems: 'center' }}
            onPress={() => Alert.alert('Follow Up', 'Send a reminder to the client.')}
          >
            <Text style={{ color: 'white', fontWeight: '600', fontSize: 13 }}>Follow Up</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: 'white', padding: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb' }}
            onPress={() => handleCancel(item)}
          >
            <Text style={{ color: '#dc2626', fontWeight: '600', fontSize: 13 }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={{ padding: 16, paddingTop: 56 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#0f172a', marginBottom: 4 }}>
          ⚠️ At Risk
        </Text>
        <Text style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
          Unconfirmed appointments needing attention
        </Text>
      </View>

      <FlatList
        data={data?.appointments ?? []}
        keyExtractor={(item) => item.id}
        renderItem={renderAtRisk}
        contentContainerStyle={{ padding: 16, paddingTop: 0 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={{ alignItems: 'center', padding: 40 }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>✅</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#0f172a' }}>
                All clear!
              </Text>
              <Text style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                No at-risk appointments right now
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}