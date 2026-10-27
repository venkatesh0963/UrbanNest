import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  MapPin,
  ShieldCheck,
  PhoneCall,
  IndianRupee,
  ArrowRight,
  Building2,
  Sparkles,
} from 'lucide-react';
import { api } from '../api/client';
import { PropertyCard } from '../components/PropertyCard';

const POPULAR_LOCALITIES = [
  { city: 'Bengaluru', locality: 'Koramangala', tag: 'Startup & Student Hub' },
  { city: 'Bengaluru', locality: 'BTM Layout', tag: 'Budget Friendly Stays' },
  { city: 'Bengaluru', locality: 'HSR Layout', tag: 'Quiet Residential Pockets' },
  { city: 'Bengaluru', locality: 'Indiranagar', tag: 'Executive Co-Living' },
  { city: 'Bengaluru', locality: 'Whitefield', tag: 'Near ITPL & Tech Parks' },
  { city: 'Pune', locality: 'Viman Nagar', tag: 'Near Symbiosis & IT Hubs' },
  { city: 'Hyderabad', locality: 'Gachibowli', tag: 'Financial District Access' },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [city, setCity] = useState('Bengaluru');
  const [locality, setLocality] = useState('');
  const [type, setType] = useState('');

  const { data: featuredData, isLoading } = useQuery({
    queryKey: ['listings', 'home-featured'],
    queryFn: () => api.getListings({ limit: 9, sort: 'newest' }),
    refetchInterval: 5000,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (locality.trim()) params.set('locality', locality.trim());
    if (type) params.set('type', type);
    navigate(`/stays?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-neutral-200 bg-gradient-to-b from-forest-50/70 via-white to-white pt-12 pb-20 sm:pt-20 sm:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-forest-200 bg-forest-50 px-3.5 py-1 text-xs font-semibold text-forest-800">
              <Sparkles className="h-3.5 w-3.5 text-forest-700" />
              Zero Brokerage • Direct Owner Contact
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
              Find a place that{' '}
              <span className="text-forest-700">feels like home.</span>
            </h1>
            <p className="mt-5 text-base leading-relaxed text-neutral-600 sm:text-lg">
              Discover curated hostels and paying guest (PG) accommodations for students and
              working professionals. Compare rent, meals, and sharing options transparently.
            </p>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="mx-auto mt-10 max-w-4xl rounded-2xl border border-neutral-200 bg-white p-3 shadow-lg sm:p-4"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
              <div className="sm:col-span-3">
                <label className="block px-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                  City
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm font-medium text-neutral-900 focus:border-forest-600 focus:bg-white focus:outline-none"
                >
                  <option value="">All Cities</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Pune">Pune</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Chennai">Chennai</option>
                </select>
              </div>

              <div className="sm:col-span-4">
                <label className="block px-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                  Locality or Landmark
                </label>
                <div className="relative mt-1">
                  <MapPin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    placeholder="e.g. Koramangala, BTM, HSR..."
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-9 pr-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-forest-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="block px-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                  Stay Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm font-medium text-neutral-900 focus:border-forest-600 focus:bg-white focus:outline-none"
                >
                  <option value="">PGs & Hostels</option>
                  <option value="pg">Paying Guest (PG)</option>
                  <option value="hostel">Student Hostel</option>
                </select>
              </div>

              <div className="flex items-end sm:col-span-2">
                <button
                  type="submit"
                  className="btn-primary h-[42px] w-full"
                >
                  <Search className="h-4 w-4" />
                  <span>Search</span>
                </button>
              </div>
            </div>
          </form>

          {/* Popular Localities */}
          <div className="mx-auto mt-10 max-w-5xl">
            <p className="text-center text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Popular Localities
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              {POPULAR_LOCALITIES.map((item) => (
                <Link
                  key={`${item.city}-${item.locality}`}
                  to={`/stays?city=${encodeURIComponent(item.city)}&locality=${encodeURIComponent(
                    item.locality
                  )}`}
                  className="group inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-xs font-medium text-neutral-700 shadow-2xs transition-all hover:border-forest-600 hover:bg-forest-50 hover:text-forest-800"
                >
                  <MapPin className="h-3.5 w-3.5 text-forest-700" />
                  <span className="font-semibold">{item.locality}</span>
                  <span className="text-neutral-400">• {item.city}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured / Recently Added Stays */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-forest-700">
                Handpicked Accommodations
              </span>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                Featured & Recently Added Stays
              </h2>
            </div>
            <Link
              to="/stays"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest-700 hover:text-forest-800"
            >
              Explore all stays
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="h-96 animate-pulse rounded-2xl border border-neutral-200 bg-neutral-100"
                />
              ))}
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(featuredData?.data || []).map((listing) => (
                <PropertyCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Urban Nest Section */}
      <section className="border-y border-neutral-200 bg-neutral-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-forest-700">
              Why Urban Nest?
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
              Built for clarity, trust, and direct connection
            </h2>
            <p className="mt-3 text-sm text-neutral-600 sm:text-base">
              No hidden booking fees or middleman call centers. See real rent breakdowns and talk
              straight to property owners.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-50 text-forest-700">
                <IndianRupee className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-neutral-900">
                Transparent Rent Breakdown
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                Compare single, double, and triple sharing rents alongside security deposit, food
                inclusion, lock-in period, and electricity rules up front.
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-50 text-forest-700">
                <PhoneCall className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-neutral-900">
                Direct Owner Contact
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                Connect with property owners via phone call, WhatsApp, or email according to their
                contact preferences—no paywalls or lead brokers.
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-50 text-forest-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-neutral-900">
                Moderated & Community Reported
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                Every new listing goes through administrative review before publication, and users
                can flag inaccurate rent quotes or unavailable rooms in one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Owner Call to Action */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-forest-900 px-6 py-12 text-white shadow-lg sm:px-12 sm:py-16">
            <div className="relative z-10 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-xl">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-800 px-3 py-1 text-xs font-semibold text-forest-200">
                  <Building2 className="h-3.5 w-3.5" />
                  For Hostel & PG Owners
                </span>
                <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                  Own a PG or student hostel? List it on Urban Nest for free.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-forest-100 sm:text-base">
                  Showcase room sharing options, upload property photos, set your preferred WhatsApp
                  or phone contact hours, and receive direct enquiries from genuine students and
                  working professionals.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/register?role=owner"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-forest-900 shadow-sm transition-colors hover:bg-forest-50"
                >
                  List Your Property
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/owner/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl border border-forest-700 bg-forest-800/60 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-forest-800"
                >
                  Owner Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
