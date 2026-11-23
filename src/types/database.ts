export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type LangCode = 'en' | 'ku' | 'ar';
export type MarketplaceRole = 'buyer' | 'seller' | 'retailer' | 'supplier' | 'admin';

export interface Database {
  public: {
    Views: Record<string, never>;
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          country: string | null;
          country_code: string | null;
          governorate: string | null;
          governorate_code: string | null;
          city: string | null;
          role: MarketplaceRole;
          preferred_language: LangCode | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & {
          id: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
        Relationships: [];
      };
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
        Relationships: [];
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
          store_category_slug: string | null;
          website_url: string | null;
          country: string | null;
          country_code: string | null;
          governorate: string | null;
          governorate_code: string | null;
          city: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['sellers']['Row']> & {
          slug: string;
          name_en: string;
        };
        Update: Partial<Database['public']['Tables']['sellers']['Row']>;
        Relationships: [];
      };
      suppliers: {
        Row: {
          id: string;
          owner_id: string;
          business_name: string;
          business_type: 'manufacturer' | 'wholesaler' | 'distributor' | 'importer' | 'supplier';
          contact_person: string | null;
          email: string | null;
          phone: string;
          country: string;
          country_code: string | null;
          governorate: string | null;
          governorate_code: string | null;
          city: string;
          address: string | null;
          description: string | null;
          category_slugs: string[];
          website: string | null;
          logo_url: string | null;
          verification_status: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['suppliers']['Row']> & {
          owner_id: string;
          business_name: string;
          business_type: Database['public']['Tables']['suppliers']['Row']['business_type'];
          phone: string;
          country: string;
          city: string;
        };
        Update: Partial<Database['public']['Tables']['suppliers']['Row']>;
        Relationships: [];
      };
      business_buyer_profiles: {
        Row: {
          owner_id: string;
          business_name: string;
          business_type: 'retail_store' | 'retail_chain' | 'shop' | 'supermarket' | 'distributor' | 'other_business';
          business_address: string;
          description: string | null;
          website: string | null;
          category_slugs: string[];
          country: string | null;
          country_code: string | null;
          governorate: string | null;
          governorate_code: string | null;
          city: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['business_buyer_profiles']['Row']> & {
          owner_id: string;
          business_name: string;
          business_type: Database['public']['Tables']['business_buyer_profiles']['Row']['business_type'];
          business_address: string;
        };
        Update: Partial<Database['public']['Tables']['business_buyer_profiles']['Row']>;
        Relationships: [];
      };
      product_feedback: {
        Row: {
          id: string;
          product_id: string;
          rating: number;
          customer_name: string;
          customer_city: string | null;
          comment: string;
          is_verified: boolean;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['product_feedback']['Row']> & {
          product_id: string;
          rating: number;
          customer_name: string;
          comment: string;
        };
        Update: Partial<Database['public']['Tables']['product_feedback']['Row']>;
        Relationships: [];
      };
      promotions: {
        Row: {
          id: string;
          slug: string;
          title_en: string;
          title_ku: string;
          title_ar: string;
          subtitle_en: string | null;
          subtitle_ku: string | null;
          subtitle_ar: string | null;
          badge_en: string | null;
          badge_ku: string | null;
          badge_ar: string | null;
          image_url: string;
          link_url: string;
          seller_id: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['promotions']['Row']> & {
          slug: string;
          title_en: string;
          title_ku: string;
          title_ar: string;
          image_url: string;
          link_url: string;
        };
        Update: Partial<Database['public']['Tables']['promotions']['Row']>;
        Relationships: [];
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
        Relationships: [];
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
          original_price?: number | null;
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
        Relationships: [];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          url: string;
          sort_order: number;
          is_primary: boolean;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['product_images']['Row']> & {
          product_id: string;
          url: string;
        };
        Update: Partial<Database['public']['Tables']['product_images']['Row']>;
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
    Enums: {
      user_role: MarketplaceRole;
      lang_code: LangCode;
    };
    CompositeTypes: Record<string, never>;
  };
}
