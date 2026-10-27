import mongoose, { Schema, Document } from 'mongoose';

export interface IFavourite extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  listingId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const favouriteSchema = new Schema<IFavourite>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    listingId: {
      type: Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Unique compound index on userId and listingId
favouriteSchema.index({ userId: 1, listingId: 1 }, { unique: true });

export const FavouriteModel = mongoose.model<IFavourite>('Favourite', favouriteSchema);
