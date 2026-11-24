import 'server-only';
import { supabaseAdmin } from '../supabaseAdmin';
import {
  RFQ,
  RFQItem,
  RFQStatus,
  Quotation,
  QuotationItem,
  QuotationStatus,
  PurchaseOrder,
  PurchaseOrderItem,
  PurchaseOrderStatus,
} from '../../../types';

// In-memory fallback stores
const rfqsFallbackStore: RFQ[] = [
  {
    id: 'rfq-demo-1',
    rfq_number: 'RFQ-2026-001',
    buyer_id: 'buyer-demo-1',
    buyer_name: 'Slemani Retail Chain',
    buyer_business_name: 'Slemani Retail Chain Ltd.',
    title: 'Commercial Espresso Machines for 3 New Branches',
    category_slug: 'coffee-machines',
    target_price_iqd: 2500000,
    quantity: 6,
    unit_measure: 'units',
    specifications: 'Dual boiler, 220V/50Hz, commercial 58mm portafilter, 2 years local service warranty required.',
    delivery_location: 'Sulaymaniyah (Salim St & Sarchinar)',
    required_delivery_date: '2026-12-15',
    status: 'open',
    quotations_count: 2,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    items: [
      {
        id: 'rfq-item-1',
        item_name: 'Commercial Dual Boiler Espresso Machine',
        quantity: 6,
        target_unit_price_iqd: 2500000,
        specifications: 'Stainless steel, UL/CE certified',
      },
    ],
  },
];

const quotationsFallbackStore: Quotation[] = [
  {
    id: 'quote-demo-1',
    quotation_number: 'QUO-2026-101',
    rfq_id: 'rfq-demo-1',
    rfq_title: 'Commercial Espresso Machines for 3 New Branches',
    supplier_id: 'sup-demo-1',
    supplier_name: 'Mesopotamia Kitchen & HoReCa Importers',
    supplier_owner_id: 'owner-sup-1',
    unit_price_iqd: 2350000,
    quantity: 6,
    subtotal_iqd: 14100000,
    delivery_cost_iqd: 150000,
    total_amount_iqd: 14250000,
    delivery_days: 5,
    payment_terms: '50% upon order confirmation, 50% upon delivery inspection',
    validity_date: '2026-12-31',
    availability_status: 'in_stock',
    notes: 'Direct European import with official 2-year warranty and free installation in Sulaymaniyah.',
    status: 'submitted',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    items: [
      {
        id: 'q-item-1',
        item_name: 'Commercial Dual Boiler Espresso Machine (Italian Pump)',
        quantity: 6,
        unit_price_iqd: 2350000,
        subtotal_iqd: 14100000,
      },
    ],
  },
];

const purchaseOrdersFallbackStore: PurchaseOrder[] = [];

// ==============================================================================
// 1. RFQ OPERATIONS
// ==============================================================================
export interface CreateRFQInput {
  buyer_id: string;
  buyer_name?: string;
  buyer_business_name?: string;
  title: string;
  category_slug?: string;
  target_price_iqd?: number;
  quantity: number;
  unit_measure?: string;
  specifications: string;
  delivery_location: string;
  required_delivery_date?: string;
  notes?: string;
  items?: Array<{
    item_name: string;
    quantity: number;
    target_unit_price_iqd?: number;
    specifications?: string;
  }>;
}

export async function createRFQ(input: CreateRFQInput): Promise<RFQ> {
  const rfqNumber = `RFQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  if (supabaseAdmin) {
    try {
      const { data: newRow, error } = await (supabaseAdmin as any)
        .from('rfqs')
        .insert({
          rfq_number: rfqNumber,
          buyer_id: input.buyer_id,
          title: input.title,
          category_slug: input.category_slug || null,
          target_price_iqd: input.target_price_iqd || null,
          quantity: input.quantity,
          unit_measure: input.unit_measure || 'pieces',
          specifications: input.specifications,
          delivery_location: input.delivery_location,
          required_delivery_date: input.required_delivery_date || null,
          notes: input.notes || null,
          status: 'open',
        })
        .select('id, created_at')
        .maybeSingle();

      if (!error && newRow) {
        const items = input.items || [{ item_name: input.title, quantity: input.quantity }];
        if (items.length > 0) {
          await (supabaseAdmin as any).from('rfq_items').insert(
            items.map((it) => ({
              rfq_id: newRow.id,
              item_name: it.item_name,
              quantity: it.quantity,
              target_unit_price_iqd: it.target_unit_price_iqd || null,
              specifications: it.specifications || null,
            }))
          );
        }

        return {
          id: newRow.id,
          rfq_number: rfqNumber,
          buyer_id: input.buyer_id,
          buyer_name: input.buyer_name,
          buyer_business_name: input.buyer_business_name,
          title: input.title,
          category_slug: input.category_slug,
          target_price_iqd: input.target_price_iqd,
          quantity: input.quantity,
          unit_measure: input.unit_measure || 'pieces',
          specifications: input.specifications,
          delivery_location: input.delivery_location,
          required_delivery_date: input.required_delivery_date,
          notes: input.notes,
          status: 'open',
          items: items.map((it, idx) => ({ id: `rfq-item-${idx}`, ...it })),
          quotations_count: 0,
          created_at: newRow.created_at || new Date().toISOString(),
        };
      }
    } catch (err) {
      console.warn('createRFQ DB error, using fallback:', err);
    }
  }

  const fallbackRFQ: RFQ = {
    id: `rfq-${Date.now()}`,
    rfq_number: rfqNumber,
    buyer_id: input.buyer_id,
    buyer_name: input.buyer_name || 'Business Buyer',
    buyer_business_name: input.buyer_business_name || 'Retail Merchant',
    title: input.title,
    category_slug: input.category_slug,
    target_price_iqd: input.target_price_iqd,
    quantity: input.quantity,
    unit_measure: input.unit_measure || 'pieces',
    specifications: input.specifications,
    delivery_location: input.delivery_location,
    required_delivery_date: input.required_delivery_date,
    notes: input.notes,
    status: 'open',
    quotations_count: 0,
    items: input.items || [{ item_name: input.title, quantity: input.quantity }],
    created_at: new Date().toISOString(),
  };

  rfqsFallbackStore.unshift(fallbackRFQ);
  return fallbackRFQ;
}

export async function getRFQs(filter?: {
  buyerId?: string;
  status?: string;
  categorySlug?: string;
}): Promise<RFQ[]> {
  if (supabaseAdmin) {
    try {
      let query = (supabaseAdmin as any)
        .from('rfqs')
        .select(`
          id,
          rfq_number,
          buyer_id,
          title,
          category_slug,
          target_price_iqd,
          quantity,
          unit_measure,
          specifications,
          delivery_location,
          required_delivery_date,
          notes,
          status,
          created_at,
          rfq_items (
            id,
            item_name,
            quantity,
            target_unit_price_iqd,
            specifications
          ),
          quotations (
            id
          )
        `)
        .order('created_at', { ascending: false });

      if (filter?.buyerId) query = query.eq('buyer_id', filter.buyerId);
      if (filter?.status) query = query.eq('status', filter.status);
      if (filter?.categorySlug) query = query.eq('category_slug', filter.categorySlug);

      const { data, error } = await query;
      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((r: any) => ({
          id: r.id,
          rfq_number: r.rfq_number,
          buyer_id: r.buyer_id,
          title: r.title,
          category_slug: r.category_slug,
          target_price_iqd: r.target_price_iqd ? Number(r.target_price_iqd) : null,
          quantity: r.quantity,
          unit_measure: r.unit_measure,
          specifications: r.specifications,
          delivery_location: r.delivery_location,
          required_delivery_date: r.required_delivery_date,
          notes: r.notes,
          status: r.status,
          items: r.rfq_items || [],
          quotations_count: Array.isArray(r.quotations) ? r.quotations.length : 0,
          created_at: r.created_at,
        }));
      }
    } catch (err) {
      console.warn('getRFQs DB error:', err);
    }
  }

  return rfqsFallbackStore.filter((r) => {
    if (filter?.buyerId && r.buyer_id !== filter.buyerId) return false;
    if (filter?.status && r.status !== filter.status) return false;
    if (filter?.categorySlug && r.category_slug !== filter.categorySlug) return false;
    return true;
  });
}

export async function getRFQById(id: string): Promise<RFQ | null> {
  const all = await getRFQs();
  return all.find((r) => r.id === id || r.rfq_number === id) || null;
}

// ==============================================================================
// 2. QUOTATION OPERATIONS
// ==============================================================================
export interface CreateQuotationInput {
  rfq_id: string;
  supplier_id: string;
  supplier_name?: string;
  supplier_owner_id: string;
  unit_price_iqd: number;
  quantity: number;
  delivery_cost_iqd?: number;
  delivery_days?: number;
  payment_terms?: string;
  validity_date?: string;
  availability_status?: 'in_stock' | 'made_to_order' | 'import_scheduled';
  notes?: string;
  items?: Array<{
    item_name: string;
    quantity: number;
    unit_price_iqd: number;
  }>;
}

export async function createQuotation(input: CreateQuotationInput): Promise<Quotation> {
  const quoteNumber = `QUO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const subtotal = input.unit_price_iqd * input.quantity;
  const deliveryCost = input.delivery_cost_iqd || 0;
  const totalAmount = subtotal + deliveryCost;

  if (supabaseAdmin) {
    try {
      const { data: quoteRow, error } = await (supabaseAdmin as any)
        .from('quotations')
        .insert({
          quotation_number: quoteNumber,
          rfq_id: input.rfq_id,
          supplier_id: input.supplier_id,
          supplier_owner_id: input.supplier_owner_id,
          unit_price_iqd: input.unit_price_iqd,
          quantity: input.quantity,
          subtotal_iqd: subtotal,
          delivery_cost_iqd: deliveryCost,
          total_amount_iqd: totalAmount,
          delivery_days: input.delivery_days || 7,
          payment_terms: input.payment_terms || '50_advance_50_delivery',
          validity_date: input.validity_date || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          availability_status: input.availability_status || 'in_stock',
          notes: input.notes || null,
          status: 'submitted',
        })
        .select('id, created_at')
        .maybeSingle();

      if (!error && quoteRow) {
        // Update RFQ status to quoted
        await (supabaseAdmin as any).from('rfqs').update({ status: 'quoted' }).eq('id', input.rfq_id);

        return {
          id: quoteRow.id,
          quotation_number: quoteNumber,
          rfq_id: input.rfq_id,
          supplier_id: input.supplier_id,
          supplier_name: input.supplier_name,
          supplier_owner_id: input.supplier_owner_id,
          unit_price_iqd: input.unit_price_iqd,
          quantity: input.quantity,
          subtotal_iqd: subtotal,
          delivery_cost_iqd: deliveryCost,
          total_amount_iqd: totalAmount,
          delivery_days: input.delivery_days || 7,
          payment_terms: input.payment_terms || '50_advance_50_delivery',
          validity_date: input.validity_date || '2026-12-31',
          availability_status: input.availability_status || 'in_stock',
          notes: input.notes,
          status: 'submitted',
          created_at: quoteRow.created_at || new Date().toISOString(),
        };
      }
    } catch (err) {
      console.warn('createQuotation DB error:', err);
    }
  }

  const fallbackQuote: Quotation = {
    id: `quote-${Date.now()}`,
    quotation_number: quoteNumber,
    rfq_id: input.rfq_id,
    supplier_id: input.supplier_id,
    supplier_name: input.supplier_name || 'Authorized Wholesaler',
    supplier_owner_id: input.supplier_owner_id,
    unit_price_iqd: input.unit_price_iqd,
    quantity: input.quantity,
    subtotal_iqd: subtotal,
    delivery_cost_iqd: deliveryCost,
    total_amount_iqd: totalAmount,
    delivery_days: input.delivery_days || 7,
    payment_terms: input.payment_terms || '50_advance_50_delivery',
    validity_date: input.validity_date || '2026-12-31',
    availability_status: input.availability_status || 'in_stock',
    notes: input.notes,
    status: 'submitted',
    created_at: new Date().toISOString(),
  };

  quotationsFallbackStore.unshift(fallbackQuote);
  return fallbackQuote;
}

export async function getQuotations(filter?: {
  rfqId?: string;
  supplierId?: string;
  supplierOwnerId?: string;
}): Promise<Quotation[]> {
  if (supabaseAdmin) {
    try {
      let query = (supabaseAdmin as any)
        .from('quotations')
        .select(`
          id,
          quotation_number,
          rfq_id,
          supplier_id,
          supplier_owner_id,
          unit_price_iqd,
          quantity,
          subtotal_iqd,
          delivery_cost_iqd,
          total_amount_iqd,
          delivery_days,
          payment_terms,
          validity_date,
          availability_status,
          notes,
          status,
          created_at,
          suppliers (
            business_name
          ),
          rfqs (
            title
          )
        `)
        .order('created_at', { ascending: false });

      if (filter?.rfqId) query = query.eq('rfq_id', filter.rfqId);
      if (filter?.supplierId) query = query.eq('supplier_id', filter.supplierId);
      if (filter?.supplierOwnerId) query = query.eq('supplier_owner_id', filter.supplierOwnerId);

      const { data, error } = await query;
      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((q: any) => ({
          id: q.id,
          quotation_number: q.quotation_number,
          rfq_id: q.rfq_id,
          rfq_title: q.rfqs?.title,
          supplier_id: q.supplier_id,
          supplier_name: q.suppliers?.business_name,
          supplier_owner_id: q.supplier_owner_id,
          unit_price_iqd: Number(q.unit_price_iqd),
          quantity: q.quantity,
          subtotal_iqd: Number(q.subtotal_iqd),
          delivery_cost_iqd: Number(q.delivery_cost_iqd),
          total_amount_iqd: Number(q.total_amount_iqd),
          delivery_days: q.delivery_days,
          payment_terms: q.payment_terms,
          validity_date: q.validity_date,
          availability_status: q.availability_status,
          notes: q.notes,
          status: q.status,
          created_at: q.created_at,
        }));
      }
    } catch (err) {
      console.warn('getQuotations DB error:', err);
    }
  }

  return quotationsFallbackStore.filter((q) => {
    if (filter?.rfqId && q.rfq_id !== filter.rfqId) return false;
    if (filter?.supplierId && q.supplier_id !== filter.supplierId) return false;
    if (filter?.supplierOwnerId && q.supplier_owner_id !== filter.supplierOwnerId) return false;
    return true;
  });
}

// ==============================================================================
// 3. PURCHASE ORDER (PO) OPERATIONS
// ==============================================================================
export async function acceptQuotationAndCreatePO(
  quotationId: string,
  buyerId: string,
  deliveryAddress: string
): Promise<{ success: boolean; purchase_order?: PurchaseOrder; error?: string }> {
  const quotes = await getQuotations();
  const quote = quotes.find((q) => q.id === quotationId);
  if (!quote) {
    return { success: false, error: 'Quotation not found' };
  }

  const poNumber = `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  if (supabaseAdmin) {
    try {
      // 1. Mark quotation as accepted
      await (supabaseAdmin as any).from('quotations').update({ status: 'accepted' }).eq('id', quote.id);

      // 2. Mark RFQ as accepted
      if (quote.rfq_id) {
        await (supabaseAdmin as any).from('rfqs').update({ status: 'accepted' }).eq('id', quote.rfq_id);
      }

      // 3. Insert Purchase Order
      const { data: poRow, error } = await (supabaseAdmin as any)
        .from('purchase_orders')
        .insert({
          po_number: poNumber,
          rfq_id: quote.rfq_id,
          quotation_id: quote.id,
          buyer_id: buyerId,
          supplier_id: quote.supplier_id,
          total_amount_iqd: quote.total_amount_iqd,
          payment_terms: quote.payment_terms,
          delivery_address: deliveryAddress,
          status: 'issued',
        })
        .select('id, created_at')
        .maybeSingle();

      if (!error && poRow) {
        return {
          success: true,
          purchase_order: {
            id: poRow.id,
            po_number: poNumber,
            rfq_id: quote.rfq_id,
            quotation_id: quote.id,
            buyer_id: buyerId,
            supplier_id: quote.supplier_id,
            total_amount_iqd: quote.total_amount_iqd,
            payment_terms: quote.payment_terms,
            delivery_address: deliveryAddress,
            status: 'issued',
            created_at: poRow.created_at || new Date().toISOString(),
          },
        };
      }
    } catch (err: any) {
      console.warn('acceptQuotationAndCreatePO DB error:', err);
    }
  }

  quote.status = 'accepted';
  const fallbackPO: PurchaseOrder = {
    id: `po-${Date.now()}`,
    po_number: poNumber,
    rfq_id: quote.rfq_id,
    quotation_id: quote.id,
    buyer_id: buyerId,
    supplier_id: quote.supplier_id,
    total_amount_iqd: quote.total_amount_iqd,
    payment_terms: quote.payment_terms,
    delivery_address: deliveryAddress,
    status: 'issued',
    created_at: new Date().toISOString(),
  };

  purchaseOrdersFallbackStore.unshift(fallbackPO);
  return { success: true, purchase_order: fallbackPO };
}

export async function getPurchaseOrders(filter?: {
  buyerId?: string;
  supplierId?: string;
}): Promise<PurchaseOrder[]> {
  if (supabaseAdmin) {
    try {
      let query = (supabaseAdmin as any)
        .from('purchase_orders')
        .select(`
          id,
          po_number,
          rfq_id,
          quotation_id,
          buyer_id,
          supplier_id,
          total_amount_iqd,
          payment_terms,
          delivery_address,
          expected_delivery_date,
          status,
          notes,
          created_at,
          suppliers (
            business_name
          )
        `)
        .order('created_at', { ascending: false });

      if (filter?.buyerId) query = query.eq('buyer_id', filter.buyerId);
      if (filter?.supplierId) query = query.eq('supplier_id', filter.supplierId);

      const { data, error } = await query;
      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((p: any) => ({
          id: p.id,
          po_number: p.po_number,
          rfq_id: p.rfq_id,
          quotation_id: p.quotation_id,
          buyer_id: p.buyer_id,
          supplier_id: p.supplier_id,
          supplier_name: p.suppliers?.business_name,
          total_amount_iqd: Number(p.total_amount_iqd),
          payment_terms: p.payment_terms,
          delivery_address: p.delivery_address,
          expected_delivery_date: p.expected_delivery_date,
          status: p.status,
          notes: p.notes,
          created_at: p.created_at,
        }));
      }
    } catch (err) {
      console.warn('getPurchaseOrders DB error:', err);
    }
  }

  return purchaseOrdersFallbackStore.filter((p) => {
    if (filter?.buyerId && p.buyer_id !== filter.buyerId) return false;
    if (filter?.supplierId && p.supplier_id !== filter.supplierId) return false;
    return true;
  });
}
