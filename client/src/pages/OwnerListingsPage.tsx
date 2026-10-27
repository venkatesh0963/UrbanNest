import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PlusCircle,
  Edit3,
  Trash2,
  Send,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { api } from '../api/client';
import { formatINR, STATUS_BADGE_STYLES, type AvailabilityStatus } from '../types';

export const OwnerListingsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['owner', 'listings'],
    queryFn: () => api.getOwnerListings(),
  });

  const invalidateAllListingCaches = () => {
    queryClient.invalidateQueries({ queryKey: ['owner'] });
    queryClient.invalidateQueries({ queryKey: ['listings'] });
    queryClient.invalidateQueries({ queryKey: ['admin'] });
  };

  const submitMutation = useMutation({
    mutationFn: (id: string) => api.submitOwnerListing(id),
    onSuccess: invalidateAllListingCaches,
  });

  const availabilityMutation = useMutation({
    mutationFn: ({ id, availability }: { id: string; availability: AvailabilityStatus }) =>
      api.updateOwnerListing(id, { availability }),
    onSuccess: invalidateAllListingCaches,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteOwnerListing(id),
    onSuccess: invalidateAllListingCaches,
  });

  const listings = data?.listings || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-6 sm:flex-row sm:items-center">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-forest-700">
            Inventory Management
          </span>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Manage Your Listings
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Update availability, submit drafts for moderation review, or edit room pricing.
          </p>
        </div>

        <Link to="/owner/listings/new" className="btn-primary">
          <PlusCircle className="h-4 w-4" />
          <span>Create Listing</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 animate-pulse rounded-2xl bg-neutral-100" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-12 text-center">
          <p className="text-base font-semibold text-neutral-800">
            You haven’t listed any properties yet.
          </p>
          <Link to="/owner/listings/new" className="btn-primary mt-4">
            Create Your First Listing
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {listings.map((listing) => {
            const thumb =
              listing.photos[0]?.url ||
              'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80';

            return (
              <div
                key={listing.id}
                className="flex flex-col justify-between gap-5 rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs sm:flex-row sm:items-center"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={thumb}
                    alt={listing.title}
                    className="h-24 w-32 shrink-0 rounded-xl object-cover bg-neutral-100"
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`badge capitalize ${
                          STATUS_BADGE_STYLES[listing.status] || 'bg-neutral-100'
                        }`}
                      >
                        {listing.status}
                      </span>
                      <span className="text-xs font-medium text-neutral-500 uppercase">
                        {listing.type}
                      </span>
                      <span className="text-xs text-neutral-400">
                        • {listing.viewsCount} views
                      </span>
                    </div>

                    <h3 className="mt-1.5 text-base font-bold text-neutral-900">
                      {listing.title}
                    </h3>
                    <p className="text-xs text-neutral-500">
                      {listing.location.address}, {listing.location.locality},{' '}
                      {listing.location.city}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-forest-800">
                      {formatINR(listing.pricing.monthlyRent)} / month • Deposit{' '}
                      {formatINR(listing.pricing.deposit)}
                    </p>

                    {listing.moderation?.rejectionReason && (
                      <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Moderation feedback: {listing.moderation.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick Controls */}
                <div className="flex flex-wrap items-center gap-2.5 sm:justify-end">
                  <select
                    aria-label="Availability status"
                    value={listing.availability}
                    onChange={(e) =>
                      availabilityMutation.mutate({
                        id: listing.id,
                        availability: e.target.value as AvailabilityStatus,
                      })
                    }
                    className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold text-neutral-800 focus:border-forest-600 focus:outline-none"
                  >
                    <option value="available">Available</option>
                    <option value="limited">Limited Beds</option>
                    <option value="unavailable">Full / Unavailable</option>
                  </select>

                  {(listing.status === 'draft' || listing.status === 'rejected') && (
                    <button
                      type="button"
                      onClick={() => submitMutation.mutate(listing.id)}
                      disabled={submitMutation.isPending}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-forest-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-forest-800"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Submit for Review
                    </button>
                  )}

                  {listing.status === 'published' && (
                    <Link
                      to={`/stays/${listing.slug}`}
                      className="btn-secondary px-3 py-2 text-xs"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View Live
                    </Link>
                  )}

                  <Link
                    to={`/owner/listings/${listing.id}/edit`}
                    className="btn-secondary px-3 py-2 text-xs"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Edit
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete "${listing.title}" permanently?`)) {
                        deleteMutation.mutate(listing.id);
                      }
                    }}
                    className="rounded-xl border border-red-200 p-2 text-red-600 hover:bg-red-50"
                    title="Delete listing"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
