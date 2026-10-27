import mongoose, { Schema, Document } from 'mongoose';
import type {
  ListingType,
  GenderPolicy,
  ListingStatus,
  AvailabilityStatus,
  RoomTypeOption,
  ListingLocation,
  ListingPricing,
  ListingContact,
  ListingPhoto,
  ModerationInfo,
  ListingDTO,
} from '@urban-nest/shared';

export interface IListing extends Document {
  _id: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
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
  moderation: {
    reviewedBy: mongoose.Types.ObjectId | null;
    reviewedAt: Date | null;
    rejectionReason: string | null;
    adminNotes: string | null;
  };
  createdAt: Date;
  updatedAt: Date;
  toDTO(includeModeration?: boolean): ListingDTO;
}

const roomTypeSchema = new Schema<RoomTypeOption>(
  {
    sharing: {
      type: String,
      enum: ['single', 'double', 'triple', 'four_plus'],
      required: true,
    },
    monthlyRent: { type: Number, required: true, min: 0 },
    availableBeds: { type: Number, required: true, min: 0, default: 1 },
  },
  { _id: false }
);

const extraChargeSchema = new Schema(
  {
    label: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    frequency: {
      type: String,
      enum: ['monthly', 'one_time', 'usage_based'],
      default: 'monthly',
    },
  },
  { _id: false }
);

const photoSchema = new Schema<ListingPhoto>(
  {
    url: { type: String, required: true },
    publicId: { type: String },
    caption: { type: String },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: false }
);

const listingSchema = new Schema<IListing>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['hostel', 'pg'],
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    location: {
      city: { type: String, required: true, trim: true },
      locality: { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true },
      landmark: { type: String, trim: true },
      pincode: { type: String, trim: true },
      coordinates: {
        type: {
          lat: { type: Number },
          lng: { type: Number },
        },
        default: null,
        _id: false,
      },
    },
    pricing: {
      monthlyRent: { type: Number, required: true, min: 0 },
      deposit: { type: Number, required: true, min: 0 },
      foodIncluded: { type: Boolean, default: false },
      electricityIncluded: { type: Boolean, default: false },
      maintenanceAmount: { type: Number, default: 0, min: 0 },
      noticePeriodDays: { type: Number, default: 30, min: 0 },
      lockInPeriodMonths: { type: Number, default: 0, min: 0 },
      extraCharges: { type: [extraChargeSchema], default: [] },
    },
    roomTypes: {
      type: [roomTypeSchema],
      required: true,
      validate: [(v: RoomTypeOption[]) => v.length > 0, 'At least one room type is required'],
    },
    amenities: {
      type: [String],
      default: [],
    },
    houseRules: {
      type: [String],
      default: [],
    },
    genderPolicy: {
      type: String,
      enum: ['male', 'female', 'any'],
      required: true,
    },
    photos: {
      type: [photoSchema],
      default: [],
    },
    contact: {
      phone: { type: String, default: null },
      email: { type: String, default: null },
      whatsappEnabled: { type: Boolean, default: false },
      preferredTime: { type: String, default: '9:00 AM – 8:00 PM' },
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'published', 'rejected', 'suspended'],
      default: 'pending',
    },
    availability: {
      type: String,
      enum: ['available', 'limited', 'unavailable'],
      default: 'available',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    moderation: {
      reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
      reviewedAt: { type: Date, default: null },
      rejectionReason: { type: String, default: null },
      adminNotes: { type: String, default: null },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for primary discovery search
listingSchema.index({ status: 1, 'location.city': 1, 'location.locality': 1 });
// Additional query pattern indexes
listingSchema.index({ type: 1, 'pricing.monthlyRent': 1, availability: 1 });

listingSchema.methods.toDTO = function (this: IListing, includeModeration = false): ListingDTO {
  const populatedOwner =
    this.ownerId && typeof this.ownerId === 'object' && 'name' in this.ownerId
      ? (this.ownerId as unknown as { _id: mongoose.Types.ObjectId; name: string; isVerified?: boolean })
      : null;

  const dto: ListingDTO = {
    id: this._id.toString(),
    ownerId: populatedOwner ? populatedOwner._id.toString() : this.ownerId.toString(),
    ownerName: populatedOwner ? populatedOwner.name : undefined,
    ownerVerified: populatedOwner ? Boolean(populatedOwner.isVerified) : undefined,
    title: this.title,
    slug: this.slug,
    type: this.type,
    description: this.description,
    location: {
      city: this.location.city,
      locality: this.location.locality,
      address: this.location.address,
      landmark: this.location.landmark,
      pincode: this.location.pincode,
      coordinates: this.location.coordinates || null,
    },
    pricing: {
      monthlyRent: this.pricing.monthlyRent,
      deposit: this.pricing.deposit,
      foodIncluded: this.pricing.foodIncluded,
      electricityIncluded: this.pricing.electricityIncluded,
      maintenanceAmount: this.pricing.maintenanceAmount,
      noticePeriodDays: this.pricing.noticePeriodDays,
      lockInPeriodMonths: this.pricing.lockInPeriodMonths,
      extraCharges: this.pricing.extraCharges || [],
    },
    roomTypes: this.roomTypes.map((rt) => ({
      sharing: rt.sharing,
      monthlyRent: rt.monthlyRent,
      availableBeds: rt.availableBeds,
    })),
    amenities: this.amenities || [],
    houseRules: this.houseRules || [],
    genderPolicy: this.genderPolicy,
    photos: (this.photos || []).map((p) => ({
      url: p.url,
      publicId: p.publicId,
      caption: p.caption,
      isPrimary: p.isPrimary,
    })),
    contact: {
      phone: this.contact?.phone || null,
      email: this.contact?.email || null,
      whatsappEnabled: Boolean(this.contact?.whatsappEnabled),
      preferredTime: this.contact?.preferredTime,
    },
    status: this.status,
    availability: this.availability,
    featured: this.featured,
    viewsCount: this.viewsCount,
    createdAt: this.createdAt.toISOString(),
    updatedAt: this.updatedAt.toISOString(),
  };

  if (includeModeration && this.moderation) {
    const moderationInfo: ModerationInfo = {
      reviewedBy: this.moderation.reviewedBy ? this.moderation.reviewedBy.toString() : null,
      reviewedAt: this.moderation.reviewedAt ? this.moderation.reviewedAt.toISOString() : null,
      rejectionReason: this.moderation.rejectionReason || null,
      adminNotes: this.moderation.adminNotes || null,
    };
    dto.moderation = moderationInfo;
  }

  return dto;
};

export const ListingModel = mongoose.model<IListing>('Listing', listingSchema);
