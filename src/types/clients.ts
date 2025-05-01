import { ReactNode } from "react";

export interface Client {
  visitCount: ReactNode;
  email: string;
  _id: string;
  createdAt: string | undefined;
  id: string;
  name: string;
  type: 'occasional' | 'regular' | 'wholesale';
  phone?: string;
  total_spent: number;
  last_purchase?: string; // Se espera un string ISO o vacío
}
