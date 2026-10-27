import mongoose, { Schema, Document } from 'mongoose';
import type { ReportReason, ReportStatus, ReportDTO } from '@urban-nest/shared';

export interface IReport extends Document {
  _id: mongoose.Types.ObjectId;
  reporterId: mongoose.Types.ObjectId;
  listingId: mongoose.Types.ObjectId;
  reason: ReportReason;
  details: string;
  status: ReportStatus;
  resolutionNotes: string | null;
  reviewedBy: mongoose.Types.ObjectId | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  toDTO(): ReportDTO;
}

const reportSchema = new Schema<IReport>(
  {
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    listingId: {
      type: Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    reason: {
      type: String,
      enum: [
        'incorrect_information',
        'fake_or_scam',
        'unavailable_property',
        'inappropriate_content',
        'duplicate_listing',
        'other',
      ],
      required: true,
    },
    details: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['open', 'under_review', 'resolved', 'dismissed'],
      default: 'open',
    },
    resolutionNotes: {
      type: String,
      default: null,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index on status and createdAt for administrative queues
reportSchema.index({ status: 1, createdAt: -1 });

reportSchema.methods.toDTO = function (this: IReport): ReportDTO {
  const populatedReporter =
    this.reporterId && typeof this.reporterId === 'object' && 'name' in this.reporterId
      ? (this.reporterId as unknown as { _id: mongoose.Types.ObjectId; name: string; email: string })
      : null;

  const populatedListing =
    this.listingId && typeof this.listingId === 'object' && 'title' in this.listingId
      ? (this.listingId as unknown as { _id: mongoose.Types.ObjectId; title: string; slug: string })
      : null;

  return {
    id: this._id.toString(),
    reporterId: populatedReporter ? populatedReporter._id.toString() : this.reporterId.toString(),
    reporterName: populatedReporter ? populatedReporter.name : undefined,
    reporterEmail: populatedReporter ? populatedReporter.email : undefined,
    listingId: populatedListing ? populatedListing._id.toString() : this.listingId.toString(),
    listingTitle: populatedListing ? populatedListing.title : undefined,
    listingSlug: populatedListing ? populatedListing.slug : undefined,
    reason: this.reason,
    details: this.details,
    status: this.status,
    resolutionNotes: this.resolutionNotes,
    reviewedBy: this.reviewedBy ? this.reviewedBy.toString() : null,
    reviewedAt: this.reviewedAt ? this.reviewedAt.toISOString() : null,
    createdAt: this.createdAt.toISOString(),
    updatedAt: this.updatedAt.toISOString(),
  };
};

export const ReportModel = mongoose.model<IReport>('Report', reportSchema);
