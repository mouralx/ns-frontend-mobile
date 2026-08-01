import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/auth/login');
        },
      },
    ]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={{ padding: 16, paddingTop: 56 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#0f172a', marginBottom: 24 }}>
          Profile
        </Text>

        {/* User Card */}
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: 12,
            padding: 20,
            borderWidth: 1,
            borderColor: '#e2e8f0',
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: '#059669',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 24, fontWeight: '600', color: 'white' }}>
              {user?.name?.charAt(0) ?? '?'}
            </Text>
          </View>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#0f172a' }}>{user?.name}</Text>
          <Text style={{ fontSize: 14, color: '#64748b', marginTop: 2 }}>{user?.email}</Text>
          <View
            style={{
              backgroundColor: '#f0fdf4',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
              marginTop: 8,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '500', color: '#059669', textTransform: 'capitalize' }}>
              {user?.role}
            </Text>
          </View>
        </View>

        {/* Menu Items */}
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#e2e8f0',
            overflow: 'hidden',
          }}
        >
          {[
            { icon: 'person-outline', label: 'Edit Profile', onPress: () => {} },
            { icon: 'notifications-outline', label: 'Notification Settings', onPress: () => {} },
            { icon: 'help-circle-outline', label: 'Help & Support', onPress: () => {} },
            { icon: 'information-circle-outline', label: 'About', onPress: () => {} },
          ].map((item, index) => (
            <TouchableOpacity
              key={item.label}
              onPress={item.onPress}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                gap: 12,
                borderBottomWidth: index < 3 ? 1 : 0,
                borderBottomColor: '#f1f5f9',
              }}
            >
              <Ionicons name={item.icon as any} size={20} color="#64748b" />
              <Text style={{ flex: 1, fontSize: 15, color: '#0f172a' }}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            marginTop: 24,
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#fecaca',
            backgroundColor: '#fef2f2',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#dc2626' }}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}