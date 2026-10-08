export type SupportedLanguage = 'en' | 'ckb' | 'ar';

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
  created_at?: string;
  // Trust/Information signals (neutral audit of data provided)
  information_signals?: {
    has_location: boolean;
    has_warranty: boolean;
    has_delivery: boolean;
    has_return_policy: boolean;
    has_specifications: boolean;
    missing_points: string[];
  };
  // AI Match details (when recommended or searched)
  ai_match?: {
    score?: number;
    match_reason: string;
    highlights: string[];
    cautions: string[];
  };
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
}

export interface Seller {
  id: string;
  name: string;
  location: string;
  productCount: number;
  delivery_info?: string;
  warranty_support?: string;
  return_window?: string;
  phone_placeholder?: string;
  avatar_bg?: string;
  established_since?: string;
}

export interface AISearchInterpretation {
  query: string;
  detected_language: SupportedLanguage;
  product_type: string;
  target_location: string;
  budget_max?: number;
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
}
