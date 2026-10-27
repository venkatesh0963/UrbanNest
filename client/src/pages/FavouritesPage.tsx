import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { useFavourites } from '../features/favourites/useFavourites';
import { PropertyCard } from '../components/PropertyCard';

export const FavouritesPage: React.FC = () => {
  const { favourites, isLoading } = useFavourites();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="border-b border-neutral-200 pb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-forest-700">
          Your Shortlist
        </span>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          Saved Properties ({favourites.length})
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Compare your shortlisted hostels and PGs across devices before contacting owners.
        </p>
      </div>

      {isLoading ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-96 animate-pulse rounded-2xl border border-neutral-200 bg-neutral-100"
            />
          ))}
        </div>
      ) : favourites.length === 0 ? (
        <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-50 text-forest-700">
            <Heart className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-base font-bold text-neutral-900">
            No saved properties yet
          </h2>
          <p className="mt-1 max-w-md text-sm text-neutral-500">
            Click the heart icon on any hostel or PG card while browsing to save it here for easy
            comparison.
          </p>
          <Link to="/stays" className="btn-primary mt-6">
            <span>Explore Stays</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favourites.map((listing) => (
            <PropertyCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
};
