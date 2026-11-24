export type SupportedLocale = 'en' | 'ku' | 'ar';
export type SupportedLanguage = 'en' | 'ckb' | 'ku' | 'ar';

export interface Product {
  id: string;
  name: string;
  name_ckb?: string;
  name_ar?: string;
  category: string;
  price: number;
  currency: 'IQD' | 'USD';
  location: string;
  seller_name: string;
  seller_location: string;
  capacity?: string;
  power?: string;
  warranty?: string;
  delivery_info?: string;
  return_policy?: string;
  origin?: string;
  description: string;
  image_url: string;
  images?: string[];
  created_at?: string;
  slug?: string;
  seller_id?: string;
  seller_slug?: string;
  seller_phone?: string;
  seller_whatsapp?: string;
  seller_verification?: 'unverified' | 'pending' | 'verified';
  status?: string;
  is_demo?: boolean;
  brand?: string;
  original_price?: number;
  discount_percent?: number;
  rating?: number;
  review_count?: number;
  information_signals?: {
    has_location: boolean;
    has_warranty: boolean;
    has_delivery: boolean;
    has_return_policy: boolean;
    has_specifications: boolean;
    missing_points: string[];
  };
  ai_match?: {
    score?: number;
    match_reason: string;
    highlights: string[];
    cautions: string[];
  };
  is_promoted?: boolean;
  is_sponsored?: boolean;
  promotion_expires_at?: string;
  view_count?: number;
  stock_quantity?: number;
  low_stock_threshold?: number;
  is_available?: boolean;
  inventory_status?: 'in_stock' | 'low_stock' | 'out_of_stock';
  discount_amount?: number;
}

export interface Promotion {
  id: string;
  slug: string;
  title_en: string;
  title_ku: string;
  title_ar: string;
  subtitle_en?: string;
  subtitle_ku?: string;
  subtitle_ar?: string;
  badge_en?: string;
  badge_ku?: string;
  badge_ar?: string;
  image_url: string;
  link_url: string;
  seller_id?: string;
  is_active: boolean;
  sort_order: number;
}

export interface ProductFeedback {
  id: string;
  product_id: string;
  rating: number;
  customer_name: string;
  customer_city?: string;
  comment: string;
  is_verified?: boolean;
  created_at: string;
}

export interface SubCategory {
  id: string;
  name: string;
  name_en?: string;
  name_ckb: string;
  name_ar: string;
  slug: string;
  iconName?: string;
  image?: string;
  itemCount?: number;
}

export interface Category {
  id: string;
  name: string;
  name_en?: string;
  name_ckb: string;
  name_ar: string;
  slug: string;
  iconName: string;
  image: string;
  itemCount: number;
  subcategories?: SubCategory[];
}

export interface Seller {
  id: string;
  slug?: string;
  name: string;
  location: string;
  productCount: number;
  delivery_info?: string;
  warranty_support?: string;
  return_window?: string;
  phone_placeholder?: string;
  phone?: string;
  whatsapp?: string;
  logo_url?: string;
  verification_status?: 'unverified' | 'pending' | 'verified' | 'rejected' | 'suspended';
  is_active?: boolean;
  is_demo?: boolean;
  avatar_bg?: string;
  established_since?: string;
  description?: string;
}

export interface SellerCategoryStat {
  slug: string;
  name: string;
  count: number;
}

export interface SellerInfoSummary {
  with_warranty: number;
  with_delivery_info: number;
  with_return_policy: number;
}

export interface SellerProfile {
  id: string;
  slug: string;
  name: string;
  description?: string;
  location: string;
  phone?: string;
  whatsapp?: string;
  logo_url?: string;
  verification_status: 'unverified' | 'pending' | 'verified';
  is_demo: boolean;
  product_count: number;
  categories: SellerCategoryStat[];
  info_summary: SellerInfoSummary;
}

export interface AISearchInterpretation {
  query: string;
  detected_language: string;
  product_type: string;
  product_type_ckb?: string;
  product_type_ar?: string;
  target_location: string;
  target_location_ckb?: string;
  target_location_ar?: string;
  budget_max?: number | null;
  currency?: string;
  extracted_preferences: string[];
  explanation: {
    en: string;
    ckb: string;
    ar: string;
  };
}

export interface AIComparisonResult {
  summary: string;
  summary_ckb?: string;
  summary_ar?: string;
  recommendation_rationale: string;
  comparison_matrix: {
    feature: string;
    values: Record<string, string>;
  }[];
  information_gaps: {
    productId: string;
    productName: string;
    missing: string[];
  }[];
  advantages_disadvantages?: {
    productId: string;
    productName: string;
    advantages: string[];
    disadvantages: string[];
  }[];
  best_match?: {
    productId: string;
    productName: string;
    rationale: string;
  };
  facts_vs_advice?: {
    verified_database_facts: string[];
    general_buying_advice: string[];
  };
}

export interface StructuredAiSearchRequest {
  product: string;
  category: string;
  location: string;
  max_price: number | null;
  min_price: number | null;
  currency: string;
  preferences: string[];
  language: string;
}

export interface DetailedInformationGap {
  productId: string;
  productName: string;
  available: string[];
  missing: string[];
  seller_questions: string[];
}

export interface AiSearchComprehensiveResult {
  request_id?: string | null;
  request: StructuredAiSearchRequest;
  interpretation: AISearchInterpretation;
  products: Product[];
  alternatives?: Product[];
  comparison?: {
    summary: string;
    differences: string[];
    matrix: { feature: string; values: Record<string, string> }[];
  } | null;
  information_gaps: DetailedInformationGap[];
  recommendation: string;
  seller_questions: string[];
  language: string;
}

export interface AIProductScanResult {
  product_type: string;
  suggested_category: string;
  visible_attributes: {
    key: string;
    value: string;
    confidence: 'high' | 'medium' | 'low';
  }[];
  transparency_audit: {
    available_info: string[];
    missing_info: string[];
  };
  seller_draft: {
    title_draft: string;
    category_slug: string;
    estimated_price_iqd?: number;
    required_missing_seller_inputs: string[];
  };
  search_suggestions: string[];
}

export interface SellerPlan {
  id: string;
  slug: string;
  name: string;
  name_en: string;
  name_ku: string;
  name_ar: string;
  price_iqd: number;
  billing_period: string;
  max_products: number;
  can_promote_products: boolean;
  analytics_tier: 'basic' | 'advanced';
  features: string[];
  features_en?: string[];
  features_ku?: string[];
  features_ar?: string[];
  is_active: boolean;
}

export interface SellerSubscription {
  id: string;
  seller_id: string;
  plan_id: string;
  plan?: SellerPlan;
  status: 'active' | 'trial' | 'past_due' | 'canceled' | 'expired';
  current_period_start: string;
  current_period_end: string;
  renewal_date: string;
  is_demo?: boolean;
}

export interface ProductPromotion {
  id: string;
  product_id: string;
  product_name?: string;
  product_image?: string;
  seller_id: string;
  promotion_type: string;
  price_iqd: number;
  duration_days: number;
  starts_at: string;
  ends_at: string;
  status: 'pending' | 'active' | 'expired' | 'canceled';
  badge_label_ku: string;
  badge_label_en: string;
  badge_label_ar: string;
  is_demo?: boolean;
  created_at: string;
}

export interface MonetizationPayment {
  id: string;
  seller_id: string;
  seller_name?: string;
  subscription_id?: string;
  promotion_id?: string;
  amount_iqd: number;
  currency: string;
  payment_method: string;
  payment_status: 'pending' | 'completed' | 'demo_verified' | 'failed';
  transaction_reference?: string;
  notes?: string;
  verified_at?: string;
  created_at: string;
}

export interface PaginatedProductsResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}



export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'processing'
  | 'ready_for_delivery'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'rejected'
  | 'returned';

export type PaymentMethod =
  | 'cash_on_delivery'
  | 'fib'
  | 'fastpay'
  | 'zaincash'
  | 'electronic';

export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';

export interface CustomerOrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  product_name: string;
  unit_price_iqd: number;
  quantity: number;
  subtotal_iqd: number;
}

export interface CustomerOrder {
  id: string;
  order_number: string;
  customer_id?: string | null;
  seller_id: string;
  seller_name?: string;
  customer_name: string;
  customer_phone: string;
  customer_city: string;
  shipping_address: string;
  subtotal_iqd: number;
  discount_iqd: number;
  delivery_fee_iqd: number;
  total_amount_iqd: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  order_notes?: string | null;
  rejection_reason?: string | null;
  items?: CustomerOrderItem[];
  created_at: string;
  updated_at?: string;
}

export type RFQStatus = 'open' | 'under_review' | 'quoted' | 'accepted' | 'fulfilled' | 'cancelled' | 'expired';

export interface RFQItem {
  id?: string;
  rfq_id?: string;
  item_name: string;
  quantity: number;
  target_unit_price_iqd?: number | null;
  specifications?: string | null;
}

export interface RFQ {
  id: string;
  rfq_number: string;
  buyer_id: string;
  buyer_name?: string;
  buyer_business_name?: string;
  title: string;
  category_slug?: string | null;
  target_price_iqd?: number | null;
  quantity: number;
  unit_measure: string;
  specifications: string;
  delivery_location: string;
  required_delivery_date?: string | null;
  notes?: string | null;
  status: RFQStatus;
  items?: RFQItem[];
  quotations_count?: number;
  created_at: string;
  updated_at?: string;
}

export type QuotationStatus = 'submitted' | 'under_negotiation' | 'accepted' | 'rejected' | 'expired';

export interface QuotationItem {
  id?: string;
  quotation_id?: string;
  item_name: string;
  quantity: number;
  unit_price_iqd: number;
  subtotal_iqd: number;
}

export interface Quotation {
  id: string;
  quotation_number: string;
  rfq_id: string;
  rfq_title?: string;
  supplier_id: string;
  supplier_name?: string;
  supplier_owner_id: string;
  unit_price_iqd: number;
  quantity: number;
  subtotal_iqd: number;
  delivery_cost_iqd: number;
  total_amount_iqd: number;
  delivery_days: number;
  payment_terms: string;
  validity_date: string;
  availability_status: 'in_stock' | 'made_to_order' | 'import_scheduled';
  notes?: string | null;
  status: QuotationStatus;
  items?: QuotationItem[];
  created_at: string;
  updated_at?: string;
}

export type PurchaseOrderStatus =
  | 'issued'
  | 'confirmed_by_supplier'
  | 'in_production'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export interface PurchaseOrderItem {
  id?: string;
  purchase_order_id?: string;
  item_name: string;
  quantity: number;
  unit_price_iqd: number;
  subtotal_iqd: number;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  rfq_id?: string | null;
  quotation_id: string;
  buyer_id: string;
  buyer_business_name?: string;
  supplier_id: string;
  supplier_name?: string;
  total_amount_iqd: number;
  payment_terms: string;
  delivery_address: string;
  expected_delivery_date?: string | null;
  status: PurchaseOrderStatus;
  notes?: string | null;
  items?: PurchaseOrderItem[];
  created_at: string;
  updated_at?: string;
}

export type NotificationType =
  | 'order_received'
  | 'order_status_changed'
  | 'order_cancelled'
  | 'rfq_received'
  | 'quotation_received'
  | 'quotation_accepted'
  | 'po_updated'
  | 'seller_verified'
  | 'seller_rejected'
  | 'subscription_expiring'
  | 'general';

export interface MarketplaceNotification {
  id: string;
  user_id: string;
  title_en: string;
  title_ku: string;
  title_ar: string;
  message_en: string;
  message_ku: string;
  message_ar: string;
  type: NotificationType;
  reference_id?: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  participant_one_id: string;
  participant_two_id: string;
  other_participant_name?: string;
  subject?: string | null;
  reference_type?: 'product' | 'order' | 'rfq' | 'quotation' | 'general' | null;
  reference_id?: string | null;
  last_message?: string;
  last_message_at: string;
  unread_count?: number;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name?: string;
  message_text: string;
  is_read: boolean;
  created_at: string;
}

export interface CustomerAddress {
  id: string;
  user_id: string;
  label: string;
  recipient_name: string;
  phone: string;
  country: string;
  city: string;
  district?: string | null;
  street_address: string;
  is_default: boolean;
  created_at: string;
}

export interface CustomerFavourite {
  id: string;
  user_id: string;
  product_id: string;
  product?: Product;
  created_at: string;
}
