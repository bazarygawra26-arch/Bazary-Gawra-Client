export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type LangCode = 'en' | 'ku' | 'ar';

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          parent_id: string | null;
          slug: string;
          name_en: string;
          name_ku: string;
          name_ar: string;
          icon: string | null;
          image_url: string | null;
          is_active: boolean;
          sort_order: number;
          search_text: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['categories']['Row']> & {
          slug: string;
          name_en: string;
          name_ku: string;
          name_ar: string;
        };
        Update: Partial<Database['public']['Tables']['categories']['Row']>;
      };
      sellers: {
        Row: {
          id: string;
          owner_id: string | null;
          slug: string;
          name_en: string;
          name_ku: string | null;
          name_ar: string | null;
          description_en: string | null;
          description_ku: string | null;
          description_ar: string | null;
          location_id: string | null;
          address: string | null;
          phone: string | null;
          whatsapp: string | null;
          logo_url: string | null;
          verification_status: string;
          is_demo: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['sellers']['Row']> & {
          slug: string;
          name_en: string;
        };
        Update: Partial<Database['public']['Tables']['sellers']['Row']>;
      };
      locations: {
        Row: {
          id: string;
          slug: string;
          name_en: string;
          name_ku: string;
          name_ar: string;
          latitude: number | null;
          longitude: number | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['locations']['Row']> & {
          slug: string;
          name_en: string;
          name_ku: string;
          name_ar: string;
        };
        Update: Partial<Database['public']['Tables']['locations']['Row']>;
      };
      products: {
        Row: {
          id: string;
          slug: string;
          category_id: string | null;
          seller_id: string | null;
          location_id: string | null;
          price: number;
          currency: string;
          brand: string | null;
          model: string | null;
          capacity: string | null;
          power_watts: number | null;
          specs: Json;
          warranty_applicable: boolean;
          warranty_months: number | null;
          warranty_details: string | null;
          delivery_available: boolean;
          delivery_info: string | null;
          return_days: number | null;
          return_policy: string | null;
          origin: string | null;
          image_url: string | null;
          status: string;
          is_demo: boolean;
          view_count: number;
          search_text: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['products']['Row']> & {
          slug: string;
          price: number;
        };
        Update: Partial<Database['public']['Tables']['products']['Row']>;
      };
      product_translations: {
        Row: {
          id: string;
          product_id: string;
          lang: LangCode;
          name: string;
          description: string | null;
        };
        Insert: Partial<Database['public']['Tables']['product_translations']['Row']> & {
          product_id: string;
          lang: LangCode;
          name: string;
        };
        Update: Partial<Database['public']['Tables']['product_translations']['Row']>;
      };
      ai_requests: {
        Row: {
          id: string;
          user_id: string | null;
          session_key: string | null;
          feature: string;
          input_text: string | null;
          input_lang: string | null;
          output_lang: string | null;
          structured_request: Json;
          product_ids: string[] | null;
          response: Json;
          model: string | null;
          prompt_tokens: number | null;
          completion_tokens: number | null;
          latency_ms: number | null;
          status: string;
          error_message: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['ai_requests']['Row']> & {
          feature: string;
        };
        Update: Partial<Database['public']['Tables']['ai_requests']['Row']>;
      };
      ai_chat_sessions: {
        Row: {
          id: string;
          user_id: string | null;
          session_key: string | null;
          product_id: string | null;
          lang: LangCode;
          title: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['ai_chat_sessions']['Row']>;
        Update: Partial<Database['public']['Tables']['ai_chat_sessions']['Row']>;
      };
      ai_chat_messages: {
        Row: {
          id: string;
          session_id: string;
          role: string;
          content: string;
          lang: LangCode;
          metadata: Json;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['ai_chat_messages']['Row']> & {
          session_id: string;
          role: string;
          content: string;
        };
        Update: Partial<Database['public']['Tables']['ai_chat_messages']['Row']>;
      };
      ai_comparisons: {
        Row: {
          id: string;
          user_id: string | null;
          session_key: string | null;
          product_ids: string[];
          lang: LangCode;
          user_preferences: Json;
          result: Json;
          request_id: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['ai_comparisons']['Row']> & {
          product_ids: string[];
          result: Json;
        };
        Update: Partial<Database['public']['Tables']['ai_comparisons']['Row']>;
      };
      ai_image_analyses: {
        Row: {
          id: string;
          user_id: string | null;
          session_key: string | null;
          storage_path: string | null;
          image_url: string | null;
          detected_category_slug: string | null;
          detected_product_type: string | null;
          visible_attributes: Json;
          visible_text: string | null;
          available_info: Json;
          missing_info: Json;
          summary: string | null;
          summary_lang: LangCode | null;
          confidence: number | null;
          raw_response: Json;
          model: string | null;
          request_id: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['ai_image_analyses']['Row']>;
        Update: Partial<Database['public']['Tables']['ai_image_analyses']['Row']>;
      };
    };
    Functions: {
      search_products: {
        Args: {
          p_query?: string;
          p_category_slug?: string;
          p_location_slug?: string;
          p_min_price?: number;
          p_max_price?: number;
          p_delivery_only?: boolean;
          p_min_warranty_months?: number;
          p_lang?: LangCode;
          p_sort?: string;
          p_limit?: number;
          p_offset?: number;
        };
        Returns: any[];
      };
      get_products_for_comparison: {
        Args: {
          p_product_ids: string[];
          p_lang?: LangCode;
        };
        Returns: any[];
      };
      get_product_context_by_slug: {
        Args: {
          p_slug: string;
          p_lang?: LangCode;
        };
        Returns: any;
      };
      get_product_context: {
        Args: {
          p_product_id: string;
          p_lang?: LangCode;
        };
        Returns: any;
      };
      product_information_check: {
        Args: {
          p_product_id: string;
          p_lang?: LangCode;
        };
        Returns: {
          score: number;
          missing: Array<{ code: string; label: string }>;
          available: Array<{ code: string; label: string }>;
        };
      };
      find_similar_products: {
        Args: {
          p_product_id: string;
          p_limit?: number;
          p_lang?: LangCode;
        };
        Returns: any[];
      };
      get_category_tree: {
        Args: {
          p_lang?: LangCode;
        };
        Returns: any[];
      };
      get_locations: {
        Args: {
          p_lang?: LangCode;
        };
        Returns: Array<{ id: string; slug: string; name: string }>;
      };
      increment_product_view: {
        Args: {
          p_product_id: string;
        };
        Returns: void;
      };
      toggle_favorite: {
        Args: {
          p_product_id: string;
        };
        Returns: boolean;
      };
    };
  };
}
