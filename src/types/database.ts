export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          name_ckb: string;
          name_ar: string;
          slug: string;
          icon_name: string;
          image_url: string;
          item_count: number;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          name_ckb: string;
          name_ar: string;
          slug: string;
          icon_name: string;
          image_url: string;
          item_count?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['categories']['Insert']>;
      };
      sellers: {
        Row: {
          id: string;
          name: string;
          location: string;
          delivery_info: string | null;
          warranty_support: string | null;
          return_window: string | null;
          phone_placeholder: string | null;
          avatar_bg: string | null;
          product_count: number;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          location: string;
          delivery_info?: string | null;
          warranty_support?: string | null;
          return_window?: string | null;
          phone_placeholder?: string | null;
          avatar_bg?: string | null;
          product_count?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['sellers']['Insert']>;
      };
      products: {
        Row: {
          id: string;
          name: string;
          name_ckb: string | null;
          name_ar: string | null;
          category: string;
          price: number;
          currency: string;
          location: string;
          seller_name: string;
          seller_location: string | null;
          capacity: string | null;
          power: string | null;
          warranty: string | null;
          delivery_info: string | null;
          return_policy: string | null;
          origin: string | null;
          description: string;
          image_url: string;
          information_signals: Json;
          ai_match: Json;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          name_ckb?: string | null;
          name_ar?: string | null;
          category: string;
          price: number;
          currency?: string;
          location: string;
          seller_name: string;
          seller_location?: string | null;
          capacity?: string | null;
          power?: string | null;
          warranty?: string | null;
          delivery_info?: string | null;
          return_policy?: string | null;
          origin?: string | null;
          description: string;
          image_url: string;
          information_signals?: Json;
          ai_match?: Json;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };
      ai_search_queries: {
        Row: {
          id: string;
          query_text: string;
          detected_language: string | null;
          parsed_product_type: string | null;
          parsed_location: string | null;
          parsed_budget: number | null;
          results_count: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          query_text: string;
          detected_language?: string | null;
          parsed_product_type?: string | null;
          parsed_location?: string | null;
          parsed_budget?: number | null;
          results_count?: number | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['ai_search_queries']['Insert']>;
      };
      ai_product_scans: {
        Row: {
          id: string;
          image_name: string | null;
          product_type: string | null;
          suggested_category: string | null;
          identified_attributes: Json;
          available_info: Json;
          missing_info: Json;
          draft_title: string | null;
          estimated_price_iqd: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          image_name?: string | null;
          product_type?: string | null;
          suggested_category?: string | null;
          identified_attributes?: Json;
          available_info?: Json;
          missing_info?: Json;
          draft_title?: string | null;
          estimated_price_iqd?: number | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['ai_product_scans']['Insert']>;
      };
    };
    Functions: {
      search_products_custom: {
        Args: {
          search_term?: string;
          city_filter?: string;
          max_budget?: number;
        };
        Returns: Database['public']['Tables']['products']['Row'][];
      };
      calculate_transparency_score: {
        Args: {
          p_id: string;
        };
        Returns: Json;
      };
    };
  };
}
