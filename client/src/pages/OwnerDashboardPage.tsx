import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  PlusCircle,
  Building2,
  Eye,
  Clock,
  CheckCircle2,
  Edit3,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { api } from '../api/client';
import { formatINR, STATUS_BADGE_STYLES } from '../types';

export const OwnerDashboardPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['owner', 'listings'],
    queryFn: () => api.getOwnerListings(),
  });

  const listings = data?.listings || [];
  const publishedCount = listings.filter((l) => l.status === 'published').length;
  const pendingCount = listings.filter((l) => l.status === 'pending').length;
  const totalViews = listings.reduce((sum, l) => sum + (l.viewsCount || 0), 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-6 sm:flex-row sm:items-center">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-forest-700">
            Property Owner Hub
          </span>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Owner Overview
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Manage your PG and hostel listings, track moderation status, and update bed
            availability.
          </p>
        </div>

        <div className="flex gap-3">
          <Link to="/owner/listings" className="btn-secondary">
            Manage All Listings
          </Link>
          <Link to="/owner/listings/new" className="btn-primary">
            <PlusCircle className="h-4 w-4" />
            <span>Add New Property</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-medium text-neutral-500">
            <span>Total Properties</span>
            <Building2 className="h-4 w-4 text-forest-700" />
          </div>
          <p className="mt-2 text-3xl font-bold text-neutral-900">{listings.length}</p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-medium text-neutral-500">
            <span>Published & Live</span>
            <CheckCircle2 className="h-4 w-4 text-forest-700" />
          </div>
          <p className="mt-2 text-3xl font-bold text-forest-700">{publishedCount}</p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-medium text-neutral-500">
            <span>Pending Moderation</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-3xl font-bold text-amber-700">{pendingCount}</p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-medium text-neutral-500">
            <span>Total Listing Views</span>
            <Eye className="h-4 w-4 text-neutral-600" />
          </div>
          <p className="mt-2 text-3xl font-bold text-neutral-900">{totalViews}</p>
        </div>
      </div>

      {/* Recent Properties Table */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900">Your Properties</h2>
          <Link
            to="/owner/listings"
            className="text-xs font-semibold text-forest-700 hover:underline"
          >
            View full management list →
          </Link>
        </div>

        {isLoading ? (
          <div className="mt-4 h-48 animate-pulse rounded-2xl bg-neutral-100" />
        ) : listings.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-12 text-center">
            <h3 className="text-base font-bold text-neutral-900">No properties created yet</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Create your first hostel or PG listing to start receiving direct tenant enquiries.
            </p>
            <Link to="/owner/listings/new" className="btn-primary mt-5">
              <PlusCircle className="h-4 w-4" />
              Create First Listing
            </Link>
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xs">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 text-left text-sm">
                <thead className="bg-neutral-50 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  <tr>
                    <th className="px-5 py-3.5">Property</th>
                    <th className="px-5 py-3.5">Location</th>
                    <th className="px-5 py-3.5">Rent</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Availability</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {listings.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-50/70">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-neutral-900">{item.title}</div>
                        <div className="text-xs text-neutral-500 uppercase">{item.type}</div>
                        {item.moderation?.rejectionReason && (
                          <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>Note: {item.moderation.rejectionReason}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-neutral-600">
                        {item.location.locality}, {item.location.city}
                      </td>
                      <td className="px-5 py-4 font-semibold text-neutral-900">
                        {formatINR(item.pricing.monthlyRent)}/mo
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`badge capitalize ${
                            STATUS_BADGE_STYLES[item.status] || 'bg-neutral-100'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 capitalize text-neutral-700">
                        {item.availability}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          {item.status === 'published' && (
                            <Link
                              to={`/stays/${item.slug}`}
                              className="rounded-lg border border-neutral-200 p-1.5 text-neutral-600 hover:bg-neutral-100"
                              title="View public page"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          )}
                          <Link
                            to={`/owner/listings/${item.id}/edit`}
                            className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs font-semibold text-neutral-800 hover:bg-neutral-100"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
