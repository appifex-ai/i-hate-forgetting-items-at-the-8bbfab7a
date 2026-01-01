// API Types - Match backend Pydantic schemas

export interface Store {
  id: number;
  name: string;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface StoreCreate {
  name: string;
  color?: string;
  icon?: string;
}

export interface StoreUpdate {
  name?: string;
  color?: string;
  icon?: string;
}

export interface ShoppingItem {
  id: number;
  name: string;
  quantity: string;
  store_id: number;
  need_by_date: string | null;
  is_checked: boolean;
  created_at: string;
  updated_at: string;
  store: Store;
}

export interface ShoppingItemCreate {
  name: string;
  quantity?: string;
  store_id: number;
  need_by_date?: string | null;
}

export interface ShoppingItemUpdate {
  name?: string;
  quantity?: string;
  store_id?: number;
  need_by_date?: string | null;
  is_checked?: boolean;
}
