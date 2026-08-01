import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Link, router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const login = useAuthStore((s) => s.login);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      router.replace('/client');
    } catch (error) {
      Alert.alert('Login Failed', 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ alignItems: 'center', marginBottom: 40 }}>
        <Text style={{ fontSize: 48 }}>💆</Text>
        <Text style={{ fontSize: 24, fontWeight: '700', color: '#0f172a', marginTop: 12 }}>
          Welcome Back
        </Text>
        <Text style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
          Sign in to book your appointment
        </Text>
      </View>

      <View style={{ gap: 16 }}>
        <View>
          <Text style={{ fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 }}>
            Email
          </Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder="you@example.com"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="none"
                keyboardType="email-address"
                style={{
                  borderWidth: 1,
                  borderColor: errors.email ? '#ef4444' : '#e5e7eb',
                  borderRadius: 10,
                  padding: 12,
                  fontSize: 16,
                  backgroundColor: '#ffffff',
                }}
              />
            )}
          />
          {errors.email && (
            <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
              {errors.email.message}
            </Text>
          )}
        </View>

        <View>
          <Text style={{ fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 }}>
            Password
          </Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder="••••••••"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry
                style={{
                  borderWidth: 1,
                  borderColor: errors.password ? '#ef4444' : '#e5e7eb',
                  borderRadius: 10,
                  padding: 12,
                  fontSize: 16,
                  backgroundColor: '#ffffff',
                }}
              />
            )}
          />
          {errors.password && (
            <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
              {errors.password.message}
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
          style={{
            backgroundColor: isLoading ? '#86efac' : '#059669',
            padding: 12,
            borderRadius: 10,
            alignItems: 'center',
            marginTop: 8,
          }}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Sign In</Text>
          )}
        </TouchableOpacity>

        <View style={{ alignItems: 'center', marginTop: 20 }}>
          <Text style={{ fontSize: 13, color: '#64748b' }}>
            Don't have an account?{' '}
          </Text>
          <Link href="/auth/register" asChild>
            <TouchableOpacity>
              <Text style={{ fontSize: 13, color: '#059669', fontWeight: '600', marginTop: 4 }}>
                Create one
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}