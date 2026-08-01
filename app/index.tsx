import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '@/stores';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Redirect href="/auth/login" />;
  }

  return <Redirect href="/client" />;
}