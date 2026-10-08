export interface Order {
  id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  customer_name: string;
  customer_phone: string;
  customer_city: string;
  customer_address: string;
  delivery_fee: number;
  total_amount: number;
  payment_method: 'cash_on_delivery' | 'electronic';
  order_notes?: string;
  seller_id?: string;
  seller_name?: string;
  seller_phone?: string;
  seller_whatsapp?: string;
  status: 'pending' | 'confirmed' | 'delivered';
  created_at: string;
}

// In-memory persistent store for runtime
const ordersStore: Order[] = [
  {
    id: 'BG-84192',
    product_id: 'prod-008',
    product_name: 'بەڕەی دەستچنی کوردی هەورامان (١.٥م × ٢م)',
    product_price: 340000,
    customer_name: 'ئاراس ئەحمەد',
    customer_phone: '0770 152 4899',
    customer_city: 'سلێمانی',
    customer_address: 'گەڕەکی ئاشتی، نزیک پارکی ئازادی',
    delivery_fee: 0,
    total_amount: 340000,
    payment_method: 'cash_on_delivery',
    order_notes: 'تکایە پێش گەیاندن پەیوەندیم پێوە بکەن',
    seller_name: 'کەلەپوور و دەستکردی هەورامان',
    seller_phone: '+964 770 123 4567',
    seller_whatsapp: '+964 770 123 4567',
    status: 'confirmed',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

export async function createOrder(input: Omit<Order, 'id' | 'status' | 'created_at'>): Promise<Order> {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const newOrder: Order = {
    ...input,
    id: `BG-${randomSuffix}`,
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  ordersStore.unshift(newOrder);
  return newOrder;
}

export async function getOrders(sellerId?: string): Promise<Order[]> {
  if (sellerId) {
    return ordersStore.filter((o) => o.seller_id === sellerId);
  }
  return [...ordersStore];
}

export async function getOrderById(id: string): Promise<Order | null> {
  return ordersStore.find((o) => o.id === id) || null;
}
