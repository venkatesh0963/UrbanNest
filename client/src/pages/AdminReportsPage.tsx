import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Flag, CheckCircle2, ExternalLink } from 'lucide-react';
import { api } from '../api/client';
import { REPORT_REASON_LABELS, type ReportStatus } from '../types';

export const AdminReportsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<ReportStatus | ''>('');
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'reports', statusFilter],
    queryFn: () =>
      api.getAdminReports({
        status: statusFilter ? (statusFilter as ReportStatus) : undefined,
      }),
  });

  const updateReportMutation = useMutation({
    mutationFn: ({
      id,
      status,
      resolutionNotes,
    }: {
      id: string;
      status: ReportStatus;
      resolutionNotes?: string;
    }) => api.updateAdminReport(id, { status, resolutionNotes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });

  const reports = data?.data || [];

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
            Listing Reports & Trust Queue
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Investigate user reports regarding inaccurate pricing, unavailable beds, or suspicious
            properties.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[
            { label: 'All Reports', value: '' },
            { label: 'Open', value: 'open' },
            { label: 'Under Review', value: 'under_review' },
            { label: 'Resolved', value: 'resolved' },
            { label: 'Dismissed', value: 'dismissed' },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value as ReportStatus | '')}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                statusFilter === tab.value
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
          {[1, 2].map((n) => (
            <div key={n} className="h-32 animate-pulse rounded-2xl bg-neutral-100" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-12 text-center">
          <p className="text-sm font-medium text-neutral-600">
            No reports in this queue.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {reports.map((rep) => (
            <div
              key={rep.id}
              className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs"
            >
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                      <Flag className="h-3 w-3" />
                      {REPORT_REASON_LABELS[rep.reason] || rep.reason}
                    </span>
                    <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold uppercase text-neutral-700">
                      {rep.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-neutral-400">
                      Reported by {rep.reporterName || rep.reporterEmail || 'User'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <h3 className="text-base font-bold text-neutral-900">
                      Property: {rep.listingTitle || rep.listingId}
                    </h3>
                    {rep.listingSlug && (
                      <Link
                        to={`/stays/${rep.listingSlug}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-forest-700 hover:underline"
                      >
                        Inspect Listing
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                  </div>

                  <p className="text-sm text-neutral-700">{rep.details}</p>

                  {rep.resolutionNotes && (
                    <p className="text-xs text-forest-800 bg-forest-50 px-3 py-1.5 rounded-lg inline-block">
                      Admin Resolution: {rep.resolutionNotes}
                    </p>
                  )}
                </div>

                {/* Status update controls */}
                <div className="flex flex-col gap-2 sm:min-w-[300px]">
                  <input
                    type="text"
                    value={notesMap[rep.id] ?? rep.resolutionNotes ?? ''}
                    onChange={(e) =>
                      setNotesMap((prev) => ({ ...prev, [rep.id]: e.target.value }))
                    }
                    placeholder="Add moderation resolution note..."
                    className="input-field py-1.5 text-xs"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateReportMutation.mutate({
                          id: rep.id,
                          status: 'under_review',
                          resolutionNotes: notesMap[rep.id],
                        })
                      }
                      className="btn-secondary flex-1 py-1.5 text-xs"
                    >
                      Mark Under Review
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateReportMutation.mutate({
                          id: rep.id,
                          status: 'resolved',
                          resolutionNotes:
                            notesMap[rep.id] || 'Reviewed and addressed with owner',
                        })
                      }
                      className="btn-primary flex-1 py-1.5 text-xs"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Resolve
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateReportMutation.mutate({
                          id: rep.id,
                          status: 'dismissed',
                          resolutionNotes: notesMap[rep.id] || 'No violation found',
                        })
                      }
                      className="rounded-xl border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
