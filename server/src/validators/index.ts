import { z } from 'zod';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  createListingSchema,
  updateListingSchema,
  moderationActionSchema,
  createReportSchema,
  updateReportSchema,
  listingTypeSchema,
  roomSharingSchema,
  genderPolicySchema,
  availabilityStatusSchema,
  listingStatusSchema,
  reportStatusSchema,
} from '@urban-nest/shared';

export {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  createListingSchema,
  updateListingSchema,
  moderationActionSchema,
  createReportSchema,
  updateReportSchema,
};

export const publicListingQuerySchema = z.object({
  q: z.string().trim().optional(),
  city: z.string().trim().optional(),
  locality: z.string().trim().optional(),
  type: listingTypeSchema.optional(),
  sharing: roomSharingSchema.optional(),
  genderPolicy: genderPolicySchema.optional(),
  availability: availabilityStatusSchema.optional(),
  minRent: z.coerce.number().min(0).optional(),
  maxRent: z.coerce.number().min(0).optional(),
  foodIncluded: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  amenities: z.string().trim().optional(), // comma-separated
  featured: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  sort: z
    .enum(['newest', 'rent_asc', 'rent_desc', 'popular'])
    .default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export const adminListingQuerySchema = z.object({
  status: listingStatusSchema.optional(),
  city: z.string().trim().optional(),
  q: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const adminReportQuerySchema = z.object({
  status: reportStatusSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
