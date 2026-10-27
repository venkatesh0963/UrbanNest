import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/errors.js';
import {
  getOwnerListings,
  getOwnerListingById,
  createOwnerListing,
  updateOwnerListing,
  deleteOwnerListing,
  submitOwnerListingForReview,
  generatePhotoUploadSignature,
} from '../services/listingService.js';
import { processAndStorePhotos } from '../services/uploadService.js';

export const listOwnerListingsHandler = asyncHandler(async (req: Request, res: Response) => {
  const listings = await getOwnerListings(req.user!._id.toString());
  res.status(200).json({ listings });
});

export const getOwnerListingHandler = asyncHandler(async (req: Request, res: Response) => {
  const isAdmin = req.user!.role === 'admin';
  const listing = await getOwnerListingById(
    req.user!._id.toString(),
    String(req.params.id),
    isAdmin
  );
  res.status(200).json({ listing });
});

export const createOwnerListingHandler = asyncHandler(async (req: Request, res: Response) => {
  const listing = await createOwnerListing(req.user!._id.toString(), req.body);
  res.status(201).json({ listing });
});

export const updateOwnerListingHandler = asyncHandler(async (req: Request, res: Response) => {
  const isAdmin = req.user!.role === 'admin';
  const listing = await updateOwnerListing(
    req.user!._id.toString(),
    String(req.params.id),
    req.body,
    isAdmin
  );
  res.status(200).json({ listing });
});

export const deleteOwnerListingHandler = asyncHandler(async (req: Request, res: Response) => {
  const isAdmin = req.user!.role === 'admin';
  await deleteOwnerListing(req.user!._id.toString(), String(req.params.id), isAdmin);
  res.status(200).json({ message: 'Listing deleted successfully' });
});

export const submitOwnerListingHandler = asyncHandler(async (req: Request, res: Response) => {
  const listing = await submitOwnerListingForReview(
    req.user!._id.toString(),
    String(req.params.id)
  );
  res.status(200).json({ listing });
});

export const requestPhotoSignatureHandler = asyncHandler(async (req: Request, res: Response) => {
  const isAdmin = req.user!.role === 'admin';
  // Verify ownership first
  await getOwnerListingById(req.user!._id.toString(), String(req.params.id), isAdmin);
  const signatureData = generatePhotoUploadSignature(
    req.user!._id.toString(),
    String(req.params.id)
  );
  res.status(200).json(signatureData);
});

export const uploadPhotosHandler = asyncHandler(async (req: Request, res: Response) => {
  const photos = await processAndStorePhotos(
    req.user!._id.toString(),
    req.body?.files || []
  );
  res.status(201).json({ photos });
});
