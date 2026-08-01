import { View, Text, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useState } from 'react';
import { useAvailabilityRules, useCreateAvailabilityRule, useDeleteAvailabilityRule } from '@/hooks';
import type { AvailabilityRule } from '@/types';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AvailabilityScreen() {
  const { data: rules, isLoading, refetch, isRefetching } = useAvailabilityRules();
  const createRule = useCreateAvailabilityRule();
  const deleteRule = useDeleteAvailabilityRule();

  const handleAddRule = () => {
    // TODO: Open modal/picker for day + time range
    Alert.alert('Add Availability', 'Select a day and time range for your working hours.');
  };

  const handleDeleteRule = (rule: AvailabilityRule) => {
    Alert.alert(
      'Remove Availability',
      `Remove ${DAY_NAMES[rule.day_of_week]} ${rule.start_time} - ${rule.end_time}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => deleteRule.mutate(rule.id),
        },
      ]
    );
  };

  // Group rules by day
  const rulesByDay = (rules ?? []).reduce<Record<number, AvailabilityRule[]>>((acc, rule) => {
    if (!acc[rule.day_of_week]) acc[rule.day_of_week] = [];
    acc[rule.day_of_week].push(rule);
    return acc;
  }, {});

  const renderDay = ({ item: dayNum }: { item: number }) => {
    const dayRules = rulesByDay[dayNum] ?? [];

    return (
      <View
        style={{
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: '#e2e8f0',
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#0f172a', marginBottom: 8 }}>
          {DAY_NAMES[dayNum]}
        </Text>

        {dayRules.length === 0 ? (
          <Text style={{ fontSize: 13, color: '#9ca3af' }}>Not available</Text>
        ) : (
          <View style={{ gap: 8 }}>
            {dayRules.map((rule) => (
              <View
                key={rule.id}
                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: rule.is_active ? '#059669' : '#d1d5db',
                    }}
                  />
                  <Text style={{ fontSize: 14, color: '#0f172a' }}>
                    {rule.start_time} - {rule.end_time}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleDeleteRule(rule)}>
                  <Text style={{ fontSize: 12, color: '#dc2626' }}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={{ padding: 16, paddingTop: 56, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={{ fontSize: 22, fontWeight: '700', color: '#0f172a', marginBottom: 4 }}>
            Working Hours
          </Text>
          <Text style={{ fontSize: 13, color: '#64748b' }}>
            Set your regular availability
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleAddRule}
          style={{ backgroundColor: '#059669', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}
        >
          <Text style={{ color: 'white', fontWeight: '600', fontSize: 13 }}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={[1, 2, 3, 4, 5, 6, 0]} // Mon-Sun
        keyExtractor={(item) => String(item)}
        renderItem={renderDay}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      />
    </View>
  );
}