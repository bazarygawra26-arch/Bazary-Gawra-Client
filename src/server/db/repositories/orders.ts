import 'server-only';
import { supabaseAdmin } from '../supabaseAdmin';
import { CustomerOrder, CustomerOrderItem, OrderStatus, PaymentMethod, PaymentStatus } from '../../../types';

export interface LegacyOrder {
  id: string;
  order_number?: string;
  product_id?: string;
  product_name?: string;
  product_price?: number;
  quantity?: number;
  customer_name: string;
  customer_phone: string;
  customer_city: string;
  customer_address: string;
  delivery_fee: number;
  total_amount: number;
  payment_method: string;
  payment_status?: string;
  order_notes?: string;
  seller_id?: string;
  seller_name?: string;
  seller_phone?: string;
  seller_whatsapp?: string;
  status: OrderStatus;
  created_at: string;
  items?: CustomerOrderItem[];
}

export type Order = LegacyOrder;

// In-memory fallback store for offline development and testing
const ordersFallbackStore: CustomerOrder[] = [
  {
    id: 'ord-bg-84192',
    order_number: 'BG-84192',
    customer_id: null,
    seller_id: '4542abe5-2b58-44bf-8705-6322658f779b',
    seller_name: 'کەلەپوور و دەستکردی هەورامان',
    customer_name: 'ئاراس ئەحمەد',
    customer_phone: '0770 152 4899',
    customer_city: 'سلێمانی',
    shipping_address: 'گەڕەکی ئاشتی، نزیک پارکی ئازادی',
    subtotal_iqd: 340000,
    discount_iqd: 0,
    delivery_fee_iqd: 0,
    total_amount_iqd: 340000,
    payment_method: 'cash_on_delivery',
    payment_status: 'pending',
    order_status: 'accepted',
    order_notes: 'تکایە پێش گەیاندن پەیوەندیم پێوە بکەن',
    items: [
      {
        id: 'item-1',
        product_id: 'prod-008',
        product_name: 'بەڕەی دەستچنی کوردی هەورامان (١.٥م × ٢م)',
        unit_price_iqd: 340000,
        quantity: 1,
        subtotal_iqd: 340000,
      },
    ],
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

export interface CreateOrderInput {
  customer_id?: string | null;
  seller_id?: string;
  seller_name?: string;
  seller_phone?: string;
  seller_whatsapp?: string;
  customer_name: string;
  customer_phone: string;
  customer_city?: string;
  customer_address?: string;
  shipping_address?: string;
  delivery_fee?: number;
  total_amount?: number;
  payment_method?: string;
  order_notes?: string;
  product_id?: string;
  product_name?: string;
  product_price?: number;
  quantity?: number;
  items?: Array<{
    product_id: string;
    product_name: string;
    unit_price_iqd: number;
    quantity: number;
  }>;
}

export async function createOrder(input: CreateOrderInput): Promise<CustomerOrder> {
  const customerCity = input.customer_city || 'Sulaymaniyah';
  const shippingAddress = input.shipping_address || input.customer_address || `${customerCity}, Kurdistan`;
  const paymentMethod = (input.payment_method || 'cash_on_delivery') as PaymentMethod;
  const sellerId = input.seller_id || 'general-seller';

  // Format order items
  const items: CustomerOrderItem[] = [];
  if (Array.isArray(input.items) && input.items.length > 0) {
    for (const item of input.items) {
      items.push({
        product_id: item.product_id,
        product_name: item.product_name || 'Product',
        unit_price_iqd: Number(item.unit_price_iqd) || 0,
        quantity: Math.max(1, Number(item.quantity) || 1),
        subtotal_iqd: (Number(item.unit_price_iqd) || 0) * Math.max(1, Number(item.quantity) || 1),
      });
    }
  } else if (input.product_id) {
    const unitPrice = Number(input.product_price) || 0;
    const qty = Math.max(1, Number(input.quantity) || 1);
    items.push({
      product_id: input.product_id,
      product_name: input.product_name || 'Product',
      unit_price_iqd: unitPrice,
      quantity: qty,
      subtotal_iqd: unitPrice * qty,
    });
  }

  const subtotal = items.reduce((acc, it) => acc + it.subtotal_iqd, 0);
  const deliveryFee = Number(input.delivery_fee) || 0;
  const totalAmount = input.total_amount != null && input.total_amount > 0 ? Number(input.total_amount) : subtotal + deliveryFee;

  // 1. Try atomic database insertion via Supabase
  if (supabaseAdmin) {
    try {
      const { data: atomicRes, error: atomicErr } = await (supabaseAdmin as any).rpc(
        'create_customer_order_atomic',
        {
          p_customer_id: input.customer_id || null,
          p_seller_id: sellerId,
          p_customer_name: input.customer_name,
          p_customer_phone: input.customer_phone,
          p_customer_city: customerCity,
          p_shipping_address: shippingAddress,
          p_subtotal_iqd: subtotal,
          p_discount_iqd: 0,
          p_delivery_fee_iqd: deliveryFee,
          p_total_amount_iqd: totalAmount,
          p_payment_method: paymentMethod,
          p_order_notes: input.order_notes || null,
          p_items: items.map((i) => ({
            product_id: i.product_id,
            product_name: i.product_name,
            unit_price_iqd: i.unit_price_iqd,
            quantity: i.quantity,
          })),
        }
      );

      if (!atomicErr && atomicRes && atomicRes.success) {
        return {
          id: atomicRes.order_id,
          order_number: atomicRes.order_number,
          customer_id: input.customer_id || null,
          seller_id: sellerId,
          seller_name: input.seller_name,
          customer_name: input.customer_name,
          customer_phone: input.customer_phone,
          customer_city: customerCity,
          shipping_address: shippingAddress,
          subtotal_iqd: subtotal,
          discount_iqd: 0,
          delivery_fee_iqd: deliveryFee,
          total_amount_iqd: totalAmount,
          payment_method: paymentMethod,
          payment_status: 'pending',
          order_status: 'pending',
          order_notes: input.order_notes || null,
          items,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      } else if (atomicErr) {
        console.warn('RPC create_customer_order_atomic error, falling back to direct table insert:', atomicErr);
        // Direct table insert fallback
        const orderNumber = `BG-${Date.now().toString().slice(-6)}`;
        const { data: newOrderRow, error: insertErr } = await (supabaseAdmin as any)
          .from('customer_orders')
          .insert({
            order_number: orderNumber,
            customer_id: input.customer_id || null,
            seller_id: sellerId,
            customer_name: input.customer_name,
            customer_phone: input.customer_phone,
            customer_city: customerCity,
            shipping_address: shippingAddress,
            subtotal_iqd: subtotal,
            discount_iqd: 0,
            delivery_fee_iqd: deliveryFee,
            total_amount_iqd: totalAmount,
            payment_method: paymentMethod,
            payment_status: 'pending',
            order_status: 'pending',
            order_notes: input.order_notes || null,
          })
          .select('id, order_number, created_at')
          .maybeSingle();

        if (!insertErr && newOrderRow) {
          if (items.length > 0) {
            await (supabaseAdmin as any).from('order_items').insert(
              items.map((it) => ({
                order_id: newOrderRow.id,
                product_id: it.product_id,
                product_name: it.product_name,
                unit_price_iqd: it.unit_price_iqd,
                quantity: it.quantity,
                subtotal_iqd: it.subtotal_iqd,
              }))
            );
          }

          return {
            id: newOrderRow.id,
            order_number: newOrderRow.order_number,
            customer_id: input.customer_id || null,
            seller_id: sellerId,
            seller_name: input.seller_name,
            customer_name: input.customer_name,
            customer_phone: input.customer_phone,
            customer_city: customerCity,
            shipping_address: shippingAddress,
            subtotal_iqd: subtotal,
            discount_iqd: 0,
            delivery_fee_iqd: deliveryFee,
            total_amount_iqd: totalAmount,
            payment_method: paymentMethod,
            payment_status: 'pending',
            order_status: 'pending',
            order_notes: input.order_notes || null,
            items,
            created_at: newOrderRow.created_at || new Date().toISOString(),
          };
        }
      }
    } catch (err) {
      console.warn('createOrder DB exception, using runtime memory store:', err);
    }
  }

  // 2. Fallback in-memory store
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const fallbackOrder: CustomerOrder = {
    id: `ord-bg-${randomSuffix}`,
    order_number: `BG-${randomSuffix}`,
    customer_id: input.customer_id || null,
    seller_id: sellerId,
    seller_name: input.seller_name,
    customer_name: input.customer_name,
    customer_phone: input.customer_phone,
    customer_city: customerCity,
    shipping_address: shippingAddress,
    subtotal_iqd: subtotal,
    discount_iqd: 0,
    delivery_fee_iqd: deliveryFee,
    total_amount_iqd: totalAmount,
    payment_method: paymentMethod,
    payment_status: 'pending',
    order_status: 'pending',
    order_notes: input.order_notes || null,
    items,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  ordersFallbackStore.unshift(fallbackOrder);
  return fallbackOrder;
}

export async function getOrders(sellerId?: string, customerId?: string): Promise<CustomerOrder[]> {
  if (supabaseAdmin) {
    try {
      let query = (supabaseAdmin as any)
        .from('customer_orders')
        .select(`
          id,
          order_number,
          customer_id,
          seller_id,
          customer_name,
          customer_phone,
          customer_city,
          shipping_address,
          subtotal_iqd,
          discount_iqd,
          delivery_fee_iqd,
          total_amount_iqd,
          payment_method,
          payment_status,
          order_status,
          order_notes,
          rejection_reason,
          created_at,
          updated_at,
          order_items (
            id,
            product_id,
            product_name,
            unit_price_iqd,
            quantity,
            subtotal_iqd
          )
        `)
        .order('created_at', { ascending: false });

      if (sellerId) {
        query = query.or(`seller_id.eq.${sellerId}`);
      }
      if (customerId) {
        query = query.eq('customer_id', customerId);
      }

      const { data, error } = await query;
      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((o: any) => ({
          id: o.id,
          order_number: o.order_number,
          customer_id: o.customer_id,
          seller_id: o.seller_id,
          customer_name: o.customer_name,
          customer_phone: o.customer_phone,
          customer_city: o.customer_city,
          shipping_address: o.shipping_address,
          subtotal_iqd: Number(o.subtotal_iqd),
          discount_iqd: Number(o.discount_iqd || 0),
          delivery_fee_iqd: Number(o.delivery_fee_iqd || 0),
          total_amount_iqd: Number(o.total_amount_iqd),
          payment_method: o.payment_method,
          payment_status: o.payment_status,
          order_status: o.order_status,
          order_notes: o.order_notes,
          rejection_reason: o.rejection_reason,
          items: Array.isArray(o.order_items) ? o.order_items : [],
          created_at: o.created_at,
          updated_at: o.updated_at,
        }));
      }
    } catch (err) {
      console.warn('getOrders DB error:', err);
    }
  }

  // Fallback filtering
  return ordersFallbackStore.filter((o) => {
    if (sellerId && o.seller_id !== sellerId) return false;
    if (customerId && o.customer_id !== customerId) return false;
    return true;
  });
}

export async function getOrderById(id: string): Promise<CustomerOrder | null> {
  if (supabaseAdmin) {
    try {
      const { data, error } = await (supabaseAdmin as any)
        .from('customer_orders')
        .select(`
          id,
          order_number,
          customer_id,
          seller_id,
          customer_name,
          customer_phone,
          customer_city,
          shipping_address,
          subtotal_iqd,
          discount_iqd,
          delivery_fee_iqd,
          total_amount_iqd,
          payment_method,
          payment_status,
          order_status,
          order_notes,
          rejection_reason,
          created_at,
          updated_at,
          order_items (
            id,
            product_id,
            product_name,
            unit_price_iqd,
            quantity,
            subtotal_iqd
          )
        `)
        .or(`id.eq.${id},order_number.eq.${id}`)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          order_number: data.order_number,
          customer_id: data.customer_id,
          seller_id: data.seller_id,
          customer_name: data.customer_name,
          customer_phone: data.customer_phone,
          customer_city: data.customer_city,
          shipping_address: data.shipping_address,
          subtotal_iqd: Number(data.subtotal_iqd),
          discount_iqd: Number(data.discount_iqd || 0),
          delivery_fee_iqd: Number(data.delivery_fee_iqd || 0),
          total_amount_iqd: Number(data.total_amount_iqd),
          payment_method: data.payment_method,
          payment_status: data.payment_status,
          order_status: data.order_status,
          order_notes: data.order_notes,
          rejection_reason: data.rejection_reason,
          items: Array.isArray(data.order_items) ? data.order_items : [],
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
      }
    } catch (err) {
      console.warn('getOrderById DB error:', err);
    }
  }

  return ordersFallbackStore.find((o) => o.id === id || o.order_number === id) || null;
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  options?: { rejection_reason?: string; payment_status?: PaymentStatus }
): Promise<{ success: boolean; order?: CustomerOrder; error?: string }> {
  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    pending: ['accepted', 'rejected', 'cancelled'],
    accepted: ['processing', 'cancelled'],
    processing: ['ready_for_delivery', 'cancelled'],
    ready_for_delivery: ['shipped', 'delivered', 'cancelled'],
    shipped: ['delivered', 'returned'],
    delivered: ['returned'],
    cancelled: [],
    rejected: [],
    returned: [],
  };

  const currentOrder = await getOrderById(orderId);
  if (!currentOrder) {
    return { success: false, error: 'Order not found' };
  }

  // Validate state machine transition
  const allowed = validTransitions[currentOrder.order_status] || [];
  if (!allowed.includes(newStatus) && currentOrder.order_status !== newStatus) {
    return {
      success: false,
      error: `Invalid status transition from ${currentOrder.order_status} to ${newStatus}.`,
    };
  }

  if (supabaseAdmin) {
    try {
      const updatePayload: any = {
        order_status: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (options?.rejection_reason) {
        updatePayload.rejection_reason = options.rejection_reason;
      }
      if (options?.payment_status) {
        updatePayload.payment_status = options.payment_status;
      }
      if (newStatus === 'delivered') {
        updatePayload.payment_status = 'paid';
      }

      const { data, error } = await (supabaseAdmin as any)
        .from('customer_orders')
        .update(updatePayload)
        .eq('id', currentOrder.id)
        .select()
        .maybeSingle();

      if (!error && data) {
        // Send notification to customer if customer_id exists
        if (currentOrder.customer_id) {
          try {
            await (supabaseAdmin as any).from('notifications').insert({
              user_id: currentOrder.customer_id,
              title_en: `Order #${currentOrder.order_number} ${newStatus}`,
              title_ku: `داواکاری #${currentOrder.order_number} گۆڕدرا بۆ ${newStatus}`,
              title_ar: `الطلب #${currentOrder.order_number} تحول إلى ${newStatus}`,
              message_en: `Your order status has been updated to ${newStatus}.`,
              message_ku: `دۆخی داواکارییەکەت نوێکرایەوە بۆ ${newStatus}.`,
              message_ar: `تم تحديث حالة طلبك إلى ${newStatus}.`,
              type: 'order_status_changed',
              reference_id: currentOrder.id,
            });
          } catch {}
        }

        return {
          success: true,
          order: {
            ...currentOrder,
            order_status: newStatus,
            rejection_reason: options?.rejection_reason || currentOrder.rejection_reason,
            payment_status: options?.payment_status || (newStatus === 'delivered' ? 'paid' : currentOrder.payment_status),
          },
        };
      }
    } catch (err: any) {
      console.warn('updateOrderStatus DB error:', err);
    }
  }

  // Update fallback store
  currentOrder.order_status = newStatus;
  if (options?.rejection_reason) currentOrder.rejection_reason = options.rejection_reason;
  if (options?.payment_status) currentOrder.payment_status = options.payment_status;
  if (newStatus === 'delivered') currentOrder.payment_status = 'paid';
  currentOrder.updated_at = new Date().toISOString();

  return { success: true, order: currentOrder };
}
