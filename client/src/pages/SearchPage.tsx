import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  SlidersHorizontal,
  Building2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { api } from '../api/client';
import { PropertyCard } from '../components/PropertyCard';
import { Filters, type SearchFilterState } from '../components/Filters';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [filters, setFilters] = useState<SearchFilterState>({
    q: searchParams.get('q') || '',
    city: searchParams.get('city') || '',
    locality: searchParams.get('locality') || '',
    type: searchParams.get('type') || '',
    sharing: searchParams.get('sharing') || '',
    genderPolicy: searchParams.get('genderPolicy') || '',
    minRent: searchParams.get('minRent') || '',
    maxRent: searchParams.get('maxRent') || '',
    foodIncluded: searchParams.get('foodIncluded') === 'true',
    amenities: searchParams.get('amenities')
      ? searchParams.get('amenities')!.split(',').filter(Boolean)
      : [],
    sort: searchParams.get('sort') || 'newest',
  });

  const [page, setPage] = useState<number>(Number(searchParams.get('page')) || 1);

  useEffect(() => {
    const nextParams = new URLSearchParams();
    if (filters.q) nextParams.set('q', filters.q);
    if (filters.city) nextParams.set('city', filters.city);
    if (filters.locality) nextParams.set('locality', filters.locality);
    if (filters.type) nextParams.set('type', filters.type);
    if (filters.sharing) nextParams.set('sharing', filters.sharing);
    if (filters.genderPolicy) nextParams.set('genderPolicy', filters.genderPolicy);
    if (filters.minRent) nextParams.set('minRent', filters.minRent);
    if (filters.maxRent) nextParams.set('maxRent', filters.maxRent);
    if (filters.foodIncluded) nextParams.set('foodIncluded', 'true');
    if (filters.amenities.length > 0) nextParams.set('amenities', filters.amenities.join(','));
    if (filters.sort && filters.sort !== 'newest') nextParams.set('sort', filters.sort);
    if (page > 1) nextParams.set('page', String(page));

    setSearchParams(nextParams, { replace: true });
  }, [filters, page, setSearchParams]);

  const { data: filterMeta } = useQuery({
    queryKey: ['listings', 'filters'],
    queryFn: () => api.getFilters(),
    staleTime: 5 * 60 * 1000,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['listings', 'search', filters, page],
    queryFn: () =>
      api.getListings({
        q: filters.q || undefined,
        city: filters.city || undefined,
        locality: filters.locality || undefined,
        type: filters.type || undefined,
        sharing: filters.sharing || undefined,
        genderPolicy: filters.genderPolicy || undefined,
        minRent: filters.minRent || undefined,
        maxRent: filters.maxRent || undefined,
        foodIncluded: filters.foodIncluded ? 'true' : undefined,
        amenities: filters.amenities.length ? filters.amenities.join(',') : undefined,
        sort: filters.sort,
        page,
        limit: 9,
      }),
    refetchInterval: 5000,
  });

  const handleUpdateFilters = (patch: Partial<SearchFilterState>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      q: '',
      city: '',
      locality: '',
      type: '',
      sharing: '',
      genderPolicy: '',
      minRent: '',
      maxRent: '',
      foodIncluded: false,
      amenities: [],
      sort: 'newest',
    });
    setPage(1);
  };

  const listings = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Search & Sort Bar */}
      <div className="flex flex-col gap-4 border-b border-neutral-200 pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            {filters.city ? `Stays in ${filters.city}` : 'Explore Verified Stays'}
            {filters.locality ? ` • ${filters.locality}` : ''}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {pagination
              ? `Showing ${listings.length} of ${pagination.total} published stays`
              : 'Loading stays...'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Keyword search */}
          <div className="relative flex-1 sm:w-64 sm:flex-initial">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={filters.q}
              onChange={(e) => handleUpdateFilters({ q: e.target.value })}
              placeholder="Search title, area, landmark..."
              className="input-field pl-9 py-2"
            />
          </div>

          {/* Sort selector */}
          <select
            value={filters.sort}
            onChange={(e) => handleUpdateFilters({ sort: e.target.value })}
            aria-label="Sort listings"
            className="input-field w-auto py-2 font-medium"
          >
            <option value="newest">Sort: Featured & Newest</option>
            <option value="rent_asc">Rent: Low to High</option>
            <option value="rent_desc">Rent: High to Low</option>
            <option value="popular">Most Viewed</option>
          </select>

          {/* Mobile filter button */}
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="btn-secondary py-2 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        <Filters
          filters={filters}
          metadata={filterMeta}
          onChange={handleUpdateFilters}
          onReset={handleResetFilters}
          mobileOpen={mobileFiltersOpen}
          onCloseMobile={() => setMobileFiltersOpen(false)}
        />

        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="h-96 animate-pulse rounded-2xl border border-neutral-200 bg-neutral-100"
                />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-200/70 text-neutral-600">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-bold text-neutral-900">
                No matching properties found
              </h3>
              <p className="mt-1 max-w-md text-sm text-neutral-500">
                Try broadening your rent range, removing a facility filter, or searching across all
                localities.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn-primary mt-5"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {listings.map((listing) => (
                  <PropertyCard key={listing.id} listing={listing} />
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-10 flex items-center justify-between border-t border-neutral-200 pt-6">
                  <p className="text-xs text-neutral-500">
                    Page <span className="font-semibold text-neutral-900">{pagination.page}</span>{' '}
                    of{' '}
                    <span className="font-semibold text-neutral-900">{pagination.totalPages}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={!pagination.hasPrevPage}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="btn-secondary px-3 py-1.5 text-xs"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={!pagination.hasNextPage}
                      onClick={() => setPage((p) => p + 1)}
                      className="btn-secondary px-3 py-1.5 text-xs"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
