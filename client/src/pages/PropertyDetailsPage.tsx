import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  MapPin,
  Heart,
  Phone,
  Mail,
  MessageCircle,
  CheckCircle2,
  ShieldAlert,
  Flag,
  ArrowLeft,
  BadgeCheck,
  Clock,
  Utensils,
  Zap,
  Calendar,
  ExternalLink,
  X,
} from 'lucide-react';
import { api } from '../api/client';
import {
  formatINR,
  SHARING_LABELS,
  GENDER_LABELS,
  REPORT_REASON_LABELS,
  type ReportReason,
} from '../types';
import { useAuth } from '../features/auth/AuthContext';
import { useFavourites } from '../features/favourites/useFavourites';

export const PropertyDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isSaved, toggleFavourite } = useFavourites();

  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason>('incorrect_information');
  const [reportDetails, setReportDetails] = useState('');
  const [reportStatusMsg, setReportStatusMsg] = useState<string | null>(null);
  const [reportSubmitting, setReportSubmitting] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['listing', slug],
    queryFn: () => api.getListingBySlug(slug!),
    enabled: Boolean(slug),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-96 animate-pulse rounded-3xl bg-neutral-100" />
      </div>
    );
  }

  if (error || !data?.listing) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-neutral-900">Property Not Found</h1>
        <p className="mt-2 text-sm text-neutral-600">
          This accommodation may have been removed or is currently unpublished.
        </p>
        <Link to="/stays" className="btn-primary mt-6">
          Browse Available Stays
        </Link>
      </div>
    );
  }

  const { listing } = data;
  const saved = isSaved(listing.id);
  const photos =
    listing.photos.length > 0
      ? listing.photos
      : [
          {
            url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
            caption: listing.title,
          },
        ];

  const activePhoto = photos[selectedPhotoIdx] || photos[0];

  const cleanPhone = (listing.contact.phone || '').replace(/[^0-9+]/g, '');
  const whatsappNumber = cleanPhone.replace(/^\+/, '');
  const whatsappMessage = encodeURIComponent(
    `Hi, I saw "${listing.title}" (${listing.location.locality}, ${listing.location.city}) on Urban Nest and would like to enquire about bed availability and rent details.`
  );

  const handleToggleFav = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    await toggleFavourite(listing.id);
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    setReportSubmitting(true);
    setReportStatusMsg(null);
    try {
      await api.reportListing(listing.id, {
        reason: reportReason,
        details: reportDetails,
      });
      setReportStatusMsg('Thank you. Your report has been submitted to our moderation team.');
      setReportDetails('');
      setTimeout(() => {
        setReportModalOpen(false);
        setReportStatusMsg(null);
      }, 1800);
    } catch (err) {
      setReportStatusMsg(err instanceof Error ? err.message : 'Failed to submit report');
    } finally {
      setReportSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back navigation */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/stays"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to search results
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleFav}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all ${
              saved
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <Heart className={`h-4 w-4 ${saved ? 'fill-red-500 text-red-500' : ''}`} />
            {saved ? 'Saved to Favourites' : 'Save Property'}
          </button>

          <button
            type="button"
            onClick={() => {
              if (!user) {
                navigate('/login');
                return;
              }
              setReportModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-50 hover:text-red-600"
          >
            <Flag className="h-3.5 w-3.5" />
            Report Listing
          </button>
        </div>
      </div>

      {/* Title & Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-6 lg:flex-row lg:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-forest-700 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-white">
              {listing.type === 'pg' ? 'Paying Guest (PG)' : 'Student Hostel'}
            </span>
            <span className="rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-800">
              {GENDER_LABELS[listing.genderPolicy]}
            </span>
            <span
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize ${
                listing.availability === 'available'
                  ? 'bg-emerald-50 text-emerald-800'
                  : listing.availability === 'limited'
                  ? 'bg-amber-50 text-amber-800'
                  : 'bg-neutral-200 text-neutral-700'
              }`}
            >
              {listing.availability === 'available'
                ? 'Beds Available'
                : listing.availability === 'limited'
                ? 'Limited Beds Left'
                : 'Currently Full'}
            </span>
            {listing.ownerVerified && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-forest-50 px-2.5 py-1 text-xs font-semibold text-forest-800">
                <BadgeCheck className="h-3.5 w-3.5 text-forest-700" />
                Reviewed Listing
              </span>
            )}
          </div>

          <h1 className="mt-3 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            {listing.title}
          </h1>

          <p className="mt-2 flex items-center gap-1.5 text-sm text-neutral-600">
            <MapPin className="h-4 w-4 shrink-0 text-forest-700" />
            <span>
              {listing.location.address}, {listing.location.locality}, {listing.location.city}
              {listing.location.pincode ? ` - ${listing.location.pincode}` : ''}
            </span>
          </p>
        </div>

        <div className="text-left lg:text-right">
          <span className="text-xs font-medium uppercase tracking-wider text-neutral-400">
            Monthly Rent From
          </span>
          <div className="flex items-baseline gap-1 lg:justify-end">
            <span className="text-3xl font-bold text-neutral-900">
              {formatINR(listing.pricing.monthlyRent)}
            </span>
            <span className="text-sm text-neutral-500">/ month</span>
          </div>
          <p className="mt-0.5 text-xs text-neutral-500">
            Security Deposit: <span className="font-semibold">{formatINR(listing.pricing.deposit)}</span>
          </p>
        </div>
      </div>

      {/* Photo Gallery */}
      <div className="mt-6">
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100">
          <img
            src={activePhoto.url}
            alt={activePhoto.caption || listing.title}
            className="h-[320px] w-full object-cover sm:h-[440px]"
          />
        </div>
        {photos.length > 1 && (
          <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
            {photos.map((photo, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedPhotoIdx(index)}
                className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                  selectedPhotoIdx === index
                    ? 'border-forest-700 ring-2 ring-forest-600/30'
                    : 'border-transparent opacity-75 hover:opacity-100'
                }`}
              >
                <img src={photo.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Two-Column Body */}
      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Left 8 Cols: Details */}
        <div className="space-y-10 lg:col-span-8">
          {/* Overview */}
          <section>
            <h2 className="text-lg font-bold text-neutral-900">About This Stay</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-neutral-600">
              {listing.description}
            </p>
            {listing.location.landmark && (
              <p className="mt-3 text-xs font-medium text-neutral-500">
                Landmark: <span className="text-neutral-800">{listing.location.landmark}</span>
              </p>
            )}
          </section>

          {/* Room Sharing Options & Rent Breakdown */}
          <section className="border-t border-neutral-200 pt-8">
            <h2 className="text-lg font-bold text-neutral-900">Room Sharing & Rent Breakdown</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {listing.roomTypes.map((rt, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4"
                >
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">
                      {SHARING_LABELS[rt.sharing] || rt.sharing}
                    </h3>
                    <p className="mt-1 text-xs text-neutral-500">
                      {rt.availableBeds > 0
                        ? `${rt.availableBeds} bed${rt.availableBeds > 1 ? 's' : ''} currently available`
                        : 'Waitlist / Check with owner'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-forest-800">
                      {formatINR(rt.monthlyRent)}
                    </span>
                    <span className="block text-[11px] text-neutral-500">per bed / month</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Inclusions & Policy Grid */}
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-neutral-200 p-3.5">
                <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                  <Utensils className="h-3.5 w-3.5 text-forest-700" />
                  Meals / Food
                </div>
                <p className="mt-1 text-sm font-semibold text-neutral-900">
                  {listing.pricing.foodIncluded ? 'Included in Rent' : 'Not Included'}
                </p>
              </div>

              <div className="rounded-xl border border-neutral-200 p-3.5">
                <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                  <Zap className="h-3.5 w-3.5 text-forest-700" />
                  Electricity
                </div>
                <p className="mt-1 text-sm font-semibold text-neutral-900">
                  {listing.pricing.electricityIncluded ? 'Included' : 'As per usage/meter'}
                </p>
              </div>

              <div className="rounded-xl border border-neutral-200 p-3.5">
                <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                  <Calendar className="h-3.5 w-3.5 text-forest-700" />
                  Notice Period
                </div>
                <p className="mt-1 text-sm font-semibold text-neutral-900">
                  {listing.pricing.noticePeriodDays ?? 30} Days
                </p>
              </div>

              <div className="rounded-xl border border-neutral-200 p-3.5">
                <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                  <Clock className="h-3.5 w-3.5 text-forest-700" />
                  Lock-in Period
                </div>
                <p className="mt-1 text-sm font-semibold text-neutral-900">
                  {listing.pricing.lockInPeriodMonths
                    ? `${listing.pricing.lockInPeriodMonths} Month(s)`
                    : 'No Lock-in'}
                </p>
              </div>
            </div>

            {listing.pricing.extraCharges && listing.pricing.extraCharges.length > 0 && (
              <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
                  Additional Charges
                </h4>
                <ul className="mt-2 space-y-1 text-xs text-neutral-700">
                  {listing.pricing.extraCharges.map((ec, i) => (
                    <li key={i} className="flex justify-between">
                      <span>{ec.label}</span>
                      <span className="font-semibold">
                        {formatINR(ec.amount)} ({ec.frequency.replace('_', ' ')})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Amenities */}
          <section className="border-t border-neutral-200 pt-8">
            <h2 className="text-lg font-bold text-neutral-900">Facilities & Amenities</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {listing.amenities.map((amenity) => (
                <div
                  key={amenity}
                  className="flex items-center gap-2.5 rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-medium text-neutral-800"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-forest-700" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </section>

          {/* House Rules */}
          {listing.houseRules && listing.houseRules.length > 0 && (
            <section className="border-t border-neutral-200 pt-8">
              <h2 className="text-lg font-bold text-neutral-900">House Rules & Guidelines</h2>
              <ul className="mt-3 space-y-2 text-sm text-neutral-600">
                {listing.houseRules.map((rule, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-forest-700" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Location & Map Link */}
          <section className="border-t border-neutral-200 pt-8">
            <h2 className="text-lg font-bold text-neutral-900">Location & Neighbourhood</h2>
            <div className="mt-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
              <p className="text-sm font-medium text-neutral-900">
                {listing.location.address}, {listing.location.locality}, {listing.location.city}
              </p>
              {listing.location.landmark && (
                <p className="mt-1 text-xs text-neutral-600">
                  Landmark: {listing.location.landmark}
                </p>
              )}
              <a
                href={
                  listing.location.coordinates
                    ? `https://www.openstreetmap.org/?mlat=${listing.location.coordinates.lat}&mlon=${listing.location.coordinates.lng}#map=16/${listing.location.coordinates.lat}/${listing.location.coordinates.lng}`
                    : `https://www.openstreetmap.org/search?query=${encodeURIComponent(
                        `${listing.location.locality}, ${listing.location.city}`
                      )}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-forest-700 hover:text-forest-800"
              >
                View neighbourhood on OpenStreetMap
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </section>
        </div>

        {/* Right 4 Cols: Sticky Direct Contact Box */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 rounded-2xl border border-neutral-200 bg-white p-6 shadow-md">
            <div className="border-b border-neutral-100 pb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-forest-700">
                Direct Owner Enquiry
              </span>
              <h3 className="mt-1 text-lg font-bold text-neutral-900">
                {listing.ownerName || 'Property Manager'}
              </h3>
              {listing.contact.preferredTime && (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-neutral-500">
                  <Clock className="h-3.5 w-3.5 text-neutral-400" />
                  Preferred hours: {listing.contact.preferredTime}
                </p>
              )}
            </div>

            <div className="mt-5 space-y-3">
              {listing.contact.whatsappEnabled && cleanPhone && (
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-forest-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-forest-800"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat on WhatsApp
                </a>
              )}

              {cleanPhone && (
                <a
                  href={`tel:${cleanPhone}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-50"
                >
                  <Phone className="h-4 w-4 text-forest-700" />
                  Call {listing.contact.phone}
                </a>
              )}

              {listing.contact.email && (
                <a
                  href={`mailto:${listing.contact.email}?subject=${encodeURIComponent(
                    `Enquiry via Urban Nest: ${listing.title}`
                  )}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-100"
                >
                  <Mail className="h-4 w-4 text-neutral-500" />
                  Email {listing.contact.email}
                </a>
              )}
            </div>

            {/* Important Safety Disclaimer */}
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs leading-relaxed text-amber-900">
              <div className="flex items-start gap-2">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                <div>
                  <p className="font-semibold">Confirm terms before paying</p>
                  <p className="mt-0.5 text-amber-800">
                    Urban Nest facilitates direct discovery and does not process online bookings or
                    payments. Always inspect the room and confirm availability, deposit refund
                    terms, and house rules directly with the owner.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs"
            onClick={() => setReportModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="text-base font-bold text-neutral-900">Report This Listing</h3>
              <button
                type="button"
                onClick={() => setReportModalOpen(false)}
                className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
                  Reason
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value as ReportReason)}
                  className="input-field mt-1.5"
                >
                  {Object.entries(REPORT_REASON_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
                  Details
                </label>
                <textarea
                  rows={4}
                  required
                  minLength={10}
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Describe what is inaccurate or misleading (at least 10 characters)..."
                  className="input-field mt-1.5"
                />
              </div>

              {reportStatusMsg && (
                <p className="rounded-xl bg-forest-50 p-3 text-xs font-medium text-forest-800">
                  {reportStatusMsg}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={reportSubmitting} className="btn-primary">
                  {reportSubmitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
