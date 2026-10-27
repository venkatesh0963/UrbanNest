import mongoose from 'mongoose';
import type { ListingDTO } from '@urban-nest/shared';
import { FavouriteModel } from '../models/Favourite.js';
import { ListingModel, type IListing } from '../models/Listing.js';
import { AppError } from '../utils/errors.js';

export async function getUserFavourites(userId: string): Promise<{
  listings: ListingDTO[];
  listingIds: string[];
}> {
  const records = await FavouriteModel.find({ userId })
    .sort({ createdAt: -1 })
    .populate({
      path: 'listingId',
      populate: { path: 'ownerId', select: 'name isVerified' },
    });

  const listings: ListingDTO[] = [];
  const listingIds: string[] = [];

  for (const record of records) {
    const populatedListing = record.listingId as unknown as IListing | null;
    if (populatedListing && '_id' in populatedListing && populatedListing.status === 'published') {
      listings.push(populatedListing.toDTO(false));
      listingIds.push(populatedListing._id.toString());
    }
  }

  return { listings, listingIds };
}

export async function addFavourite(userId: string, listingId: string): Promise<{ saved: boolean; listingId: string }> {
  if (!mongoose.Types.ObjectId.isValid(listingId)) {
    throw new AppError('Invalid listing ID', 400, 'INVALID_ID');
  }

  const listing = await ListingModel.findOne({
    _id: listingId,
    status: 'published',
  });
  if (!listing) {
    throw new AppError('Published property not found', 404, 'LISTING_NOT_FOUND');
  }

  await FavouriteModel.findOneAndUpdate(
    {
      userId: new mongoose.Types.ObjectId(userId),
      listingId: new mongoose.Types.ObjectId(listingId),
    },
    {
      $setOnInsert: {
        userId: new mongoose.Types.ObjectId(userId),
        listingId: new mongoose.Types.ObjectId(listingId),
      },
    },
    { upsert: true, new: true }
  );

  return { saved: true, listingId };
}

export async function removeFavourite(userId: string, listingId: string): Promise<{ saved: boolean; listingId: string }> {
  if (!mongoose.Types.ObjectId.isValid(listingId)) {
    throw new AppError('Invalid listing ID', 400, 'INVALID_ID');
  }

  await FavouriteModel.deleteOne({
    userId: new mongoose.Types.ObjectId(userId),
    listingId: new mongoose.Types.ObjectId(listingId),
  });

  return { saved: false, listingId };
}
