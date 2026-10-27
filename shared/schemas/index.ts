import { z } from 'zod';

export const userRoleSchema = z.enum(['user', 'owner', 'admin']);
export const registerRoleSchema = z.enum(['user', 'owner']);

export const listingTypeSchema = z.enum(['hostel', 'pg']);
export const roomSharingSchema = z.enum(['single', 'double', 'triple', 'four_plus']);
export const genderPolicySchema = z.enum(['male', 'female', 'any']);
export const listingStatusSchema = z.enum([
  'draft',
  'pending',
  'published',
  'rejected',
  'suspended',
]);
export const availabilityStatusSchema = z.enum(['available', 'limited', 'unavailable']);

export const reportReasonSchema = z.enum([
  'incorrect_information',
  'fake_or_scam',
  'unavailable_property',
  'inappropriate_content',
  'duplicate_listing',
  'other',
]);

export const reportStatusSchema = z.enum(['open', 'under_review', 'resolved', 'dismissed']);

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().trim().email('Enter a valid email address').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long'),
  role: registerRoleSchema.default('user'),
  phone: z
    .string()
    .trim()
    .regex(/^[+]?[0-9\s-]{10,15}$/, 'Enter a valid 10-15 digit phone number')
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : null)),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80).optional(),
  phone: z
    .string()
    .trim()
    .regex(/^[+]?[0-9\s-]{10,15}$/, 'Enter a valid 10-15 digit phone number')
    .nullable()
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : null)),
  role: registerRoleSchema.optional(),
});

export const roomTypeOptionSchema = z.object({
  sharing: roomSharingSchema,
  monthlyRent: z.coerce.number().min(1000, 'Rent must be at least ₹1,000').max(200000),
  availableBeds: z.coerce.number().int().min(0).max(500),
});

export const extraChargeSchema = z.object({
  label: z.string().trim().min(1).max(80),
  amount: z.coerce.number().min(0).max(100000),
  frequency: z.enum(['monthly', 'one_time', 'usage_based']).default('monthly'),
});

export const listingPhotoSchema = z.object({
  url: z
    .string()
    .trim()
    .refine(
      (val) =>
        val.startsWith('http://') ||
        val.startsWith('https://') ||
        val.startsWith('/uploads/') ||
        val.startsWith('data:image/'),
      'Invalid photo URL or upload path'
    ),
  publicId: z.string().optional(),
  caption: z.string().max(140).optional(),
  isPrimary: z.boolean().optional(),
});

export const createListingSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(120),
  type: listingTypeSchema,
  description: z
    .string()
    .trim()
    .min(20, 'Description must be at least 20 characters')
    .max(3000),
  location: z.object({
    city: z.string().trim().min(2, 'City is required').max(60),
    locality: z.string().trim().min(2, 'Locality is required').max(80),
    address: z.string().trim().min(5, 'Approximate address is required').max(250),
    landmark: z.string().trim().max(120).optional(),
    pincode: z.string().trim().max(12).optional(),
    coordinates: z
      .object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
      })
      .nullable()
      .optional()
      .default(null),
  }),
  pricing: z.object({
    monthlyRent: z.coerce.number().min(1000, 'Monthly rent must be at least ₹1,000').max(200000),
    deposit: z.coerce.number().min(0, 'Deposit cannot be negative').max(1000000),
    foodIncluded: z.boolean().default(false),
    electricityIncluded: z.boolean().optional().default(false),
    maintenanceAmount: z.coerce.number().min(0).max(50000).optional().default(0),
    noticePeriodDays: z.coerce.number().int().min(0).max(180).optional().default(30),
    lockInPeriodMonths: z.coerce.number().int().min(0).max(24).optional().default(0),
    extraCharges: z.array(extraChargeSchema).optional().default([]),
  }),
  roomTypes: z
    .array(roomTypeOptionSchema)
    .min(1, 'At least one room sharing configuration is required'),
  amenities: z.array(z.string().trim().min(1)).default([]),
  houseRules: z.array(z.string().trim().min(1)).optional().default([]),
  genderPolicy: genderPolicySchema,
  photos: z.array(listingPhotoSchema).max(12).default([]),
  contact: z.object({
    phone: z
      .string()
      .trim()
      .regex(/^[+]?[0-9\s-]{10,15}$/, 'Enter a valid phone number')
      .nullable()
      .optional()
      .or(z.literal(''))
      .transform((v) => (v ? v : null)),
    email: z
      .string()
      .trim()
      .email('Enter a valid contact email')
      .nullable()
      .optional()
      .or(z.literal(''))
      .transform((v) => (v ? v : null)),
    whatsappEnabled: z.boolean().default(false),
    preferredTime: z.string().trim().max(80).optional(),
  }),
  availability: availabilityStatusSchema.default('available'),
  submitForReview: z.boolean().optional().default(false),
});

export const updateListingSchema = createListingSchema.partial().extend({
  availability: availabilityStatusSchema.optional(),
});

export const moderationActionSchema = z.object({
  status: z.enum(['published', 'rejected', 'suspended']),
  rejectionReason: z.string().trim().max(500).optional().nullable(),
  adminNotes: z.string().trim().max(500).optional().nullable(),
  featured: z.boolean().optional(),
});

export const createReportSchema = z.object({
  reason: reportReasonSchema,
  details: z
    .string()
    .trim()
    .min(10, 'Please provide at least 10 characters of detail')
    .max(1000, 'Details cannot exceed 1000 characters'),
});

export const updateReportSchema = z.object({
  status: reportStatusSchema,
  resolutionNotes: z.string().trim().max(500).optional().nullable(),
});
