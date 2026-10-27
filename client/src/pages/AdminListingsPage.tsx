import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Ban,
  ExternalLink,
  Star,
} from 'lucide-react';
import { api } from '../api/client';
import {
  formatINR,
  STATUS_BADGE_STYLES,
  type ListingStatus,
} from '../types';

export const AdminListingsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = (searchParams.get('status') as ListingStatus) || undefined;
  const [rejectionNotes, setRejectionNotes] = useState<Record<string, string>>({});

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'listings', statusFilter],
    queryFn: () => api.getAdminListings({ status: statusFilter }),
    refetchInterval: 5000,
  });

  const moderateMutation = useMutation({
    mutationFn: ({
      id,
      status,
      rejectionReason,
      featured,
    }: {
      id: string;
      status: 'published' | 'rejected' | 'suspended';
      rejectionReason?: string;
      featured?: boolean;
    }) =>
      api.moderateListing(id, {
        status,
        rejectionReason,
        featured,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'listings'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });

  const listings = data?.data || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        to="/admin"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Admin Dashboard
      </Link>

      <div className="mt-4 flex flex-col justify-between gap-4 border-b border-neutral-200 pb-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Property Submissions & Moderation
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Verify listing details, photos, and contact info before approving for public search.
          </p>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: 'All', value: '' },
            { label: 'Pending', value: 'pending' },
            { label: 'Published', value: 'published' },
            { label: 'Rejected', value: 'rejected' },
            { label: 'Suspended', value: 'suspended' },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                if (tab.value) {
                  setSearchParams({ status: tab.value });
                } else {
                  setSearchParams({});
                }
              }}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                (statusFilter || '') === tab.value
                  ? 'bg-forest-700 text-white'
                  : 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-36 animate-pulse rounded-2xl bg-neutral-100" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-12 text-center">
          <p className="text-sm font-medium text-neutral-600">
            No listings match the selected status filter.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {listings.map((item) => {
            const thumb =
              item.photos[0]?.url ||
              'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80';

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs"
              >
                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                  <div className="flex items-start gap-4">
                    <img
                      src={thumb}
                      alt={item.title}
                      className="h-24 w-32 shrink-0 rounded-xl object-cover bg-neutral-100"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`badge capitalize ${
                            STATUS_BADGE_STYLES[item.status] || 'bg-neutral-100'
                          }`}
                        >
                          {item.status}
                        </span>
                        <span className="text-xs font-semibold uppercase text-neutral-500">
                          {item.type}
                        </span>
                        <span className="text-xs text-neutral-500">
                          • Owner: <strong className="text-neutral-800">{item.ownerName || 'Owner'}</strong>
                        </span>
                      </div>

                      <h3 className="mt-1.5 text-base font-bold text-neutral-900">
                        {item.title}
                      </h3>
                      <p className="text-xs text-neutral-500">
                        {item.location.address}, {item.location.locality}, {item.location.city}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-forest-800">
                        Rent: {formatINR(item.pricing.monthlyRent)}/mo • Deposit:{' '}
                        {formatINR(item.pricing.deposit)} • Contact:{' '}
                        {item.contact.phone || item.contact.email || 'None'}
                      </p>
                      <p className="mt-2 line-clamp-2 max-w-2xl text-xs text-neutral-600">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Moderation Actions */}
                  <div className="flex flex-col gap-2.5 sm:min-w-[280px]">
                    <div className="flex flex-wrap items-center gap-2">
                      {item.status !== 'published' && (
                        <button
                          type="button"
                          onClick={() =>
                            moderateMutation.mutate({
                              id: item.id,
                              status: 'published',
                            })
                          }
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-forest-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-forest-800"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Approve & Publish
                        </button>
                      )}

                      {item.status === 'published' && (
                        <button
                          type="button"
                          onClick={() =>
                            moderateMutation.mutate({
                              id: item.id,
                              status: 'published',
                              featured: !item.featured,
                            })
                          }
                          className={`inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-xs font-semibold ${
                            item.featured
                              ? 'border-amber-300 bg-amber-50 text-amber-800'
                              : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                          }`}
                        >
                          <Star className="h-3.5 w-3.5" />
                          {item.featured ? 'Featured' : 'Feature'}
                        </button>
                      )}

                      {item.status === 'published' && (
                        <Link
                          to={`/stays/${item.slug}`}
                          className="btn-secondary px-3 py-2 text-xs"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          View
                        </Link>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={rejectionNotes[item.id] || ''}
                        onChange={(e) =>
                          setRejectionNotes((prev) => ({
                            ...prev,
                            [item.id]: e.target.value,
                          }))
                        }
                        placeholder="Reason for rejection or suspension..."
                        className="input-field py-1.5 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          moderateMutation.mutate({
                            id: item.id,
                            status: 'rejected',
                            rejectionReason:
                              rejectionNotes[item.id] || 'Please verify rent & address details',
                          })
                        }
                        className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Reject
                      </button>

                      {item.status === 'published' && (
                        <button
                          type="button"
                          onClick={() =>
                            moderateMutation.mutate({
                              id: item.id,
                              status: 'suspended',
                              rejectionReason:
                                rejectionNotes[item.id] || 'Suspended by administrator',
                            })
                          }
                          className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-800 hover:bg-neutral-200"
                        >
                          <Ban className="h-3.5 w-3.5" />
                          Suspend
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
