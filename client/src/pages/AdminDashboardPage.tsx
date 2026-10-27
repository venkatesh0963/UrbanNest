import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  Flag,
  Users,
  BadgeCheck,
  Ban,
  ArrowRight,
  ExternalLink,
  XCircle,
} from 'lucide-react';
import { api } from '../api/client';
import { formatINR, STATUS_BADGE_STYLES } from '../types';

export const AdminDashboardPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.getAdminStats(),
    refetchInterval: 5000,
  });

  const { data: recentListingsData } = useQuery({
    queryKey: ['admin', 'listings', undefined],
    queryFn: () => api.getAdminListings({}),
    refetchInterval: 5000,
  });

  const { data: usersData } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => api.getAdminUsers(),
    refetchInterval: 10000,
  });

  const moderateMutation = useMutation({
    mutationFn: ({
      id,
      status,
      rejectionReason,
    }: {
      id: string;
      status: 'published' | 'rejected' | 'suspended';
      rejectionReason?: string;
    }) =>
      api.moderateListing(id, {
        status,
        rejectionReason,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['owner'] });
    },
  });

  const userUpdateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { isActive?: boolean; isVerified?: boolean };
    }) => api.updateAdminUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  const users = usersData?.users || [];
  const recentListings = recentListingsData?.data || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-6 sm:flex-row sm:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-forest-700">
            <ShieldCheck className="h-4 w-4" />
            Platform Administration
          </span>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Moderation & Trust Dashboard
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Review newly added rooms, resolve community reports, and manage user & owner accounts.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link to="/admin/listings" className="btn-primary">
            All Submissions ({stats?.listings.total ?? recentListings.length})
          </Link>
          <Link to="/admin/reports" className="btn-secondary">
            Manage Reports ({stats?.reports.open ?? 0})
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          to="/admin/listings?status=pending"
          className="group rounded-2xl border border-amber-200 bg-amber-50/50 p-5 transition-all hover:border-amber-300"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-amber-800">
            <span>Pending Submissions</span>
            <Clock className="h-4 w-4" />
          </div>
          <p className="mt-2 text-3xl font-bold text-amber-900">
            {stats?.listings.pending ?? 0}
          </p>
          <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-amber-800 group-hover:underline">
            Review queue <ArrowRight className="h-3 w-3" />
          </span>
        </Link>

        <Link
          to="/admin/listings?status=published"
          className="group rounded-2xl border border-neutral-200 bg-white p-5 transition-all hover:border-neutral-300"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-500">
            <span>Published Listings</span>
            <CheckCircle2 className="h-4 w-4 text-forest-700" />
          </div>
          <p className="mt-2 text-3xl font-bold text-neutral-900">
            {stats?.listings.published ?? 0}
          </p>
          <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-forest-700 group-hover:underline">
            View all listings <ArrowRight className="h-3 w-3" />
          </span>
        </Link>

        <Link
          to="/admin/reports"
          className="group rounded-2xl border border-red-200 bg-red-50/40 p-5 transition-all hover:border-red-300"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-red-800">
            <span>Open Reports</span>
            <Flag className="h-4 w-4" />
          </div>
          <p className="mt-2 text-3xl font-bold text-red-900">{stats?.reports.open ?? 0}</p>
          <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-red-700 group-hover:underline">
            Investigate reports <ArrowRight className="h-3 w-3" />
          </span>
        </Link>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-500">
            <span>Registered Accounts</span>
            <Users className="h-4 w-4 text-forest-700" />
          </div>
          <p className="mt-2 text-3xl font-bold text-neutral-900">
            {(stats?.users.renters ?? 0) + (stats?.users.owners ?? 0)}
          </p>
          <p className="mt-2 text-xs text-neutral-500">
            {stats?.users.owners ?? 0} Owners • {stats?.users.renters ?? 0} Renters
          </p>
        </div>
      </div>

      {/* Recently Added & Pending Rooms Table */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">
              Recently Added & Pending Properties
            </h2>
            <p className="mt-0.5 text-xs text-neutral-500">
              Live feed of all property listings sorted by newest first.
            </p>
          </div>
          <Link
            to="/admin/listings"
            className="text-xs font-semibold text-forest-700 hover:underline"
          >
            Open full moderation view →
          </Link>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200 text-left text-sm">
              <thead className="bg-neutral-50 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="px-5 py-3.5">Property</th>
                  <th className="px-5 py-3.5">Owner</th>
                  <th className="px-5 py-3.5">Location</th>
                  <th className="px-5 py-3.5">Rent</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Quick Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {recentListings.slice(0, 10).map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50/70">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-neutral-900">{item.title}</div>
                      <div className="text-xs uppercase text-neutral-400">{item.type}</div>
                    </td>
                    <td className="px-5 py-4 text-xs text-neutral-600">
                      {item.ownerName || 'Property Owner'}
                    </td>
                    <td className="px-5 py-4 text-xs text-neutral-600">
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
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        {item.status !== 'published' && (
                          <button
                            type="button"
                            onClick={() =>
                              moderateMutation.mutate({
                                id: item.id,
                                status: 'published',
                              })
                            }
                            className="inline-flex items-center gap-1 rounded-lg bg-forest-700 px-2.5 py-1 text-xs font-semibold text-white hover:bg-forest-800"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Publish
                          </button>
                        )}
                        {item.status === 'published' && (
                          <Link
                            to={`/stays/${item.slug}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-2.5 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-100"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            View
                          </Link>
                        )}
                        {item.status !== 'rejected' && (
                          <button
                            type="button"
                            onClick={() =>
                              moderateMutation.mutate({
                                id: item.id,
                                status: 'rejected',
                                rejectionReason: 'Rejected by moderator',
                              })
                            }
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User & Owner Verification / Account Access Table */}
      <div className="mt-12">
        <h2 className="text-lg font-bold text-neutral-900">
          User & Property Owner Accounts
        </h2>
        <p className="mt-1 text-xs text-neutral-500">
          Grant reviewed verification status to vetted owners or suspend fraudulent accounts.
        </p>

        <div className="mt-4 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200 text-left text-sm">
              <thead className="bg-neutral-50 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="px-5 py-3.5">Name & Email</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Verification</th>
                  <th className="px-5 py-3.5">Account Status</th>
                  <th className="px-5 py-3.5 text-right">Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-neutral-50/70">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-neutral-900">{u.name}</div>
                      <div className="text-xs text-neutral-500">{u.email}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-semibold uppercase text-neutral-700">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {u.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-forest-700">
                          <BadgeCheck className="h-4 w-4" />
                          Reviewed
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-400">Unverified</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`badge ${
                          u.isActive
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {u.role !== 'admin' && (
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              userUpdateMutation.mutate({
                                id: u.id,
                                payload: { isVerified: !u.isVerified },
                              })
                            }
                            className="rounded-lg border border-neutral-200 px-2.5 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-100"
                          >
                            {u.isVerified ? 'Revoke Badge' : 'Mark Reviewed'}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              userUpdateMutation.mutate({
                                id: u.id,
                                payload: { isActive: !u.isActive },
                              })
                            }
                            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold ${
                              u.isActive
                                ? 'border-red-200 text-red-600 hover:bg-red-50'
                                : 'border-forest-200 text-forest-700 hover:bg-forest-50'
                            }`}
                          >
                            <Ban className="h-3 w-3" />
                            {u.isActive ? 'Suspend' : 'Activate'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
