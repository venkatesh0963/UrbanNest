import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/errors.js';
import {
  searchPublicListings,
  getPublicListingBySlug,
  getSupportedFilters,
  createReportForListing,
} from '../services/listingService.js';

export const getPublicListingsHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await searchPublicListings(req.query as Record<string, unknown>);
  res.status(200).json(result);
});

export const getPublicListingBySlugHandler = asyncHandler(async (req: Request, res: Response) => {
  const listing = await getPublicListingBySlug(String(req.params.slug));
  res.status(200).json({ listing });
});

export const getSupportedFiltersHandler = asyncHandler(async (_req: Request, res: Response) => {
  const filters = await getSupportedFilters();
  res.status(200).json(filters);
});

export const reportListingHandler = asyncHandler(async (req: Request, res: Response) => {
  const report = await createReportForListing({
    reporterId: req.user!._id.toString(),
    listingId: String(req.params.id),
    reason: req.body.reason,
    details: req.body.details,
  });
  res.status(201).json({ report });
});
