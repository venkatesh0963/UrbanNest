import type {
  FilterMetadata,
  ListingDTO,
  ListingPhoto,
  ListingStatus,
  PaginatedResponse,
  ReportDTO,
  ReportReason,
  ReportStatus,
  UserDTO,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export class ApiClientError extends Error {
  status: number;
  code: string;
  details?: Record<string, string>;

  constructor(message: string, status: number, code = 'ERROR', details?: Record<string, string>) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errObj = data?.error || {};
    throw new ApiClientError(
      errObj.message || 'Request failed',
      res.status,
      errObj.code || 'API_ERROR',
      errObj.details
    );
  }

  return data as T;
}

export const api = {
  // Auth & Users
  getMe: () => request<{ user: UserDTO | null }>('/auth/me'),
  login: (payload: { email: string; password: string }) =>
    request<{ user: UserDTO }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  register: (payload: {
    name: string;
    email: string;
    password: string;
    role: 'user' | 'owner';
    phone?: string;
  }) =>
    request<{ user: UserDTO }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  logout: () =>
    request<{ message: string }>('/auth/logout', {
      method: 'POST',
    }),
  updateProfile: (payload: { name?: string; phone?: string | null; role?: 'user' | 'owner' }) =>
    request<{ user: UserDTO }>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  // Public Listings
  getListings: (params: Record<string, string | number | boolean | undefined> = {}) => {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        search.set(key, String(value));
      }
    }
    const qs = search.toString();
    return request<PaginatedResponse<ListingDTO>>(`/listings${qs ? `?${qs}` : ''}`);
  },
  getListingBySlug: (slug: string) => request<{ listing: ListingDTO }>(`/listings/${slug}`),
  getFilters: () => request<FilterMetadata>('/listings/filters'),
  reportListing: (listingId: string, payload: { reason: ReportReason; details: string }) =>
    request<{ report: ReportDTO }>(`/listings/${listingId}/reports`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Favourites
  getFavourites: () =>
    request<{ listings: ListingDTO[]; listingIds: string[] }>('/favourites'),
  addFavourite: (listingId: string) =>
    request<{ saved: boolean; listingId: string }>(`/favourites/${listingId}`, {
      method: 'PUT',
    }),
  removeFavourite: (listingId: string) =>
    request<{ saved: boolean; listingId: string }>(`/favourites/${listingId}`, {
      method: 'DELETE',
    }),

  // Owner APIs
  uploadOwnerPhotos: (
    files: { fileName: string; mimeType: string; dataUrl: string; caption?: string }[]
  ) =>
    request<{ photos: ListingPhoto[] }>('/owner/uploads', {
      method: 'POST',
      body: JSON.stringify({ files }),
    }),
  getOwnerListings: () => request<{ listings: ListingDTO[] }>('/owner/listings'),
  getOwnerListingById: (id: string) =>
    request<{ listing: ListingDTO }>(`/owner/listings/${id}`),
  createOwnerListing: (payload: unknown) =>
    request<{ listing: ListingDTO }>('/owner/listings', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateOwnerListing: (id: string, payload: unknown) =>
    request<{ listing: ListingDTO }>(`/owner/listings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  deleteOwnerListing: (id: string) =>
    request<{ message: string }>(`/owner/listings/${id}`, {
      method: 'DELETE',
    }),
  submitOwnerListing: (id: string) =>
    request<{ listing: ListingDTO }>(`/owner/listings/${id}/submit`, {
      method: 'POST',
    }),
  getPhotoUploadSignature: (id: string) =>
    request<{
      mode: 'cloudinary' | 'direct';
      cloudName?: string;
      apiKey?: string;
      timestamp: number;
      folder: string;
      signature?: string;
      uploadUrl?: string;
      message?: string;
    }>(`/owner/listings/${id}/photos`, {
      method: 'POST',
    }),

  // Admin APIs
  getAdminStats: () =>
    request<{
      listings: {
        total: number;
        pending: number;
        published: number;
        rejected: number;
        suspended: number;
      };
      reports: { open: number };
      users: { renters: number; owners: number };
    }>('/admin/stats'),
  getAdminListings: (params: { status?: ListingStatus; city?: string; q?: string; page?: number } = {}) => {
    const search = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v) search.set(k, String(v));
    }
    const qs = search.toString();
    return request<PaginatedResponse<ListingDTO>>(`/admin/listings${qs ? `?${qs}` : ''}`);
  },
  moderateListing: (
    id: string,
    payload: {
      status: 'published' | 'rejected' | 'suspended';
      rejectionReason?: string | null;
      adminNotes?: string | null;
      featured?: boolean;
    }
  ) =>
    request<{ listing: ListingDTO }>(`/admin/listings/${id}/moderation`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  getAdminReports: (params: { status?: ReportStatus; page?: number } = {}) => {
    const search = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v) search.set(k, String(v));
    }
    const qs = search.toString();
    return request<PaginatedResponse<ReportDTO>>(`/admin/reports${qs ? `?${qs}` : ''}`);
  },
  updateAdminReport: (
    id: string,
    payload: { status: ReportStatus; resolutionNotes?: string | null }
  ) =>
    request<{ report: ReportDTO }>(`/admin/reports/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  getAdminUsers: () => request<{ users: UserDTO[] }>('/admin/users'),
  updateAdminUser: (id: string, payload: { isActive?: boolean; isVerified?: boolean }) =>
    request<{ user: UserDTO }>(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
};
