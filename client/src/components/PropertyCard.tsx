import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Heart,
  Utensils,
  Wifi,
  Users,
  BadgeCheck,
  ArrowUpRight,
} from 'lucide-react';
import {
  type ListingDTO,
  formatINR,
  SHARING_LABELS,
  GENDER_LABELS,
} from '../types';
import { useAuth } from '../features/auth/AuthContext';
import { useFavourites } from '../features/favourites/useFavourites';

interface PropertyCardProps {
  listing: ListingDTO;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ listing }) => {
  const { user } = useAuth();
  const { isSaved, toggleFavourite } = useFavourites();
  const navigate = useNavigate();

  const saved = isSaved(listing.id);
  const primaryPhoto =
    listing.photos.find((p) => p.isPrimary)?.url ||
    listing.photos[0]?.url ||
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80';

  const handleFavouriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    await toggleFavourite(listing.id);
  };

  const sharingSummary = listing.roomTypes
    .map((rt) => SHARING_LABELS[rt.sharing] || rt.sharing)
    .slice(0, 2)
    .join(' • ');

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md">
      {/* Photo container */}
      <Link to={`/stays/${listing.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-neutral-100">
        <img
          src={primaryPhoto}
          alt={listing.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Top badges */}
        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
          <span className="rounded-lg bg-neutral-900/80 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
            {listing.type === 'pg' ? 'PG Stay' : 'Hostel'}
          </span>
          <span
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold backdrop-blur-sm ${
              listing.genderPolicy === 'female'
                ? 'bg-rose-50/95 text-rose-800'
                : listing.genderPolicy === 'male'
                ? 'bg-sky-50/95 text-sky-800'
                : 'bg-white/95 text-neutral-800'
            }`}
          >
            {GENDER_LABELS[listing.genderPolicy]}
          </span>
        </div>

        {/* Save button */}
        <button
          type="button"
          onClick={handleFavouriteClick}
          aria-label={saved ? 'Remove from favourites' : 'Save to favourites'}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition-all ${
            saved
              ? 'bg-white text-red-600'
              : 'bg-white/90 text-neutral-600 hover:bg-white hover:text-neutral-900'
          }`}
        >
          <Heart className={`h-4 w-4 ${saved ? 'fill-red-500 text-red-500' : ''}`} />
        </button>

        {/* Availability pill */}
        {listing.availability !== 'available' && (
          <div className="absolute bottom-3 left-3">
            <span
              className={`rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase ${
                listing.availability === 'limited'
                  ? 'bg-amber-500 text-white'
                  : 'bg-neutral-800 text-white'
              }`}
            >
              {listing.availability === 'limited' ? 'Few Beds Left' : 'Currently Full'}
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="flex items-center justify-between gap-2 text-xs text-neutral-500">
            <span className="inline-flex items-center gap-1 truncate font-medium text-neutral-600">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-forest-700" />
              {listing.location.locality}, {listing.location.city}
            </span>
            {listing.status === 'published' && listing.ownerVerified && (
              <span
                className="inline-flex shrink-0 items-center gap-1 text-forest-700 font-medium"
                title="Moderation reviewed listing"
              >
                <BadgeCheck className="h-3.5 w-3.5" />
                Reviewed
              </span>
            )}
          </div>

          <Link to={`/stays/${listing.slug}`} className="mt-1.5 block">
            <h3 className="line-clamp-1 text-base font-semibold text-neutral-900 group-hover:text-forest-700 transition-colors">
              {listing.title}
            </h3>
          </Link>

          {/* Sharing & Facilities row */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-neutral-600">
            <span className="inline-flex items-center gap-1 rounded-lg bg-neutral-100 px-2.5 py-1 font-medium">
              <Users className="h-3.5 w-3.5 text-neutral-500" />
              {sharingSummary}
            </span>

            {listing.pricing.foodIncluded && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-forest-50 px-2.5 py-1 font-medium text-forest-800">
                <Utensils className="h-3.5 w-3.5 text-forest-700" />
                Food Included
              </span>
            )}

            {listing.amenities.includes('Wi-Fi') && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-neutral-100 px-2.5 py-1 font-medium">
                <Wifi className="h-3.5 w-3.5 text-neutral-500" />
                Wi-Fi
              </span>
            )}
          </div>
        </div>

        {/* Footer price & CTA */}
        <div className="mt-5 flex items-end justify-between border-t border-neutral-100 pt-4">
          <div>
            <span className="block text-[11px] font-medium uppercase tracking-wider text-neutral-400">
              Starting from
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-neutral-900">
                {formatINR(listing.pricing.monthlyRent)}
              </span>
              <span className="text-xs text-neutral-500">/ month</span>
            </div>
          </div>

          <Link
            to={`/stays/${listing.slug}`}
            className="inline-flex items-center gap-1 rounded-xl bg-neutral-100 px-3.5 py-2 text-xs font-semibold text-neutral-800 transition-colors group-hover:bg-forest-700 group-hover:text-white"
          >
            View Details
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
};
