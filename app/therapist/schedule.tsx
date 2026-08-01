import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useDashboardToday } from '@/hooks';
import { format } from 'date-fns';
import type { Appointment, AppointmentStatus } from '@/types';

const STATUS_COLORS: Record<AppointmentStatus, { bg: string; text: string; dot: string }> = {
  scheduled: { bg: '#dbeafe', text: '#1d4ed8', dot: '#3b82f6' },
  confirmed: { bg: '#dcfce7', text: '#16a34a', dot: '#22c55e' },
  completed: { bg: '#f3f4f6', text: '#6b7280', dot: '#9ca3af' },
  cancelled: { bg: '#fee2e2', text: '#dc2626', dot: '#ef4444' },
  no_show: { bg: '#fff7ed', text: '#ea580c', dot: '#f97316' },
};

export default function ScheduleScreen() {
  const { data, isLoading, refetch, isRefetching } = useDashboardToday();

  const renderAppointment = ({ item }: { item: Appointment }) => {
    const colors = STATUS_COLORS[item.status];
    const timeStr = format(new Date(item.scheduled_at), 'HH:mm');
    const endTimeStr = item.ends_at ? format(new Date(item.ends_at), 'HH:mm') : '';

    return (
      <View
        style={{
          flexDirection: 'row',
          gap: 12,
          backgroundColor: 'white',
          padding: 16,
          borderRadius: 12,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: '#f1f5f9',
        }}
      >
        {/* Time column */}
        <View style={{ width: 60, alignItems: 'center' }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#0f172a' }}>{timeStr}</Text>
          {endTimeStr && (
            <Text style={{ fontSize: 12, color: '#64748b' }}>{endTimeStr}</Text>
          )}
        </View>

        {/* Divider */}
        <View style={{ width: 3, backgroundColor: colors.dot, borderRadius: 2 }} />

        {/* Details */}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#0f172a' }}>
            {item.client?.name ?? 'Client'}
          </Text>
          <Text style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
            {item.service?.name ?? 'Massage'} · {item.duration_min} min
          </Text>
          <View
            style={{
              backgroundColor: colors.bg,
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 6,
              alignSelf: 'flex-start',
              marginTop: 8,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '600', color: colors.text, textTransform: 'capitalize' }}>
              {item.status.replace('_', ' ')}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={{ padding: 16, paddingTop: 56 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#0f172a', marginBottom: 4 }}>
          Today's Schedule
        </Text>
        <Text style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
          {data?.date ? format(new Date(data.date), 'EEEE, MMMM d, yyyy') : ''}
        </Text>

        {/* Stats */}
        {data?.stats && (
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Total', value: data.stats.total, color: '#0f172a' },
              { label: 'Confirmed', value: data.stats.confirmed, color: '#059669' },
              { label: 'At Risk', value: data.stats.at_risk, color: '#f59e0b' },
            ].map((stat) => (
              <View
                key={stat.label}
                style={{
                  flex: 1,
                  backgroundColor: 'white',
                  padding: 12,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: '#e2e8f0',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 20, fontWeight: '700', color: stat.color }}>
                  {stat.value}
                </Text>
                <Text style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{stat.label}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <FlatList
        data={data?.appointments ?? []}
        keyExtractor={(item) => item.id}
        renderItem={renderAppointment}
        contentContainerStyle={{ padding: 16, paddingTop: 0 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={{ alignItems: 'center', padding: 40 }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>📅</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#0f172a' }}>
                No appointments today
              </Text>
              <Text style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                Enjoy your free time!
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}