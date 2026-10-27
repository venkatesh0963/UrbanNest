import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  registerHandler,
  loginHandler,
  logoutHandler,
  getCurrentUserHandler,
  updateProfileHandler,
} from '../controllers/authController.js';
import {
  getPublicListingsHandler,
  getPublicListingBySlugHandler,
  getSupportedFiltersHandler,
  reportListingHandler,
} from '../controllers/listingController.js';
import {
  listOwnerListingsHandler,
  getOwnerListingHandler,
  createOwnerListingHandler,
  updateOwnerListingHandler,
  deleteOwnerListingHandler,
  submitOwnerListingHandler,
  requestPhotoSignatureHandler,
  uploadPhotosHandler,
} from '../controllers/ownerController.js';
import {
  listFavouritesHandler,
  addFavouriteHandler,
  removeFavouriteHandler,
} from '../controllers/favouriteController.js';
import {
  getAdminStatsHandler,
  listAdminListingsHandler,
  moderateListingHandler,
  listAdminReportsHandler,
  updateAdminReportHandler,
  listAdminUsersHandler,
  updateAdminUserHandler,
} from '../controllers/adminController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  publicListingQuerySchema,
  createListingSchema,
  updateListingSchema,
  createReportSchema,
  moderationActionSchema,
  updateReportSchema,
  adminListingQuerySchema,
  adminReportQuerySchema,
} from '../validators/index.js';
import { env } from '../config/env.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.NODE_ENV === 'test' ? 1000 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many authentication attempts. Please try again in a few minutes.',
    },
  },
});

const reportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.NODE_ENV === 'test' ? 1000 : 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many reports submitted recently. Please try again later.',
    },
  },
});

// Health check
router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'urban-nest-api' });
});

// Auth & Account APIs
router.post('/auth/register', authLimiter, validateBody(registerSchema), registerHandler);
router.post('/auth/login', authLimiter, validateBody(loginSchema), loginHandler);
router.post('/auth/logout', logoutHandler);
router.get('/auth/me', getCurrentUserHandler);
router.patch('/users/me', requireAuth, validateBody(updateProfileSchema), updateProfileHandler);

// Public Listing APIs
router.get('/listings/filters', getSupportedFiltersHandler);
router.get('/listings', validateQuery(publicListingQuerySchema), getPublicListingsHandler);
router.get('/listings/:slug', getPublicListingBySlugHandler);
router.post(
  '/listings/:id/reports',
  requireAuth,
  reportLimiter,
  validateBody(createReportSchema),
  reportListingHandler
);

// Owner APIs
router.post('/owner/uploads', requireRole('owner', 'admin'), uploadPhotosHandler);
router.get('/owner/listings', requireRole('owner', 'admin'), listOwnerListingsHandler);
router.post(
  '/owner/listings',
  requireRole('owner', 'admin'),
  validateBody(createListingSchema),
  createOwnerListingHandler
);
router.get('/owner/listings/:id', requireRole('owner', 'admin'), getOwnerListingHandler);
router.patch(
  '/owner/listings/:id',
  requireRole('owner', 'admin'),
  validateBody(updateListingSchema),
  updateOwnerListingHandler
);
router.delete('/owner/listings/:id', requireRole('owner', 'admin'), deleteOwnerListingHandler);
router.post(
  '/owner/listings/:id/submit',
  requireRole('owner', 'admin'),
  submitOwnerListingHandler
);
router.post(
  '/owner/listings/:id/photos',
  requireRole('owner', 'admin'),
  requestPhotoSignatureHandler
);

// Favourites APIs
router.get('/favourites', requireAuth, listFavouritesHandler);
router.put('/favourites/:listingId', requireAuth, addFavouriteHandler);
router.delete('/favourites/:listingId', requireAuth, removeFavouriteHandler);

// Admin APIs
router.get('/admin/stats', requireRole('admin'), getAdminStatsHandler);
router.get(
  '/admin/listings',
  requireRole('admin'),
  validateQuery(adminListingQuerySchema),
  listAdminListingsHandler
);
router.patch(
  '/admin/listings/:id/moderation',
  requireRole('admin'),
  validateBody(moderationActionSchema),
  moderateListingHandler
);
router.get(
  '/admin/reports',
  requireRole('admin'),
  validateQuery(adminReportQuerySchema),
  listAdminReportsHandler
);
router.patch(
  '/admin/reports/:id',
  requireRole('admin'),
  validateBody(updateReportSchema),
  updateAdminReportHandler
);
router.get('/admin/users', requireRole('admin'), listAdminUsersHandler);
router.patch('/admin/users/:id', requireRole('admin'), updateAdminUserHandler);

export default router;
