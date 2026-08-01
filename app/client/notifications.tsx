import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useNotifications, useMarkNotificationRead } from '@/hooks';
import { useNotificationsStore } from '@/stores';
import { useEffect } from 'react';
import { format } from 'date-fns';
import type { Notification, NotificationType } from '@/types';

const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  booking_confirmation: '✅',
  confirmation_request: '❓',
  reminder_2h: '⏰',
  cancellation: '❌',
  therapist_alert: '⚠️',
  walkin_confirmation: '💆',
};

export default function NotificationsScreen() {
  const { data, isLoading, refetch, isRefetching } = useNotifications();
  const markRead = useMarkNotificationRead();
  const setUnreadCount = useNotificationsStore((s) => s.setUnreadCount);

  useEffect(() => {
    if (data) {
      const unread = data.items.filter((n) => n.status !== 'read').length;
      setUnreadCount(unread);
    }
  }, [data, setUnreadCount]);

  const handlePress = (notification: Notification) => {
    if (notification.status !== 'read') {
      markRead.mutate(notification.id);
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const isUnread = item.status !== 'read';
    const icon = NOTIFICATION_ICONS[item.type] ?? '🔔';

    return (
      <TouchableOpacity
        onPress={() => handlePress(item)}
        style={{
          backgroundColor: isUnread ? '#f0fdf4' : 'white',
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#f1f5f9',
        }}
      >
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Text style={{ fontSize: 24 }}>{icon}</Text>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: isUnread ? '600' : '400',
                  color: '#0f172a',
                  flex: 1,
                }}
              >
                {item.type.replace(/_/g, ' ')}
              </Text>
              {isUnread && (
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#059669',
                    marginLeft: 8,
                    marginTop: 4,
                  }}
                />
              )}
            </View>
            <Text style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
              {format(new Date(item.created_at), 'MMM d, HH:mm')}
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
          Notifications
        </Text>
        <Text style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
          Stay updated on your appointments
        </Text>
      </View>

      <FlatList
        data={data?.items ?? []}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={{ alignItems: 'center', padding: 40 }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>🔔</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#0f172a' }}>
                No notifications
              </Text>
              <Text style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                You're all caught up!
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}