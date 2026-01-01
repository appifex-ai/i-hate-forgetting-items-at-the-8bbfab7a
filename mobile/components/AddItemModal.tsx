import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { Store } from '@/types/api';

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; quantity: string; store_id: number; need_by_date?: string }) => void;
  stores: Store[];
}

export function AddItemModal({ visible, onClose, onSubmit, stores }: AddItemModalProps) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [needByDate, setNeedByDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSubmit = () => {
    if (!name.trim() || !selectedStoreId) return;

    onSubmit({
      name: name.trim(),
      quantity: quantity.trim(),
      store_id: selectedStoreId,
      need_by_date: needByDate ? needByDate.toISOString().split('T')[0] : undefined,
    });

    // Reset form
    setName('');
    setQuantity('1');
    setSelectedStoreId(null);
    setNeedByDate(null);
    onClose();
  };

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setNeedByDate(selectedDate);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <Pressable style={styles.overlayTouchable} onPress={onClose} />
        <View style={styles.modal}>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
          <Text style={styles.title}>Add Item</Text>

          <TextInput
            style={styles.input}
            placeholder="Item name"
            value={name}
            onChangeText={setName}
            autoFocus
          />

          <TextInput
            style={styles.input}
            placeholder="Quantity (e.g., 1, 2 lbs, 1 dozen)"
            value={quantity}
            onChangeText={setQuantity}
          />

          <Text style={styles.label}>Select Store:</Text>
          <ScrollView style={styles.storeList} horizontal showsHorizontalScrollIndicator={false}>
            {stores.map((store) => (
              <Pressable
                key={store.id}
                style={[
                  styles.storeChip,
                  { backgroundColor: selectedStoreId === store.id ? store.color : '#f3f4f6' },
                ]}
                onPress={() => setSelectedStoreId(store.id)}
              >
                <Text style={styles.storeIcon}>{store.icon}</Text>
                <Text style={[styles.storeText, selectedStoreId === store.id && styles.storeTextSelected]}>
                  {store.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={styles.label}>Need By Date (Optional):</Text>
          <Pressable style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateButtonText}>
              {needByDate ? needByDate.toLocaleDateString() : 'Select date'}
            </Text>
          </Pressable>

          {showDatePicker && (
            <DateTimePicker
              value={needByDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}

          {needByDate && (
            <Pressable onPress={() => setNeedByDate(null)}>
              <Text style={styles.clearDate}>Clear date</Text>
            </Pressable>
          )}

            <View style={styles.buttons}>
              <Pressable style={[styles.button, styles.cancelButton]} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.submitButton, (!name.trim() || !selectedStoreId) && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={!name.trim() || !selectedStoreId}
              >
                <Text style={styles.submitButtonText}>Add Item</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayTouchable: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '90%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  storeList: {
    marginBottom: 16,
    maxHeight: 60,
  },
  storeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
  },
  storeIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  storeText: {
    fontSize: 14,
    color: '#374151',
  },
  storeTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#374151',
  },
  clearDate: {
    color: '#ef4444',
    fontSize: 14,
    marginBottom: 16,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#6366f1',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
