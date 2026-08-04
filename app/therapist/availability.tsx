import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useAvailabilityRules, useCreateAvailabilityRule, useDeleteAvailabilityRule } from '@/hooks';
import type { AvailabilityRule } from '@/types';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AvailabilityScreen() {
  const { data: rules, isLoading, refetch, isRefetching } = useAvailabilityRules();
  const createRule = useCreateAvailabilityRule();
  const deleteRule = useDeleteAvailabilityRule();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [ruleToDelete, setRuleToDelete] = useState<AvailabilityRule | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleAddRule = () => {
    setFormError(null);
    setIsAddOpen(true);
  };

  const parseTime = (value: string) => {
    const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(value.trim());
    if (!match) return null;
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (hours > 23 || minutes > 59) return null;
    return hours * 60 + minutes;
  };

  const handleSaveRule = async () => {
    setFormError(null);
    const startMinutes = parseTime(startTime);
    const endMinutes = parseTime(endTime);

    if (startMinutes === null || endMinutes === null) {
      setFormError('Enter times in 24-hour HH:MM format.');
      return;
    }
    if (startMinutes >= endMinutes) {
      setFormError('End time must be later than start time.');
      return;
    }
    const overlaps = (rules ?? []).some((rule) => {
      if (rule.day_of_week !== selectedDay || !rule.is_active) return false;
      const existingStart = parseTime(rule.start_time);
      const existingEnd = parseTime(rule.end_time);
      return existingStart !== null && existingEnd !== null && startMinutes < existingEnd && endMinutes > existingStart;
    });
    if (overlaps) {
      setFormError('Working hours overlap an existing rule for this day.');
      return;
    }

    try {
      await createRule.mutateAsync({
        day_of_week: selectedDay,
        start_time: startTime.trim(),
        end_time: endTime.trim(),
      });
      setIsAddOpen(false);
      setSuccessMessage(`${DAY_NAMES[selectedDay]} working hours added.`);
    } catch (error) {
      const status = (error as { response?: { status?: number } }).response?.status;
      if (status === 401) {
        setFormError('Your session expired. Please sign in again.');
        setTimeout(() => router.replace('/auth/login'), 1200);
        return;
      }
      const message =
        (error as { response?: { data?: { error?: string } } }).response?.data?.error ??
        'Could not add working hours. Please try again.';
      setFormError(message);
    }
  };

  const handleDeleteRule = (rule: AvailabilityRule) => {
    setDeleteError(null);
    setRuleToDelete(rule);
  };

  const handleConfirmDelete = async () => {
    if (!ruleToDelete) return;
    try {
      const dayName = DAY_NAMES[ruleToDelete.day_of_week];
      await deleteRule.mutateAsync(ruleToDelete.id);
      setRuleToDelete(null);
      setSuccessMessage(`${dayName} working hours removed.`);
    } catch (error) {
      const message =
        (error as { response?: { data?: { error?: string } } }).response?.data?.error ??
        'Could not remove working hours. Please try again.';
      setDeleteError(message);
    }
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

      {successMessage && (
        <TouchableOpacity
          onPress={() => setSuccessMessage(null)}
          style={{
            position: 'absolute',
            left: 16,
            right: 16,
            bottom: 68,
            backgroundColor: '#ecfdf5',
            borderColor: '#a7f3d0',
            borderWidth: 1,
            borderRadius: 10,
            padding: 12,
          }}
        >
          <Text style={{ color: '#047857', fontSize: 13, fontWeight: '600' }}>
            {successMessage}
          </Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={isAddOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAddOpen(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 14,
              padding: 20,
              borderWidth: 1,
              borderColor: '#e2e8f0',
              width: '100%',
              maxWidth: 440,
              alignSelf: 'center',
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#0f172a' }}>
              Add working hours
            </Text>
            <Text style={{ fontSize: 13, color: '#64748b', marginTop: 4, marginBottom: 18 }}>
              Choose a day and the time range you are available.
            </Text>

            <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
              Day
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
              {[1, 2, 3, 4, 5, 6, 0].map((day) => (
                <TouchableOpacity
                  key={day}
                  onPress={() => setSelectedDay(day)}
                  style={{
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    borderWidth: 1,
                    borderColor: selectedDay === day ? '#059669' : '#e2e8f0',
                    backgroundColor: selectedDay === day ? '#ecfdf5' : 'white',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: selectedDay === day ? '#047857' : '#64748b',
                    }}
                  >
                    {DAY_NAMES[day].slice(0, 3)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 }}>
                  Start
                </Text>
                <TextInput
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="09:00"
                  keyboardType="numbers-and-punctuation"
                  style={{ borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 12, fontSize: 16 }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 }}>
                  End
                </Text>
                <TextInput
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholder="17:00"
                  keyboardType="numbers-and-punctuation"
                  style={{ borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 12, fontSize: 16 }}
                />
              </View>
            </View>

            {formError && (
              <Text style={{ color: '#dc2626', fontSize: 13, marginTop: 12 }}>{formError}</Text>
            )}

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <TouchableOpacity
                onPress={() => setIsAddOpen(false)}
                disabled={createRule.isPending}
                style={{ paddingHorizontal: 16, paddingVertical: 11, borderRadius: 9 }}
              >
                <Text style={{ color: '#64748b', fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveRule}
                disabled={createRule.isPending}
                style={{
                  minWidth: 116,
                  alignItems: 'center',
                  backgroundColor: createRule.isPending ? '#6ee7b7' : '#059669',
                  paddingHorizontal: 16,
                  paddingVertical: 11,
                  borderRadius: 9,
                }}
              >
                {createRule.isPending ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={{ color: 'white', fontWeight: '600' }}>Add hours</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={ruleToDelete !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setRuleToDelete(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 14,
              padding: 20,
              borderWidth: 1,
              borderColor: '#e2e8f0',
              width: '100%',
              maxWidth: 440,
              alignSelf: 'center',
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#0f172a' }}>
              Remove working hours?
            </Text>
            {ruleToDelete && (
              <Text style={{ fontSize: 14, color: '#64748b', marginTop: 8 }}>
                {DAY_NAMES[ruleToDelete.day_of_week]} {ruleToDelete.start_time} - {ruleToDelete.end_time}
              </Text>
            )}
            {deleteError && (
              <Text style={{ color: '#dc2626', fontSize: 13, marginTop: 12 }}>{deleteError}</Text>
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <TouchableOpacity
                onPress={() => setRuleToDelete(null)}
                disabled={deleteRule.isPending}
                style={{ paddingHorizontal: 16, paddingVertical: 11, borderRadius: 9 }}
              >
                <Text style={{ color: '#64748b', fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmDelete}
                disabled={deleteRule.isPending}
                style={{
                  minWidth: 100,
                  alignItems: 'center',
                  backgroundColor: deleteRule.isPending ? '#fca5a5' : '#dc2626',
                  paddingHorizontal: 16,
                  paddingVertical: 11,
                  borderRadius: 9,
                }}
              >
                {deleteRule.isPending ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={{ color: 'white', fontWeight: '600' }}>Remove</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
