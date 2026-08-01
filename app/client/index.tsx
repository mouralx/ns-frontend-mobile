import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useServices } from '@/hooks';
import { useBookingStore } from '@/stores';
import type { ServiceType } from '@/types';

const SERVICE_ICONS: Record<string, string> = {
  'Swedish Massage': '🌿',
  'Deep Tissue Massage': '🔥',
  'Sports Massage': '💧',
  'Aromatherapy Massage': '🌸',
  'Hot Stone Massage': '✨',
};

const SERVICE_COLORS: Record<string, string> = {
  'Swedish Massage': '#ecfdf5',
  'Deep Tissue Massage': '#fef3c7',
  'Sports Massage': '#dbeafe',
  'Aromatherapy Massage': '#fce7f3',
  'Hot Stone Massage': '#ede9fe',
};

export default function ServicesScreen() {
  const { data: services, isLoading, refetch, isRefetching } = useServices();
  const setService = useBookingStore((s) => s.setService);

  const handleSelect = (service: ServiceType) => {
    setService(service);
    router.push('/client/booking-date');
  };

  const renderService = ({ item }: { item: ServiceType }) => (
    <TouchableOpacity
      onPress={() => handleSelect(item)}
      style={{
        flexDirection: 'row',
        gap: 14,
        alignItems: 'flex-start',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
      }}
    >
      <View
        style={{
          width: 56,
          height: 56,
          backgroundColor: SERVICE_COLORS[item.name] ?? '#f3f4f6',
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 28 }}>{SERVICE_ICONS[item.name] ?? '💆'}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#0f172a' }}>{item.name}</Text>
        <Text style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
          {item.duration_min} min · {item.description}
        </Text>
      </View>
      <Text style={{ color: '#9ca3af', fontSize: 18, alignSelf: 'center' }}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={{ padding: 16, paddingTop: 56 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#0f172a', marginBottom: 4 }}>
          Our Services
        </Text>
        <Text style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
          Choose a massage service to get started
        </Text>
      </View>

      <FlatList
        data={services ?? []}
        keyExtractor={(item) => item.id}
        renderItem={renderService}
        contentContainerStyle={{ padding: 16, paddingTop: 0 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={{ alignItems: 'center', padding: 40 }}>
              <Text style={{ fontSize: 14, color: '#64748b' }}>No services available</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}