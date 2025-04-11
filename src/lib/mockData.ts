import { Sale, Client, Product } from '../types/sales';

// Mock data for testing
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Fórmula 1 Vainilla',
    type: 'sealed',
    price: 850,
    stock: 10
  },
  {
    id: '2',
    name: 'Proteína en Polvo',
    type: 'prepared',
    price: 1200,
    stock: 5
  },
  {
    id: '3',
    name: 'Batido Nutricional',
    type: 'both',
    price: 950,
    stock: 15
  },
  {
    id: '4',
    name: 'Té Concentrado',
    type: 'both',
    price: 750,
    stock: 20
  }
];

const mockClients: Client[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    type: 'regular',
    phone: '555-0123',
    total_spent: 5000,
    last_purchase: '2024-03-21'
  },
  {
    id: '2',
    name: 'María García',
    type: 'wholesale',
    phone: '555-4567',
    total_spent: 12000,
    last_purchase: '2024-03-20'
  },
  {
    id: '3',
    name: 'Carlos López',
    type: 'occasional',
    phone: '555-8901',
    total_spent: 1500,
    last_purchase: '2024-03-19'
  }
];

const mockEmployees = [
  {
    id: '1',
    name: 'Ana Martínez',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
  },
  {
    id: '2',
    name: 'Roberto Sánchez',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop'
  }
];

const mockSales: Sale[] = [
  {
    id: '1',
    created_at: '2024-03-21T15:30:00',
    total: 1250,
    items: [
      {
        id: '1',
        product_id: '1',
        type: 'sealed',
        quantity: 1,
        unit_price: 850
      },
      {
        id: '2',
        product_id: '2',
        type: 'prepared',
        quantity: 2,
        unit_price: 200,
        portions: 4
      }
    ],
    client_id: '1',
    status: 'completed',
    employee: mockEmployees[0]
  },
  {
    id: '2',
    created_at: '2024-03-21T14:15:00',
    total: 1650,
    items: [
      {
        id: '3',
        product_id: '3',
        type: 'sealed',
        quantity: 1,
        unit_price: 950
      },
      {
        id: '4',
        product_id: '3',
        type: 'prepared',
        quantity: 1,
        unit_price: 700,
        portions: 3
      }
    ],
    client_id: '2',
    status: 'completed',
    employee: mockEmployees[1]
  },
  {
    id: '3',
    created_at: '2024-03-20T11:30:00',
    total: 2250,
    items: [
      {
        id: '5',
        product_id: '4',
        type: 'sealed',
        quantity: 2,
        unit_price: 750
      },
      {
        id: '6',
        product_id: '2',
        type: 'prepared',
        quantity: 1,
        unit_price: 750,
        portions: 5
      }
    ],
    client_id: '3',
    status: 'completed',
    employee: mockEmployees[0]
  },
  {
    id: '4',
    created_at: '2024-03-20T09:45:00',
    total: 850,
    items: [
      {
        id: '7',
        product_id: '1',
        type: 'sealed',
        quantity: 1,
        unit_price: 850
      }
    ],
    status: 'completed',
    employee: mockEmployees[1]
  }
];

export const api = {
  getSales: () => Promise.resolve(mockSales),
  getProducts: () => Promise.resolve(mockProducts),
  getClients: () => Promise.resolve(mockClients),
  getProductName: (id: string) => mockProducts.find(p => p.id === id)?.name || 'Unknown Product',
  getClient: (id: string) => mockClients.find(c => c.id === id),
  createSale: (data: any) => Promise.resolve({ ...data, id: crypto.randomUUID() }),
  updateClient: (id: string, data: any) => Promise.resolve({ id, ...data })
};