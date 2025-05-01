import { ReactNode } from "react";

export interface Sale {
  id: string;
  _id: string;
  created_at: string;
  total: number;
  items: {
    flavor: any;
    productName: ReactNode;
    id: string;
    product_id: string;
    type: 'sealed' | 'prepared';
    quantity: number;
    unit_price: number;
    portions?: number;
  }[];
  client_id?: string;
  client: string | null;
  status: 'completed' | 'pending_inventory_adjustment' | 'cancelled';
  itemGroups: { name: string; items: any[] }[];
  employee: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface Client {
  id: string;
  name: string;
  type: 'occasional' | 'regular' | 'wholesale';
  phone?: string;
  total_spent: number;
  last_purchase?: string;
}

export interface Product {
  id: string;
  name: string;
  type: 'sealed' | 'prepared' | 'both';
  price: number;
  stock: number;
  portions?: number;
}