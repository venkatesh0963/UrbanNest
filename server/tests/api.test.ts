import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { connectDatabase, disconnectDatabase } from '../src/config/db.js';
import { createApp } from '../src/app.js';
import { seedInitialData } from '../src/utils/seed.js';

let app: Express;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await connectDatabase(true);
  await seedInitialData(true);
  app = createApp();
}, 30000);

afterAll(async () => {
  await disconnectDatabase();
});

describe('Urban Nest REST API v1', () => {
  it('returns health check status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('lists published properties with filters and pagination', async () => {
    const res = await request(app).get(
      '/api/v1/listings?city=Bengaluru&type=pg&minRent=5000&maxRent=15000&sharing=double&page=1&limit=12'
    );
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.pagination).toMatchObject({
      page: 1,
      limit: 12,
    });
    for (const item of res.body.data) {
      expect(item.status).toBe('published');
      expect(item.location.city).toBe('Bengaluru');
      expect(item.type).toBe('pg');
    }
  });

  it('fetches supported filter metadata and property details by slug', async () => {
    const filtersRes = await request(app).get('/api/v1/listings/filters');
    expect(filtersRes.status).toBe(200);
    expect(filtersRes.body.cities.length).toBeGreaterThan(0);

    const detailRes = await request(app).get(
      '/api/v1/listings/the-canopy-co-living-pg-koramangala'
    );
    expect(detailRes.status).toBe(200);
    expect(detailRes.body.listing.title).toBe('The Canopy Co-Living & PG');
    expect(detailRes.body.listing.contact.whatsappEnabled).toBe(true);
  });

  it('registers a user, manages session, and saves/removes favourites', async () => {
    const agent = request.agent(app);

    const regRes = await agent.post('/api/v1/auth/register').send({
      name: 'Rohan Kulkarni',
      email: 'rohan.k@example.com',
      password: 'SecurePass123!',
      role: 'user',
      phone: '+91 9876543210',
    });

    expect(regRes.status).toBe(201);
    expect(regRes.body.user.email).toBe('rohan.k@example.com');
    expect(regRes.body.user.role).toBe('user');

    const meRes = await agent.get('/api/v1/auth/me');
    expect(meRes.status).toBe(200);
    expect(meRes.body.user.name).toBe('Rohan Kulkarni');

    // Get a published listing ID
    const listRes = await agent.get('/api/v1/listings?limit=1');
    const listingId = listRes.body.data[0].id;

    // Save favourite
    const putFav = await agent.put(`/api/v1/favourites/${listingId}`);
    expect(putFav.status).toBe(200);
    expect(putFav.body.saved).toBe(true);

    // List favourites
    const getFavs = await agent.get('/api/v1/favourites');
    expect(getFavs.status).toBe(200);
    expect(getFavs.body.listingIds).toContain(listingId);

    // Remove favourite
    const delFav = await agent.delete(`/api/v1/favourites/${listingId}`);
    expect(delFav.status).toBe(200);
    expect(delFav.body.saved).toBe(false);

    // Regular user cannot access owner or admin routes
    const ownerDenied = await agent.get('/api/v1/owner/listings');
    expect(ownerDenied.status).toBe(403);

    const adminDenied = await agent.get('/api/v1/admin/listings');
    expect(adminDenied.status).toBe(403);
  });

  it('allows owners to create, update, and submit listings, and admins to moderate', async () => {
    const ownerAgent = request.agent(app);

    const loginRes = await ownerAgent.post('/api/v1/auth/login').send({
      email: 'owner@urbannest.in',
      password: 'Password123!',
    });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.user.role).toBe('owner');

    const createRes = await ownerAgent.post('/api/v1/owner/listings').send({
      title: 'Maple Leaf Student Residency',
      type: 'hostel',
      description:
        'Quiet and modern student residency near Christ University with 3 meals, Wi-Fi, and study lounge.',
      location: {
        city: 'Bengaluru',
        locality: 'SG Palya',
        address: '2nd Cross, Tavarekere Main Road, SG Palya',
      },
      pricing: {
        monthlyRent: 8000,
        deposit: 15000,
        foodIncluded: true,
      },
      roomTypes: [{ sharing: 'double', monthlyRent: 8000, availableBeds: 4 }],
      amenities: ['Wi-Fi', 'Food', 'Laundry'],
      genderPolicy: 'male',
      photos: [
        {
          url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
          isPrimary: true,
        },
      ],
      contact: {
        phone: '+919845022334',
        email: 'owner@urbannest.in',
        whatsappEnabled: true,
      },
      availability: 'available',
      submitForReview: false,
    });

    expect(createRes.status).toBe(201);
    const createdId = createRes.body.listing.id;
    expect(createRes.body.listing.status).toBe('draft');

    // Submit for review
    const submitRes = await ownerAgent.post(`/api/v1/owner/listings/${createdId}/submit`);
    expect(submitRes.status).toBe(200);
    expect(submitRes.body.listing.status).toBe('pending');

    // Another owner cannot modify this listing
    const otherOwnerAgent = request.agent(app);
    await otherOwnerAgent.post('/api/v1/auth/login').send({
      email: 'vikram.stays@urbannest.in',
      password: 'Password123!',
    });
    const forbiddenUpdate = await otherOwnerAgent
      .patch(`/api/v1/owner/listings/${createdId}`)
      .send({ title: 'Unauthorized Title Change' });
    expect(forbiddenUpdate.status).toBe(403);

    // Admin approves the listing
    const adminAgent = request.agent(app);
    await adminAgent.post('/api/v1/auth/login').send({
      email: 'admin@urbannest.in',
      password: 'Password123!',
    });

    const modRes = await adminAgent
      .patch(`/api/v1/admin/listings/${createdId}/moderation`)
      .send({
        status: 'published',
        adminNotes: 'Verified by moderation team',
      });
    expect(modRes.status).toBe(200);
    expect(modRes.body.listing.status).toBe('published');
  });
});
