import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  RefreshControl,
  Alert,
} from 'react-native';
import { itemsApi, storesApi } from '@/lib/api';
import type { ShoppingItem, Store } from '@/types/api';
import { SwipeableItem } from '@/components/SwipeableItem';
import { AddItemModal } from '@/components/AddItemModal';

export default function ShoppingListScreen() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadData = async () => {
    try {
      const [itemsData, storesData] = await Promise.all([
        itemsApi.getAll(),
        storesApi.getAll(),
      ]);
      setItems(itemsData);
      setStores(storesData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleToggleCheck = async (item: ShoppingItem) => {
    try {
      const updated = await itemsApi.update(item.id, { is_checked: !item.is_checked });
      setItems(items.map((i) => (i.id === item.id ? updated : i)));
    } catch (error) {
      Alert.alert('Error', 'Failed to update item');
    }
  };

  const handleDeleteItem = async (item: ShoppingItem) => {
    try {
      await itemsApi.delete(item.id);
      setItems(items.filter((i) => i.id !== item.id));
    } catch (error) {
      Alert.alert('Error', 'Failed to delete item');
    }
  };

  const handleAddItem = async (data: any) => {
    try {
      const newItem = await itemsApi.create(data);
      setItems([newItem, ...items]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add item');
    }
  };

  // Group items by store
  const groupedItems = items.reduce((acc, item) => {
    const storeId = item.store_id;
    if (!acc[storeId]) {
      acc[storeId] = [];
    }
    acc[storeId].push(item);
    return acc;
  }, {} as Record<number, ShoppingItem[]>);

  // Separate checked and unchecked items
  const uncheckedItems = items.filter((item) => !item.is_checked);
  const checkedItems = items.filter((item) => item.is_checked);

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
        <Text style={styles.title}>Shopping List</Text>
        <Text style={styles.subtitle}>
          {uncheckedItems.length} item{uncheckedItems.length !== 1 ? 's' : ''} to buy
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Unchecked items grouped by store */}
        {Object.entries(groupedItems).map(([storeId, storeItems]) => {
          const store = stores.find((s) => s.id === Number(storeId));
          const unchecked = storeItems.filter((item) => !item.is_checked);
          
          if (unchecked.length === 0) return null;

          return (
            <View key={storeId} style={styles.storeSection}>
              <View style={[styles.storeHeader, { backgroundColor: store?.color }]}>
                <Text style={styles.storeIcon}>{store?.icon}</Text>
                <Text style={styles.storeName}>{store?.name}</Text>
                <Text style={styles.itemCount}>{unchecked.length}</Text>
              </View>

              {unchecked.map((item) => (
                <SwipeableItem
                  key={item.id}
                  onSwipeRight={() => handleToggleCheck(item)}
                  onSwipeLeft={() => handleDeleteItem(item)}
                >
                  <View style={styles.itemCard}>
                    <View style={styles.itemContent}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemQuantity}>{item.quantity}</Text>
                      {item.need_by_date && (
                        <Text style={styles.itemDate}>
                          Need by: {new Date(item.need_by_date).toLocaleDateString()}
                        </Text>
                      )}
                    </View>
                  </View>
                </SwipeableItem>
              ))}
            </View>
          );
        })}

        {/* Checked items */}
        {checkedItems.length > 0 && (
          <View style={styles.checkedSection}>
            <Text style={styles.checkedTitle}>✓ Completed ({checkedItems.length})</Text>
            {checkedItems.map((item) => (
              <SwipeableItem
                key={item.id}
                onSwipeRight={() => handleToggleCheck(item)}
                onSwipeLeft={() => handleDeleteItem(item)}
                rightIcon="↩"
              >
                <View style={[styles.itemCard, styles.checkedItem]}>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemNameChecked}>{item.name}</Text>
                    <Text style={styles.itemQuantity}>{item.quantity}</Text>
                  </View>
                </View>
              </SwipeableItem>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Add Button */}
      <Pressable style={styles.fab} onPress={() => setShowAddModal(true)}>
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>

      <AddItemModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddItem}
        stores={stores}
      />
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
  storeSection: {
    marginTop: 16,
    marginHorizontal: 16,
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  storeIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  itemCount: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  itemCard: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  itemDate: {
    fontSize: 12,
    color: '#f59e0b',
    marginTop: 4,
  },
  checkedSection: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  checkedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  checkedItem: {
    opacity: 0.6,
  },
  itemNameChecked: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    textDecorationLine: 'line-through',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: 'white',
    fontWeight: '300',
  },
});
