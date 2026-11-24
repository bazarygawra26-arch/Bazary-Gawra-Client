/**
 * Products Feature Domain Types
 */

/** Product publication lifecycle — enforced server-side */
export type ProductPublicationStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'published'
  | 'rejected'
  | 'suspended'
  | 'archived';

/** Repository interface for product moderation */
export interface ProductModerationRepository {
  submitForReview(productId: string, sellerId: string): Promise<void>;
  approveProduct(productId: string, adminId: string, note?: string): Promise<void>;
  rejectProduct(productId: string, adminId: string, reason: string): Promise<void>;
  suspendProduct(productId: string, adminId: string, reason?: string): Promise<void>;
  getPendingProducts(limit?: number, offset?: number): Promise<PendingProductRecord[]>;
}

export interface PendingProductRecord {
  id: string;
  slug: string;
  name: string;
  sellerId: string;
  sellerName: string;
  publicationStatus: ProductPublicationStatus;
  submittedAt: string;
  price: number;
  category: string;
}

/** Allowed transitions for the product moderation state machine */
export const ALLOWED_MODERATION_TRANSITIONS: Record<ProductPublicationStatus, ProductPublicationStatus[]> = {
  draft: ['pending_review'],
  pending_review: ['approved', 'rejected'],
  approved: ['published', 'suspended', 'rejected'],
  published: ['suspended', 'archived'],
  rejected: ['pending_review', 'draft'],
  suspended: ['published', 'archived'],
  archived: [],
};
