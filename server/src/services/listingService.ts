import mongoose, { type FilterQuery } from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import type {
  FilterMetadata,
  ListingDTO,
  PaginatedResponse,
} from '@urban-nest/shared';
import { ListingModel, type IListing } from '../models/Listing.js';
import { ReportModel } from '../models/Report.js';
import { AppError } from '../utils/errors.js';
import { generateUniqueListingSlug } from '../utils/slug.js';
import { env } from '../config/env.js';

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function searchPublicListings(params: {
  q?: string;
  city?: string;
  locality?: string;
  type?: 'hostel' | 'pg';
  sharing?: 'single' | 'double' | 'triple' | 'four_plus';
  genderPolicy?: 'male' | 'female' | 'any';
  availability?: 'available' | 'limited' | 'unavailable';
  minRent?: number;
  maxRent?: number;
  foodIncluded?: boolean;
  amenities?: string;
  featured?: boolean;
  sort?: 'newest' | 'rent_asc' | 'rent_desc' | 'popular';
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<ListingDTO>> {
  const filter: FilterQuery<IListing> = {
    status: 'published',
  };

  if (params.city) {
    filter['location.city'] = new RegExp(`^${escapeRegex(params.city)}$`, 'i');
  }

  if (params.locality) {
    filter['location.locality'] = new RegExp(escapeRegex(params.locality), 'i');
  }

  if (params.type) {
    filter.type = params.type;
  }

  if (params.sharing) {
    filter['roomTypes.sharing'] = params.sharing;
  }

  if (params.genderPolicy) {
    filter.genderPolicy = params.genderPolicy;
  }

  if (params.availability) {
    filter.availability = params.availability;
  }

  if (params.minRent !== undefined || params.maxRent !== undefined) {
    filter['pricing.monthlyRent'] = {};
    if (params.minRent !== undefined) {
      filter['pricing.monthlyRent'].$gte = params.minRent;
    }
    if (params.maxRent !== undefined) {
      filter['pricing.monthlyRent'].$lte = params.maxRent;
    }
  }

  if (params.foodIncluded !== undefined) {
    filter['pricing.foodIncluded'] = params.foodIncluded;
  }

  if (params.featured !== undefined) {
    filter.featured = params.featured;
  }

  if (params.amenities) {
    const requestedAmenities = params.amenities
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);
    if (requestedAmenities.length > 0) {
      filter.amenities = { $all: requestedAmenities };
    }
  }

  if (params.q) {
    const regex = new RegExp(escapeRegex(params.q), 'i');
    filter.$or = [
      { title: regex },
      { description: regex },
      { 'location.city': regex },
      { 'location.locality': regex },
      { 'location.address': regex },
    ];
  }

  const page = Math.max(1, params.page || 1);
  const limit = Math.min(50, Math.max(1, params.limit || 12));
  const skip = (page - 1) * limit;

  let sortOption: Record<string, 1 | -1> = { createdAt: -1, featured: -1 };
  switch (params.sort) {
    case 'rent_asc':
      sortOption = { 'pricing.monthlyRent': 1, createdAt: -1 };
      break;
    case 'rent_desc':
      sortOption = { 'pricing.monthlyRent': -1, createdAt: -1 };
      break;
    case 'popular':
      sortOption = { viewsCount: -1, featured: -1 };
      break;
    case 'newest':
    default:
      sortOption = { createdAt: -1, featured: -1 };
      break;
  }

  const [items, total] = await Promise.all([
    ListingModel.find(filter)
      .populate('ownerId', 'name isVerified')
      .sort(sortOption)
      .skip(skip)
      .limit(limit),
    ListingModel.countDocuments(filter),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    data: items.map((item) => item.toDTO(false)),
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

export async function getPublicListingBySlug(slug: string): Promise<ListingDTO> {
  const listing = await ListingModel.findOneAndUpdate(
    { slug: slug.toLowerCase().trim(), status: 'published' },
    { $inc: { viewsCount: 1 } },
    { new: true }
  ).populate('ownerId', 'name isVerified');

  if (!listing) {
    throw new AppError('Property not found or no longer published.', 404, 'LISTING_NOT_FOUND');
  }

  return listing.toDTO(false);
}

export async function getSupportedFilters(): Promise<FilterMetadata> {
  const published = await ListingModel.find({ status: 'published' }).select(
    'location.city location.locality amenities pricing.monthlyRent'
  );

  const cityMap = new Map<string, { localities: Set<string>; count: number }>();
  const amenitiesSet = new Set<string>([
    'Wi-Fi',
    'Food',
    'Laundry',
    'Power Backup',
    'AC',
    'CCTV Security',
    'Housekeeping',
    'Gym',
    'Two-Wheeler Parking',
    'Study Desk',
    'RO Water',
    'Geyser',
  ]);

  let minPrice = 4000;
  let maxPrice = 25000;

  if (published.length > 0) {
    minPrice = Math.min(...published.map((l) => l.pricing.monthlyRent));
    maxPrice = Math.max(...published.map((l) => l.pricing.monthlyRent));
  }

  for (const item of published) {
    const city = item.location.city;
    const locality = item.location.locality;
    if (!cityMap.has(city)) {
      cityMap.set(city, { localities: new Set(), count: 0 });
    }
    const entry = cityMap.get(city)!;
    entry.localities.add(locality);
    entry.count += 1;

    for (const amenity of item.amenities || []) {
      amenitiesSet.add(amenity);
    }
  }

  const cities = Array.from(cityMap.entries())
    .map(([city, info]) => ({
      city,
      localities: Array.from(info.localities).sort(),
      count: info.count,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    cities,
    amenities: Array.from(amenitiesSet).sort(),
    priceRange: {
      min: minPrice,
      max: maxPrice,
    },
    types: ['pg', 'hostel'],
    sharingTypes: ['single', 'double', 'triple', 'four_plus'],
    genderPolicies: ['any', 'male', 'female'],
  };
}

export async function createReportForListing(input: {
  reporterId: string;
  listingId: string;
  reason:
    | 'incorrect_information'
    | 'fake_or_scam'
    | 'unavailable_property'
    | 'inappropriate_content'
    | 'duplicate_listing'
    | 'other';
  details: string;
}) {
  if (!mongoose.Types.ObjectId.isValid(input.listingId)) {
    throw new AppError('Invalid listing ID', 400, 'INVALID_ID');
  }
  const listing = await ListingModel.findById(input.listingId);
  if (!listing) {
    throw new AppError('Listing not found', 404, 'LISTING_NOT_FOUND');
  }

  const report = await ReportModel.create({
    reporterId: new mongoose.Types.ObjectId(input.reporterId),
    listingId: listing._id,
    reason: input.reason,
    details: input.details,
    status: 'open',
  });

  return report.toDTO();
}

export async function getOwnerListings(ownerId: string): Promise<ListingDTO[]> {
  const listings = await ListingModel.find({ ownerId }).sort({ updatedAt: -1 });
  return listings.map((l) => l.toDTO(true));
}

export async function getOwnerListingById(ownerId: string, listingId: string, isAdmin = false): Promise<ListingDTO> {
  if (!mongoose.Types.ObjectId.isValid(listingId)) {
    throw new AppError('Invalid listing ID', 400, 'INVALID_ID');
  }
  const listing = await ListingModel.findById(listingId).populate('ownerId', 'name isVerified');
  if (!listing) {
    throw new AppError('Listing not found', 404, 'LISTING_NOT_FOUND');
  }

  const rawOwner = listing.ownerId as unknown as { _id?: mongoose.Types.ObjectId } | mongoose.Types.ObjectId;
  const recordOwnerId =
    rawOwner && typeof rawOwner === 'object' && '_id' in rawOwner && rawOwner._id
      ? rawOwner._id.toString()
      : String(rawOwner);

  if (!isAdmin && recordOwnerId !== ownerId) {
    throw new AppError('You do not own this listing.', 403, 'FORBIDDEN');
  }

  return listing.toDTO(true);
}

export async function createOwnerListing(
  ownerId: string,
  payload: Record<string, unknown>
): Promise<ListingDTO> {
  const title = String(payload.title);
  const location = payload.location as { city: string; locality: string };
  const slug = await generateUniqueListingSlug(title, location.locality);
  const submitForReview = Boolean(payload.submitForReview);

  const listing = await ListingModel.create({
    ...payload,
    ownerId: new mongoose.Types.ObjectId(ownerId),
    slug,
    status: submitForReview ? 'published' : 'draft',
  });

  return listing.toDTO(true);
}

export async function updateOwnerListing(
  ownerId: string,
  listingId: string,
  payload: Record<string, unknown>,
  isAdmin = false
): Promise<ListingDTO> {
  if (!mongoose.Types.ObjectId.isValid(listingId)) {
    throw new AppError('Invalid listing ID', 400, 'INVALID_ID');
  }

  const listing = await ListingModel.findById(listingId);
  if (!listing) {
    throw new AppError('Listing not found', 404, 'LISTING_NOT_FOUND');
  }

  if (!isAdmin && listing.ownerId.toString() !== ownerId) {
    throw new AppError('You do not own this listing.', 403, 'FORBIDDEN');
  }

  const { submitForReview, ...fields } = payload;

  Object.assign(listing, fields);

  if (submitForReview === true) {
    listing.status = 'published';
    listing.moderation.rejectionReason = null;
  } else if (listing.status === 'rejected' && !isAdmin) {
    // Editing a rejected listing moves it back to draft until resubmitted
    listing.status = 'draft';
  }

  await listing.save();
  return listing.toDTO(true);
}

export async function deleteOwnerListing(
  ownerId: string,
  listingId: string,
  isAdmin = false
): Promise<void> {
  if (!mongoose.Types.ObjectId.isValid(listingId)) {
    throw new AppError('Invalid listing ID', 400, 'INVALID_ID');
  }

  const listing = await ListingModel.findById(listingId);
  if (!listing) {
    throw new AppError('Listing not found', 404, 'LISTING_NOT_FOUND');
  }

  if (!isAdmin && listing.ownerId.toString() !== ownerId) {
    throw new AppError('You do not own this listing.', 403, 'FORBIDDEN');
  }

  await listing.deleteOne();
}

export async function submitOwnerListingForReview(
  ownerId: string,
  listingId: string
): Promise<ListingDTO> {
  if (!mongoose.Types.ObjectId.isValid(listingId)) {
    throw new AppError('Invalid listing ID', 400, 'INVALID_ID');
  }

  const listing = await ListingModel.findById(listingId);
  if (!listing) {
    throw new AppError('Listing not found', 404, 'LISTING_NOT_FOUND');
  }

  if (listing.ownerId.toString() !== ownerId) {
    throw new AppError('You do not own this listing.', 403, 'FORBIDDEN');
  }

  if (!listing.contact.phone && !listing.contact.email) {
    throw new AppError(
      'Please provide at least one contact method (phone or email) before submitting for review.',
      400,
      'CONTACT_REQUIRED'
    );
  }

  listing.status = 'pending';
  listing.moderation.rejectionReason = null;
  await listing.save();

  return listing.toDTO(true);
}

export function generatePhotoUploadSignature(ownerId: string, listingId: string) {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder = `${env.CLOUDINARY_FOLDER}/owners/${ownerId}/${listingId}`;

  if (
    env.CLOUDINARY_CLOUD_NAME &&
    env.CLOUDINARY_API_KEY &&
    env.CLOUDINARY_API_SECRET
  ) {
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      env.CLOUDINARY_API_SECRET
    );
    return {
      mode: 'cloudinary' as const,
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      apiKey: env.CLOUDINARY_API_KEY,
      timestamp,
      folder,
      signature,
      uploadUrl: `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`,
    };
  }

  // Fallback for local dev when Cloudinary keys are not configured
  return {
    mode: 'direct' as const,
    timestamp,
    folder,
    message:
      'Cloudinary credentials not configured in .env; direct image URLs and curated stock presets are enabled.',
  };
}
