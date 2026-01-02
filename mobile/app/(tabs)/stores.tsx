import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  RefreshControl,
  Alert,
  Modal,
  Platform,
  Keyboard,
  Animated,
} from 'react-native';
import { storesApi } from '@/lib/api';
import type { Store } from '@/types/api';

const PRESET_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899'];
const PRESET_ICONS = ['🏪', '🛒', '🥬', '🎯', '🍎', '🧺', '🏬', '🍞', '🥩', '🧀'];

export default function StoresScreen() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [newStoreName, setNewStoreName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(PRESET_ICONS[0]);
  
  // Keyboard handling
  const modalBottom = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        Animated.timing(modalBottom, {
          toValue: e.endCoordinates.height,
          duration: Platform.OS === 'ios' ? e.duration : 250,
          useNativeDriver: false,
        }).start();
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      (e) => {
        Animated.timing(modalBottom, {
          toValue: 0,
          duration: Platform.OS === 'ios' ? e.duration : 250,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, [modalBottom]);

  const loadStores = async () => {
    try {
      const data = await storesApi.getAll();
      setStores(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load stores');
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStores();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadStores();
  };

  const openAddModal = () => {
    setEditingStore(null);
    setNewStoreName('');
    setSelectedColor(PRESET_COLORS[0]);
    setSelectedIcon(PRESET_ICONS[0]);
    setShowAddModal(true);
  };

  const openEditModal = (store: Store) => {
    setEditingStore(store);
    setNewStoreName(store.name);
    setSelectedColor(store.color);
    setSelectedIcon(store.icon);
    setShowAddModal(true);
  };

  const handleSubmit = async () => {
    if (!newStoreName.trim()) return;

    try {
      if (editingStore) {
        const updated = await storesApi.update(editingStore.id, {
          name: newStoreName.trim(),
          color: selectedColor,
          icon: selectedIcon,
        });
        setStores(stores.map((s) => (s.id === editingStore.id ? updated : s)));
      } else {
        const newStore = await storesApi.create({
          name: newStoreName.trim(),
          color: selectedColor,
          icon: selectedIcon,
        });
        setStores([...stores, newStore]);
      }
      setShowAddModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save store');
    }
  };

  const handleDelete = (store: Store) => {
    Alert.alert('Delete Store', `Delete "${store.name}"? All items in this store will be deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await storesApi.delete(store.id);
            setStores(stores.filter((s) => s.id !== store.id));
          } catch (error) {
            Alert.alert('Error', 'Failed to delete store');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Stores</Text>
        <Text style={styles.subtitle}>{stores.length} store{stores.length !== 1 ? 's' : ''}</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {stores.map((store) => (
          <Pressable
            key={store.id}
            style={[styles.storeCard, { borderLeftColor: store.color }]}
            onPress={() => openEditModal(store)}
            onLongPress={() => handleDelete(store)}
          >
            <Text style={styles.storeIcon}>{store.icon}</Text>
            <View style={styles.storeInfo}>
              <Text style={styles.storeName}>{store.name}</Text>
              <Text style={styles.storeHint}>Tap to edit • Long press to delete</Text>
            </View>
            <View style={[styles.colorDot, { backgroundColor: store.color }]} />
          </Pressable>
        ))}

        <Pressable style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonIcon}>+</Text>
          <Text style={styles.addButtonText}>Add New Store</Text>
        </Pressable>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add/Edit Store Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent onRequestClose={() => setShowAddModal(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowAddModal(false)}>
          <Animated.View style={[styles.modalContainer, { bottom: modalBottom }]}>
            <Pressable onPress={(e) => e.stopPropagation()}>
              <ScrollView
                style={styles.modal}
                contentContainerStyle={styles.modalContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
                <Text style={styles.modalTitle}>{editingStore ? 'Edit Store' : 'Add Store'}</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Store name"
                  value={newStoreName}
                  onChangeText={setNewStoreName}
                  autoFocus
                />

                <Text style={styles.label}>Choose Icon:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconList}>
                  {PRESET_ICONS.map((icon) => (
                    <Pressable
                      key={icon}
                      style={[styles.iconButton, selectedIcon === icon && styles.iconButtonSelected]}
                      onPress={() => setSelectedIcon(icon)}
                    >
                      <Text style={styles.iconText}>{icon}</Text>
                    </Pressable>
                  ))}
                </ScrollView>

                <Text style={styles.label}>Choose Color:</Text>
                <View style={styles.colorGrid}>
                  {PRESET_COLORS.map((color) => (
                    <Pressable
                      key={color}
                      style={[
                        styles.colorButton,
                        { backgroundColor: color },
                        selectedColor === color && styles.colorButtonSelected,
                      ]}
                      onPress={() => setSelectedColor(color)}
                    />
                  ))}
                </View>

                <View style={styles.buttons}>
                  <Pressable style={[styles.button, styles.cancelButton]} onPress={() => setShowAddModal(false)}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.button, styles.submitButton, !newStoreName.trim() && styles.buttonDisabled]}
                    onPress={handleSubmit}
                    disabled={!newStoreName.trim()}
                  >
                    <Text style={styles.submitButtonText}>{editingStore ? 'Save' : 'Add'}</Text>
                  </Pressable>
                </View>
              </ScrollView>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 18,
    color: '#6b7280',
  },
  storeCard: {
    backgroundColor: 'white',
    margin: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  storeIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  storeHint: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  addButton: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 8,
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  addButtonIcon: {
    fontSize: 24,
    color: '#6366f1',
    marginRight: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width: '100%',
  },
  modal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: 600,
  },
  modalContent: {
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
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
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  iconList: {
    marginBottom: 20,
    maxHeight: 60,
  },
  iconButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#f3f4f6',
  },
  iconButtonSelected: {
    backgroundColor: '#6366f1',
  },
  iconText: {
    fontSize: 28,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  colorButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  colorButtonSelected: {
    borderWidth: 4,
    borderColor: 'white',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
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
