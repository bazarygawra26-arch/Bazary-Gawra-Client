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
