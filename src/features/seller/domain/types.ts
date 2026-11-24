/**
 * Seller Feature Domain Types
 */

export type SellerApprovalStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface SellerApplicationRecord {
  id: string;
  userId: string;
  storeName: string;
  storeAddress: string;
  storeDescription: string;
  storeCategorySlug: string;
  phone: string;
  governorate: string;
  city: string;
  approvalStatus: SellerApprovalStatus;
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

/** Repository interface for admin seller approval */
export interface SellerApprovalRepository {
  getPendingApplications(): Promise<SellerApplicationRecord[]>;
  approve(sellerId: string, adminId: string): Promise<void>;
  reject(sellerId: string, adminId: string, reason: string): Promise<void>;
  suspend(sellerId: string, adminId: string, reason?: string): Promise<void>;
}

/** Allowed transitions */
export const ALLOWED_SELLER_TRANSITIONS: Record<SellerApprovalStatus, SellerApprovalStatus[]> = {
  pending: ['approved', 'rejected'],
  approved: ['suspended', 'rejected'],
  rejected: ['pending'],
  suspended: ['approved', 'rejected'],
};
