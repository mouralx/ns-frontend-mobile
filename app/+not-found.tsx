import { Slot } from 'expo-router';
import { View, Text } from 'react-native';

export default function NotFoundScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 48, marginBottom: 16 }}>🔍</Text>
      <Text style={{ fontSize: 20, fontWeight: '700', color: '#0f172a' }}>Page Not Found</Text>
      <Text style={{ fontSize: 14, color: '#64748b', marginTop: 8, textAlign: 'center' }}>
        The page you're looking for doesn't exist.
      </Text>
    </View>
  );
}