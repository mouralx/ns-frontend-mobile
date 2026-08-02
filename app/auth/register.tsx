import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Link, router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores';
import type { UserRole } from '@/types';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Invalid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['client', 'therapist']),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const register = useAuthStore((s) => s.register);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', phone: '', password: '', role: 'client' },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await register(data);
      router.replace('/client');
    } catch (error) {
      Alert.alert('Registration Failed', 'Could not create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ alignItems: 'center', marginBottom: 32 }}>
        <Text style={{ fontSize: 48 }}>💆</Text>
        <Text style={{ fontSize: 24, fontWeight: '700', color: '#0f172a', marginTop: 12 }}>
          Create Account
        </Text>
        <Text style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
          Join our massage booking community
        </Text>
      </View>

      <View style={{ gap: 14 }}>
        {/* Role selector */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {(['client', 'therapist'] as const).map((role) => (
            <TouchableOpacity
              key={role}
              onPress={() => setValue('role', role)}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: selectedRole === role ? '#059669' : '#e5e7eb',
                backgroundColor: selectedRole === role ? '#ecfdf5' : '#ffffff',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 24 }}>{role === 'client' ? '👤' : '💆'}</Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: selectedRole === role ? '#059669' : '#64748b',
                  marginTop: 4,
                  textTransform: 'capitalize',
                }}
              >
                {role}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Name */}
        <View>
          <Text style={{ fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 }}>
            Full Name
          </Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder="Your full name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                style={{
                  borderWidth: 1,
                  borderColor: errors.name ? '#ef4444' : '#e5e7eb',
                  borderRadius: 10,
                  padding: 12,
                  fontSize: 16,
                }}
              />
            )}
          />
          {errors.name && (
            <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.name.message}</Text>
          )}
        </View>

        {/* Email */}
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
                }}
              />
            )}
          />
          {errors.email && (
            <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.email.message}</Text>
          )}
        </View>

        {/* Phone */}
        <View>
          <Text style={{ fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 }}>
            Phone
          </Text>
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder="+55 11 99999-0000"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="phone-pad"
                style={{
                  borderWidth: 1,
                  borderColor: errors.phone ? '#ef4444' : '#e5e7eb',
                  borderRadius: 10,
                  padding: 12,
                  fontSize: 16,
                }}
              />
            )}
          />
          {errors.phone && (
            <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.phone.message}</Text>
          )}
        </View>

        {/* Password */}
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
                }}
              />
            )}
          />
          {errors.password && (
            <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.password.message}</Text>
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
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Create Account</Text>
          )}
        </TouchableOpacity>

        <View style={{ alignItems: 'center', marginTop: 16 }}>
          <Text style={{ fontSize: 13, color: '#64748b' }}>Already have an account? </Text>
          <Link href="/auth/login" asChild>
            <TouchableOpacity>
              <Text style={{ fontSize: 13, color: '#059669', fontWeight: '600', marginTop: 4 }}>
                Sign in
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}