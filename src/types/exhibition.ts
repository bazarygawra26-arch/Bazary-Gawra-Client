export interface ExhibitionProduct {
  id: string;
  slug?: string;
  name_en: string;
  name_ku: string;
  name_ar: string;
  image_url: string;
  regular_price: number;
  expo_price: number;
  currency: 'IQD' | 'USD';
  discount_percent: number;
  warranty_ku?: string;
  warranty_en?: string;
  warranty_ar?: string;
  in_stock_at_booth: boolean;
  demo_available: boolean;
  brand?: string;
}

export interface ExhibitionBooth {
  booth_number: string; // e.g. "A-12"
  hall_ku: string;
  hall_en: string;
  hall_ar: string;
  zone_id: 'zone-a' | 'zone-b' | 'zone-c' | 'zone-d';
  zone_name_ku: string;
  zone_name_en: string;
  zone_name_ar: string;
  size_meters: string; // e.g. "36 m² (6x6m Island Pavilion)"
  status: 'open' | 'live_demo' | 'presentation';
  manager_name: string;
  manager_title_ku: string;
  manager_title_en: string;
  manager_title_ar: string;
  phone: string;
  whatsapp: string;
  location_hint_ku: string;
  location_hint_en: string;
  location_hint_ar: string;
}

export interface ExhibitionLiveSchedule {
  time: string;
  title_ku: string;
  title_en: string;
  title_ar: string;
  host_ku: string;
  host_en: string;
  host_ar: string;
}

export interface ExhibitionShop {
  id: string;
  slug: string;
  name_en: string;
  name_ku: string;
  name_ar: string;
  logo_url: string;
  cover_image?: string;
  seller_slug?: string;
  is_official_distributor: boolean;
  verified: boolean;
  badge_ku: string;
  badge_en: string;
  badge_ar: string;
  brands: string[];
  description_en: string;
  description_ku: string;
  description_ar: string;
  city: string;
  city_ku: string;
  city_ar: string;
  city_en: string;
  showroom_address_ku: string;
  showroom_address_en: string;
  showroom_address_ar: string;
  phone: string;
  whatsapp: string;
  rating: number;
  review_count: number;
  booth: ExhibitionBooth;
  products: ExhibitionProduct[];
  live_schedule: ExhibitionLiveSchedule[];
}

export interface ExhibitionZone {
  id: 'zone-a' | 'zone-b' | 'zone-c' | 'zone-d';
  name_ku: string;
  name_en: string;
  name_ar: string;
  hall_ku: string;
  hall_en: string;
  hall_ar: string;
  description_ku: string;
  description_en: string;
  description_ar: string;
  accent_color: string;
}

export interface Exhibition {
  id: string;
  slug: string;
  title_en: string;
  title_ku: string;
  title_ar: string;
  badge_en: string;
  badge_ku: string;
  badge_ar: string;
  subtitle_en: string;
  subtitle_ku: string;
  subtitle_ar: string;
  hero_image: string;
  dates_display_ku: string;
  dates_display_en: string;
  dates_display_ar: string;
  timing_ku: string;
  timing_en: string;
  timing_ar: string;
  venue_name_ku: string;
  venue_name_en: string;
  venue_name_ar: string;
  venue_city_ku: string;
  venue_city_en: string;
  venue_city_ar: string;
  venue_address_ku: string;
  venue_address_en: string;
  venue_address_ar: string;
  organizer_whatsapp: string;
  organizer_phone: string;
  stats: {
    total_shops: number;
    total_booths: number;
    max_discount_percent: number;
    free_entry: boolean;
  };
  zones: ExhibitionZone[];
  shops: ExhibitionShop[];
}
