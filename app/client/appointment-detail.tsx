import { View, Text, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAppointment, useConfirmAppointment, useCancelAppointment } from '@/hooks';
import { TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { format } from 'date-fns';
import type { AppointmentStatus } from '@/types';

const STATUS_COLORS: Record<AppointmentStatus, { bg: string; text: string }> = {
  scheduled: { bg: '#dbeafe', text: '#1d4ed8' },
  confirmed: { bg: '#dcfce7', text: '#16a34a' },
  completed: { bg: '#f3f4f6', text: '#6b7280' },
  cancelled: { bg: '#fee2e2', text: '#dc2626' },
  no_show: { bg: '#fff7ed', text: '#ea580c' },
};

export default function AppointmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: appointment, isLoading } = useAppointment(id ?? '');
  const confirmMutation = useConfirmAppointment();
  const cancelMutation = useCancelAppointment();

  const handleConfirm = () => {
    Alert.alert('Confirm Appointment', 'Are you sure you want to confirm this appointment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: () => {
          confirmMutation.mutate(id ?? '', {
            onSuccess: () => Alert.alert('Confirmed!', 'Your appointment has been confirmed.'),
          });
        },
      },
    ]);
  };

  const handleCancel = () => {
    Alert.alert('Cancel Appointment', 'Are you sure you want to cancel this appointment?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: () => {
          cancelMutation.mutate(
            { id: id ?? '', reason: 'Cancelled by client' },
            {
              onSuccess: () => {
                Alert.alert('Cancelled', 'Your appointment has been cancelled.');
                router.back();
              },
            }
          );
        },
      },
    ]);
  };

  if (isLoading || !appointment) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  const colors = STATUS_COLORS[appointment.status];
  const dateStr = format(new Date(appointment.scheduled_at), 'EEEE, MMMM d, yyyy');
  const timeStr = format(new Date(appointment.scheduled_at), 'HH:mm');
  const endTimeStr = appointment.ends_at
    ? format(new Date(appointment.ends_at), 'HH:mm')
    : '';

  const canConfirm = appointment.status === 'scheduled' && appointment.confirmation_status === 'pending';
  const canCancel = appointment.status === 'scheduled' || appointment.status === 'confirmed';

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc', padding: 16 }}>
      <View style={{ paddingTop: 40, marginBottom: 24 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, color: '#059669', fontWeight: '500' }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#0f172a' }}>Appointment Details</Text>
      </View>

      {/* Status Badge */}
      <View
        style={{
          backgroundColor: colors.bg,
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 8,
          alignSelf: 'flex-start',
          marginBottom: 20,
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text, textTransform: 'capitalize' }}>
          {appointment.status.replace('_', ' ')}
        </Text>
      </View>

      {/* Details Card */}
      <View
        style={{
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 20,
          borderWidth: 1,
          borderColor: '#e2e8f0',
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#0f172a', marginBottom: 16 }}>
          {appointment.service?.name ?? 'Massage'}
        </Text>

        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 14, color: '#64748b' }}>Date</Text>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#0f172a' }}>{dateStr}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 14, color: '#64748b' }}>Time</Text>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#0f172a' }}>
              {timeStr}{endTimeStr ? ` - ${endTimeStr}` : ''}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 14, color: '#64748b' }}>Duration</Text>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#0f172a' }}>
              {appointment.duration_min} min
            </Text>
          </View>
          {appointment.therapist && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 14, color: '#64748b' }}>Therapist</Text>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#0f172a' }}>
                {appointment.therapist.name}
              </Text>
            </View>
          )}
        </View>

        {appointment.notes && (
          <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9' }}>
            <Text style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>Notes</Text>
            <Text style={{ fontSize: 14, color: '#0f172a' }}>{appointment.notes}</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={{ marginTop: 'auto', gap: 12, paddingVertical: 16 }}>
        {canConfirm && (
          <TouchableOpacity
            onPress={handleConfirm}
            disabled={confirmMutation.isPending}
            style={{
              backgroundColor: '#059669',
              padding: 14,
              borderRadius: 10,
              alignItems: 'center',
            }}
          >
            {confirmMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Confirm Appointment</Text>
            )}
          </TouchableOpacity>
        )}

        {canCancel && (
          <TouchableOpacity
            onPress={handleCancel}
            disabled={cancelMutation.isPending}
            style={{
              backgroundColor: 'white',
              padding: 14,
              borderRadius: 10,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#e5e7eb',
            }}
          >
            <Text style={{ color: '#dc2626', fontSize: 16, fontWeight: '600' }}>Cancel Appointment</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}