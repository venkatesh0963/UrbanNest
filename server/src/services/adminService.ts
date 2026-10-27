import mongoose, { type FilterQuery } from 'mongoose';
import type {
  ListingDTO,
  ListingStatus,
  PaginatedResponse,
  ReportDTO,
  ReportStatus,
  UserDTO,
} from '@urban-nest/shared';
import { ListingModel, type IListing } from '../models/Listing.js';
import { ReportModel, type IReport } from '../models/Report.js';
import { UserModel } from '../models/User.js';
import { AppError } from '../utils/errors.js';

export async function getAdminOverviewStats() {
  const [
    totalListings,
    pendingListings,
    publishedListings,
    rejectedListings,
    suspendedListings,
    openReports,
    totalUsers,
    totalOwners,
  ] = await Promise.all([
    ListingModel.countDocuments(),
    ListingModel.countDocuments({ status: 'pending' }),
    ListingModel.countDocuments({ status: 'published' }),
    ListingModel.countDocuments({ status: 'rejected' }),
    ListingModel.countDocuments({ status: 'suspended' }),
    ReportModel.countDocuments({ status: { $in: ['open', 'under_review'] } }),
    UserModel.countDocuments({ role: 'user' }),
    UserModel.countDocuments({ role: 'owner' }),
  ]);

  return {
    listings: {
      total: totalListings,
      pending: pendingListings,
      published: publishedListings,
      rejected: rejectedListings,
      suspended: suspendedListings,
    },
    reports: {
      open: openReports,
    },
    users: {
      renters: totalUsers,
      owners: totalOwners,
    },
  };
}

export async function listAdminListings(params: {
  status?: ListingStatus;
  city?: string;
  q?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<ListingDTO>> {
  const filter: FilterQuery<IListing> = {};

  if (params.status) {
    filter.status = params.status;
  }
  if (params.city) {
    filter['location.city'] = new RegExp(params.city, 'i');
  }
  if (params.q) {
    const regex = new RegExp(params.q, 'i');
    filter.$or = [
      { title: regex },
      { 'location.city': regex },
      { 'location.locality': regex },
    ];
  }

  const page = Math.max(1, params.page || 1);
  const limit = Math.min(50, Math.max(1, params.limit || 20));
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    ListingModel.find(filter)
      .populate('ownerId', 'name email isVerified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    ListingModel.countDocuments(filter),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    data: items.map((item) => item.toDTO(true)),
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

export async function moderateListing(
  adminId: string,
  listingId: string,
  action: {
    status: 'published' | 'rejected' | 'suspended';
    rejectionReason?: string | null;
    adminNotes?: string | null;
    featured?: boolean;
  }
): Promise<ListingDTO> {
  if (!mongoose.Types.ObjectId.isValid(listingId)) {
    throw new AppError('Invalid listing ID', 400, 'INVALID_ID');
  }

  const listing = await ListingModel.findById(listingId).populate('ownerId', 'name isVerified');
  if (!listing) {
    throw new AppError('Listing not found', 404, 'LISTING_NOT_FOUND');
  }

  listing.status = action.status;
  listing.moderation = {
    reviewedBy: new mongoose.Types.ObjectId(adminId),
    reviewedAt: new Date(),
    rejectionReason:
      action.status === 'rejected' || action.status === 'suspended'
        ? action.rejectionReason || 'Does not meet community guidelines'
        : null,
    adminNotes: action.adminNotes || listing.moderation?.adminNotes || null,
  };

  if (action.featured !== undefined) {
    listing.featured = action.featured;
  }

  await listing.save();
  return listing.toDTO(true);
}

export async function listAdminReports(params: {
  status?: ReportStatus;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<ReportDTO>> {
  const filter: FilterQuery<IReport> = {};
  if (params.status) {
    filter.status = params.status;
  }

  const page = Math.max(1, params.page || 1);
  const limit = Math.min(50, Math.max(1, params.limit || 20));
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    ReportModel.find(filter)
      .populate('reporterId', 'name email')
      .populate('listingId', 'title slug status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    ReportModel.countDocuments(filter),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    data: items.map((r) => r.toDTO()),
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

export async function updateAdminReport(
  adminId: string,
  reportId: string,
  input: {
    status: ReportStatus;
    resolutionNotes?: string | null;
  }
): Promise<ReportDTO> {
  if (!mongoose.Types.ObjectId.isValid(reportId)) {
    throw new AppError('Invalid report ID', 400, 'INVALID_ID');
  }

  const report = await ReportModel.findById(reportId)
    .populate('reporterId', 'name email')
    .populate('listingId', 'title slug');

  if (!report) {
    throw new AppError('Report not found', 404, 'REPORT_NOT_FOUND');
  }

  report.status = input.status;
  if (input.resolutionNotes !== undefined) {
    report.resolutionNotes = input.resolutionNotes;
  }
  report.reviewedBy = new mongoose.Types.ObjectId(adminId);
  report.reviewedAt = new Date();

  await report.save();
  return report.toDTO();
}

export async function listAdminUsers(): Promise<UserDTO[]> {
  const users = await UserModel.find().sort({ createdAt: -1 }).limit(100);
  return users.map((u) => u.toDTO());
}

export async function updateAdminUserStatus(
  userId: string,
  updates: { isActive?: boolean; isVerified?: boolean }
): Promise<UserDTO> {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError('Invalid user ID', 400, 'INVALID_ID');
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  if (updates.isActive !== undefined && user.role !== 'admin') {
    user.isActive = updates.isActive;
  }
  if (updates.isVerified !== undefined) {
    user.isVerified = updates.isVerified;
  }

  await user.save();
  return user.toDTO();
}
