export type UserRole = 'user' | 'owner' | 'admin';

export type ListingType = 'hostel' | 'pg';

export type RoomSharingType = 'single' | 'double' | 'triple' | 'four_plus';

export type GenderPolicy = 'male' | 'female' | 'any';

export type ListingStatus = 'draft' | 'pending' | 'published' | 'rejected' | 'suspended';

export type AvailabilityStatus = 'available' | 'limited' | 'unavailable';

export type ReportReason =
  | 'incorrect_information'
  | 'fake_or_scam'
  | 'unavailable_property'
  | 'inappropriate_content'
  | 'duplicate_listing'
  | 'other';

export type ReportStatus = 'open' | 'under_review' | 'resolved' | 'dismissed';

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string | null;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoomTypeOption {
  sharing: RoomSharingType;
  monthlyRent: number;
  availableBeds: number;
}

export interface ExtraCharge {
  label: string;
  amount: number;
  frequency: 'monthly' | 'one_time' | 'usage_based';
}

export interface ListingCoordinates {
  lat: number;
  lng: number;
}

export interface ListingLocation {
  city: string;
  locality: string;
  address: string;
  landmark?: string;
  pincode?: string;
  coordinates: ListingCoordinates | null;
}

export interface ListingPricing {
  monthlyRent: number;
  deposit: number;
  foodIncluded: boolean;
  electricityIncluded?: boolean;
  maintenanceAmount?: number;
  noticePeriodDays?: number;
  lockInPeriodMonths?: number;
  extraCharges: ExtraCharge[];
}

export interface ListingContact {
  phone: string | null;
  email: string | null;
  whatsappEnabled: boolean;
  preferredTime?: string;
}

export interface ListingPhoto {
  url: string;
  publicId?: string;
  caption?: string;
  isPrimary?: boolean;
}

export interface ModerationInfo {
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  rejectionReason?: string | null;
  adminNotes?: string | null;
}

export interface ListingDTO {
  id: string;
  ownerId: string;
  ownerName?: string;
  ownerVerified?: boolean;
  title: string;
  slug: string;
  type: ListingType;
  description: string;
  location: ListingLocation;
  pricing: ListingPricing;
  roomTypes: RoomTypeOption[];
  amenities: string[];
  houseRules: string[];
  genderPolicy: GenderPolicy;
  photos: ListingPhoto[];
  contact: ListingContact;
  status: ListingStatus;
  availability: AvailabilityStatus;
  featured: boolean;
  viewsCount: number;
  moderation?: ModerationInfo;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface FilterMetadata {
  cities: {
    city: string;
    localities: string[];
    count: number;
  }[];
  amenities: string[];
  priceRange: {
    min: number;
    max: number;
  };
  types: ListingType[];
  sharingTypes: RoomSharingType[];
  genderPolicies: GenderPolicy[];
}

export interface ReportDTO {
  id: string;
  reporterId: string;
  reporterName?: string;
  reporterEmail?: string;
  listingId: string;
  listingTitle?: string;
  listingSlug?: string;
  reason: ReportReason;
  details: string;
  status: ReportStatus;
  resolutionNotes?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
