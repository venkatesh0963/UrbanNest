import React from 'react';
import { SlidersHorizontal, RotateCcw, X } from 'lucide-react';
import type { FilterMetadata } from '../types';

export interface SearchFilterState {
  q: string;
  city: string;
  locality: string;
  type: string;
  sharing: string;
  genderPolicy: string;
  minRent: string;
  maxRent: string;
  foodIncluded: boolean;
  amenities: string[];
  sort: string;
}

interface FiltersProps {
  filters: SearchFilterState;
  metadata?: FilterMetadata;
  onChange: (next: Partial<SearchFilterState>) => void;
  onReset: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Filters: React.FC<FiltersProps> = ({
  filters,
  metadata,
  onChange,
  onReset,
  mobileOpen,
  onCloseMobile,
}) => {
  const cities = metadata?.cities || [];
  const selectedCityObj = cities.find(
    (c) => c.city.toLowerCase() === filters.city.toLowerCase()
  );
  const localities = selectedCityObj?.localities || [];

  const toggleAmenity = (amenity: string) => {
    const exists = filters.amenities.includes(amenity);
    const next = exists
      ? filters.amenities.filter((a) => a !== amenity)
      : [...filters.amenities, amenity];
    onChange({ amenities: next });
  };

  const content = (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
        <div className="flex items-center gap-2 font-semibold text-neutral-900">
          <SlidersHorizontal className="h-4 w-4 text-forest-700" />
          <span>Filters</span>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-forest-700"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset all
        </button>
      </div>

      {/* City */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
          City
        </label>
        <select
          value={filters.city}
          onChange={(e) => onChange({ city: e.target.value, locality: '' })}
          className="input-field mt-1.5"
        >
          <option value="">All Cities</option>
          {cities.map((c) => (
            <option key={c.city} value={c.city}>
              {c.city} ({c.count})
            </option>
          ))}
        </select>
      </div>

      {/* Locality */}
      {localities.length > 0 && (
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
            Locality
          </label>
          <select
            value={filters.locality}
            onChange={(e) => onChange({ locality: e.target.value })}
            className="input-field mt-1.5"
          >
            <option value="">All Localities in {filters.city}</option>
            {localities.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Accommodation Type */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
          Property Type
        </label>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {[
            { value: '', label: 'All' },
            { value: 'pg', label: 'PG' },
            { value: 'hostel', label: 'Hostel' },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => onChange({ type: item.value })}
              className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                filters.type === item.value
                  ? 'border-forest-700 bg-forest-50 text-forest-800'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Gender Policy */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
          Gender Policy
        </label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {[
            { value: '', label: 'Any' },
            { value: 'male', label: 'Men Only' },
            { value: 'female', label: 'Women Only' },
            { value: 'any', label: 'Co-ed' },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => onChange({ genderPolicy: item.value })}
              className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                filters.genderPolicy === item.value
                  ? 'border-forest-700 bg-forest-50 text-forest-800'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Room Sharing */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
          Room Sharing
        </label>
        <select
          value={filters.sharing}
          onChange={(e) => onChange({ sharing: e.target.value })}
          className="input-field mt-1.5"
        >
          <option value="">Any Sharing</option>
          <option value="single">Single Private</option>
          <option value="double">Double Sharing</option>
          <option value="triple">Triple Sharing</option>
          <option value="four_plus">4+ Sharing</option>
        </select>
      </div>

      {/* Monthly Rent Range */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
          Monthly Budget (₹)
        </label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min ₹"
            value={filters.minRent}
            onChange={(e) => onChange({ minRent: e.target.value })}
            className="input-field"
            min={0}
            step={500}
          />
          <input
            type="number"
            placeholder="Max ₹"
            value={filters.maxRent}
            onChange={(e) => onChange({ maxRent: e.target.value })}
            className="input-field"
            min={0}
            step={500}
          />
        </div>
      </div>

      {/* Food Included toggle */}
      <div>
        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-neutral-200 p-3 hover:bg-neutral-50">
          <span className="text-sm font-medium text-neutral-800">Food Included</span>
          <input
            type="checkbox"
            checked={filters.foodIncluded}
            onChange={(e) => onChange({ foodIncluded: e.target.checked })}
            className="h-4 w-4 rounded border-neutral-300 text-forest-700 focus:ring-forest-600"
          />
        </label>
      </div>

      {/* Amenities */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
          Essential Amenities
        </label>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {(
            metadata?.amenities || [
              'Wi-Fi',
              'Food',
              'Laundry',
              'AC',
              'Power Backup',
              'Study Desk',
              'CCTV Security',
              'Gym',
            ]
          ).map((amenity) => {
            const active = filters.amenities.includes(amenity);
            return (
              <button
                key={amenity}
                type="button"
                onClick={() => toggleAmenity(amenity)}
                className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                  active
                    ? 'border-forest-700 bg-forest-700 text-white'
                    : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                }`}
              >
                {amenity}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block lg:w-72 lg:shrink-0">
        <div className="sticky top-24 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          {content}
        </div>
      </aside>

      {/* Mobile Filter Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative ml-auto flex h-full w-full max-w-sm flex-col overflow-y-auto bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-neutral-900">Search Filters</h2>
              <button
                type="button"
                onClick={onCloseMobile}
                className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{content}</div>
            <div className="mt-6 border-t border-neutral-200 pt-4">
              <button
                type="button"
                onClick={onCloseMobile}
                className="btn-primary w-full"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
