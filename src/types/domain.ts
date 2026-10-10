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
  verification_status?: 'unverified' | 'pending' | 'verified';
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

