import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../features/auth/AuthContext';
import { PropertyCard } from '../components/PropertyCard';
import type { ListingDTO } from '../types';

vi.stubGlobal(
  'fetch',
  vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ user: null }),
    })
  )
);

const sampleListing: ListingDTO = {
  id: '507f1f77bcf86cd799439011',
  ownerId: '507f1f77bcf86cd799439012',
  ownerName: 'Rajeshwari Nair',
  ownerVerified: true,
  title: 'Comfort Stay PG',
  slug: 'comfort-stay-pg-example',
  type: 'pg',
  description: 'Accommodation for students and professionals',
  location: {
    city: 'Bengaluru',
    locality: 'BTM Layout',
    address: '2nd Stage, 100 Feet Ring Road',
    coordinates: null,
  },
  pricing: {
    monthlyRent: 8500,
    deposit: 15000,
    foodIncluded: true,
    extraCharges: [],
  },
  roomTypes: [{ sharing: 'double', monthlyRent: 8500, availableBeds: 2 }],
  amenities: ['Wi-Fi', 'Laundry', 'Food'],
  houseRules: ['No smoking'],
  genderPolicy: 'any',
  photos: [],
  contact: {
    phone: '+919845022334',
    email: 'owner@example.com',
    whatsappEnabled: true,
  },
  status: 'published',
  availability: 'available',
  featured: true,
  viewsCount: 42,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('PropertyCard Component', () => {
  it('renders property title, locality, rent, and facilities', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AuthProvider>
            <PropertyCard listing={sampleListing} />
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Comfort Stay PG')).toBeInTheDocument();
    expect(screen.getByText(/BTM Layout, Bengaluru/i)).toBeInTheDocument();
    expect(screen.getByText(/8,500/)).toBeInTheDocument();
    expect(screen.getByText(/Double Sharing/i)).toBeInTheDocument();
    expect(screen.getByText(/Food Included/i)).toBeInTheDocument();
  });
});
