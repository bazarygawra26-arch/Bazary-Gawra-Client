/**
 * Platform-wide shared constants.
 * Import from here — do not scatter magic numbers across the codebase.
 */

/** AI prompt quota limit per user (testing phase) */
export const AI_PROMPT_QUOTA_LIMIT = 10;

/** Subscription plan limits */
export const SUBSCRIPTION_LIMITS = {
  free: {
    maxListings: 5,
    monthlyPriceIqd: 0,
    name: 'Free Starter',
  },
  pro: {
    maxListings: 50,
    monthlyPriceIqd: 10_000,
    name: 'Pro Merchant',
  },
} as const;

/** Sponsored listing price */
export const SPONSORED_LISTING_PRICE_IQD = 5_000;
export const SPONSORED_LISTING_DURATION_DAYS = 7;

/** Low stock threshold default */
export const DEFAULT_LOW_STOCK_THRESHOLD = 3;

/** Currency */
export const DEFAULT_CURRENCY = 'IQD' as const;

/** Product publication statuses in display order */
export const PUBLICATION_STATUSES = [
  'draft',
  'pending_review',
  'approved',
  'published',
  'rejected',
  'suspended',
  'archived',
] as const;

/** Seller application statuses */
export const APPROVAL_STATUSES = ['pending', 'approved', 'rejected', 'suspended'] as const;

/** Supported platform languages */
export const SUPPORTED_LANGUAGES = ['en', 'ku', 'ckb', 'ar'] as const;

/** Brand colors */
export const BRAND_COLORS = {
  darkGreen: '#18794E',
  goldenYellow: '#F4B83F',
  white: '#FFFFFF',
  darkCharcoal: '#202820',
} as const;
