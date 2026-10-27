import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/errors.js';
import {
  getUserFavourites,
  addFavourite,
  removeFavourite,
} from '../services/favouriteService.js';

export const listFavouritesHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await getUserFavourites(req.user!._id.toString());
  res.status(200).json(result);
});

export const addFavouriteHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await addFavourite(req.user!._id.toString(), String(req.params.listingId));
  res.status(200).json(result);
});

export const removeFavouriteHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await removeFavourite(req.user!._id.toString(), String(req.params.listingId));
  res.status(200).json(result);
});
