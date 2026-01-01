// API Client for Shopping List Backend
import type { Store, StoreCreate, StoreUpdate, ShoppingItem, ShoppingItemCreate, ShoppingItemUpdate } from '@/types/api';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

// Stores API
export const storesApi = {
  getAll: () => apiFetch<Store[]>('/api/stores'),
  create: (data: StoreCreate) => apiFetch<Store>('/api/stores', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: StoreUpdate) => apiFetch<Store>(`/api/stores/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => apiFetch<{ message: string }>(`/api/stores/${id}`, {
    method: 'DELETE',
  }),
};

// Shopping Items API
export const itemsApi = {
  getAll: () => apiFetch<ShoppingItem[]>('/api/items'),
  create: (data: ShoppingItemCreate) => apiFetch<ShoppingItem>('/api/items', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: ShoppingItemUpdate) => apiFetch<ShoppingItem>(`/api/items/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => apiFetch<{ message: string }>(`/api/items/${id}`, {
    method: 'DELETE',
  }),
};
